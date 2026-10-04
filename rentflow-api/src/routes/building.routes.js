import { Router } from "express";
import {
    createBuilding,
    getBuildings,
    getBuildingById,
    updateBuilding,
} from "../controllers/building.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
    "/",
    authenticate,
    getBuildings
);

router.post("/", authenticate, (req, res, next) => {
    console.log("Building route hit");
    next();
}, createBuilding);

router.get("/:buildingId", authenticate, getBuildingById);

router.put("/:id", authenticate, updateBuilding);

export default router;