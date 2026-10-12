import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import buildingRoutes from "./routes/building.routes.js";
import unitRoutes from "./routes/unit.routes.js";
import tenancyRoutes from "./routes/tenancy.routes.js";
import ownerRoutes from "./routes/owner.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { authenticate } from "./middleware/auth.middleware.js";
import { requireRole, requireUser } from "./middleware/role.middleware.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "RentFlow API is running",
    });
});

const ownerOnly = [authenticate, requireRole("OWNER")];
const tenantOnly = [authenticate, requireRole("TENANT")];

// Routes
app.use("/api/auth", authRoutes);

// Property management is for owners only
app.use("/api/properties", ownerOnly, propertyRoutes);
app.use("/api/buildings", ownerOnly, buildingRoutes);
app.use("/api/units", ownerOnly, unitRoutes);
app.use("/api/tenancies", ownerOnly, tenancyRoutes);
app.use("/api/owner", ownerOnly, ownerRoutes);

app.use("/api/tenant", tenantOnly, tenantRoutes);

// Messaging is shared by owners and tenants
app.use("/api/messages", authenticate, requireUser, messageRoutes);

// Malformed JSON and other unhandled errors return JSON rather than
// Express's HTML page (which would expose stack traces).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid request body." });
    }

    console.error("Unhandled error:", err);

    res.status(err.status || 500).json({ message: "Something went wrong." });
});

export default app;