import {
    createBuilding,
    getBuildingsByPropertyId,
    getBuildingById,
    updateBuildingById,
} from "../repositories/building.repository.js";

/**
 * Used by POST /buildings
 */
export async function createBuildingForProperty(buildingData) {
    return await createBuilding(buildingData);
}

/**
 * Used internally when a Property is created
 */
export async function createSkeletonBuildings(property) {
    const buildingIds = [];

    for (let i = 1; i <= property.totalBuildings; i++) {
        const building = await createBuilding({
            propertyId: property.id,
            buildingName: `Building ${i}`,
            numberOfFloors: 0,
            totalUnits: 0,
            unitIds: [],
            isConfigured: false,
        });

        buildingIds.push(building.id);
    }

    return buildingIds;
}

export async function getBuildingsByProperty(propertyId) {
    return await getBuildingsByPropertyId(propertyId);
}

export async function getBuilding(id) {
    return await getBuildingById(id);
}

export async function update(id, buildingData) {
    return await updateBuildingById(id, buildingData);
}