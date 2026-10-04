import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import buildingRoutes from "./routes/building.routes.js";

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/buildings", buildingRoutes);
// app.use("/api/units", unitRoutes);
// app.use("/api/tenants", tenantRoutes);

export default app;