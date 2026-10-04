import { getPropertiesByOwner } from "../repositories/property.repository.js";
import { create } from "../services/property.service.js";

export const createProperty = async (req, res) => {
    try {
        const property = await create(
            req.body,
            req.user.id
        );

        res.status(201).json(property);
    } catch (error) {
        console.error("Create Property Error:", error);

        res.status(500).json({
            message: "Failed to create property.",
        });
    }
};

export async function getProperties(req, res) {
    try {
        const properties = await getPropertiesByOwner(req.user.id);

        res.json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch properties." });
    }
}