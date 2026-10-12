import apiClient from "./apiClient";

import {
    Neighbour,
    OwnerSearchResult,
    TenantHome,
} from "../models/Tenancy";

// Tenant-side endpoints

export async function getTenantHome(): Promise<TenantHome> {
    const response = await apiClient.get("/tenant/home");

    return response.data;
}

export async function getPropertyTenants(
    propertyId: string
): Promise<Neighbour[]> {
    const response = await apiClient.get(
        `/tenant/properties/${propertyId}/tenants`
    );

    return response.data;
}

export async function joinWithInviteCode(code: string): Promise<void> {
    await apiClient.post("/tenant/join", { code });
}

export async function acceptInvite(tenancyId: string): Promise<void> {
    await apiClient.post(`/tenant/invites/${tenancyId}/accept`);
}

export async function declineInvite(tenancyId: string): Promise<void> {
    await apiClient.post(`/tenant/invites/${tenancyId}/decline`);
}

export async function findOwner(
    name: string,
    phone: string
): Promise<OwnerSearchResult> {
    const response = await apiClient.get("/tenant/owners/search", {
        params: { name, phone },
    });

    return response.data;
}

export async function requestAccess(
    ownerId: string,
    propertyId: string
): Promise<void> {
    await apiClient.post("/tenant/requests", { ownerId, propertyId });
}
