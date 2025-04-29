import { eq, sql, asc } from 'drizzle-orm';
import { getDb } from '../db/client';
import { kpis, policyExecutions, policies } from '../db/schema';

export class KPIsModel {
  async findAll() {
    const db = getDb();
    return await db.select().from(kpis).orderBy(asc(kpis.name));
  }

  async findOne(id: string) {
    const db = getDb();
    return await db.select().from(kpis).where(eq(kpis.id, Number(id))).limit(1);
  }

  async findAllByProject(projectId: number) {
    const db = getDb();
    // Get latest policy executions for the project grouped by policy
    const executions = await db
      .select({
        policyId: policyExecutions.policyId,
        kpiId: policies.kpiId,
        name: kpis.name,
        result: policyExecutions.result,
        createdAt: policyExecutions.createdAt,
      })
      .from(policyExecutions)
      .innerJoin(policies, eq(policies.id, policyExecutions.policyId))
      .innerJoin(kpis, eq(kpis.id, policies.kpiId))
      .where(eq(policyExecutions.projectId, projectId))
      .orderBy(policyExecutions.createdAt);

    // Group by KPI type and calculate stats
    const kpiStats = executions.reduce((acc, curr) => {
      if (curr.kpiId !== null && !acc[curr.kpiId]) {
        acc[curr.kpiId] = {
          name: curr.name,
          type: curr.kpiId,
          policyCount: 0,
          passedPolicyCount: 0
        };
      }
      if (curr.kpiId !== null) {
        acc[curr.kpiId].policyCount++;
      }
      if (curr.kpiId !== null && curr.result === 1) {
        acc[curr.kpiId].passedPolicyCount++;
      }
      return acc;
    }, {});

    return Object.values(kpiStats);
  }
}
