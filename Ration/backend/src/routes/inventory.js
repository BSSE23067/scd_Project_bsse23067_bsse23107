import express from "express";
import { getInventory, upsertInventory } from "../services/inventory.service.js";

export default (db) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const inventory = await getInventory(db);
    res.json(inventory);
  });

  router.post("/", async (req, res) => {
    await upsertInventory(db, req.body);
    res.sendStatus(201);
  });

  return router;
};
