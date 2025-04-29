import { eq, and } from 'drizzle-orm';
import { getDb } from '../db/client';
import { projectRuntimes, runtimes } from '../db/schema';
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class ProjectMembersModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(project_id, runtime_id): Promise<any> {
    const db = getDb();
    const existing = await db
      .select()
      .from(projectRuntimes)
      .where(
        and(
          eq(projectRuntimes.projectId, project_id),
          eq(projectRuntimes.runtimeId, runtime_id)
        ));

    if (existing.length > 0) {
      return existing[0];
    }

    const [newObj] = await db
      .insert(projectRuntimes)
      .values({
        projectId: project_id,
        runtimeId: runtime_id
      })
      .returning();

    return newObj;
  }


  async findAll(): Promise<any[]> {
    const db = getDb();
    const results = await db
      .selectDistinct({
        id: runtimes.id,
        name: runtimes.name,
        description: runtimes.description,
      })
      .from(runtimes)
      //.innerJoin(projectRuntimes, eq(projectRuntimes.stackId, runtimes.id))
      //.innerJoin(projects, eq(projects.id, projectRuntimes.projectId))
      //.innerJoin(projectContributors, eq(projectContributors.projectId, projects.id))
      //.innerJoin(contributors, eq(contributors.id, projectContributors.contributorId));

    return results;
  }

  async findAllByContributor(contributorExternalId: number): Promise<any[]> {
    const db = getDb();
    const results = await db
      .selectDistinct({
        id: runtimes.id,
        name: runtimes.name,
        description: runtimes.description,
      })
      .from(runtimes)
      // .innerJoin(projectRuntimes, eq(projectRuntimes.stackId, runtimes.id))
      // .innerJoin(projects, eq(projects.id, projectRuntimes.projectId))
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
      .from(runtimes)
      .where(eq(runtimes.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async createOrUpdate(data: any): Promise<any> {
    const existingStack = await this.findOne(data.id);

    if (existingStack) {
      const db = getDb();
      const [updated] = await db
        .update(runtimes)
        .set({ name: data.name, description: data.description })
        .where(eq(runtimes.id, data.id))
        .returning();
      return updated;
    }

    return await this.create(data.name, data.description);
  }

  async remove(id: number, projectId: number): Promise<void> {
    const db = getDb();
    // First delete related project_runtimes entries
    await db
      .delete(projectRuntimes)
      .where(and(eq(projectRuntimes.runtimeId, id), eq(projectRuntimes.projectId, projectId)));

    // Then delete the stack
    await db
      .delete(runtimes)
      .where(eq(runtimes.id, id));
  }
}