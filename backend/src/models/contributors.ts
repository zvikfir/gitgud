import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { contributors } from '../db/schema';  // Import the languages table model
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class ContributorsModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(name: string, email: string): Promise<any> {
    const db = getDb();
    const existing = await db
      .select()
      .from(contributors)
      .where(eq(contributors.email, email));

    if (existing.length > 0) {
      return existing[0];
    }

    const [newObj] = await db
      .insert(contributors)
      .values({
        name,
        email,
      })
      .returning();

    return newObj;
  }

  async findOneByName(name: string): Promise<any> {
    const db = getDb();
    const existing = await db
      .select(
        { id: contributors.id },
      )
      .from(contributors)
      .where(eq(contributors.name, name));

    if (existing.length > 0) {
      return existing[0];
    }

    return null;
  }
}