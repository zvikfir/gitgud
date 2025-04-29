import { eq } from 'drizzle-orm';
import { getDb } from '../infra/db/client';
import { lifecycles, projects } from '../infra/db/schema';  // Import the languages table model
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class LifecyclesModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(name, description): Promise<any> {
    const db = getDb();
    // Insert the project
    const existing = await db
      .select()
      .from(lifecycles)
      .where(eq(lifecycles.name, name));

    // If the language exists, return the existing language
    if (existing.length > 0) {
      return existing[0]; // Return the first match (since name is unique)
    }

    // If the language doesn't exist, insert it and return the new record
    const [newObj] = await db
      .insert(lifecycles)
      .values({ name, description })
      .returning(); // .returning() fetches the inserted row with its ID

    return newObj;
  }
  
  async findAll(): Promise<any[]> {
    const db = getDb();
    const results = await db
      .selectDistinct({
        id: lifecycles.id,
        name: lifecycles.name,
        description: lifecycles.description,
      })
      .from(lifecycles)
      //.innerJoin(projectStacks, eq(projectStacks.stackId, lifecycles.id))
      //.innerJoin(projects, eq(projects.id, projectStacks.projectId))
      //.innerJoin(projectContributors, eq(projectContributors.projectId, projects.id))
      //.innerJoin(contributors, eq(contributors.id, projectContributors.contributorId));

    return results;
  }

  async findAllByContributor(contributorExternalId: number): Promise<any[]> {
    const db = getDb();
    const results = await db
      .selectDistinct({
        id: lifecycles.id,
        name: lifecycles.name,
        description: lifecycles.description,
      })
      .from(lifecycles)
      // .innerJoin(projectStacks, eq(projectStacks.stackId, lifecycles.id))
      // .innerJoin(projects, eq(projects.id, projectStacks.projectId))
      // .innerJoin(projectContributors, eq(projectContributors.projectId, projects.id))
      // .innerJoin(contributors, eq(contributors.id, projectContributors.contributorId))
      // .where(eq(contributors.externalId, contributorExternalId));

    return results;
  }

  async findOne(id: number): Promise<any> {
    const db = getDb();
    if (!id) {
      return null;
    }
    const result = await db
      .select()
      .from(lifecycles)
      .where(eq(lifecycles.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async createOrUpdate(data: any): Promise<any> {
    const db = getDb();
    const existingStack = await this.findOne(data.id);

    if (existingStack) {
      const [updated] = await db
        .update(lifecycles)
        .set({ name: data.name, description: data.description })
        .where(eq(lifecycles.id, data.id))
        .returning();
      return updated;
    }

    return await this.create(data.name, data.description);
  }

  async remove(id: number): Promise<void> {
    const db = getDb();
    // Then delete the stack
    await db
      .delete(lifecycles)
      .where(eq(lifecycles.id, id));
  }
}