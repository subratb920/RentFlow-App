import mongoose from "mongoose";

import { Bill, BILL_TYPES } from "../models/Bill.js";
import { Tenancy } from "../models/Tenancy.js";
import { Property } from "../models/Property.js";
import { Unit } from "../models/Unit.js";
import { User } from "../models/User.js";
import { getOwnedProperty } from "./access.service.js";
import { HttpError } from "../utils/httpError.js";
import {
    createPaymentLink,
    getPaymentLink,
    isRazorpayConfigured,
} from "../utils/razorpay.js";

const OWNER_BILL_TYPES = BILL_TYPES.filter((type) => type !== "RENT");
const MAX_AMOUNT = 10_000_000;
const UPI_ID_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;
const UPI_REFERENCE_PATTERN = /^[a-zA-Z0-9]{6,30}$/;

// ---------------- Rent generation ----------------

/**
 * Creates any missing monthly rent bills for the tenancies, from the
 * move-in month up to the current month. Each bill is due on the
 * move-in day of its month.
 */
export async function ensureRentBills(tenancies, now = new Date()) {
    for (const tenancy of tenancies) {
        const moveIn = tenancy.moveInDate;
        const periods = monthsBetween(moveIn, now);

        if (periods.length === 0) continue;

        const existing = new Set(
            await Bill.distinct("period", { tenancyId: tenancy._id, type: "RENT" })
        );

        const missing = periods
            .filter(({ period }) => !existing.has(period))
            .map(({ period, year, month }) => ({
                tenancyId: tenancy._id,
                ownerId: tenancy.ownerId,
                propertyId: tenancy.propertyId,
                buildingId: tenancy.buildingId,
                unitId: tenancy.unitId,
                type: "RENT",
                period,
                amount: tenancy.monthlyRent,
                dueDate: new Date(Date.UTC(
                    year,
                    month,
                    Math.min(moveIn.getUTCDate(), daysInMonth(year, month))
                )),
            }));

        if (missing.length > 0) {
            // ordered:false + unique index: a concurrent request that
            // inserted the same month is harmless
            await Bill.insertMany(missing, { ordered: false }).catch((error) => {
                if (error?.code !== 11000 && !error?.writeErrors) throw error;
            });
        }
    }
}

// ---------------- Tenant ----------------

/**
 * All bills of the tenant's active tenancies, newest month first.
 */
export async function getTenantBills(user) {
    const tenancies = await Tenancy.find({ tenantUserId: user._id, status: "ACTIVE" });

    await ensureRentBills(tenancies);

    const bills = await Bill.find({
        tenancyId: { $in: tenancies.map((tenancy) => tenancy._id) },
    }).sort({ period: -1, dueDate: -1 });

    return await withDetails(bills);
}

export async function getPaymentOptions(user, billId) {
    const bill = await findTenantBill(user, billId);
    const owner = await User.findById(bill.ownerId).select("fullName upiId");

    return {
        upiId: owner?.upiId ?? "",
        payeeName: owner?.fullName ?? "",
        razorpayEnabled: isRazorpayConfigured(),
    };
}

/**
 * Tenant reports a UPI payment; the owner confirms it.
 */
export async function submitUpiPayment(user, billId, reference) {
    const bill = await findTenantBill(user, billId);

    assertUnpaid(bill);

    const upiReference = String(reference ?? "").trim();

    if (!UPI_REFERENCE_PATTERN.test(upiReference)) {
        throw new HttpError(
            400,
            "Enter the UPI transaction reference (6–30 letters or numbers).",
            "reference"
        );
    }

    bill.status = "PENDING_CONFIRMATION";
    bill.paymentMethod = "UPI";
    bill.upiReference = upiReference;

    await bill.save();

    return bill;
}

/**
 * Creates (or reuses) a Razorpay payment link for the bill.
 */
export async function startRazorpayPayment(user, billId) {
    const bill = await findTenantBill(user, billId);

    assertUnpaid(bill);

    if (bill.razorpayLinkId) {
        const existing = await getPaymentLink(bill.razorpayLinkId);

        if (existing.status === "paid") {
            return await markRazorpayPaid(bill);
        }

        if (existing.status === "created" || existing.status === "partially_paid") {
            return bill;
        }
    }

    const link = await createPaymentLink({
        amount: bill.amount,
        description: `${labelForType(bill.type)} ${bill.period}`,
        referenceId: `${bill.id}-${Date.now().toString(36)}`,
        customer: {
            name: user.fullName,
            email: user.email,
            ...(user.phone ? { contact: user.phone } : {}),
        },
    });

    bill.razorpayLinkId = link.id;
    bill.razorpayLinkUrl = link.short_url;

    await bill.save();

    return bill;
}

