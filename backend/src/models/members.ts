import { eq } from 'drizzle-orm';
import db from '../db/client';
import { members } from '../db/schema';  // Import the languages table model
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class MembersModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(externalId: number, username: string, name: string, avatar_url: string, web_url: string): Promise<any> {
    const existing = await db
      .select()
      .from(members)
      .where(eq(members.externalId, externalId));

    if (existing.length > 0) {
      return existing[0];
    }

    const [newObj] = await db
      .insert(members)
      .values({
        externalId,
        username,
        name,
        avatarUrl: avatar_url,
        webUrl: web_url
      })
      .returning();

    return newObj;
  }

  async findOneByName(name: string): Promise<any> {
    const existing = await db
      .select(
        { id: members.id },
      )
      .from(members)
      .where(eq(members.name, name));

    if (existing.length > 0) {
      return existing[0];
    }

    return null;
  }
}