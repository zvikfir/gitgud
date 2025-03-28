
import { eq, and } from 'drizzle-orm';
import db from '../db/client';
import { projectMembers, members } from '../db/schema';
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class ProjectMembersModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(project_id, member_id): Promise<any> {
    const existing = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, project_id),
          eq(projectMembers.memberId, member_id)
        ));

    if (existing.length > 0) {
      return existing[0];
    }

    const [newObj] = await db
      .insert(projectMembers)
      .values({
        projectId: project_id,
        memberId: member_id
      })
      .returning();

    return newObj;
  }

  async createByMemberExternalId(project_id, member_external_id): Promise<any> {
    const member = await db
      .select()
      .from(members)
      .where(eq(members.externalId, member_external_id));

    if (member.length === 0) {
      return null;
    }

    return this.create(project_id, member[0].id);
  }
}