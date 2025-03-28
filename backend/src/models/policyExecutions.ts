import db from '../db/client';
import { policyExecutions, policies, projects } from '../db/schema';  // Import the languages table model
import { eq, and, desc } from 'drizzle-orm';
import { ProjectsModel } from './projects';
import { PoliciesModel } from './policies';
import { PolicyExecutionLogsModel } from './policyExecutionLogs';

export class PolicyExecutionsModel {
  constructor() {
  }

  async create(policy_id: number, project_id: number, status: number): Promise<any> {
    const [newObj] = await db
      .insert(policyExecutions)
      .values({
        policyId: policy_id,
        projectId: project_id,
        status,
        result: -1
      })
      .returning();

    return newObj;
  }

  async update(id: number, result: number, status: number, message: string ): Promise<any> {
    const [updatedObj] = await db
      .update(policyExecutions)
      .set({
        result: result ? 1 : 0,
        status: status ? 1 : 0,
        message
      })
      .where(eq(policyExecutions.id, id));

    return updatedObj;
  }

  async findAll(limit = 10): Promise<any> {
    let policyExecutionResult = await db
      .select({ id: policyExecutions.id })
      .from(policyExecutions)
      .orderBy(desc(policyExecutions.createdAt))
      .limit(limit);

    //iterate over the results and get the full object
    let _policyExecutionResults: any[] = [];
    for (let policyExecution of policyExecutionResult) {
      _policyExecutionResults.push(await this.findOne(policyExecution.id));
    }
    return _policyExecutionResults;
  }

  async findOne(id): Promise<any> {
    let projectsModel = new ProjectsModel();
    let policiesModel = new PoliciesModel();

    let policyExecutionResult = (await db
      .select()
      .from(policyExecutions)
      .where(eq(policyExecutions.id, id)))[0] as any;

    policyExecutionResult.project = await projectsModel.findOne(policyExecutionResult.projectId);
    policyExecutionResult.policy = await policiesModel.findOne(policyExecutionResult.policyId);

    //gather the logs for this policy execution
    let policyExecutionLogsModel = new PolicyExecutionLogsModel();
    policyExecutionResult.logs = await policyExecutionLogsModel.fineOneByPolicyExecutionId(policyExecutionResult.id);

    return policyExecutionResult;
  }

  async findLastExecutionByPolicyAndProject(policy_id: number, project_id: number): Promise<any> {
    let policyExecutionResult = await db
      .select()
      .from(policyExecutions)
      .where(
        and(
          eq(policyExecutions.policyId, policy_id),
          eq(policyExecutions.projectId, project_id)
        )
      )
      .orderBy(desc(policyExecutions.createdAt))
      .limit(1);
    return policyExecutionResult[0];
  }

  async findLastExecutionByPolicy(policy_id: number): Promise<any> {
    const result = await db
      .select({
        projectName: projects.name,
        status: policyExecutions.status,
        result: policyExecutions.result,
        createdAt: policyExecutions.createdAt,
      })
      .from(policies)
      .leftJoin(policyExecutions, eq(policyExecutions.policyId, policies.id))
      .leftJoin(projects, eq(projects.id, policyExecutions.projectId))
      .where(eq(policies.id, policy_id))
      .groupBy(projects.name, policyExecutions.status, policyExecutions.result, policyExecutions.createdAt)      
      .limit(1);

    return result;
  }
}