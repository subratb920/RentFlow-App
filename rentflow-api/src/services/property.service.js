import {
    createProperty,
    getPropertiesByOwner,
    updateProperty,
} from "../repositories/property.repository.js";

import {
    createSkeletonBuildings,
    MAX_FLOORS,
    MAX_UNITS_PER_BUILDING,
} from "./building.service.js";
import { HttpError, parseWholeNumber } from "../utils/httpError.js";
import { Unit } from "../models/Unit.js";
import { countTenanciesByProperty } from "./tenancy.service.js";
import { getOwnedProperty } from "./access.service.js";

const MAX_BUILDINGS = 100;
const MAX_TEXT_LENGTH = 100;
const MAX_ADDRESS_LENGTH = 500;

export async function create(propertyData, ownerId) {
    const { numberOfFloors, ...propertyFields } =
        validatePropertyFields(propertyData);

    // Create the property from the accepted fields only
    const property = await createProperty({
        ...propertyFields,
        ownerId,
    });

    // Create the default buildings
    const buildingIds = await createSkeletonBuildings(
        property,
        numberOfFloors
    );

    // Update the property with the generated building ids
    const updatedProperty = await updateProperty(property.id, {
        buildingIds,
    });

    // Return the updated property
    return updatedProperty;
}

/**
 * The owner's properties with how many units are configured and how
 * many tenants are assigned (decides setup vs. manage in the app).
 */
export async function getProperties(ownerId) {
    const properties = await getPropertiesByOwner(ownerId);
    const propertyIds = properties.map((property) => property._id);

    const [configured, tenantCounts] = await Promise.all([
        Unit.aggregate([
            { $match: { propertyId: { $in: propertyIds }, isConfigured: true } },
            { $group: { _id: "$propertyId", count: { $sum: 1 } } },
        ]),
        countTenanciesByProperty(propertyIds),
    ]);

    const configuredCounts = new Map(
        configured.map((entry) => [entry._id.toString(), entry.count])
    );

    return properties.map((property) => ({
        ...property.toJSON(),
        configuredUnits: configuredCounts.get(property.id) ?? 0,
        tenantCount: tenantCounts.get(property.id) ?? 0,
    }));
}

/**
 * Updates the property's name and address. The type and building
 * structure are managed through buildings and units.
 */
export async function updatePropertyDetails(propertyId, data, ownerId) {
    await getOwnedProperty(propertyId, ownerId);

    const updates = {
        propertyName: requiredText(data.propertyName, "propertyName", "Property name"),
        address: String(data.address ?? "").trim(),
    };

    if (updates.address.length > MAX_ADDRESS_LENGTH) {
        throw new HttpError(
            400,
            `Address must be ${MAX_ADDRESS_LENGTH} characters or fewer.`,
            "address"
        );
    }

    return await updateProperty(propertyId, updates);
}

function validatePropertyFields(data) {
    const propertyName = requiredText(data.propertyName, "propertyName", "Property name");
    const propertyType = requiredText(data.propertyType, "propertyType", "Property type");
    const address = String(data.address ?? "").trim();

    if (address.length > MAX_ADDRESS_LENGTH) {
        throw new HttpError(
            400,
            `Address must be ${MAX_ADDRESS_LENGTH} characters or fewer.`,
            "address"
        );
    }

    return {
        propertyName,
        propertyType,
        address,
        totalBuildings: parseWholeNumber(data.totalBuildings, {
            field: "totalBuildings",
            label: "Number of buildings",
            min: 1,
            max: MAX_BUILDINGS,
        }),
        totalUnits: parseWholeNumber(data.totalUnits ?? 0, {
            field: "totalUnits",
            label: "Number of units",
            max: MAX_UNITS_PER_BUILDING,
        }),
        // Floors of the building for single-building properties;
        // stored on the building, not the property.
        numberOfFloors: parseWholeNumber(data.numberOfFloors ?? 0, {
            field: "numberOfFloors",
            label: "Number of floors",
            max: MAX_FLOORS,
        }),
    };
}

function requiredText(value, field, label) {
    const text = String(value ?? "").trim();

    if (!text) {
        throw new HttpError(400, `${label} is required.`, field);
    }

    if (text.length > MAX_TEXT_LENGTH) {
        throw new HttpError(
            400,
            `${label} must be ${MAX_TEXT_LENGTH} characters or fewer.`,
            field
        );
    }

    return text;
}
