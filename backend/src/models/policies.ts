import config from 'config';
import fs from 'fs';
import path from 'path';

import { eq, desc } from 'drizzle-orm';
import { getDb } from '../infra/db/client';
import { policies, badges, policyCompliance, kpis } from '../infra/db/schema';
import { BadgesModel } from './badges';
import { GitLabService } from '../integrations/gitlab/gitlab_service';

import { PolicyExecutionsModel } from './policyExecutions';
import { PolicyExecutionLogsModel } from './policyExecutionLogs';

export class PoliciesModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async init_policies() {
    async function iterate_directories(dirPath: string, policies: { [key: string]: any }, base_path: string) {
      const exclude_dirs = [".git", "node_modules", "_template", "_badges"];

      // Read the contents of the directory
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

      // Iterate over each entry in the directory
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory() && exclude_dirs.indexOf(entry.name) === -1) {
          await iterate_directories(fullPath, policies, base_path);
        } else {
          if (entry.name === "index.js") {
            let policy = require(fullPath);
            policy.id = fullPath
              .replace(base_path, "")
              .replace(/^\//, "")
              .replace("/index.js", "")
              .replace(/\//gi, "_");
            policy.path = fullPath;
            policies[policy.id] = policy;
          }
        }
      }
      return policies;
    }

    async function fetch_latest_policies(): Promise<any[]> {
      const policies: any[] = [];
      for (let policies_source of config.policies.sources) {
        const policies_path = path.join((global.context).root, policies_source.path);
        let source_policies = await iterate_directories(policies_path, {}, policies_path);
        policies.push(...Object.values(source_policies));
      }
      return policies;
    }
    const latest_policies = await fetch_latest_policies();
    for (let latest_policy of latest_policies) {
      let policiesModel = new PoliciesModel();
      await policiesModel.createOrUpdate(latest_policy, true);
    }

    console.log(`${Object.keys(latest_policies).length} policies loaded.`);

