/**
 * A unit within a building: a flat, office, shop or room depending
 * on the property type.
 */
export interface Unit {
    id: string;

    propertyId: string;
    buildingId: string;

    // Position within the building, used for the default name
    sequence: number;

    unitNumber: string;

    // 0 = Ground floor; null until configured
    floor: number | null;

    unitType: string;

    parkingAssigned: boolean;
    parkingSpotNumber: string;

    isConfigured: boolean;
}

export type UnitInput = Pick<
    Unit,
    "unitNumber" | "floor" | "unitType" | "parkingAssigned" | "parkingSpotNumber"
>;

export function getUnitDisplayName(unit: Unit): string {
    return unit.isConfigured && unit.unitNumber
        ? `Unit ${unit.unitNumber}`
        : `Unit ${unit.sequence}`;
}

export function getFloorLabel(floor: number): string {
    return floor === 0 ? "Ground" : `Floor ${floor}`;
}
