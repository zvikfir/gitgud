const express = require("express");
const router = express.Router();

import { PolicyExecutionsModel } from "../models/policyExecutions";

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
    const policyExecutionsModel = new PolicyExecutionsModel();
    const results = await policyExecutionsModel.findAll();
    res.json({ status: "ok", total: results.length, results });
  });

  router.get("/:id", async (req, res) => {
    const policyExecutionsModel = new PolicyExecutionsModel();
    const result = await policyExecutionsModel.findOne(req.params.id);
    res.json({ status: "ok", total: 1, result });    
  });

  router.put("/:id", async (req, res) => {
    let enabled = req.body.enabled;
   // await policies_repository.update_one(req.params.id, enabled);
    //res.json({ status: "ok" });
  });

  router.patch("/:id", (req, res) => {
    res.json({ status: "ok" });
  });

  return router;
}

