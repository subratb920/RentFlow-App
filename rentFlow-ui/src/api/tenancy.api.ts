import apiClient from "./apiClient";

import {
    AssignableUnits,
    CreateTenancyRequest,
    OwnerAccessRequest,
    Tenancy,
} from "../models/Tenancy";

// Owner-side tenant management

export async function getTenancies(
    propertyId: string
): Promise<Tenancy[]> {
    const response = await apiClient.get("/tenancies", {
        params: { propertyId },
    });

    return response.data;
}

export async function getAssignableUnits(
    propertyId: string
): Promise<AssignableUnits> {
    const response = await apiClient.get("/tenancies/assignable-units", {
        params: { propertyId },
    });

    return response.data;
}

export async function createTenancy(
    tenancy: CreateTenancyRequest
): Promise<Tenancy> {
    const response = await apiClient.post("/tenancies", tenancy);

    return response.data;
}

export async function deleteTenancy(id: string): Promise<void> {
    await apiClient.delete(`/tenancies/${id}`);
}

export async function getOwnerRequests(): Promise<OwnerAccessRequest[]> {
    const response = await apiClient.get("/owner/requests");

    return response.data;
}

export async function approveRequest(
    requestId: string,
    assignment: Pick<CreateTenancyRequest, "unitId" | "moveInDate" | "monthlyRent">
): Promise<Tenancy> {
    const response = await apiClient.post(
        `/owner/requests/${requestId}/approve`,
        assignment
    );

    return response.data;
}

export async function rejectRequest(requestId: string): Promise<void> {
    await apiClient.post(`/owner/requests/${requestId}/reject`);
}
