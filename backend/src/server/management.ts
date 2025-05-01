import { Router } from "express";
import { policies, projects, members, projectMembers, policyContributors, policyExecutions, badges, kpis } from "../infra/db/schema";
import { getDb } from "../infra/db/client";
import { and, eq, sql } from "drizzle-orm";
import { BadgesModel } from "../models/badges";

const router = Router();
/**
 * @swagger
 * /api/management/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieves active policies count and policy creation trends for the last 6 months
 *     tags:
 *       - Management
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 data:
 *                   type: object
 *                   properties:
 *                     activePoliciesCount:
 *                       type: number
 *                       example: 10
 *                     policyTrends:
 *                       type: object
 *                       properties:
 *                         labels:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
 *                         data:
 *                           type: array
 *                           items:
 *                             type: number
 *                           example: [5, 3, 7, 8, 4, 2]
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 */
export default function management() {
  router.get("/dashboard", async (req, res) => {
    try {
      const db = getDb();
      // Get active policies count
      const activePolicies = await db
        .select()
        .from(policies)
        .where(
          and(
            eq(policies.enabled, true),
            eq(policies.draft, false)
          )
        );

      // Get policy creation trends for the last 6 months
      const policyTrends = await db
        .select({
          month: sql`to_char(date_trunc('month', created_at), 'Mon')`,
          count: sql`count(*)`,
        })
        .from(policies)
        .groupBy(sql`date_trunc('month', created_at)`)
        .orderBy(sql`date_trunc('month', created_at) DESC`)
        .limit(6);

      // Get total projects count
      const totalProjects = await db
        .select()
        .from(projects);

      // Get project creation trends
      const projectTrends = await db
        .select({
          month: sql`to_char(date_trunc('month', created_at), 'Mon')`,
          count: sql`count(*)`,
        })
        .from(projects)
        .groupBy(sql`date_trunc('month', created_at)`)
        .orderBy(sql`date_trunc('month', created_at) DESC`)
        .limit(6);

      // Get total unique contributors count from policy_contributors
      const totalContributors = await db
        .select({
          count: sql`COUNT(DISTINCT ${policyContributors.contributorId})`
        })
        .from(policyContributors);

      // Generate months for the last 6 months
      const monthsQuery = sql`
        SELECT to_char(month, 'Mon') as month
        FROM generate_series(
          date_trunc('month', NOW() - INTERVAL '5 months'),
          date_trunc('month', NOW()),
          '1 month'
        ) AS month
      `;

      // Get contributor trends from policy_contributors
      const contributorTrends = await db
        .select({
          month: sql`to_char(date_trunc('month', ${policies.createdAt}), 'Mon')`,
          count: sql`COALESCE(count(DISTINCT ${policyContributors.contributorId}), 0)`,
        })
        .from(policyContributors)
        .innerJoin(
          policies,
          eq(policyContributors.policyId, policies.id)
        )
        .where(
          sql`${policies.createdAt} >= NOW() - INTERVAL '6 months'`
        )
        .groupBy(sql`date_trunc('month', ${policies.createdAt})`)
        .orderBy(sql`date_trunc('month', ${policies.createdAt})`);

      // Generate array of last 6 months
      const today = new Date();
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        return d.toLocaleString('en-US', { month: 'short' });
      }).reverse();

      // Create a map of existing data
      const dataMap = new Map(
        policyTrends.map(item => [item.month, Number(item.count)])
      );

      // Fill in missing months with zeros
      const completeData = last6Months.map(month => ({
        month,
        count: dataMap.get(month) || 0
      }));

      // Create maps of existing data
      const projectDataMap = new Map(
        projectTrends.map(item => [item.month, Number(item.count)])
      );

      // Fill in missing months with zeros for projects
      const completeProjectData = last6Months.map(month => ({
        month,
        count: projectDataMap.get(month) || 0
      }));

      // Create map for contributor data
      const contributorDataMap = new Map(
        contributorTrends.map(item => [item.month, Number(item.count)])
      );

      // Fill in missing months for contributors
      const completeContributorData = last6Months.map(month => ({
        month,
        count: contributorDataMap.get(month) || 0
      }));

      // Get compliance by KPI
      const kpiCompliance = await db
        .select({
          kpiName: kpis.name,
          totalPolicies: sql<number>`COUNT(DISTINCT ${policies.id})`,
          successfulExecutions: sql<number>`SUM(CASE WHEN ${policyExecutions.result} = 1 THEN 1 ELSE 0 END)`,
          totalExecutions: sql<number>`COUNT(${policyExecutions.id})`
        })
        .from(policies)
        .innerJoin(badges, eq(policies.kpiId, badges.id))
        .innerJoin(kpis, eq(badges.kpiId, kpis.id))
        .leftJoin(policyExecutions, eq(policies.id, policyExecutions.policyId))
        .where(eq(policies.enabled, true))
        .groupBy(kpis.id, kpis.name);

      const kpiComplianceData = kpiCompliance.map(kpi => ({
        name: kpi.kpiName,
        compliance: Number(kpi.totalExecutions) > 0 
          ? Math.round((Number(kpi.successfulExecutions) / Number(kpi.totalExecutions)) * 100)
          : 0
      }));

      // Get badges completion data
      const badgesModel = new BadgesModel();
      const allBadges = await db
        .select({
          id: badges.id,
          name: badges.name,
          kpiName: kpis.name
        })
        .from(badges)
        .innerJoin(kpis, eq(badges.kpiId, kpis.id));

      const badgesCompletion = await Promise.all(
        allBadges.map(async (badge) => {
          const completion = await badgesModel.getCompletion(badge.id);
          return {
            name: badge.name,
            kpiName: badge.kpiName,
            completion: completion.totalProjectPolicies > 0
              ? Math.round((completion.totalPassed / completion.totalProjectPolicies) * 100)
              : 0
          };
        })
      );

      res.json({
        status: "ok",
        data: {
          activePoliciesCount: activePolicies.length,
          policyTrends: {
            labels: completeData.map(item => item.month),
            data: completeData.map(item => item.count)
          },
          totalProjects: totalProjects.length,
          projectTrends: {
            labels: completeProjectData.map(item => item.month),
            data: completeProjectData.map(item => item.count)
          },
          totalContributors: Number(totalContributors[0].count),
          contributorTrends: {
            labels: completeContributorData.map(item => item.month),
            data: completeContributorData.map(item => item.count)
          },
          kpiCompliance: {
            labels: kpiComplianceData.map(k => k.name),
            data: kpiComplianceData.map(k => k.compliance)
          },
          badgesCompletion: {
            labels: badgesCompletion.map(b => b.kpiName),
            data: badgesCompletion.map(b => b.completion)
          }
        }
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  return router;
}