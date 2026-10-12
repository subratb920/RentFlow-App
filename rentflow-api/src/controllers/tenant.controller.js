import * as tenancyService from "../services/tenancy.service.js";
import * as accessRequestService from "../services/accessRequest.service.js";
import { sendError } from "../utils/httpError.js";

/**
 * GET /api/tenant/home
 * The tenant's properties (if any) and their access requests
 */
export async function getHome(req, res) {
    try {
        const [residences, invites, requests] = await Promise.all([
            tenancyService.getTenantResidences(req.currentUser),
            tenancyService.getPendingInvites(req.currentUser),
            accessRequestService.getTenantRequests(req.currentUser),
        ]);

        res.json({ residences, invites, requests });
    } catch (error) {
        sendError(res, error, "Failed to load your home.");
    }
}

/**
 * GET /api/tenant/properties/:propertyId/tenants
 * Everyone living in a property the tenant lives in
 */
export async function getPropertyTenants(req, res) {
    try {
        const tenants = await tenancyService.getPropertyTenantsForTenant(
            req.currentUser,
            req.params.propertyId
        );

        res.json(tenants);
    } catch (error) {
        sendError(res, error, "Failed to fetch tenants.");
    }
}

/**
 * POST /api/tenant/join
 * Joins a property with an invite code
 */
export async function joinWithCode(req, res) {
    try {
        await tenancyService.joinWithInviteCode(req.currentUser, req.body.code);

        res.status(204).end();
    } catch (error) {
        sendError(res, error, "Failed to join property.");
    }
}

/**
 * POST /api/tenant/invites/:id/accept
 * POST /api/tenant/invites/:id/decline
 */
export async function acceptInvite(req, res) {
    try {
        await tenancyService.respondToInvite(req.currentUser, req.params.id, true);

        res.status(204).end();
    } catch (error) {
        sendError(res, error, "Failed to accept invitation.");
    }
}

export async function declineInvite(req, res) {
    try {
        await tenancyService.respondToInvite(req.currentUser, req.params.id, false);

        res.status(204).end();
    } catch (error) {
        sendError(res, error, "Failed to decline invitation.");
    }
}

/**
 * GET /api/tenant/owners/search?name=...&phone=...
 * Finds an owner by name and exact phone number
 */
export async function findOwner(req, res) {
    try {
        const result = await accessRequestService.findOwner(req.query);

        res.json(result);
    } catch (error) {
        sendError(res, error, "Failed to find owner.");
    }
}

/**
 * POST /api/tenant/requests
 * Requests access to an owner's property
 */
export async function createRequest(req, res) {
    try {
        const request = await accessRequestService.createAccessRequest(
            req.currentUser,
            req.body
        );

        res.status(201).json(request);
    } catch (error) {
        sendError(res, error, "Failed to send request.");
    }
}
