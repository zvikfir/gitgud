import { eq, and } from 'drizzle-orm';
import db from '../db/client';
import { projectDisabledPolicies } from '../db/schema';
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class ProjectDisabledPoliciesModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async createOrUpdate(project, policy, enabled): Promise<any> {
    // Check if the badge already exists
    const existing = await db
      .select()
      .from(projectDisabledPolicies)
      .where(and(
        eq(projectDisabledPolicies.projectId, project.id),
        eq(projectDisabledPolicies.policyId, policy.id)
      ));

    if (existing.length > 0) {
      // If the badge exists, update it
      const updated = await db
        .update(projectDisabledPolicies)
        .set({
          projectId: project.id,
          policyId: policy.id,
          enabled: enabled
        })
        .where(and(
          eq(projectDisabledPolicies.projectId, project.id),
          eq(projectDisabledPolicies.policyId, policy.id)
        ))
        .returning(); // Return the updated record

      return updated[0];
    }

    // If the badge doesn't exist, insert a new one
    const [newObj] = await db
      .insert(projectDisabledPolicies)
      .values({
        projectId: project.id,
        policyId: policy.id,
        enabled: enabled
      })
      .returning(); // Return the newly inserted record

    return newObj;
  }

  async findByProjectId(projectId): Promise<any> {
    return db
      .select()
      .from(projectDisabledPolicies)
      .where(eq(projectDisabledPolicies.projectId, projectId));
  }

}
