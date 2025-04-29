import { getDb } from '../db/client';
import { userStacks, users, projects, projectContributors, stacks, projectStacks, contributors } from '../db/schema';  // Import the languages table model
import { unionAll, } from 'drizzle-orm/pg-core'
import { eq, desc, and, sql } from 'drizzle-orm';

export class UserStacksModel {
  constructor() {
  }

  async create(user_id: number, stack_id: number, state: number): Promise<any> {
    const db = getDb();
    //check if we already have a record for this user_id/stack_id
    const existing = await db
      .select()
      .from(userStacks)
      .where(and(eq(userStacks.userId, user_id), eq(userStacks.stackId, stack_id)));

    //if we have a record, update it
    if (existing.length > 0) {
      const [newObj] = await db
        .update(userStacks)
        .set({ state: state })
        .where(and(eq(userStacks.userId, user_id), eq(userStacks.stackId, stack_id)))
        .returning();
      return newObj;
    }
    else {
      const [newObj] = await db
        .insert(userStacks)
        .values({
          userId: user_id,
          stackId: stack_id,
          state: state
        })
        .returning();
      return newObj;
    }

  }

  async findAll(): Promise<any> {
    const db = getDb();
    let userStacksResult = await db
      .select()
      .from(userStacks)

    return userStacksResult;
  }

  async findAllByUserId(user_id: number): Promise<any> {
    const db = getDb();
    let userStacksResult = await unionAll(
      db.select({
        stack_id: stacks.id,
        //project_id: projects.id,
        state: sql<string>`'contributor'`
      })
        .from(stacks)
        .leftJoin(projectStacks, eq(projectStacks.stackId, stacks.id))
        .leftJoin(projects, eq(projects.id, projectStacks.projectId))
        .leftJoin(projectContributors, eq(projectContributors.projectId, projects.id))
        .leftJoin(contributors, eq(contributors.id, projectContributors.contributorId))
        .leftJoin(users, eq(users.email, contributors.email))
        .where(eq(users.id, user_id))
      ,
      db.select({
        stack_id: stacks.id,
        //project_id: projects.id,
        state: sql<string>`'following'`
      })
        .from(userStacks)
        .innerJoin(stacks, eq(userStacks.stackId, stacks.id))
        .leftJoin(projectStacks, eq(projectStacks.stackId, stacks.id))
        .leftJoin(projects, eq(projects.id, projectStacks.projectId))
        .where(and(eq(userStacks.userId, user_id), eq(userStacks.state, 1)))
    )

    const notFollowingStacks = await db.select({
      stack_id: stacks.id,
      //project_id: projects.id,
      state: sql<string>`'not-following'`
    })
      .from(userStacks)
      .innerJoin(stacks, eq(userStacks.stackId, stacks.id))
      .innerJoin(projectStacks, eq(projectStacks.stackId, stacks.id))
      .innerJoin(projects, eq(projects.id, projectStacks.projectId))
      .where(and(eq(userStacks.userId, user_id), eq(userStacks.state, 0)))

    //remove duplicates
    userStacksResult = userStacksResult.filter((v, i, a) => a.findIndex(t => (t.stack_id === v.stack_id)) === i)


    //iterate over the not following stacks and if there's a matching userstackresult then update the state, else add it
    for (let i = 0; i < notFollowingStacks.length; i++) {
      let notFollowingStack = notFollowingStacks[i];
      let userStack = userStacksResult.find(us => us.stack_id == notFollowingStack.stack_id);
      if (userStack) {
        userStack.state = notFollowingStack.state;
      } else {
        userStacksResult.push(notFollowingStack);
      }
    }

    return userStacksResult;
  }
}