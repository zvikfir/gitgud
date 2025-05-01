import { eq, sql, ilike } from 'drizzle-orm';
import { getDb } from '../infra/db/client';
import { stacks, projectStacks, projects, projectMembers, members, projectContributors, contributors, users } from '../infra/db/schema';
import { GitLabService } from '../integrations/gitlab/gitlab_service';
import { UserStacksModel } from './userStacks';

export class StacksModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(name, description): Promise<any> {
    const db = getDb();
    // Insert the stack
    console.log('Creating stack:', name);
    const existing = await db
      .select()
      .from(stacks)
      .where(eq(stacks.name, name));

    if (existing.length > 0) {
      return existing[0];
    }

    const [newObj] = await db
      .insert(stacks)
      .values({ name, description })
      .returning();

    return newObj;
  }

  async findAll(searchQuery: string = '', page: number = 1, limit: number = 10): Promise<any[]> {
    const db = getDb();
    if (searchQuery) {
      searchQuery = `%${searchQuery}%`;
    }

    const results = await db
      .selectDistinct({
        id: stacks.id,
        name: stacks.name,
        description: stacks.description,
      })
      .from(stacks)
      .where(searchQuery ? ilike(stacks.name, searchQuery) : undefined)
      .orderBy(stacks.name)
      .limit(limit)
      .offset((page - 1) * limit);

    for (let i = 0; i < results.length; i++) {
      results[i] = await this.findOne(results[i].id);
    }
    return results;
  }

  async findAllByUserId(userId: number, searchQuery: string = '', page: number = 1, limit: number = 10): Promise<any[]> {
    const db = getDb();
    //first let's get all via findAll()
    let results = await this.findAll(searchQuery, page, limit);

    let userStacksModel = new UserStacksModel();
    let userStacks = await userStacksModel.findAllByUserId(userId);

    //now let's iterate over the results and add the state
    for (let i = 0; i < results.length; i++) {
      let stack = results[i];
      let userStack = userStacks.find(us => us.stack_id == stack.id);
      if (userStack) {
        stack.state = userStack.state;
      } else {
        //stack.state = 'not-following';
      }
    }

    return results;
  }

  async findOne(id: number): Promise<any> {
    const db = getDb();
    if (!id) {
      return null;
    }
    const result = await db
      .select(
        {
          id: stacks.id,
          name: stacks.name,
          description: stacks.description,
          //count of projects
          projects: sql<number>`cast(count(${projects.id}) as int)`,
          //count of contributors
          contributors: sql<number>`cast(count(${projectContributors.contributorId}) as int)`,
          //if there's a contributor id with the current user's email address then return true
          isContributor: sql<boolean>`bool_or(${users.email} = ${contributors.email})`,
        }
      )
      .from(stacks)
      .leftJoin(projectStacks, eq(projectStacks.stackId, stacks.id))
      .leftJoin(projects, eq(projects.id, projectStacks.projectId))
      .leftJoin(projectContributors, eq(projectContributors.projectId, projects.id))
      .leftJoin(contributors, eq(contributors.id, projectContributors.contributorId))
      .leftJoin(users, eq(users.email, contributors.email))
      .where(eq(stacks.id, id))
      .groupBy(stacks.id, stacks.name, stacks.description)
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async createOrUpdate(data: any): Promise<any> {
    const db = getDb();
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

  async remove(id: number): Promise<void> {
    const db = getDb();
    // First delete related project_stacks entries
    await db
      .delete(projectStacks)
      .where(eq(projectStacks.stackId, id));

    // Then delete the stack
    await db
      .delete(stacks)
      .where(eq(stacks.id, id));
  }
}