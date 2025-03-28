const express = require("express");
const router = express.Router();
import { asyncHandler } from './middleware/errorHandler';
import { ApiError, NotFoundError, ValidationError } from './middleware/errorHandler';

import { RuntimeModel } from "../models/runtimes";

export default function apiRoutes() {
  router.get("/", asyncHandler(async (req, res) => {
    const ownersModel = new RuntimeModel();
    let results: any[] = [];
    
    if (req.user?.isAdmin) {
      results = await ownersModel.findAll();
    } else {
      results = await ownersModel.findAllByContributor(req.user.externalId);
    }
    
    res.json({ status: "ok", total: results.length, results });
  }));

  router.get("/:id", async (req, res) => {
    let ownersModel = new RuntimeModel();
    let result = await ownersModel.findOne(req.params.id);
    res.json({ status: "ok", total: 1, result });
  });

  router.post("/", (req, res) => {
    let ownersModel = new RuntimeModel();
    let result = ownersModel.createOrUpdate(req.body);
    res.json({ status: "ok", result });
  });

  router.put("/:id", (req, res) => {
    let ownersModel = new RuntimeModel();
    let result = ownersModel.createOrUpdate(req.body);
    res.json({ status: "ok", result });
  });

  router.patch("/:id", (req, res) => {
    let ownersModel = new RuntimeModel();
    let result = ownersModel.createOrUpdate(req.body);
    res.json({ status: "ok" });
  });

  router.delete("/:id", (req, res) => {
    let ownersModel = new RuntimeModel();
    ownersModel.remove(req.params.id);
    res.json({ status: "ok" });
  });

  return router;
}