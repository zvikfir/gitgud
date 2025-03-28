const express = require("express");
const router = express.Router();

import { PoliciesModel } from "../models/policies";

export default function apiRoutes() {
  /**
   * @swagger
   * /api/policies:
   *   get:
   *     summary: Retrieve the list of policies
   *     responses:
   *       200:
   *         description: A JSON object containing the status.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   */
  router.get("/", async (req, res) => {
    const policiesModel = new PoliciesModel();
    const results = await policiesModel.findAll();
    res.json({ status: "ok", total: results.length, results });
  });

  router.get("/:id", async (req, res) => {
    const policiesModel = new PoliciesModel();
    const result = await policiesModel.findOne(req.params.id);
    res.json({ status: "ok", total: 1, result });    
  });

  router.post("/", async (req, res) => {
    const policiesModel = new PoliciesModel();
    try {
      const result = await policiesModel.createOrUpdate({
        title: req.body.name,
        description: req.body.description,
        help: req.body.longDescription,
        kpi: req.body.kpi,
        handle: req.body.scriptJs,
        version: req.body.version,
        criteria: req.body.criteria,
        tags: req.body.tags,
        ordinal: req.body.ordinal,
        enabled: req.body.enabled,
        draft: req.body.draft,
        compliance: req.body.compliance
      });
      res.json({ status: "ok", result });
    } catch (error) {
      res.status(400).json({ status: "error", message: error.message });
    }
  });

  router.put("/:id", async (req, res) => {
    const policiesModel = new PoliciesModel();
    try {
      const result = await policiesModel.createOrUpdate({
        id: req.params.id,
        title: req.body.name,
        description: req.body.description,
        help: req.body.longDescription,
        kpi: req.body.kpi,
        handle: req.body.scriptJs,
        version: req.body.version,
        criteria: req.body.criteria,
        tags: req.body.tags,
        ordinal: req.body.ordinal,
        enabled: req.body.enabled,
        draft: req.body.draft,
        compliance: req.body.compliance
      });
      res.json({ status: "ok", result });
    } catch (error) {
      res.status(400).json({ status: "error", message: error.message });
      console.log(error);
    }
  });

  router.patch("/:id", (req, res) => {
    res.json({ status: "ok" });
  });

  return router;
}

