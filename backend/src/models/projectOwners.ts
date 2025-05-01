import { eq, and } from 'drizzle-orm';
import { getDb } from '../infra/db/client';
import { projectOwners, owners } from '../infra/db/schema';
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class ProjectMembersModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(project_id, member_id): Promise<any> {
    const db = getDb();
    const existing = await db
      .select()
      .from(projectOwners)
      .where(
        and(
          eq(projectOwners.projectId, project_id),
          eq(projectOwners.ownerId, member_id)
        ));

    if (existing.length > 0) {
      return existing[0];
    }

    const [newObj] = await db
      .insert(projectOwners)
      .values({
        projectId: project_id,
        ownerId: member_id
      })
      .returning();

    return newObj;
  }


  async findAll(): Promise<any[]> {
    const db = getDb();
    const results = await db
      .selectDistinct({
        id: owners.id,
        name: owners.name,
        description: owners.description,
      })
      .from(owners)
    //.innerJoin(projectOwners, eq(projectOwners.stackId, owners.id))
    //.innerJoin(projects, eq(projects.id, projectOwners.projectId))
    //.innerJoin(projectContributors, eq(projectContributors.projectId, projects.id))
    //.innerJoin(contributors, eq(contributors.id, projectContributors.contributorId));

    return results;
  }

  async findAllByContributor(contributorExternalId: number): Promise<any[]> {
    const db = getDb();
    const results = await db
      .selectDistinct({
        id: owners.id,
        name: owners.name,
        description: owners.description,
      })
      .from(owners)
    // .innerJoin(projectOwners, eq(projectOwners.stackId, owners.id))
    // .innerJoin(projects, eq(projects.id, projectOwners.projectId))
    // .innerJoin(projectContributors, eq(projectContributors.projectId, projects.id))
    // .innerJoin(contributors, eq(contributors.id, projectContributors.contributorId))
    // .where(eq(contributors.externalId, contributorExternalId));

    return results;
  }

  async findOne(id: number): Promise<any> {
    if (!id) {
      return null;
    }
    const db = getDb();
    const result = await db
      .select()
      .from(owners)
      .where(eq(owners.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async createOrUpdate(data: any): Promise<any> {
    const existingStack = await this.findOne(data.id);

    if (existingStack) {
      const db = getDb();
      const [updated] = await db
        .update(owners)
        .set({ name: data.name, description: data.description })
        .where(eq(owners.id, data.id))
        .returning();
      return updated;
    }

    return await this.create(data.name, data.description);
  }

  async remove(id: number, projectId: number): Promise<void> {
    const db = getDb();
    // First delete related project_owners entries
    await db
      .delete(projectOwners)
      .where(and(eq(projectOwners.ownerId, id), eq(projectOwners.projectId, projectId)));

    // Then delete the stack
    await db
      .delete(owners)
      .where(eq(owners.id, id));
  }
}