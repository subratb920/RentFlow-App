import mongoose from "mongoose";

import { Tenancy } from "../models/Tenancy.js";
import { Unit } from "../models/Unit.js";
import { Building } from "../models/Building.js";
import { Property } from "../models/Property.js";
import { User } from "../models/User.js";
import { getOwnedProperty } from "./access.service.js";
import { deleteUnpaidBills } from "./bill.service.js";
import { HttpError } from "../utils/httpError.js";
import { parsePhone } from "../utils/phone.js";
import {
    generateInviteCode,
    normalizeInviteCode,
} from "../utils/inviteCode.js";

// Only these property types allow several tenants in one unit
const SHARED_UNIT_TYPES = ["Hostel / PG"];

const MAX_RENT = 10_000_000;
const MAX_NAME_LENGTH = 100;

export function allowsSharedUnits(propertyType) {
    return SHARED_UNIT_TYPES.includes(propertyType);
}

// ---------------- Owner ----------------

// Tenancies that hold a unit (a declined invite frees it)
const OCCUPYING = { status: { $ne: "DECLINED" } };

/**
 * Owner assigns a tenant to a unit. The tenancy waits as an
 * invitation until the tenant accepts it in the app (matched by
 * email) or joins with the invite code.
 */
export async function createTenancy(ownerId, data) {
    const { property, building, unit } = await getAssignableUnit(
        ownerId,
        data.unitId
    );

    const tenantName = parseName(data.tenantName);
    const tenantEmail = parseEmail(data.tenantEmail);
    const tenantPhone = parsePhone(data.tenantPhone, {
        field: "tenantPhone",
        required: false,
    });

    const existingUser = await User.findOne({ email: tenantEmail });

    if (existingUser && existingUser.role !== "TENANT") {
        throw new HttpError(
            409,
            "This email belongs to a property owner account.",
            "tenantEmail"
        );
    }

    await assertNotAlreadyTenant(property._id, { tenantEmail });

    return await insertTenancy({
        ownerId: property.ownerId,
        propertyId: property._id,
        buildingId: building._id,
        unitId: unit._id,
        tenantName,
        tenantEmail,
        tenantPhone,
        moveInDate: parseMoveInDate(data.moveInDate),
        monthlyRent: parseRent(data.monthlyRent),
        tenantUserId: null,
        status: "INVITED",
    });
}

/**
 * Used when an owner approves an access request: the tenant account
 * is known, so the tenancy is active immediately.
 */
export async function createTenancyForUser(ownerId, propertyId, tenantUser, data) {
    const { property, building, unit } = await getAssignableUnit(
        ownerId,
        data.unitId
    );

    if (!property._id.equals(propertyId)) {
        throw new HttpError(
            400,
            "Choose a unit in the requested property.",
            "unitId"
        );
    }

    await assertNotAlreadyTenant(property._id, {
        tenantEmail: tenantUser.email,
        tenantUserId: tenantUser._id,
    });

    return await insertTenancy({
        ownerId: property.ownerId,
        propertyId: property._id,
        buildingId: building._id,
        unitId: unit._id,
        tenantName: tenantUser.fullName,
        tenantEmail: tenantUser.email,
        tenantPhone: tenantUser.phone ?? "",
        moveInDate: parseMoveInDate(data.moveInDate),
        monthlyRent: parseRent(data.monthlyRent),
        tenantUserId: tenantUser._id,
        status: "ACTIVE",
    });
}

/**
 * All tenancies of an owner's property, with unit and building names.
 */
export async function getPropertyTenancies(ownerId, propertyId) {
    await getOwnedProperty(propertyId, ownerId);

    const tenancies = await Tenancy.find({ propertyId }).sort({ createdAt: 1 });

    return await withUnitDetails(tenancies, (tenancy) => tenancy.toJSON());
}

/**
 * Configured units of a property with how many more tenants each
 * can take (null = no limit).
 */
export async function getAssignableUnits(ownerId, propertyId) {
    const property = await getOwnedProperty(propertyId, ownerId);
    const shared = allowsSharedUnits(property.propertyType);

    const [units, buildings, counts] = await Promise.all([
        Unit.find({ propertyId, isConfigured: true }).sort({ sequence: 1 }),
        Building.find({ propertyId }),
        Tenancy.aggregate([
            { $match: { propertyId: property._id, ...OCCUPYING } },
            { $group: { _id: "$unitId", count: { $sum: 1 } } },
        ]),
    ]);

    const buildingNames = new Map(
        buildings.map((building) => [building.id, building.buildingName])
    );
    const occupancy = new Map(
        counts.map((entry) => [entry._id.toString(), entry.count])
    );

    return {
        allowsSharedUnits: shared,
        units: units.map((unit) => {
            const tenantCount = occupancy.get(unit.id) ?? 0;

            return {
                id: unit.id,
                buildingId: unit.buildingId.toString(),
                buildingName: buildingNames.get(unit.buildingId.toString()) ?? "",
                unitNumber: unit.unitNumber,
                unitType: unit.unitType,
                tenantCount,
                isFull: !shared && tenantCount >= 1,
            };
        }),
    };
}

