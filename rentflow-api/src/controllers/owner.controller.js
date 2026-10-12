import * as accessRequestService from "../services/accessRequest.service.js";
import { sendError } from "../utils/httpError.js";

/**
 * GET /api/owner/requests
 * Pending tenant access requests
 */
export async function getRequests(req, res) {
    try {
        const requests = await accessRequestService.getOwnerRequests(req.user.id);

        res.json(requests);
    } catch (error) {
        sendError(res, error, "Failed to fetch requests.");
    }
}

/**
 * POST /api/owner/requests/:id/approve
 * Approves a request by assigning the tenant to a unit
 */
export async function approveRequest(req, res) {
    try {
        const tenancy = await accessRequestService.approveRequest(
            req.user.id,
            req.params.id,
            req.body
        );

        res.status(201).json(tenancy);
    } catch (error) {
        sendError(res, error, "Failed to approve request.");
    }
}

/**
 * POST /api/owner/requests/:id/reject
 */
export async function rejectRequest(req, res) {
    try {
        await accessRequestService.rejectRequest(req.user.id, req.params.id);

        res.status(204).end();
    } catch (error) {
        sendError(res, error, "Failed to reject request.");
    }
}