    return latest_policies;
  }

  async createOrUpdate(policy, useUuid = false): Promise<any> {
    const db = getDb();
    const policyData = {
      name: policy.title,
      description: policy.description,
      longDescription: policy.help,
      kpiId: policy.kpi, // Changed from badge to direct KPI
      scriptJs: policy.handle.toString(),
      version: policy.version || '1.0.0',
      criteria: policy.criteria,
      tags: Array.isArray(policy.tags) ? policy.tags.join(',') : policy.tags,
      ordinal: policy.ordinal,
      enabled: policy.enabled,
      draft: policy.draft,
    };

    // Handle compliance data
    const compliance = policy.compliance || [];

    if (policy.id) {
      console.log(`Updating policy: ${JSON.stringify(policy, null, 2)}`);
      // Update existing policy
      const [updatedPolicy] = await db.transaction(async (tx) => {
        let updated;
        if (useUuid) {
          [updated] = await tx
            .update(policies)
            .set(policyData)
            .where(eq(policies.uuid, policy.id))
            .returning();
        }
        else {
          [updated] = await tx
            .update(policies)
            .set(policyData)
            .where(eq(policies.id, policy.id))
            .returning();


          // Delete existing compliance entries
          console.log(`Deleting compliance for policy: ${policy.id}`);
          await tx
            .delete(policyCompliance)
            .where(eq(policyCompliance.policyId, policy.id));

          // Insert new compliance entries
          if (compliance.length > 0) {
            console.log(`Inserting compliance for policy: ${policy.id}`);
            await tx
              .insert(policyCompliance)
              .values(compliance.map(c => ({
                policyId: policy.id,
                standard: c.standard,
                control: c.control,
                description: c.description
              })));
          }
        }
        return [updated];
      });

      return updatedPolicy;
    }

    console.log(`Creating policy: ${policy.name}`);

    // Create new policy
    const [newPolicy] = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(policies)
        .values({
          ...policyData,
          uuid: policy.id || crypto.randomUUID()
        })
        .returning();

      if (compliance.length > 0) {
        await tx
          .insert(policyCompliance)
          .values(compliance.map(c => ({
            policyId: created.id,
            standard: c.standard,
            control: c.control,
            description: c.description
          })));
      }

      return [created];
    });

    return newPolicy;
  }

  async findAll(): Promise<any> {
    const db = getDb();
    let policiesResult = await db
      .select()
      .from(policies)

    let _policies: any[] = [];
    for (let project of policiesResult) {
      _policies.push(await this.findOne(project.id.toString()));
    }

    return _policies;
  }

  async findOne(id: string): Promise<any> {
    const db = getDb();
    const policy: any = await db.transaction(async (tx) => {
      const [policyData] = await tx
        .select()
        .from(policies)
        .where(eq(policies.id, Number(id)));

      if (!policyData) return null;

      // Fetch compliance data
      const complianceData = await tx
        .select()
        .from(policyCompliance)
        .where(eq(policyCompliance.policyId, policyData.id));

      // Fetch KPI data
      const [kpiData] = await tx
        .select()
        .from(kpis)
        .where(eq(kpis.id, policyData.kpiId ?? 0));

      const policyResult = {
        ...policyData,
        compliance: complianceData,
        kpi: kpiData,
        tags: policyData.tags ? policyData.tags.split(',') : [],
        executions: [] // Initialize executions property
      };
      return policyResult;
    });

    // No badgeId property on policy, so this section is removed

    //find all related project to this policy by policyExecutions
    let policyExecutionsModel = new PolicyExecutionsModel();
    if (!policy) {
      return null;
    }

    let policyExecutions = await policyExecutionsModel.findLastExecutionByPolicy(policy.id);
    policy.executions = policyExecutions;
    let totals = {
      totalProjects: 0,
      totalFailed: 0,
      totalPassed: 0,
      totalErrors: 0,
      lastExecution: 0,
    }
    for (let execution of policy.executions as any[]) {
      totals.totalProjects++;
      if (execution.result === 1) {
        totals.totalPassed++;
      } else if (execution.status === 0) {
        totals.totalFailed++;
      } else {
        totals.totalErrors++;
      }
      if (execution.createdAt > totals.lastExecution) {
        totals.lastExecution = execution.createdAt;
      }
    }
    policy.totals = totals;

    return { ...policy, totals: {} };
  }

  async isQualified(policy, project, event) {
    let criteria = policy.criteria;
    let detailed: { criterion: string; passed: boolean; value: any; expected?: any; pattern?: string }[] = [];

    if (!policy.enabled) {
      detailed.push({
        criterion: 'enabled',
        passed: false,
        value: false,
        expected: true
      });
      return { result: false, reason: "Policy is disabled", detailed };
    }
    detailed.push({ criterion: 'enabled', passed: true, value: true, expected: true });

    if (event && criteria.events) {
      const passed = criteria.events.indexOf(event.name) !== -1;
      detailed.push({
        criterion: 'events',
        passed,
        value: event.name,
        expected: criteria.events
      });
    }

    if (event && criteria.ref) {
      const passed = criteria.ref.test(event.ref);
      detailed.push({
        criterion: 'ref',
        passed,
        value: event.ref,
        pattern: criteria.ref.toString()
      });
    }

    if (criteria.lifecycle) {
      const passed = criteria.lifecycle.test(project.lifecycle);
      detailed.push({
        criterion: 'lifecycle',
        passed,
        value: project.lifecycle,
        pattern: criteria.lifecycle.toString()
      });
    }

    if (criteria.topics) {
      const passed = criteria.topics.test(project.topics);
      detailed.push({
        criterion: 'topics',
        passed,
        value: project.topics,
        pattern: criteria.topics.toString()
      });
    }

    if (criteria.exclude) {
      const passed = !criteria.exclude.test(project.topics);
      detailed.push({
        criterion: 'exclude',
        passed,
        value: project.topics,
        pattern: criteria.exclude.toString()
      });
    }

    if (criteria.path) {
      const passed = criteria.path.test(project.path);
      detailed.push({
        criterion: 'path',
        passed,
        value: project.path,
        pattern: criteria.path.toString()
      });
    }

    if (criteria.runtime) {
      const passed = criteria.runtime.test(project.runtime);
      detailed.push({
        criterion: 'runtime',
        passed,
        value: project.runtime,
        pattern: criteria.runtime.toString()
      });
    }

    if (criteria.language) {
      const passed = criteria.language.test(project.languages);
      detailed.push({
        criterion: 'language',
        passed,
        value: project.languages,
        pattern: criteria.language.toString()
      });
    }

    if (criteria.hasOwnProperty("status") && project.policies[policy.id]) {
      const passed = criteria.status.indexOf(project.policies[policy.id].result) > -1;
      detailed.push({
        criterion: 'status',
        passed,
        value: project.policies[policy.id].result,
        expected: criteria.status
      });
    }

    const result = detailed.every(item => item.passed);
    const reason = result
      ? "All criteria are satisfied"
      : `Failed criteria: ${detailed.filter(item => !item.passed).map(item => item.criterion).join(', ')}`;

    return { result, reason, detailed };
  };
}
