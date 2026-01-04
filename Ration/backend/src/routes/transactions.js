import express from "express";
import {
  getTransactions,
  createTransaction
} from "../services/transactions.service.js";

export default (db) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const txs = await getTransactions(db);
    res.json(txs);
  });

  router.post("/", async (req, res) => {
    try {
      await createTransaction(db, req.body);
      res.sendStatus(201);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};
