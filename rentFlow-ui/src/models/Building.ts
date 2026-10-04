export interface Building {
    id?: string;

    propertyId: string;

    buildingName: string;

    numberOfFloors: number;
    totalUnits: number;

    unitIds: string[];

    
}