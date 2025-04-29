import { eq, and } from 'drizzle-orm';
import { getDb } from '../db/client';
import { policyContributors, members } from '../db/schema';  // Import the languages table model
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class PolicyContributorsModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(policy_id: number, contributor_id: number, result: number): Promise<any> {
    const db = getDb();
    console.log('create policyContributors', policy_id, contributor_id, result);
    const existing = await db
      .select()
      .from(policyContributors)
      .where(
        and(
          eq(policyContributors.policyId, policy_id),
          eq(policyContributors.contributorId, contributor_id)
        ));

    if (existing.length > 0) {
      //update
      const [newObj] = await db
        .update(policyContributors)
        .set({ result: result ? 1 : 0 })
        .where(
          and(
            eq(policyContributors.policyId, policy_id),
            eq(policyContributors.contributorId, contributor_id)
          ))
        .returning();
      return newObj;
    }

    const [newObj] = await db
      .insert(policyContributors)
      .values({
        policyId: policy_id,
        contributorId: contributor_id,
        result: result ? 1 : 0
      })
      .returning();
    return newObj;
  }

  async createByContributorExternalId(policy_id: number, contributor_external_id: number, result: number): Promise<any> {
    const db = getDb();
    const contibutor = await db
      .select()
      .from(members)
      .where(eq(members.externalId, contributor_external_id));

    if (contibutor.length === 0) {
      return null;
    }

    return this.create(policy_id, contibutor[0].id, result);
  }

  async createByContributorName(policy_id: number, contributor_name: string, result): Promise<any> {
    const db = getDb();
    const contibutor = await db
      .select(
        { id: members.id },
      )
      .from(members)
      .where(eq(members.name, contributor_name));

    if (contibutor.length === 0) {
      return null;
    }

    return this.create(policy_id, contibutor[0].id, result);
  }
}