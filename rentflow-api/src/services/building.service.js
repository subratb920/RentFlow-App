import {
    createBuilding,
    getBuildingsByPropertyId,
    updateBuildingById,
} from "../repositories/building.repository.js";
import { updateProperty } from "../repositories/property.repository.js";
import {
    countConfiguredUnits,
    getHighestConfiguredFloor,
} from "../repositories/unit.repository.js";
import { getOwnedBuilding, getOwnedProperty } from "./access.service.js";
import {
    refreshPropertyUnitTotal,
    syncSkeletonUnits,
} from "./unit.service.js";
import { HttpError, parseWholeNumber } from "../utils/httpError.js";

const MAX_BUILDING_NAME_LENGTH = 60;
export const MAX_FLOORS = 200;
export const MAX_UNITS_PER_BUILDING = 1000;

/**
 * Used by POST /buildings: adds a building to an existing property.
 */
export async function createBuildingForProperty(propertyId, buildingData, userId) {
    const property = await getOwnedProperty(propertyId, userId);

    const building = await createBuilding({
        propertyId: property.id,
        buildingName: parseBuildingName(buildingData.buildingName),
        numberOfFloors: parseWholeNumber(buildingData.numberOfFloors ?? 0, {
            field: "numberOfFloors",
            label: "Number of floors",
            max: MAX_FLOORS,
        }),
        totalUnits: 0,
        unitIds: [],
    });

    const buildingIds = [...property.buildingIds, building._id];

    await updateProperty(property.id, {
        buildingIds,
        totalBuildings: buildingIds.length,
    });

    return building;
}

/**
 * Used internally when a Property is created. A single-building
 * property also gets its floors and skeleton units straight away.
 */
export async function createSkeletonBuildings(property, numberOfFloors = 0) {
    const buildingIds = [];
    const isSingleBuilding = property.totalBuildings === 1;

    for (let i = 1; i <= property.totalBuildings; i++) {
        const building = await createBuilding({
            propertyId: property.id,
            buildingName: `Building ${i}`,
            numberOfFloors: isSingleBuilding ? numberOfFloors : 0,
            totalUnits: isSingleBuilding ? property.totalUnits : 0,
            unitIds: [],
        });

        if (isSingleBuilding && property.totalUnits > 0) {
            const unitIds = await syncSkeletonUnits(
                building,
                property.totalUnits
            );

            await updateBuildingById(building.id, { unitIds });
        }

        buildingIds.push(building.id);
    }

    return buildingIds;
}

export async function getBuildingsByProperty(propertyId, userId) {
    await getOwnedProperty(propertyId, userId);

    return await getBuildingsByPropertyId(propertyId);
}

export async function getBuilding(id, userId) {
    return await getOwnedBuilding(id, userId);
}

/**
 * Updates the editable building fields and keeps its skeleton
 * units in step with totalUnits.
 */
export async function update(id, buildingData, userId) {
    const building = await getOwnedBuilding(id, userId);
    const updates = {};

    if ("buildingName" in buildingData) {
        updates.buildingName = parseBuildingName(buildingData.buildingName);
    }

    if ("numberOfFloors" in buildingData) {
        updates.numberOfFloors = parseWholeNumber(buildingData.numberOfFloors, {
            field: "numberOfFloors",
            label: "Number of floors",
            min: 1,
            max: MAX_FLOORS,
        });

        const highestFloor = await getHighestConfiguredFloor(building.id);

        if (highestFloor > updates.numberOfFloors - 1) {
            throw new HttpError(
                400,
                "A configured unit is on a floor above this number of floors.",
                "numberOfFloors"
            );
        }
    }

    if ("totalUnits" in buildingData) {
        updates.totalUnits = parseWholeNumber(buildingData.totalUnits, {
            field: "totalUnits",
            label: "Number of units",
            max: MAX_UNITS_PER_BUILDING,
        });

        const configuredCount = await countConfiguredUnits(building.id);

        if (updates.totalUnits < configuredCount) {
            throw new HttpError(
                400,
                `This building already has ${configuredCount} configured units.`,
                "totalUnits"
            );
        }

        updates.unitIds = await syncSkeletonUnits(building, updates.totalUnits);
    }

    const updatedBuilding = await updateBuildingById(id, updates);

    if ("totalUnits" in updates) {
        await refreshPropertyUnitTotal(building.propertyId);
    }

    return updatedBuilding;
}

function parseBuildingName(value) {
    const buildingName = String(value ?? "").trim();

    if (!buildingName) {
        throw new HttpError(400, "Building name is required.", "buildingName");
    }

    if (buildingName.length > MAX_BUILDING_NAME_LENGTH) {
        throw new HttpError(
            400,
            `Building name must be ${MAX_BUILDING_NAME_LENGTH} characters or fewer.`,
            "buildingName"
        );
    }

    return buildingName;
}
