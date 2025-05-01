import { getDb } from '../infra/db/client';
import { policyExecutionLogs } from '../infra/db/schema';  // Import the languages table model
import { eq, desc } from 'drizzle-orm';

export class PolicyExecutionLogsModel {
  constructor() {
  }

  async create(policy_execution_id: number, message: string, level: string): Promise<any> {
    const db = getDb();
    const [newObj] = await db
      .insert(policyExecutionLogs)
      .values({
        policyExecutionId: policy_execution_id,
        message,
        level
      })
      .returning();

    return newObj;
  }

  async findAll(): Promise<any> {
    const db = getDb();
    let policyExecutionLogsResult = await db
      .select()
      .from(policyExecutionLogs)

    return policyExecutionLogsResult;
  }

  async fineOneByPolicyExecutionId(id): Promise<any> {
    const db = getDb();
    let policyExecutionLogsResult = await db
      .select()
      .from(policyExecutionLogs)
      .where(eq(policyExecutionLogs.policyExecutionId, id))
      .orderBy(desc(policyExecutionLogs.createdAt))

    return policyExecutionLogsResult;
  }
}