import { Building } from "../models/Building.js";

/**
 * Creates a new building
 */
export async function createBuilding(data) {
    return await Building.create(data);
}

/**
 * Returns all buildings for a property.
 * Returns Mongoose documents so the schema's toJSON()
 * transform converts _id -> id.
 */
export async function getBuildingsByPropertyId(propertyId) {
    return await Building.find({ propertyId });
}

/**
 * Returns a single building by id.
 * Returns a Mongoose document so toJSON() is applied.
 */
export async function getBuildingById(buildingId) {
    return await Building.findById(buildingId);
}

/**
 * Updates a building and returns the updated document.
 */
export async function updateBuildingById(buildingId, updateData) {
    return await Building.findByIdAndUpdate(
        buildingId,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );
}