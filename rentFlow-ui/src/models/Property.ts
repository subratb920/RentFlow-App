export interface Property {
    id?: string;

    propertyName: string;
    propertyType: string;
    address: string;

    totalBuildings: number;
    totalUnits: number;

    buildingIds: string[];
}