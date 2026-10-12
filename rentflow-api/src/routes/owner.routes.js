import { Router } from "express";
import {
    approveRequest,
    getRequests,
    rejectRequest,
} from "../controllers/owner.controller.js";
import {
    addBill,
    confirmPayment,
    deleteBill,
    getOwnerBills,
    getPaymentSettings,
    rejectPayment,
    updatePaymentSettings,
} from "../controllers/bill.controller.js";

// Mounted behind authenticate + requireRole("OWNER") in app.js
const router = Router();

router.get("/requests", getRequests);

router.post("/requests/:id/approve", approveRequest);

router.post("/requests/:id/reject", rejectRequest);

router.get("/bills", getOwnerBills);

router.post("/bills", addBill);

router.post("/bills/:id/confirm", confirmPayment);

router.post("/bills/:id/reject", rejectPayment);

router.delete("/bills/:id", deleteBill);

router.get("/payment-settings", getPaymentSettings);

router.put("/payment-settings", updatePaymentSettings);

export default router;
