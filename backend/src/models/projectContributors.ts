
import { eq, and } from 'drizzle-orm';
import db from '../db/client';
import { projectContributors, contributors } from '../db/schema';
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class ProjectContributorsModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(project_id, contributor_id): Promise<any> {
    const existing = await db
      .select()
      .from(projectContributors)
      .where(
        and(
          eq(projectContributors.projectId, project_id),
          eq(projectContributors.contributorId, contributor_id)
        ));

    if (existing.length > 0) {
      return existing[0];
    }

    const [newObj] = await db
      .insert(projectContributors)
      .values({
        projectId: project_id,
        contributorId: contributor_id
      })
      .returning();

    return newObj;
  }

  async createByContributorEmail(project_id, contributor_email): Promise<any> {
    const contributor = await db
      .select()
      .from(contributors)
      .where(eq(contributors.email, contributor_email));

    if (contributor.length === 0) {
      return null;
    }

    return this.create(project_id, contributor[0].id);
  }
}