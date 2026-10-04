import {
    createProperty,
    getPropertiesByOwner,
    updateProperty,
} from "../repositories/property.repository.js";

import { createSkeletonBuildings } from "./building.service.js";

export async function create(propertyData, ownerId) {
    // Create the property
    const property = await createProperty({
        ...propertyData,
        ownerId,
    });

    // Create the default buildings
    const buildingIds = await createSkeletonBuildings(property);

    // Update the property with the generated building ids
    const updatedProperty = await updateProperty(property.id, {
        buildingIds,
    });

    // Return the updated property
    return updatedProperty;
}

export async function getProperties(ownerId) {
    return await getPropertiesByOwner(ownerId);
}