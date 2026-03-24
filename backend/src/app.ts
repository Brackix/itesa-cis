import express from "express";
import cors from "cors";
import { corsConfig } from "./config/cors.config";
import apiRouter from "./routes/index";

const app = express();

// Middlewares
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// Routes
app.use("/api", apiRouter);

export default app;
