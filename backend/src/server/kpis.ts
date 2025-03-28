import express from "express";
import { KPIsModel } from "../models/kpis";

const router = express.Router();

export default function apiRoutes() {
  router.get("/", async (req, res) => {
    const kpisModel = new KPIsModel();
    const results = await kpisModel.findAll();
    res.json({ status: "ok", results });
  });

  router.get("/:id", async (req, res) => {
    const kpisModel = new KPIsModel();
    const result = await kpisModel.findOne(req.params.id);
    if (!result) {
      res.status(404).json({ status: "error", message: "KPI not found" });
      return;
    }
    res.json({ status: "ok", result });
  });

  return router;
}