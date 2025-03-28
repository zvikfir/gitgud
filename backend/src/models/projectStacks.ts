
import { eq, and } from 'drizzle-orm';
import db from '../db/client';
import { projectStacks, stacks } from '../db/schema';
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class ProjectStacksModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(project_id, stack_id): Promise<any> {
    const existing = await db
      .select()
      .from(projectStacks)
      .where(
        and(
          eq(projectStacks.projectId, project_id),
          eq(projectStacks.stackId, stack_id)
        ));

    if (existing.length > 0) {
      return existing[0];
    }

    const [newObj] = await db
      .insert(projectStacks)
      .values({
        projectId: project_id,
        stackId: stack_id
      })
      .returning();

    return newObj;
  }


  async findAll(): Promise<any[]> {
    const results = await db
      .selectDistinct({
        id: stacks.id,
        name: stacks.name,
        description: stacks.description,
      })
      .from(stacks)
      //.innerJoin(projectStacks, eq(projectStacks.stackId, runtimes.id))
      //.innerJoin(projects, eq(projects.id, projectStacks.projectId))
      //.innerJoin(projectContributors, eq(projectContributors.projectId, projects.id))
      //.innerJoin(contributors, eq(contributors.id, projectContributors.contributorId));

    return results;
  }

  async findAllByContributor(contributorExternalId: number): Promise<any[]> {
    const results = await db
      .selectDistinct({
        id: stacks.id,
        name: stacks.name,
        description: stacks.description,
      })
      .from(stacks)
      // .innerJoin(projectStacks, eq(projectStacks.stackId, runtimes.id))
      // .innerJoin(projects, eq(projects.id, projectStacks.projectId))
      // .innerJoin(projectContributors, eq(projectContributors.projectId, projects.id))
      // .innerJoin(contributors, eq(contributors.id, projectContributors.contributorId))
      // .where(eq(contributors.externalId, contributorExternalId));

    return results;
  }

  async findOne(id: number): Promise<any> {
    if (!id) {
      return null;
    }
    const result = await db
      .select()
      .from(stacks)
      .where(eq(stacks.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async createOrUpdate(data: any): Promise<any> {
    const existingStack = await this.findOne(data.id);

    if (existingStack) {
      const [updated] = await db
        .update(stacks)
        .set({ name: data.name, description: data.description })
        .where(eq(stacks.id, data.id))
        .returning();
      return updated;
    }

    return await this.create(data.name, data.description);
  }

  async remove(id: number, projectId: number): Promise<void> {
    // First delete related project_runtimes entries
    await db
      .delete(projectStacks)
      .where(and(eq(projectStacks.stackId, id), eq(projectStacks.projectId, projectId)));

    // Then delete the stack
    await db
      .delete(stacks)
      .where(eq(stacks.id, id));
  }
}