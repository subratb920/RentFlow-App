import mongoose from "mongoose";

import { AccessRequest } from "../models/AccessRequest.js";
import { Property } from "../models/Property.js";
import { Tenancy } from "../models/Tenancy.js";
import { User } from "../models/User.js";
import { createTenancyForUser } from "./tenancy.service.js";
import { HttpError } from "../utils/httpError.js";
import { parsePhone } from "../utils/phone.js";

const MAX_MESSAGE_LENGTH = 300;

// ---------------- Tenant ----------------

/**
 * Finds an owner by exact phone number plus name, so tenants can
 * only find an owner they already know. Returns the owner's
 * property names for the tenant to request access to.
 */
export async function findOwner({ name, phone }) {
    const ownerName = String(name ?? "").trim();
    const ownerPhone = parsePhone(phone, { field: "phone" });

    if (ownerName.length < 2) {
        throw new HttpError(400, "Enter your owner's name.", "name");
    }

    const owner = await User.findOne({ phone: ownerPhone, role: "OWNER" });
    const nameMatches =
        owner && owner.fullName.toLowerCase().includes(ownerName.toLowerCase());

    if (!nameMatches) {
        throw new HttpError(
            404,
            "No owner found with that name and phone number."
        );
    }

    const properties = await Property.find({ ownerId: owner._id }).sort({
        createdAt: 1,
    });

    return {
        owner: {
            id: owner.id,
            fullName: owner.fullName,
        },
        properties: properties.map((property) => ({
            id: property.id,
            propertyName: property.propertyName,
            propertyType: property.propertyType,
            address: property.address,
        })),
    };
}

export async function createAccessRequest(tenantUser, data) {
    const { ownerId, propertyId } = data;

    if (!mongoose.isValidObjectId(ownerId) || !mongoose.isValidObjectId(propertyId)) {
        throw new HttpError(400, "Select a property.");
    }

    const property = await Property.findById(propertyId);

    if (!property || property.ownerId.toString() !== ownerId) {
        throw new HttpError(404, "Property not found.");
    }

    const message = String(data.message ?? "").trim();

    if (message.length > MAX_MESSAGE_LENGTH) {
        throw new HttpError(
            400,
            `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
            "message"
        );
    }

    const alreadyResident = await Tenancy.exists({
        propertyId,
        tenantUserId: tenantUser._id,
        status: "ACTIVE",
    });

    if (alreadyResident) {
        throw new HttpError(409, "You already have access to this property.");
    }

    const pending = await AccessRequest.exists({
        propertyId,
        tenantUserId: tenantUser._id,
        status: "PENDING",
    });

    if (pending) {
        throw new HttpError(409, "You have already requested access to this property.");
    }

    return await AccessRequest.create({
        tenantUserId: tenantUser._id,
        ownerId: property.ownerId,
        propertyId: property._id,
        message,
    });
}

/**
 * A tenant's own requests, newest first.
 */
export async function getTenantRequests(tenantUser) {
    const requests = await AccessRequest.find({
        tenantUserId: tenantUser._id,
    }).sort({ createdAt: -1 });

    const [properties, owners] = await Promise.all([
        Property.find({ _id: { $in: requests.map((r) => r.propertyId) } }),
        User.find({ _id: { $in: requests.map((r) => r.ownerId) } }).select("fullName"),
    ]);

    const propertyNames = new Map(properties.map((p) => [p.id, p.propertyName]));
    const ownerNames = new Map(owners.map((o) => [o.id, o.fullName]));

    return requests.map((request) => ({
        id: request.id,
        status: request.status,
        createdAt: request.createdAt,
        propertyName: propertyNames.get(request.propertyId.toString()) ?? "",
        ownerName: ownerNames.get(request.ownerId.toString()) ?? "",
    }));
}

// ---------------- Owner ----------------

/**
 * Pending requests for an owner, oldest first.
 */
export async function getOwnerRequests(ownerId) {
    const requests = await AccessRequest.find({
        ownerId,
        status: "PENDING",
    }).sort({ createdAt: 1 });

    const [properties, tenants] = await Promise.all([
        Property.find({ _id: { $in: requests.map((r) => r.propertyId) } }),
        User.find({ _id: { $in: requests.map((r) => r.tenantUserId) } }).select(
            "fullName email phone"
        ),
    ]);

    const propertyNames = new Map(properties.map((p) => [p.id, p.propertyName]));
    const tenantById = new Map(tenants.map((t) => [t.id, t]));

    return requests.map((request) => {
        const tenant = tenantById.get(request.tenantUserId.toString());

        return {
            id: request.id,
            propertyId: request.propertyId.toString(),
            propertyName: propertyNames.get(request.propertyId.toString()) ?? "",
            message: request.message,
            createdAt: request.createdAt,
            tenant: {
                fullName: tenant?.fullName ?? "",
                email: tenant?.email ?? "",
                phone: tenant?.phone ?? "",
            },
        };
    });
}

/**
 * Approves a request by assigning the tenant to a unit.
 */
export async function approveRequest(ownerId, requestId, data) {
    const request = await findPendingRequest(ownerId, requestId);
    const tenantUser = await User.findById(request.tenantUserId);

    if (!tenantUser) {
        throw new HttpError(404, "Tenant account no longer exists.");
    }

    const tenancy = await createTenancyForUser(
        ownerId,
        request.propertyId,
        tenantUser,
        data
    );

    request.status = "APPROVED";
    request.tenancyId = tenancy._id;

    await request.save();

    return tenancy;
}

export async function rejectRequest(ownerId, requestId) {
    const request = await findPendingRequest(ownerId, requestId);

    request.status = "REJECTED";

    await request.save();
}

async function findPendingRequest(ownerId, requestId) {
    const request = mongoose.isValidObjectId(requestId)
        ? await AccessRequest.findById(requestId)
        : null;

    if (!request || request.ownerId.toString() !== String(ownerId)) {
        throw new HttpError(404, "Request not found.");
    }

    if (request.status !== "PENDING") {
        throw new HttpError(409, "This request has already been handled.");
    }

    return request;
}
