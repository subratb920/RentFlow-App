import * as unitService from "../services/unit.service.js";
import { sendError } from "../utils/httpError.js";

/**
 * GET /api/units?buildingId=123
 * Fetches all units in a building, in display order
 */
export async function getUnits(req, res) {
    try {
        const { buildingId } = req.query;

        if (!buildingId) {
            return res.status(400).json({ message: "buildingId query parameter is required." });
        }

        const units = await unitService.getUnitsForBuilding(
            buildingId,
            req.user.id
        );

        res.json(units);
    } catch (error) {
        sendError(res, error, "Failed to fetch units.");
    }
}

/**
 * GET /api/units/:id
 * Fetches a single unit's details
 */
export async function getUnitById(req, res) {
    try {
        const unit = await unitService.getUnit(req.params.id, req.user.id);

        res.json(unit);
    } catch (error) {
        sendError(res, error, "Failed to fetch unit.");
    }
}

/**
 * POST /api/units
 * Adds a new unit to the building supplied in req.body
 */
export async function createUnit(req, res) {
    try {
        const unit = await unitService.createUnitInBuilding(
            req.body,
            req.user.id
        );

        res.status(201).json(unit);
    } catch (error) {
        sendError(res, error, "Failed to create unit.");
    }
}

/**
 * PUT /api/units/:id
 * Saves a unit's details
 */
export async function updateUnit(req, res) {
    try {
        const unit = await unitService.updateUnit(
            req.params.id,
            req.body,
            req.user.id
        );

        res.json(unit);
    } catch (error) {
        sendError(res, error, "Failed to update unit.");
    }
}
