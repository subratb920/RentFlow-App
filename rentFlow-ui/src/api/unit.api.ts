import apiClient from "./apiClient";

import { Unit, UnitInput } from "../models/Unit";

export async function getUnitsByBuilding(
    buildingId: string
): Promise<Unit[]> {
    const response = await apiClient.get("/units", {
        params: { buildingId },
    });

    return response.data;
}

export async function getUnitById(
    id: string
): Promise<Unit> {
    const response = await apiClient.get(`/units/${id}`);

    return response.data;
}

export async function createUnit(
    buildingId: string,
    unit: UnitInput
): Promise<Unit> {
    const response = await apiClient.post("/units", {
        buildingId,
        ...unit,
    });

    return response.data;
}

export async function updateUnit(
    id: string,
    unit: UnitInput
): Promise<Unit> {
    const response = await apiClient.put(`/units/${id}`, unit);

    return response.data;
}
