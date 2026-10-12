import { Unit } from "../models/Unit.js";

export async function createUnits(units) {
    return await Unit.insertMany(units);
}

export async function createUnit(data) {
    return await Unit.create(data);
}

/**
 * Returns the building's units in display order.
 */
export async function getUnitsByBuildingId(buildingId) {
    return await Unit.find({ buildingId }).sort({ sequence: 1 });
}

export async function getUnitById(unitId) {
    return await Unit.findById(unitId);
}

export async function countConfiguredUnits(buildingId) {
    return await Unit.countDocuments({ buildingId, isConfigured: true });
}

/**
 * Highest floor used by a configured unit, or -1 when none.
 */
export async function getHighestConfiguredFloor(buildingId) {
    const unit = await Unit.findOne({ buildingId, isConfigured: true })
        .sort({ floor: -1 })
        .select("floor");

    return unit?.floor ?? -1;
}

export async function findUnitByNumberKey(buildingId, unitNumberKey) {
    return await Unit.findOne({ buildingId, unitNumberKey });
}

export async function getHighestSequence(buildingId) {
    const unit = await Unit.findOne({ buildingId })
        .sort({ sequence: -1 })
        .select("sequence");

    return unit?.sequence ?? 0;
}

/**
 * Returns the last `count` unconfigured units (highest sequence first).
 */
export async function getTrailingUnconfiguredUnits(buildingId, count) {
    return await Unit.find({ buildingId, isConfigured: false })
        .sort({ sequence: -1 })
        .limit(count);
}

export async function deleteUnitsByIds(unitIds) {
    return await Unit.deleteMany({ _id: { $in: unitIds } });
}

export async function updateUnitById(unitId, updateData) {
    return await Unit.findByIdAndUpdate(
        unitId,
        updateData,
        {
            returnDocument: "after",
            runValidators: true,
        }
    );
}
