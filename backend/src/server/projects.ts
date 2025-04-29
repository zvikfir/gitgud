import { GitLabService } from '../integrations/gitlab/gitlab_service';
import { ProjectsModel } from '../models/projects';
import { PoliciesModel } from '../models/policies';
import { StacksModel } from '../models/stacks';
import { ProjectMembersModel } from '../models/projectMembers';
import { ProjectContributorsModel } from '../models/projectContributors';
import { asyncHandler } from './middleware/errorHandler';
import { ApiError, NotFoundError, ValidationError } from './middleware/errorHandler';
import { contributors, projectContributors } from '../infra/db/schema';

const express = require("express");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         externalId:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         pathWithNamespace:
 *           type: string
 *         webUrl:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         webhookId:
 *           type: string
 *         tags:
 *           type: string
 *         lifecycleId:
 *           type: integer
 *         default_branch:
 *           type: string
 *         languages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: 
 *                 type: integer
 *               name:
 *                 type: string
 *         stacks:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *         owners:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *         policies:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               qualified:
 *                 type: boolean
 */

export default function apiRoutes() {
  /**
   * @swagger
   * /api/projects:
   *   get:
   *     summary: Get all projects
   *     tags: [Projects]
   *     responses:
   *       200:
   *         description: List of projects
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 total:
   *                   type: number
   *                 results:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Project'
   */
  router.get("/", asyncHandler(async (req, res) => {
    const projectsModel = new ProjectsModel();
    const results = await projectsModel.findAll(req.user);
    res.json({ status: "ok", total: results.length, results });
  }));

  /**
   * @swagger
   * /api/projects:
   *   post:
   *     summary: Create a new project
   *     tags: [Projects]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - project_id
   *             properties:
   *               project_id:
   *                 type: integer
   *               lifecycle:
   *                 type: string
   *               stack:
   *                 oneOf:
   *                   - type: object
   *                     properties:
   *                       label:
   *                         type: string
   *                   - type: array
   *                     items:
   *                       type: object
   *                       properties:
   *                         label:
   *                           type: string
   *               owners:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     label:
   *                       type: string
   *               runtimes:
   *                 type: array
   *                 items:
   *                   type: string
   *               add_project_badge:
   *                 type: boolean
   *               add_project_webhook:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Project created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 total:
   *                   type: integer
   *                 result:
   *                   $ref: '#/components/schemas/Project'
   *       400:
   *         description: Validation error
   *       404:
   *         description: GitLab project not found
   */
  router.post('/', asyncHandler(async (req, res) => {
    const gitlab_service = new GitLabService();
    const projectMembersModel = new ProjectMembersModel();
    const projectContributorsModel = new ProjectContributorsModel();

    if (!req.body.project_id) {
      throw new ValidationError('project_id is required');
    }

    let payload = req.body;
    let gitlab_project = await gitlab_service.get_project(payload.project_id);

    if (!gitlab_project) {
      throw new NotFoundError('GitLab project not found');
    }

    let project = {
      id: payload.project_id,
      lifecycle: payload.lifecycle,
      stack: Array.isArray(payload.stack) ? payload.stack : [payload.stack],
      owners: payload.owners,
      runtimes: payload.runtimes,
      name: gitlab_project.name,
      description: gitlab_project.description || 'No description provided',
      path_with_namespace: gitlab_project.path_with_namespace,
      web_url: gitlab_project.web_url,
      tags: payload.topics ? payload.topics.join(',') : '',
      webhook_id: payload.webhook_id || '0',
      policies: function () {
        let policies = {};
        for (let policy of payload.policies) {
          policies[policy.id] = { enabled: policy.enabled, kpi: policy.kpi };
        }
        return policies;
      }(),
      languages: gitlab_project.languages || {},
      members: gitlab_project.members || [],
      contributors: gitlab_project.contributors || [],
      default_branch: gitlab_project.default_branch || 'master',
    }

    try {
      const projectsModel = new ProjectsModel();
      const result = await projectsModel.create(project, payload.add_project_kpi, payload.add_project_webhook);

      // Add project members if they exist
      if (gitlab_project.members) {
        for (const member of gitlab_project.members) {
          await projectMembersModel.createByMemberExternalId(result.id, member.id);
        }
      }

      if (gitlab_project.contributors) {
        for (const contributor of gitlab_project.contributors) {
          await projectContributorsModel.createByContributorEmail(result.id, contributor.email);
        }
      }

      res.json({ status: "ok", total: 1, result });
    }
    catch (e) {
      console.log(e);
      res.json({ status: "failed", error: e });
    }
  }));

  router.put("/:id", (req, res) => {
    res.json({ status: "ok" });
  });

  router.patch("/:id", (req, res) => {
    res.json({ status: "ok" });
  });

  router.get("/external", asyncHandler(async (req, res) => {
    const gitlab_service = new GitLabService();
    let projects = await gitlab_service.get_projects(req.query.search);

    if (!projects) {
      throw new NotFoundError('No external projects found');
    }

    projects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      path_with_namespace: project.path_with_namespace,
    }));
    res.json({ status: "ok", total: projects.length, results: projects });
  }));

  router.get("/external/:id/policies", asyncHandler(async (req, res) => {
    const gitlab_service = new GitLabService();
    let project = await gitlab_service.get_project(req.params.id);

    if (!project) {
      throw new NotFoundError('External project not found');
    }

    let policiesModel = new PoliciesModel();
    let policies = await policiesModel.findAll();

    project.policies = {};
    let qualified_policies: any[] = [];
    for (let policy of policies) {
      let result = await policiesModel.isQualified(policy, project, null);
      policy.qualified = result;
      qualified_policies.push(policy);
    }

    res.json({ status: "ok", total: qualified_policies.length, results: qualified_policies });
  }));

  // router.get("/owners", async (req, res) => {
  //   let owners = ['645', '641'];
  //   res.json({ status: "ok", total: owners.length, results: owners });
  // });

  // router.get("/runtime_types", async (req, res) => {
  //   let types = ['Container', 'Library', 'Serverless', 'Command line'];
  //   res.json({ status: "ok", total: types.length, results: types });
  // });

  /**
   * @swagger
   * /api/projects/{id}:
   *   get:
   *     summary: Get a project by ID
   *     tags: [Projects]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: Project ID
   *     responses:
   *       200:
   *         description: Project details
   *       404:
   *         description: Project not found
   */
  router.get("/:id", asyncHandler(async (req, res) => {
    const projectsModel = new ProjectsModel();
    const project = await projectsModel.findOne(req.params.id);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    project.policies = project.policies || {};
    res.json({ status: "ok", total: 1, result: project });
  }));

  router.get("/:id/policies", asyncHandler(async (req, res) => {
    const projectsModel = new ProjectsModel();
    const project = await projectsModel.findOne(req.params.id);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    project.policies = project.policies || [];
    res.json({ status: "ok", total: 1, result: project.policies });
  }));

  router.post('/:id/evaluate', asyncHandler(async (req, res) => {
    const projectsModel = new ProjectsModel();
    const project = await projectsModel.findOne(req.params.id);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const gitlab_service = new GitLabService();
    await gitlab_service.evaluate(project.externalId, project.webhookId);
    res.json({ status: "ok" });
  }));


  return router;
}
