const express = require("express");
const router = express.Router();
import { asyncHandler } from './middleware/errorHandler';
import { ApiError, NotFoundError, ValidationError } from './middleware/errorHandler';

import { StacksModel } from "../models/stacks";
import { UserStacksModel } from "../models/userStacks";
import { ProjectsModel } from "../models/projects";

export default function apiRoutes() {
  router.get("/", asyncHandler(async (req, res) => {
    const stacksModel = new StacksModel();
    let projectsModel = new ProjectsModel();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || "";

    const results = await stacksModel.findAllByUserId(req.user.id, searchQuery, page, limit);
    //iterate over the stacks and for each get the projects
    for (let stack of results) {
      stack.projects = await projectsModel.findAll(req.user, stack.id);
    }
    
    res.json({ status: "ok", total: results.length, results });
  }));

  router.get("/:id/projects", async (req, res) => {
    let stacksModel = new StacksModel();
    let stack = await stacksModel.findOne(req.params.id);

    let projectsModel = new ProjectsModel();
    let projects = await projectsModel.findAll(req.user, stack.id);
    res.json({ status: "ok", total: 1, projects, stack });
  });

  router.get("/:id", async (req, res) => {
    let stacksModel = new StacksModel();
    let result = await stacksModel.findOne(req.params.id);
    res.json({ status: "ok", total: 1, result });
  });

  router.post("/", (req, res) => {
    let stacksModel = new StacksModel();
    let result = stacksModel.createOrUpdate(req.body);
    res.json({ status: "ok", result });
  });

  router.put("/:id", (req, res) => {
    let stacksModel = new StacksModel();
    let result = stacksModel.createOrUpdate(req.body);
    res.json({ status: "ok", result });
  });

  router.patch("/:id", (req, res) => {
    let stacksModel = new StacksModel();
    let result = stacksModel.createOrUpdate(req.body);
    res.json({ status: "ok" });
  });

  router.delete("/:id", (req, res) => {
    let stacksModel = new StacksModel();
    stacksModel.remove(req.params.id);
    res.json({ status: "ok" });
  });

  router.post("/:id/follow", asyncHandler(async (req, res) => {
    const userStacksModel = new UserStacksModel();
    const { state } = req.body;
    const userId = req.user.id;
    const result = await userStacksModel.create(userId, req.params.id, state);
    res.json({ status: "ok", result });
  }));



  return router;
}