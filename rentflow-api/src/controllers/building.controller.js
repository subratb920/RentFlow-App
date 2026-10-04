import * as buildingService from "../services/building.service.js";

/**
 * POST /api/buildings
 * Creates a building attached to a propertyId supplied in req.body
 */
export async function createBuilding(req, res) {
    try {
        const { propertyId, buildingName, numberOfFloors, totalUnits } = req.body;

        if (!propertyId) {
            return res.status(400).json({ message: "propertyId is required." });
        }

        if (!buildingName) {
            return res.status(400).json({ message: "Building name is required." });
        }

        const building = await buildingService.createBuildingForProperty(
            propertyId,
            {
                buildingName,
                numberOfFloors: Number(numberOfFloors) || 1,
                totalUnits: Number(totalUnits) || 0,
            }
        );

        res.status(201).json(building);
    } catch (error) {
        console.error("Error creating building:", error);
        res.status(500).json({ message: "Failed to create building." });
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

        const buildings = await buildingService.getBuildingsByProperty(propertyId);

        res.json(buildings);
    } catch (error) {
        console.error("Error fetching buildings:", error);
        res.status(500).json({ message: "Failed to fetch buildings." });
    }
}

/**
 * GET /api/buildings/:buildingId
 * Fetches a single building's details
 */
export async function getBuildingById(req, res) {
    try {
        const { buildingId } = req.params;
        const building = await buildingService.getBuildingById(buildingId);

        if (!building) {
            return res.status(404).json({ message: "Building not found." });
        }

        res.json(building);
    } catch (error) {
        console.error("Error fetching building:", error);
        res.status(500).json({ message: "Failed to fetch building." });
    }
}

export async function updateBuilding(req, res) {
    try {
        const { id } = req.params;

        const updatedBuilding = await buildingService.update(id, req.body);

        if (!updatedBuilding) {
            return res.status(404).json({
                message: "Building not found.",
            });
        }

        res.json(updatedBuilding);
    } catch (error) {
        console.error("Error updating building:", error);

        res.status(500).json({
            message: "Failed to update building.",
        });
    }
}