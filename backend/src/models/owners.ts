import { eq, and } from 'drizzle-orm';
import { getDb } from '../db/client';
import { owners, projectOwners } from '../db/schema';
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class OwnersModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(name, description): Promise<any> {
    const db = getDb();
    const existing = await db
      .select()
      .from(owners)
      .where(eq(owners.name, name));

    if (existing.length > 0) {
      return existing[0]; 
    }

    const [newObj] = await db
      .insert(owners)
      .values({ name, description })
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
      .from(owners);

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
      .from(owners);

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

  async remove(id: number): Promise<void> {
    const db = getDb();
    // First delete related project_owners entries
    await db
      .delete(projectOwners)
      .where(eq(projectOwners.ownerId, id));

    // Then delete the stack
    await db
      .delete(owners)
      .where(eq(owners.id, id));
  }
}