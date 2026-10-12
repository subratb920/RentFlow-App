import {
    create,
    getProperties as getOwnerProperties,
    updatePropertyDetails,
} from "../services/property.service.js";
import { sendError } from "../utils/httpError.js";

export const createProperty = async (req, res) => {
    try {
        const property = await create(
            req.body,
            req.user.id
        );

        res.status(201).json(property);
    } catch (error) {
        sendError(res, error, "Failed to create property.");
    }
};

export async function getProperties(req, res) {
    try {
        const properties = await getOwnerProperties(req.user.id);

        res.json(properties);
    } catch (error) {
        sendError(res, error, "Failed to fetch properties.");
    }
}

/**
 * PUT /api/properties/:id
 * Updates the property name and address
 */
export async function updateProperty(req, res) {
    try {
        const property = await updatePropertyDetails(
            req.params.id,
            req.body,
            req.user.id
        );

        res.json(property);
    } catch (error) {
        sendError(res, error, "Failed to update property.");
    }
}
