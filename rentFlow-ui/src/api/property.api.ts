import apiClient from "./apiClient";

import { Property } from "../models/Property";

export async function createProperty(
    property: Property
) {
    const response = await apiClient.post(
        "/properties",
        property
    );

    return response.data;
}

export async function getProperties(): Promise<Property[]> {
    const response = await apiClient.get("/properties");

    return response.data;
}