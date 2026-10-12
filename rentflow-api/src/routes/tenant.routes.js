import { Router } from "express";
import {
    acceptInvite,
    createRequest,
    declineInvite,
    findOwner,
    getHome,
    getPropertyTenants,
    joinWithCode,
} from "../controllers/tenant.controller.js";
import {
    getPaymentOptions,
    getTenantBills,
    startRazorpayPayment,
    submitUpiPayment,
    verifyRazorpayPayment,
} from "../controllers/bill.controller.js";

// Mounted behind authenticate + requireRole("TENANT") in app.js
const router = Router();

router.get("/home", getHome);

router.get("/properties/:propertyId/tenants", getPropertyTenants);

router.post("/join", joinWithCode);

router.post("/invites/:id/accept", acceptInvite);

router.post("/invites/:id/decline", declineInvite);

router.get("/owners/search", findOwner);

router.post("/requests", createRequest);

router.get("/bills", getTenantBills);

router.get("/bills/:id/payment-options", getPaymentOptions);

router.post("/bills/:id/upi", submitUpiPayment);

router.post("/bills/:id/razorpay", startRazorpayPayment);

router.post("/bills/:id/razorpay/verify", verifyRazorpayPayment);

export default router;
