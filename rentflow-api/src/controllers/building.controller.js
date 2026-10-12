import * as buildingService from "../services/building.service.js";
import { sendError } from "../utils/httpError.js";

/**
 * POST /api/buildings
 * Creates a building attached to a propertyId supplied in req.body
 */
export async function createBuilding(req, res) {
    try {
        const { propertyId, buildingName, numberOfFloors } = req.body;

        if (!propertyId) {
            return res.status(400).json({ message: "propertyId is required." });
        }

        const building = await buildingService.createBuildingForProperty(
            propertyId,
            { buildingName, numberOfFloors },
            req.user.id
        );

        res.status(201).json(building);
    } catch (error) {
        sendError(res, error, "Failed to create building.");
    }
}

/**
 * GET /api/buildings?propertyId=123
 * Fetches all buildings belonging to a specific property when the user taps on it
 */
export async function getBuildings(req, res) {
    try {
        const { propertyId } = req.query;

        if (!propertyId) {
            return res.status(400).json({ message: "propertyId query parameter is required." });
        }

        const buildings = await buildingService.getBuildingsByProperty(
            propertyId,
            req.user.id
        );

        res.json(buildings);
    } catch (error) {
        sendError(res, error, "Failed to fetch buildings.");
    }
}

/**
 * GET /api/buildings/:buildingId
 * Fetches a single building's details
 */
export async function getBuildingById(req, res) {
    try {
        const building = await buildingService.getBuilding(
            req.params.buildingId,
            req.user.id
        );

        res.json(building);
    } catch (error) {
        sendError(res, error, "Failed to fetch building.");
    }
}

/**
 * PUT /api/buildings/:id
 * Updates the building name, number of floors and number of units
 */
export async function updateBuilding(req, res) {
    try {
        const updatedBuilding = await buildingService.update(
            req.params.id,
            req.body,
            req.user.id
        );

        res.json(updatedBuilding);
    } catch (error) {
        sendError(res, error, "Failed to update building.");
    }
}
