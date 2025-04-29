import { eq, sql, and, asc } from 'drizzle-orm';
import { getDb } from '../db/client';
import { badges, policies, policyExecutions } from '../db/schema';
import { KPIsModel } from './kpis';
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class BadgesModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async createOrUpdate(badge): Promise<any> {
    const db = getDb();
    // Check if the badge already exists
    const existing = await db
      .select()
      .from(badges)
      .where(eq(badges.name, badge.name));

    if (existing.length > 0) {
      // If the badge exists, update it
      const updatedBadge = await db
        .update(badges)
        .set({
          name: badge.name,
          description: badge.description,
          kpiId: badge.kpiId,
        })
        .where(eq(badges.name, badge.name))
        .returning(); // Return the updated record

      return updatedBadge[0];
    }

    // If the badge doesn't exist, insert a new one
    const [newObj] = await db
      .insert(badges)
      .values({
        name: badge.name,
        description: badge.description,
        kpiId: badge.kpiId,
      })
      .returning(); // Return the newly inserted record

    return newObj;
  }

  async findAllByProject(project_id: number): Promise<any> {
    const db = getDb();
    const result = await db
      .select({
        badgeName: badges.name,
        policyCount: sql<number>`COUNT(1)`,
        passedPolicyCount: sql<number>`COALESCE(SUM(${policyExecutions.result}), 0)`
      })
      .from(badges)
      .leftJoin(policies, eq(policies.kpiId, badges.id))
      .leftJoin(
        policyExecutions,
        sql<boolean>`
            ${policyExecutions.policyId} = ${policies.id} 
            AND ${policyExecutions.projectId} = ${project_id} 
            AND ${policyExecutions.status} >= 0 
            AND ${policyExecutions.createdAt} = (
                SELECT MAX(${policyExecutions.createdAt})
                FROM ${policyExecutions}
                WHERE ${policyExecutions.policyId} = ${policies.id}
                AND ${policyExecutions.status} >= 0
            )
        `
      )
      .groupBy(badges.name)
      .orderBy(badges.name)
      .execute();
    return result;
  }


  async findOneByProject(badge_id: number, project_id: number): Promise<any> {
    const db = getDb();
    const result = await db
      .select({
        badgeName: badges.name,
        policyCount: sql<number>`COUNT(1)`,
        passedPolicyCount: sql<number>`COALESCE(SUM(${policyExecutions.result}), 0)`
      })
      .from(badges)
      .leftJoin(policies, eq(policies.kpiId, badges.id))
      .leftJoin(
        policyExecutions,
        sql<boolean>`
            ${policyExecutions.policyId} = ${policies.id} 
            AND ${policyExecutions.projectId} = ${project_id} 
            AND ${policyExecutions.status} >= 0 
            AND ${policyExecutions.createdAt} = (
                SELECT MAX(${policyExecutions.createdAt})
                FROM ${policyExecutions}
                WHERE ${policyExecutions.policyId} = ${policies.id}
                AND ${policyExecutions.status} >= 0
            )
        `
      )
      .where(eq(badges.id, badge_id))
      .groupBy(badges.name)
      .orderBy(badges.name)
      .execute();
    return result;
  }

  async getCompletion(badge_id: number): Promise<{ totalProjectPolicies: number; totalPassed: number }> {
    const db = getDb();
    const result = await db
      .select({
        badgeName: badges.name,
        totalProjectPolicies: sql<string>`COUNT(${policyExecutions.id})`,
        totalPassed: sql<string>`
        SUM(CASE 
          WHEN ${policyExecutions.result} = 1 THEN 1
          ELSE 0
        END)`
      })
      .from(policyExecutions)
      .innerJoin(
        // Subquery to get the last execution for each project_id and policy_id
        sql`(
        SELECT 
          ${policyExecutions.projectId} AS project_id,
          ${policyExecutions.policyId} AS policy_id,
          MAX(${policyExecutions.updatedAt}) AS last_execution
        FROM ${policyExecutions}
        WHERE ${policyExecutions.status} >= 0
        GROUP BY ${policyExecutions.projectId}, ${policyExecutions.policyId}
      ) AS result`,
        sql`${policyExecutions.projectId} = result.project_id
        AND ${policyExecutions.policyId} = result.policy_id
        AND ${policyExecutions.updatedAt} = result.last_execution`
      )
      // Join with policies to link the policy_id with badges
      .innerJoin(policies, eq(policyExecutions.policyId, policies.id))
      // Join policies with badges to get badge name
      .innerJoin(badges, eq(policies.kpiId, badges.id))
      // Filter by badge ID
      .where(eq(badges.id, badge_id))
      // Group by badge name to aggregate results by badge
      .groupBy(badges.name)
      .execute();

    if (result.length === 0) {
      return {
        totalProjectPolicies: 0,
        totalPassed: 0
      };
    }
    return {
      totalProjectPolicies: parseInt(result[0].totalProjectPolicies, 10),
      totalPassed: parseInt(result[0].totalPassed, 10)
    };
  }

  async getCompletionLast30Days(badge_id: number): Promise<any> {
    const db = getDb();
    const result = await db
      .select({
        date: sql<string>`DATE(${policyExecutions.updatedAt})`,  // Group by the day
        count: sql<string>`
        COUNT(DISTINCT CASE 
          WHEN ${policyExecutions.result} = 1 THEN ${policyExecutions.id}
          ELSE NULL
        END)::text` // Cast to string for parsing later
      })
      .from(policyExecutions)
      .innerJoin(
        // Subquery to get the last execution for each project_id and policy_id
        sql`(
        SELECT 
          ${policyExecutions.projectId} AS project_id,
          ${policyExecutions.policyId} AS policy_id,
          MAX(${policyExecutions.updatedAt}) AS last_execution
        FROM ${policyExecutions}
        WHERE ${policyExecutions.status} >= 0
        GROUP BY ${policyExecutions.projectId}, ${policyExecutions.policyId}
      ) AS result`,
        sql`${policyExecutions.projectId} = result.project_id
        AND ${policyExecutions.policyId} = result.policy_id
        AND ${policyExecutions.updatedAt} = result.last_execution`
      )
      // Join with policies to link the policy_id with badges
      .innerJoin(policies, eq(policyExecutions.policyId, policies.id))
      // Join policies with badges to get badge name
      .innerJoin(badges, eq(policies.kpiId, badges.id))
      // Filter by badge ID and restrict results to the last 30 days
      .where(and(
        eq(badges.id, badge_id),
        sql`DATE(${policyExecutions.updatedAt}) >= CURRENT_DATE - INTERVAL '30 DAYS'`
      ))
      // Group by the date of execution
      .groupBy(sql`DATE(${policyExecutions.updatedAt})`)
      // Order the results by date
      .orderBy(sql`DATE(${policyExecutions.updatedAt})`)
      .execute();

    // Parse the string count to numbers and return the breakdown
    return result.map(row => ({
      date: row.date,
      count: parseInt(row.count, 10)
    }));
  }

  async getEarned(badge_id: number): Promise<{ totalProjects: number; totalEarned: number }> {
    const db = getDb();
    const result = await db
      .select({
        totalProjects: sql<number>`COUNT(DISTINCT ${policyExecutions.projectId})`, // Total distinct projects
        totalEarned: sql<number>`
          COUNT(DISTINCT CASE
            WHEN ${policyExecutions.result} = 1 THEN ${policyExecutions.projectId}
            ELSE NULL
          END)` // Count projects that passed all policies
      })
      .from(badges)
      .innerJoin(policies, eq(policies.kpiId, badges.id))
      .innerJoin(
        policyExecutions,
        sql<boolean>`
          ${policyExecutions.policyId} = ${policies.id} 
          AND ${policyExecutions.status} >= 0 
          AND ${policyExecutions.createdAt} = (
              SELECT MAX(${policyExecutions.createdAt})
              FROM ${policyExecutions}
              WHERE ${policyExecutions.policyId} = ${policies.id}
              AND ${policyExecutions.status} >= 0
          )
        `
      )
      .where(eq(badges.id, badge_id)) // Filter by badge
      .groupBy(badges.id)
      .execute();

    if (result.length === 0) {
      return {
        totalProjects: 0,
        totalEarned: 0
      };
    }

    return {
      totalProjects: result[0].totalProjects,
      totalEarned: result[0].totalEarned
    };
  }

  async getEffectiveness(badge_id: number): Promise<any> {
    const db = getDb();
  }

  async getEffectivenessLast30Days(badge_id: number): Promise<any> {
    const db = getDb();
  }

  async getAdoption(badge_id: number): Promise<any> {
    const db = getDb();
  }

  async getAdoptionLast30Days(badge_id: number): Promise<any> {
    const db = getDb();
  }

  async getPolicies(badge_id: number): Promise<any> {
    const db = getDb();
    const result = await db
      .select({
        policyName: policies.name,
        policyCount: sql<number>`COUNT(1)`,
        passedPolicyCount: sql<number>`COALESCE(SUM(${policyExecutions.result}), 0)`
      })
      .from(badges)
      .leftJoin(policies, eq(policies.kpiId, badges.id))
      .leftJoin(
        policyExecutions,
        sql<boolean>`
            ${policyExecutions.policyId} = ${policies.id} 
            AND ${policyExecutions.status} >= 0 
            AND ${policyExecutions.createdAt} = (
                SELECT MAX(${policyExecutions.createdAt})
                FROM ${policyExecutions}
                WHERE ${policyExecutions.policyId} = ${policies.id}
                AND ${policyExecutions.status} >= 0
            )
        `
      )
      .where(eq(badges.id, badge_id))
      .groupBy(policies.name)
      .orderBy(policies.name)
      .execute();
    return result[0];
  }

  async findAll(): Promise<any> {
    const db = getDb();
    const result = await db
      .select(
        { id: badges.id },
      )
      .from(badges)
      .orderBy(asc(badges.name))
      .execute();

    //iterate over the results and get the full object
    let _badgeResults: any[] = [];
    for (let badge of result) {
      _badgeResults.push(await this.findOne(badge.id));
    }
    return _badgeResults;
  }

  async findOne(badge_id: number): Promise<any> {
    const db = getDb();
    const result = await db
      .select(
        {
          id: badges.id,
          name: badges.name,
          description: badges.description,
          kpiId: badges.kpiId,
          policyCount: sql<number>`COUNT(DISTINCT ${policies.id})`,
        },
      )
      .from(badges)
      .leftJoin(policies, eq(policies.kpiId, badges.id))
      .where(eq(badges.id, badge_id))
      .groupBy(badges.id)
      .execute();

    return result[0];
  }

  async getPolicyCount(badge_id: number): Promise<number> {
    const db = getDb();
    const result = await db
      .select({
        policyCount: sql<string>`COUNT(1)`
      })
      .from(policies)
      .where(eq(policies.kpiId, badge_id))
      .execute();
    return parseInt(result[0].policyCount, 10);
  }

  async remove(badge_id: number): Promise<any> {
    const db = getDb();
    const result = await db
      .delete(badges)
      .where(eq(badges.id, badge_id))
      .returning();
    return result[0];
  }

}