export async function deleteTenancy(ownerId, tenancyId) {
    const tenancy = await findTenancy(tenancyId);

    await getOwnedProperty(tenancy.propertyId.toString(), ownerId);

    await deleteUnpaidBills(tenancy._id);
    await tenancy.deleteOne();
}

/**
 * Number of tenancies per property, for the owner's property list.
 */
export async function countTenanciesByProperty(propertyIds) {
    const counts = await Tenancy.aggregate([
        { $match: { propertyId: { $in: propertyIds }, ...OCCUPYING } },
        { $group: { _id: "$propertyId", count: { $sum: 1 } } },
    ]);

    return new Map(counts.map((entry) => [entry._id.toString(), entry.count]));
}

// ---------------- Tenant ----------------

/**
 * Invitations sent to this tenant's email that are waiting for an answer.
 */
export async function getPendingInvites(user) {
    const tenancies = await Tenancy.find({
        tenantEmail: user.email,
        tenantUserId: null,
        status: "INVITED",
    }).sort({ createdAt: -1 });

    const [properties, owners] = await Promise.all([
        Property.find({ _id: { $in: tenancies.map((t) => t.propertyId) } }),
        User.find({ _id: { $in: tenancies.map((t) => t.ownerId) } }).select("fullName"),
    ]);

    const propertyById = new Map(properties.map((p) => [p.id, p]));
    const ownerNames = new Map(owners.map((o) => [o.id, o.fullName]));

    return await withUnitDetails(tenancies, (tenancy) => {
        const property = propertyById.get(tenancy.propertyId.toString());

        return {
            id: tenancy.id,
            moveInDate: tenancy.moveInDate,
            monthlyRent: tenancy.monthlyRent,
            createdAt: tenancy.createdAt,
            propertyName: property?.propertyName ?? "",
            propertyType: property?.propertyType ?? "",
            address: property?.address ?? "",
            ownerName: ownerNames.get(tenancy.ownerId.toString()) ?? "",
        };
    });
}

/**
 * Tenant accepts or declines an invitation sent to their email.
 */
export async function respondToInvite(user, tenancyId, accept) {
    const tenancy = mongoose.isValidObjectId(tenancyId)
        ? await Tenancy.findOne({
            _id: tenancyId,
            tenantEmail: user.email,
            tenantUserId: null,
            status: "INVITED",
        })
        : null;

    if (!tenancy) {
        throw new HttpError(404, "This invitation is no longer available.");
    }

    if (accept) {
        tenancy.tenantUserId = user._id;
        tenancy.status = "ACTIVE";
    } else {
        tenancy.status = "DECLINED";
    }

    await tenancy.save();

    return tenancy;
}

/**
 * Tenant joins using an invite code shared by the owner.
 */
export async function joinWithInviteCode(user, code) {
    const inviteCode = normalizeInviteCode(code);

    if (inviteCode.length < 9) {
        throw new HttpError(400, "Enter the invite code from your owner.", "code");
    }

    const tenancy = await Tenancy.findOne({ inviteCode });

    if (!tenancy) {
        throw new HttpError(404, "This invite code is not valid.", "code");
    }

    if (tenancy.tenantUserId) {
        if (tenancy.tenantUserId.equals(user._id)) {
            return tenancy;
        }

        throw new HttpError(409, "This invite code has already been used.", "code");
    }

    if (tenancy.status === "DECLINED") {
        throw new HttpError(
            409,
            "This invitation was declined. Ask your owner for a new one.",
            "code"
        );
    }

    tenancy.tenantUserId = user._id;
    tenancy.status = "ACTIVE";

    await tenancy.save();

    return tenancy;
}

/**
 * The properties a tenant lives in (active tenancies only).
 */
export async function getTenantResidences(user) {
    const tenancies = await Tenancy.find({
        tenantUserId: user._id,
        status: "ACTIVE",
    }).sort({ createdAt: 1 });

    const [properties, owners] = await Promise.all([
        Property.find({ _id: { $in: tenancies.map((t) => t.propertyId) } }),
        User.find({ _id: { $in: tenancies.map((t) => t.ownerId) } }).select(
            "fullName phone"
        ),
    ]);

    const propertyById = new Map(properties.map((p) => [p.id, p]));
    const ownerById = new Map(owners.map((o) => [o.id, o]));

    return await withUnitDetails(tenancies, (tenancy) => {
        const property = propertyById.get(tenancy.propertyId.toString());
        const owner = ownerById.get(tenancy.ownerId.toString());

        return {
            id: tenancy.id,
            moveInDate: tenancy.moveInDate,
            monthlyRent: tenancy.monthlyRent,
            property: {
                id: tenancy.propertyId.toString(),
                propertyName: property?.propertyName ?? "",
                propertyType: property?.propertyType ?? "",
                address: property?.address ?? "",
            },
            owner: {
                fullName: owner?.fullName ?? "",
                phone: owner?.phone ?? "",
            },
        };
    });
}

/**
 * Everyone living in a property, visible to a tenant of that property.
 * Contact details are not shared.
 */
