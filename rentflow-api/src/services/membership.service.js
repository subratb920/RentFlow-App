import mongoose from "mongoose";

import { Property } from "../models/Property.js";
import { Tenancy } from "../models/Tenancy.js";
import { HttpError } from "../utils/httpError.js";

/**
 * A user's relationship to a property: its owner, or an active
 * tenant (with the buildings they live in). Anyone else gets 404.
 */
export async function getMembership(user, propertyId) {
    if (!mongoose.isValidObjectId(propertyId)) {
        throw new HttpError(400, "Invalid property id.");
    }

    const property = await Property.findById(propertyId);

    if (!property) {
        throw new HttpError(404, "Property not found.");
    }

    if (property.ownerId.equals(user._id)) {
        return { property, isOwner: true, buildingIds: [] };
    }

    const tenancies = await Tenancy.find({
        propertyId,
        tenantUserId: user._id,
        status: "ACTIVE",
    });

    if (tenancies.length === 0) {
        throw new HttpError(404, "Property not found.");
    }

    return {
        property,
        isOwner: false,
        buildingIds: tenancies.map((tenancy) => tenancy.buildingId.toString()),
    };
}

/**
 * Properties the user belongs to (owned, or rented as an active tenant).
 */
export async function getMemberProperties(user) {
    if (user.role === "OWNER") {
        return await Property.find({ ownerId: user._id }).sort({ createdAt: 1 });
    }

    const propertyIds = await Tenancy.distinct("propertyId", {
        tenantUserId: user._id,
        status: "ACTIVE",
    });

    return await Property.find({ _id: { $in: propertyIds } }).sort({ createdAt: 1 });
}
