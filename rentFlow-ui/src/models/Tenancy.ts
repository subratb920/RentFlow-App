// ---------------- Owner side ----------------

export type TenancyStatus = "INVITED" | "ACTIVE" | "DECLINED";

/**
 * A tenant assigned to one of the owner's units.
 */
export interface Tenancy {
    id: string;
    propertyId: string;
    unitId: string;

    tenantName: string;
    tenantEmail: string;
    tenantPhone: string;

    moveInDate: string;
    monthlyRent: number;

    inviteCode: string;
    status: TenancyStatus;

    unitNumber: string;
    buildingName: string;
}

export interface AssignableUnit {
    id: string;
    buildingName: string;
    unitNumber: string;
    unitType: string;
    tenantCount: number;
    isFull: boolean;
}

export interface AssignableUnits {
    allowsSharedUnits: boolean;
    units: AssignableUnit[];
}

export interface CreateTenancyRequest {
    unitId: string;
    tenantName: string;
    tenantEmail: string;
    tenantPhone: string;
    moveInDate: string; // YYYY-MM-DD
    monthlyRent: number;
}

export interface OwnerAccessRequest {
    id: string;
    propertyId: string;
    propertyName: string;
    message: string;
    createdAt: string;
    tenant: {
        fullName: string;
        email: string;
        phone: string;
    };
}

// ---------------- Tenant side ----------------

export interface Residence {
    id: string;
    moveInDate: string;
    monthlyRent: number;
    unitNumber: string;
    buildingName: string;
    property: {
        id: string;
        propertyName: string;
        propertyType: string;
        address: string;
    };
    owner: {
        fullName: string;
        phone: string;
    };
}

export type AccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TenantAccessRequest {
    id: string;
    status: AccessRequestStatus;
    createdAt: string;
    propertyName: string;
    ownerName: string;
}

// An owner's invitation to the tenant's email, waiting for an answer
export interface PendingInvite {
    id: string;
    moveInDate: string;
    monthlyRent: number;
    createdAt: string;
    propertyName: string;
    propertyType: string;
    address: string;
    ownerName: string;
    unitNumber: string;
    buildingName: string;
}

export interface TenantHome {
    residences: Residence[];
    invites: PendingInvite[];
    requests: TenantAccessRequest[];
}

export interface Neighbour {
    id: string;
    tenantName: string;
    unitNumber: string;
    buildingName: string;
    isYou: boolean;
}

export interface OwnerSearchResult {
    owner: {
        id: string;
        fullName: string;
    };
    properties: {
        id: string;
        propertyName: string;
        propertyType: string;
        address: string;
    }[];
}