export async function getPropertyTenantsForTenant(user, propertyId) {
    if (!mongoose.isValidObjectId(propertyId)) {
        throw new HttpError(400, "Invalid property id.");
    }

    const isResident = await Tenancy.exists({
        propertyId,
        tenantUserId: user._id,
        status: "ACTIVE",
    });

    if (!isResident) {
        throw new HttpError(404, "Property not found.");
    }

    const tenancies = await Tenancy.find({ propertyId, status: "ACTIVE" }).sort({
        createdAt: 1,
    });

    return await withUnitDetails(tenancies, (tenancy) => ({
        id: tenancy.id,
        tenantName: tenancy.tenantName,
        isYou: !!tenancy.tenantUserId?.equals(user._id),
    }));
}

// ---------------- Helpers ----------------

async function getAssignableUnit(ownerId, unitId) {
    if (!mongoose.isValidObjectId(unitId)) {
        throw new HttpError(400, "Select a unit.", "unitId");
    }

    const unit = await Unit.findById(unitId);

    if (!unit) {
        throw new HttpError(404, "Unit not found.", "unitId");
    }

    const property = await getOwnedProperty(unit.propertyId.toString(), ownerId);
    const building = await Building.findById(unit.buildingId);

    if (!unit.isConfigured) {
        throw new HttpError(
            400,
            "Configure this unit before assigning a tenant.",
            "unitId"
        );
    }

    if (!allowsSharedUnits(property.propertyType)) {
        const occupied = await Tenancy.exists({ unitId: unit._id, ...OCCUPYING });

        if (occupied) {
            throw new HttpError(
                409,
                "This unit already has a tenant.",
                "unitId"
            );
        }
    }

    return { property, building, unit };
}

async function assertNotAlreadyTenant(propertyId, { tenantEmail, tenantUserId }) {
    const conditions = [{ tenantEmail }];

    if (tenantUserId) {
        conditions.push({ tenantUserId });
    }

    const existing = await Tenancy.exists({
        propertyId,
        ...OCCUPYING,
        $or: conditions,
    });

    if (existing) {
        throw new HttpError(
            409,
            "This tenant is already assigned in this property.",
            "tenantEmail"
        );
    }
}

/**
 * Inserts a tenancy, retrying if the random invite code collides.
 */
async function insertTenancy(data) {
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            return await Tenancy.create({
                ...data,
                inviteCode: generateInviteCode(),
            });
        } catch (error) {
            const isCodeCollision =
                error?.code === 11000 && error?.keyPattern?.inviteCode;

            if (!isCodeCollision) {
                throw error;
            }
        }
    }

    throw new HttpError(500, "Could not create an invite code. Please try again.");
}

async function findTenancy(tenancyId) {
    const tenancy = mongoose.isValidObjectId(tenancyId)
        ? await Tenancy.findById(tenancyId)
        : null;

    if (!tenancy) {
        throw new HttpError(404, "Tenant not found.");
    }

    return tenancy;
}

/**
 * Maps tenancies to objects with unitNumber and buildingName added.
 */
async function withUnitDetails(tenancies, mapTenancy) {
    const [units, buildings] = await Promise.all([
        Unit.find({ _id: { $in: tenancies.map((t) => t.unitId) } }).select(
            "unitNumber"
        ),
        Building.find({ _id: { $in: tenancies.map((t) => t.buildingId) } }).select(
            "buildingName"
        ),
    ]);

    const unitNumbers = new Map(units.map((u) => [u.id, u.unitNumber]));
    const buildingNames = new Map(buildings.map((b) => [b.id, b.buildingName]));

    return tenancies.map((tenancy) => ({
        ...mapTenancy(tenancy),
        unitNumber: unitNumbers.get(tenancy.unitId.toString()) ?? "",
        buildingName: buildingNames.get(tenancy.buildingId.toString()) ?? "",
    }));
}

function parseName(value) {
    const name = String(value ?? "").trim();

    if (!name) {
        throw new HttpError(400, "Tenant name is required.", "tenantName");
    }

    if (name.length > MAX_NAME_LENGTH) {
        throw new HttpError(
            400,
            `Tenant name must be ${MAX_NAME_LENGTH} characters or fewer.`,
            "tenantName"
        );
    }

    return name;
}

function parseEmail(value) {
    const email = String(value ?? "").trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new HttpError(400, "Enter a valid email address.", "tenantEmail");
    }

    return email;
}

function parseMoveInDate(value) {
    // Expect an ISO date (YYYY-MM-DD) from the app
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
    const date = match
        ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
        : null;

    const isRealDate =
        date &&
        date.getUTCFullYear() === Number(match[1]) &&
        date.getUTCMonth() === Number(match[2]) - 1 &&
        date.getUTCDate() === Number(match[3]);

    if (!isRealDate) {
        throw new HttpError(400, "Enter a valid move-in date.", "moveInDate");
    }

    return date;
}

function parseRent(value) {
    const rent = Number(value);

    if (value === "" || value === null || value === undefined ||
        !Number.isFinite(rent) || rent < 0 || rent > MAX_RENT) {
        throw new HttpError(400, "Enter a valid monthly rent.", "monthlyRent");
    }

    return Math.round(rent * 100) / 100;
}
