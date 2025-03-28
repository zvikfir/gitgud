const express = require("express");
const router = express.Router();

import { BadgesModel } from "../models/badges";

export default function apiRoutes() {
  router.get("/", async (req, res) => {
    let badgesModel = new BadgesModel();
    let results = await badgesModel.findAll();
    res.json({ status: "ok", total: results.length, results });
  });

  router.get("/:id", async (req, res) => {
    let badgesModel = new BadgesModel();
    let result = await badgesModel.findOne(req.params.id);
    console.log('result', result);
    let completion = await badgesModel.getCompletion(req.params.id);
    console.log('completion', completion);
    if (!result) {
      return res.json({ status: "failed", error: "Not found" });
    }
    result.stats = {
      completion: {
        totals: completion,
        last_30_days: await badgesModel.getCompletionLast30Days(req.params.id),
      },
      earned: {
        totals: await badgesModel.getEarned(req.params.id),

      }
    }
    //result.policyCount = await badgesModel.getPolicyCount(req.params.id);
    res.json({ status: "ok", total: 1, result });
  });

  router.post("/", (req, res) => {
    let badgesModel = new BadgesModel();
    badgesModel.createOrUpdate(req.body);
    res.json({ status: "ok" });
  });

  router.put("/:id", (req, res) => {
    let badgesModel = new BadgesModel();
    badgesModel.createOrUpdate(req.body);
    res.json({ status: "ok" });
  });

  router.patch("/:id", (req, res) => {
    let badgesModel = new BadgesModel();
    badgesModel.createOrUpdate(req.body);
    res.json({ status: "ok" });
  });

  router.delete("/:id", (req, res) => {
    let badgesModel = new BadgesModel();
    badgesModel.remove(req.params.id);
    res.json({ status: "ok" });
  });


  return router;
}