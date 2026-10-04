import { Property } from "../models/Property.js";

export async function createProperty(propertyData) {
    return await Property.create(propertyData);
}

export async function getPropertiesByOwner(ownerId) {
    return await Property.find({ ownerId });
}

export async function updateProperty(propertyId, updateData) {
    return await Property.findByIdAndUpdate(
        propertyId,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );
}