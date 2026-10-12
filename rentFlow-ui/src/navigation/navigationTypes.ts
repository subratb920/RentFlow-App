export type RootStackParamList = {
    Home: undefined;

    Auth: undefined;

    // New Google user adds a phone number to finish signing up
    CompleteProfile: {
        signupToken: string;
        fullName: string;
        email: string;
    };

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

    // Units list for a building
    CreateUnits: {
        propertyId: string;
        buildingId: string;
    };

    // Unit setup; without unitId it adds a new unit
    UnitSetup: {
        propertyId: string;
        buildingId: string;
        unitId?: string;
    };

    Dashboard: undefined;

    // Owner: manage a property with configured units
    PropertyDetail: {
        propertyId: string;
    };

    EditProperty: {
        propertyId: string;
    };

    // Owner assigns a tenant; with requestId it approves that
    // tenant's access request instead
    AssignTenant: {
        propertyId: string;
        request?: {
            id: string;
            tenantName: string;
            tenantEmail: string;
            tenantPhone: string;
        };
    };

    TenantRequests: undefined;

    // Tenant app
    TenantHome: undefined;

    JoinProperty: undefined;

    FindOwner: undefined;

    // Messaging (owners and tenants)
    Inbox: undefined;

    Chat: {
        propertyId: string;
        userId: string;
        name: string;
    };

    Broadcasts: {
        propertyId: string;
        propertyName: string;
    };

    NewMessage: undefined;

    // Bills
    TenantBills: undefined;

    BillDetail: {
        billId: string;
    };

    OwnerBills: {
        propertyId: string;
    };

    AddBill: {
        propertyId: string;
    };

    PaymentSettings: undefined;
};