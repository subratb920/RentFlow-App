import * as tenancyService from "../services/tenancy.service.js";
import { sendError } from "../utils/httpError.js";

/**
 * POST /api/tenancies
 * Owner assigns a tenant to a unit (invitation by email or code)
 */
export async function createTenancy(req, res) {
    try {
        const tenancy = await tenancyService.createTenancy(req.user.id, req.body);

        res.status(201).json(tenancy);
    } catch (error) {
        sendError(res, error, "Failed to assign tenant.");
    }
}

/**
 * GET /api/tenancies?propertyId=123
 * Tenants of one of the owner's properties
 */
export async function getTenancies(req, res) {
    try {
        const { propertyId } = req.query;

        if (!propertyId) {
            return res.status(400).json({ message: "propertyId query parameter is required." });
        }

        const tenancies = await tenancyService.getPropertyTenancies(
            req.user.id,
            propertyId
        );

        res.json(tenancies);
    } catch (error) {
        sendError(res, error, "Failed to fetch tenants.");
    }
}

/**
 * GET /api/tenancies/assignable-units?propertyId=123
 * Configured units with their occupancy
 */
export async function getAssignableUnits(req, res) {
    try {
        const { propertyId } = req.query;

        if (!propertyId) {
            return res.status(400).json({ message: "propertyId query parameter is required." });
        }

        const result = await tenancyService.getAssignableUnits(
            req.user.id,
            propertyId
        );

        res.json(result);
    } catch (error) {
        sendError(res, error, "Failed to fetch units.");
    }
}

/**
 * DELETE /api/tenancies/:id
 * Removes a tenant from a unit
 */
export async function deleteTenancy(req, res) {
    try {
        await tenancyService.deleteTenancy(req.user.id, req.params.id);

        res.status(204).end();
    } catch (error) {
        sendError(res, error, "Failed to remove tenant.");
    }
}
