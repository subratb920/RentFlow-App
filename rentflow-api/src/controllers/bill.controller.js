import * as billService from "../services/bill.service.js";
import { sendError } from "../utils/httpError.js";

// ---------------- Tenant ----------------

/**
 * GET /api/tenant/bills
 */
export async function getTenantBills(req, res) {
    try {
        res.json(await billService.getTenantBills(req.currentUser));
    } catch (error) {
        sendError(res, error, "Failed to load bills.");
    }
}

/**
 * GET /api/tenant/bills/:id/payment-options
 */
export async function getPaymentOptions(req, res) {
    try {
        res.json(await billService.getPaymentOptions(req.currentUser, req.params.id));
    } catch (error) {
        sendError(res, error, "Failed to load payment options.");
    }
}

/**
 * POST /api/tenant/bills/:id/upi
 */
export async function submitUpiPayment(req, res) {
    try {
        res.json(await billService.submitUpiPayment(
            req.currentUser,
            req.params.id,
            req.body.reference
        ));
    } catch (error) {
        sendError(res, error, "Failed to record payment.");
    }
}

/**
 * POST /api/tenant/bills/:id/razorpay
 */
export async function startRazorpayPayment(req, res) {
    try {
        res.json(await billService.startRazorpayPayment(req.currentUser, req.params.id));
    } catch (error) {
        sendError(res, error, "Failed to start payment.");
    }
}

/**
 * POST /api/tenant/bills/:id/razorpay/verify
 */
export async function verifyRazorpayPayment(req, res) {
    try {
        res.json(await billService.verifyRazorpayPayment(req.currentUser, req.params.id));
    } catch (error) {
        sendError(res, error, "Failed to check payment.");
    }
}

// ---------------- Owner ----------------

/**
 * GET /api/owner/bills?propertyId=123
 */
export async function getOwnerBills(req, res) {
    try {
        res.json(await billService.getOwnerBills(req.user.id, req.query.propertyId));
    } catch (error) {
        sendError(res, error, "Failed to load bills.");
    }
}

/**
 * POST /api/owner/bills
 */
export async function addBill(req, res) {
    try {
        res.status(201).json(await billService.addBill(req.user.id, req.body));
    } catch (error) {
        sendError(res, error, "Failed to add bill.");
    }
}

/**
 * POST /api/owner/bills/:id/confirm
 */
export async function confirmPayment(req, res) {
    try {
        res.json(await billService.confirmPayment(req.user.id, req.params.id));
    } catch (error) {
        sendError(res, error, "Failed to confirm payment.");
    }
}

/**
 * POST /api/owner/bills/:id/reject
 */
export async function rejectPayment(req, res) {
    try {
        res.json(await billService.rejectPayment(req.user.id, req.params.id));
    } catch (error) {
        sendError(res, error, "Failed to reject payment.");
    }
}

/**
 * DELETE /api/owner/bills/:id
 */
export async function deleteBill(req, res) {
    try {
        await billService.deleteBill(req.user.id, req.params.id);

        res.status(204).end();
    } catch (error) {
        sendError(res, error, "Failed to delete bill.");
    }
}

/**
 * GET /api/owner/payment-settings
 */
export async function getPaymentSettings(req, res) {
    try {
        res.json(await billService.getPaymentSettings(req.currentUser));
    } catch (error) {
        sendError(res, error, "Failed to load payment settings.");
    }
}

/**
 * PUT /api/owner/payment-settings
 */
export async function updatePaymentSettings(req, res) {
    try {
        res.json(await billService.updatePaymentSettings(req.currentUser, req.body));
    } catch (error) {
        sendError(res, error, "Failed to save payment settings.");
    }
}