/**
 * Checks the Razorpay link and marks the bill paid if it was.
 */
export async function verifyRazorpayPayment(user, billId) {
    const bill = await findTenantBill(user, billId);

    if (bill.status === "PAID" || !bill.razorpayLinkId) {
        return bill;
    }

    const link = await getPaymentLink(bill.razorpayLinkId);

    if (link.status === "paid") {
        return await markRazorpayPaid(bill);
    }

    return bill;
}

// ---------------- Owner ----------------

export async function getOwnerBills(ownerId, propertyId) {
    await getOwnedProperty(propertyId, ownerId);

    const tenancies = await Tenancy.find({ propertyId, status: { $ne: "DECLINED" } });

    await ensureRentBills(tenancies);

    const bills = await Bill.find({ propertyId }).sort({ period: -1, dueDate: -1 });

    return await withDetails(bills);
}

export async function addBill(ownerId, data) {
    const tenancy = mongoose.isValidObjectId(data.tenancyId)
        ? await Tenancy.findById(data.tenancyId)
        : null;

    if (!tenancy || tenancy.status === "DECLINED") {
        throw new HttpError(400, "Select a tenant.", "tenancyId");
    }

    await getOwnedProperty(tenancy.propertyId.toString(), ownerId);

    if (!OWNER_BILL_TYPES.includes(data.type)) {
        throw new HttpError(400, "Select a bill type.", "type");
    }

    const { period, year, month } = parsePeriod(data.period);

    const bill = await Bill.create({
        tenancyId: tenancy._id,
        ownerId: tenancy.ownerId,
        propertyId: tenancy.propertyId,
        buildingId: tenancy.buildingId,
        unitId: tenancy.unitId,
        type: data.type,
        period,
        amount: parseAmount(data.amount),
        // Due on the 10th of the billing month unless given
        dueDate: data.dueDate
            ? parseDate(data.dueDate)
            : new Date(Date.UTC(year, month, 10)),
        description: parseDescription(data.description),
    });

    return bill;
}

/**
 * Marks a bill paid: confirms a reported UPI payment, or records an
 * offline (cash) payment for an unpaid bill.
 */
export async function confirmPayment(ownerId, billId) {
    const bill = await findOwnerBill(ownerId, billId);

    if (bill.status === "PAID") {
        throw new HttpError(409, "This bill is already paid.");
    }

    if (bill.status === "UNPAID") {
        bill.paymentMethod = "CASH";
    }

    bill.status = "PAID";
    bill.paidAt = new Date();

    await bill.save();

    return bill;
}

/**
 * Rejects a reported UPI payment the owner did not receive.
 */
export async function rejectPayment(ownerId, billId) {
    const bill = await findOwnerBill(ownerId, billId);

    if (bill.status !== "PENDING_CONFIRMATION") {
        throw new HttpError(409, "There is no payment to reject.");
    }

    bill.status = "UNPAID";
    bill.paymentMethod = null;
    bill.upiReference = "";

    await bill.save();

    return bill;
}

export async function deleteBill(ownerId, billId) {
    const bill = await findOwnerBill(ownerId, billId);

    if (bill.type === "RENT") {
        throw new HttpError(400, "Rent bills are created automatically and cannot be deleted.");
    }

    if (bill.status === "PAID") {
        throw new HttpError(400, "Paid bills cannot be deleted.");
    }

    await bill.deleteOne();
}

export async function getPaymentSettings(owner) {
    return { upiId: owner.upiId ?? "", razorpayEnabled: isRazorpayConfigured() };
}

export async function updatePaymentSettings(owner, data) {
    const upiId = String(data.upiId ?? "").trim();

    if (upiId && !UPI_ID_PATTERN.test(upiId)) {
        throw new HttpError(400, "Enter a valid UPI ID, e.g. name@okaxis.", "upiId");
    }

    await User.updateOne({ _id: owner._id }, { upiId });

    return { upiId, razorpayEnabled: isRazorpayConfigured() };
}

