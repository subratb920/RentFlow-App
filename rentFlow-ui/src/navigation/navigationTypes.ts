export type RootStackParamList = {
    Home: undefined;

    Auth: undefined;

    Profile: undefined;

    CreateProperty: undefined;

    PropertySetup: undefined;

    CreateBuildings: {
        propertyId: string;
        totalBuildings: number;
        currentBuilding: number;
    };

    BuildingSetup: {
        propertyId: string;
        buildingId?: string;
        buildingName?: string;
    };

    CreateUnits: {
        propertyId: string;
        buildingId: string;
        totalUnits: number;
    };

    UnitSetup: {
        propertyId: string;
        buildingId: string;
        unitId: string;
        unitName: string;
    };

    CreateOfficeUnits: undefined;

    Dashboard: undefined;
};