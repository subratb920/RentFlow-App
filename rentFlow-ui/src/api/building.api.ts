import apiClient from "./apiClient";

import { Building } from "../models/Building";

export async function createBuilding(
    building: Omit<Building, "id">
): Promise<Building> {
    const response = await apiClient.post(
        "/buildings",
        building
    );

    return response.data;
}

export async function getBuildingsByProperty(
    propertyId: string
): Promise<Building[]> {
    const response = await apiClient.get("/buildings", {
        params: { propertyId },
    });

    return response.data;
}

export async function updateBuilding(
    id: string,
    building: Partial<Building>
): Promise<Building> {
    const response = await apiClient.put(
        `/buildings/${id}`,
        building
    );

    return response.data;
}