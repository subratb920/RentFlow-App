import { Router } from "express";

import { createProperty } from "../controllers/property.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { getProperties } from "../controllers/property.controller.js";

const router = Router();

// Protected route
router.post("/", authenticate, (req, res, next) => {
    console.log("Property route hit");
    next();
}, createProperty);

router.get(
    "/",
    authenticate,
    getProperties
);

export default router;