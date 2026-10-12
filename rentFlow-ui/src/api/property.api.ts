import apiClient from "./apiClient";

import { Property } from "../models/Property";

// numberOfFloors applies to the building of a single-building
// property; it is not stored on the property itself.
export type CreatePropertyRequest = Property & {
    numberOfFloors: number;
};

export async function createProperty(
    property: CreatePropertyRequest
): Promise<Property> {
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
export async function updateProperty(
    id: string,
    details: Pick<Property, "propertyName" | "address">
): Promise<Property> {
    const response = await apiClient.put(`/properties/${id}`, details);

    return response.data;
}
