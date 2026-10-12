import mongoose from "mongoose";

import { Property } from "../models/Property.js";
import { Building } from "../models/Building.js";
import { HttpError } from "../utils/httpError.js";

/**
 * Returns the property when it exists and belongs to the user.
 * Another owner's property is reported as not found so its
 * existence is not revealed.
 */
export async function getOwnedProperty(propertyId, userId) {
    if (!mongoose.isValidObjectId(propertyId)) {
        throw new HttpError(400, "Invalid property id.");
    }

    const property = await Property.findById(propertyId);

    if (!property || property.ownerId.toString() !== String(userId)) {
        throw new HttpError(404, "Property not found.");
    }

    return property;
}

/**
 * Returns the building when it exists and its property belongs
 * to the user.
 */
export async function getOwnedBuilding(buildingId, userId) {
    if (!mongoose.isValidObjectId(buildingId)) {
        throw new HttpError(400, "Invalid building id.");
    }

    const building = await Building.findById(buildingId);

    if (!building) {
        throw new HttpError(404, "Building not found.");
    }

    const property = await Property.findById(building.propertyId);

    if (!property || property.ownerId.toString() !== String(userId)) {
        throw new HttpError(404, "Building not found.");
    }

    return building;
}
