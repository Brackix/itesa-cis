import express from "express";
import cors from "cors";
import { corsConfig } from "./config/cors.config";
import apiRouter from "./routes/index";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./config/swagger.config";
const app = express();

// Middlewares
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use("/api/v1", apiRouter);

export default app;