/**
 * Removes a tenancy's unpaid bills (paid history is kept).
 */
export async function deleteUnpaidBills(tenancyId) {
    await Bill.deleteMany({ tenancyId, status: { $ne: "PAID" } });
}

// ---------------- Helpers ----------------

async function findTenantBill(user, billId) {
    const bill = mongoose.isValidObjectId(billId) ? await Bill.findById(billId) : null;

    const isOwnBill =
        bill &&
        (await Tenancy.exists({
            _id: bill.tenancyId,
            tenantUserId: user._id,
            status: "ACTIVE",
        }));

    if (!isOwnBill) {
        throw new HttpError(404, "Bill not found.");
    }

    return bill;
}

async function findOwnerBill(ownerId, billId) {
    const bill = mongoose.isValidObjectId(billId) ? await Bill.findById(billId) : null;

    if (!bill || bill.ownerId.toString() !== String(ownerId)) {
        throw new HttpError(404, "Bill not found.");
    }

    return bill;
}

function assertUnpaid(bill) {
    if (bill.status === "PAID") {
        throw new HttpError(409, "This bill is already paid.");
    }

    if (bill.status === "PENDING_CONFIRMATION") {
        throw new HttpError(409, "Your payment is waiting for the owner to confirm.");
    }
}

async function markRazorpayPaid(bill) {
    bill.status = "PAID";
    bill.paymentMethod = "RAZORPAY";
    bill.paidAt = new Date();

    await bill.save();

    return bill;
}

/**
 * Bills as JSON with property name, unit number and tenant name.
 */
async function withDetails(bills) {
    const [properties, units, tenancies] = await Promise.all([
        Property.find({ _id: { $in: bills.map((b) => b.propertyId) } }).select("propertyName"),
        Unit.find({ _id: { $in: bills.map((b) => b.unitId) } }).select("unitNumber"),
        Tenancy.find({ _id: { $in: bills.map((b) => b.tenancyId) } }).select("tenantName"),
    ]);

    const propertyNames = new Map(properties.map((p) => [p.id, p.propertyName]));
    const unitNumbers = new Map(units.map((u) => [u.id, u.unitNumber]));
    const tenantNames = new Map(tenancies.map((t) => [t.id, t.tenantName]));

    return bills.map((bill) => ({
        ...bill.toJSON(),
        propertyName: propertyNames.get(bill.propertyId.toString()) ?? "",
        unitNumber: unitNumbers.get(bill.unitId.toString()) ?? "",
        tenantName: tenantNames.get(bill.tenancyId.toString()) ?? "",
    }));
}

/**
 * [{ period: "2026-09", year: 2026, month: 8 }, ...] from the start
 * month to the end month inclusive (month is 0-based).
 */
function monthsBetween(start, end) {
    const result = [];
    let year = start.getUTCFullYear();
    let month = start.getUTCMonth();

    while (year < end.getUTCFullYear() ||
        (year === end.getUTCFullYear() && month <= end.getUTCMonth())) {
        result.push({
            period: `${year}-${String(month + 1).padStart(2, "0")}`,
            year,
            month,
        });

        month += 1;

        if (month === 12) {
            month = 0;
            year += 1;
        }
    }

    return result;
}

function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function labelForType(type) {
    return type.charAt(0) + type.slice(1).toLowerCase();
}

function parsePeriod(value) {
    const match = /^(\d{4})-(\d{2})$/.exec(String(value ?? ""));
    const month = match ? Number(match[2]) - 1 : -1;

    if (!match || month < 0 || month > 11) {
        throw new HttpError(400, "Select the billing month.", "period");
    }

    return { period: match[0], year: Number(match[1]), month };
}

function parseAmount(value) {
    const amount = Number(value);

    if (value === "" || value === null || value === undefined ||
        !Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
        throw new HttpError(400, "Enter a valid amount.", "amount");
    }

    return Math.round(amount * 100) / 100;
}

function parseDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
    const date = match
        ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
        : null;

    if (!date || date.getUTCDate() !== Number(match[3])) {
        throw new HttpError(400, "Enter a valid due date.", "dueDate");
    }

    return date;
}

function parseDescription(value) {
    const description = String(value ?? "").trim();

    if (description.length > 200) {
        throw new HttpError(400, "Description must be 200 characters or fewer.", "description");
    }

    return description;
}
