export interface Property {
    id?: string;

    propertyName: string;
    propertyType: string;
    address: string;

    totalBuildings: number;
    totalUnits: number;

    buildingIds: string[];

    // Included in the owner's property list
    configuredUnits?: number;
    tenantCount?: number;
}