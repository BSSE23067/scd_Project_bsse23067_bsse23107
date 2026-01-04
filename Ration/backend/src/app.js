import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ===== Fix for ES Modules =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env ONLY in local development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// ===== Import DB + Routes =====
import { createDB } from "./config/db.js";

import familiesRoutes from "./routes/families.js";
import inventoryRoutes from "./routes/inventory.js";
import transactionsRoutes from "./routes/transactions.js";

// ===== Create Express App =====
export const createApp = async () => {
  const app = express();

  const db = await createDB();

  app.use(cors({
    origin: [
      "https://relieftrack-frontend.s3.us-east-1.amazonaws.com/index.html",
      "https://relieftrack-frontend.s3.us-east-1.amazonaws.com",
      "http://relieftrack-frontend.s3.us-east-1.amazonaws.com/index.html",
      "http://relieftrack-frontend.s3.us-east-1.amazonaws.com",
      "http://localhost:5173" // keep localhost for dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false
  }));

  app.use(express.json());

  // Health check (Elastic Beanstalk uses this)
  app.get("/", (req, res) => {
    res.send("ReliefTrack Backend API is running");
  });

  app.use("/api/families", familiesRoutes(db));
  app.use("/api/inventory", inventoryRoutes(db));
  app.use("/api/transactions", transactionsRoutes(db));

  return app;
};
