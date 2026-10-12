import { Router } from "express";
import {
    createUnit,
    getUnitById,
    getUnits,
    updateUnit,
} from "../controllers/unit.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getUnits);

router.post("/", authenticate, createUnit);

router.get("/:id", authenticate, getUnitById);

router.put("/:id", authenticate, updateUnit);

export default router;
