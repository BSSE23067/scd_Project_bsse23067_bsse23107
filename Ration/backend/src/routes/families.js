import express from "express";
import { getFamilies, getFamilyById, createFamily } from "../services/families.service.js";

export default (db) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const families = await getFamilies(db);
    res.json(families);
  });

  router.get("/:id", async (req, res) => {
    const family = await getFamilyById(db, req.params.id);
    if (family) {
      res.json(family);
    } else {
      res.status(404).json({ error: "Family not found" });
    }
  });

  router.post("/", async (req, res) => {
    await createFamily(db, req.body);
    res.sendStatus(201);
  });

  return router;
};
