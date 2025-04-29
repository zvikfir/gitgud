const express = require("express");
const router = express.Router();
import { asyncHandler } from './middleware/errorHandler';
import { getDb } from '../infra/db/client';
import { eq, desc, and } from 'drizzle-orm';
import { users, policyContributors, policies, projects, policyExecutions } from '../infra/db/schema';
import { UserStacksModel } from '../models/userStacks';

export default function apiRoutes() {
  router.get("/", asyncHandler(async (req, res) => {
    if (req.isAuthenticated()) {
      const db = getDb();
      const userStacksModel = new UserStacksModel();

      // Add mock data to enhance the user object
      const enhancedUser = {
        ...req.user,
        displayName: req.user.displayName || "John Doe",
        role: "Developer",
        team: "Platform Security",
        recentActivities: [
          { type: "policy_review", date: "2024-01-15", description: "Reviewed AWS Security Policy" },
          { type: "contribution", date: "2024-01-14", description: "Updated Kubernetes Security Controls" }
        ],
        stats: {
          policiesReviewed: 15,
          contributionsLastMonth: 8,
          projectsInvolved: 4
        },
        stacks: await userStacksModel.findAllByUserId(req.user.id)
      };



      res.json(enhancedUser);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  }));

  router.get("/last-contribution", asyncHandler(async (req, res) => {
    // Mock data instead of DB query
    const mockContribution = {
      policyName: "AWS Security Controls v2",
      projectName: "Cloud Infrastructure",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      impact: "high",
      type: "security_update",
      summary: "Updated IAM policies and S3 bucket configurations"
    };
    
    res.json(mockContribution);
  }));

  router.get("/tasks", asyncHandler(async (req, res) => {
    const suggestedTasks = [
      {
        id: "task1",
        description: "Review Kubernetes RBAC policy updates",
        priority: "high",
        type: "policy_review",
        link: "/policies/k8s-rbac",
        estimatedTime: "30m",
        impact: "Critical security configuration"
      },
      {
        id: "task2",
        description: "Update AWS CloudFront security headers",
        priority: "medium",
        type: "policy_update",
        link: "/policies/cloudfront-headers",
        estimatedTime: "45m",
        impact: "Security hardening"
      },
      {
        id: "task3",
        description: "Document Docker image scanning policy",
        priority: "low",
        type: "documentation",
        link: "/policies/docker-scan",
        estimatedTime: "1h",
        impact: "Process improvement"
      }
    ];
    
    res.json(suggestedTasks);
  }));

  return router;
}
