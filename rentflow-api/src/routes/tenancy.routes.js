import { Router } from "express";
import {
    createTenancy,
    deleteTenancy,
    getAssignableUnits,
    getTenancies,
} from "../controllers/tenancy.controller.js";

// Mounted behind authenticate + requireRole("OWNER") in app.js
const router = Router();

router.get("/", getTenancies);

router.get("/assignable-units", getAssignableUnits);

router.post("/", createTenancy);

router.delete("/:id", deleteTenancy);

export default router;
