import { UNIT_TYPES } from "../models/Unit.js";
import {
    createUnit,
    createUnits,
    deleteUnitsByIds,
    findUnitByNumberKey,
    getHighestSequence,
    getTrailingUnconfiguredUnits,
    getUnitById,
    getUnitsByBuildingId,
    updateUnitById,
} from "../repositories/unit.repository.js";
import {
    getBuildingsByPropertyId,
    updateBuildingById,
} from "../repositories/building.repository.js";
import { updateProperty } from "../repositories/property.repository.js";
import { getOwnedBuilding } from "./access.service.js";
import { HttpError, parseWholeNumber } from "../utils/httpError.js";

const MAX_UNIT_NUMBER_LENGTH = 20;
const MAX_PARKING_SPOT_LENGTH = 20;

/**
 * Adds or removes skeleton (unconfigured) units so the building has
 * exactly `targetTotal` units. Configured units are never removed;
 * callers must reject targets below the configured count first.
 * Returns the building's unit ids in display order.
 */
export async function syncSkeletonUnits(building, targetTotal) {
    const units = await getUnitsByBuildingId(building.id);
    const difference = targetTotal - units.length;

    if (difference > 0) {
        const highestSequence = await getHighestSequence(building.id);

        await createUnits(
            Array.from({ length: difference }, (_, index) => ({
                propertyId: building.propertyId,
                buildingId: building.id,
                sequence: highestSequence + index + 1,
            }))
        );
    } else if (difference < 0) {
        const removable = await getTrailingUnconfiguredUnits(
            building.id,
            -difference
        );

        if (removable.length < -difference) {
            throw new HttpError(
                400,
                "Cannot remove units that are already configured.",
                "totalUnits"
            );
        }

        await deleteUnitsByIds(removable.map((unit) => unit._id));
    }

    const syncedUnits = await getUnitsByBuildingId(building.id);

    return syncedUnits.map((unit) => unit._id);
}

/**
 * Keeps property.totalUnits equal to the sum of its buildings' units.
 */
export async function refreshPropertyUnitTotal(propertyId) {
    const buildings = await getBuildingsByPropertyId(propertyId);

    const totalUnits = buildings.reduce(
        (sum, building) => sum + building.totalUnits,
        0
    );

    await updateProperty(propertyId, { totalUnits });
}

export async function getUnitsForBuilding(buildingId, userId) {
    const building = await getOwnedBuilding(buildingId, userId);
    const units = await getUnitsByBuildingId(buildingId);

    // Buildings configured before units existed have a totalUnits
    // count but no unit records; create their skeleton units now.
    if (units.length < building.totalUnits) {
        const unitIds = await syncSkeletonUnits(building, building.totalUnits);

        await updateBuildingById(building.id, { unitIds });

        return await getUnitsByBuildingId(buildingId);
    }

    return units;
}

export async function getUnit(unitId, userId) {
    const unit = await findUnit(unitId);

    await getOwnedBuilding(unit.buildingId.toString(), userId);

    return unit;
}

/**
 * Saves a unit's details and marks it configured.
 */
export async function updateUnit(unitId, data, userId) {
    const unit = await findUnit(unitId);
    const building = await getOwnedBuilding(
        unit.buildingId.toString(),
        userId
    );

    const fields = validateUnitFields(data, building);

    await assertUnitNumberAvailable(building.id, fields.unitNumberKey, unit.id);

    return await saveUnit(() =>
        updateUnitById(unitId, { ...fields, isConfigured: true })
    );
}

/**
 * Adds a new, configured unit to a building and increases the
 * building's unit count.
 */
export async function createUnitInBuilding(data, userId) {
    if (!data.buildingId) {
        throw new HttpError(400, "buildingId is required.");
    }

    const building = await getOwnedBuilding(data.buildingId, userId);
    const fields = validateUnitFields(data, building);

    await assertUnitNumberAvailable(building.id, fields.unitNumberKey);

    const highestSequence = await getHighestSequence(building.id);

    const unit = await saveUnit(() =>
        createUnit({
            ...fields,
            propertyId: building.propertyId,
            buildingId: building.id,
            sequence: highestSequence + 1,
            isConfigured: true,
        })
    );

    const units = await getUnitsByBuildingId(building.id);

    await updateBuildingById(building.id, {
        totalUnits: units.length,
        unitIds: units.map((existing) => existing._id),
    });

    await refreshPropertyUnitTotal(building.propertyId);

    return unit;
}

async function findUnit(unitId) {
    const unit = await getUnitById(unitId).catch(() => null);

    if (!unit) {
        throw new HttpError(404, "Unit not found.");
    }

    return unit;
}

function validateUnitFields(data, building) {
    const unitNumber = String(data.unitNumber ?? "").trim();

    if (!unitNumber) {
        throw new HttpError(400, "Unit number is required.", "unitNumber");
    }

    if (unitNumber.length > MAX_UNIT_NUMBER_LENGTH) {
        throw new HttpError(
            400,
            `Unit number must be ${MAX_UNIT_NUMBER_LENGTH} characters or fewer.`,
            "unitNumber"
        );
    }

    const floor = parseOptionalFloor(data.floor, building);

    if (!UNIT_TYPES.includes(data.unitType)) {
        throw new HttpError(400, "Select a valid unit type.", "unitType");
    }

    const parkingAssigned = data.parkingAssigned === true;
    const parkingSpotNumber = parkingAssigned
        ? String(data.parkingSpotNumber ?? "").trim()
        : "";

    if (parkingAssigned && !parkingSpotNumber) {
        throw new HttpError(
            400,
            "Parking spot number is required when parking is assigned.",
            "parkingSpotNumber"
        );
    }

    if (parkingSpotNumber.length > MAX_PARKING_SPOT_LENGTH) {
        throw new HttpError(
            400,
            `Parking spot number must be ${MAX_PARKING_SPOT_LENGTH} characters or fewer.`,
            "parkingSpotNumber"
        );
    }

    return {
        unitNumber,
        unitNumberKey: unitNumber.toLowerCase(),
        floor,
        unitType: data.unitType,
        parkingAssigned,
        parkingSpotNumber,
    };
}

/**
 * Floor is optional. When given it must be Ground (0) up to
 * numberOfFloors - 1, so the building needs its floors set first.
 */
function parseOptionalFloor(value, building) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    if (building.numberOfFloors < 1) {
        throw new HttpError(
            400,
            "Set the building's number of floors before choosing a floor.",
            "floor"
        );
    }

    return parseWholeNumber(value, {
        field: "floor",
        label: "Floor",
        min: 0,
        max: building.numberOfFloors - 1,
    });
}

async function assertUnitNumberAvailable(buildingId, unitNumberKey, currentUnitId) {
    const existing = await findUnitByNumberKey(buildingId, unitNumberKey);

    if (existing && existing.id !== currentUnitId) {
        throw duplicateUnitNumberError();
    }
}

/**
 * Runs a write, converting a unique-index violation (two requests
 * racing for the same unit number) into a 409.
 */
async function saveUnit(write) {
    try {
        return await write();
    } catch (error) {
        if (error?.code === 11000) {
            throw duplicateUnitNumberError();
        }

        throw error;
    }
}

function duplicateUnitNumberError() {
    return new HttpError(
        409,
        "This unit number already exists in this building.",
        "unitNumber"
    );
}
