import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { languages } from '../db/schema';  // Import the languages table model
import { GitLabService } from '../integrations/gitlab/gitlab_service';

export class LanguagesModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(name): Promise<any> {
    const db = getDb();
    // Insert the project
    const existing = await db
      .select()
      .from(languages)
      .where(eq(languages.name, name));

    // If the language exists, return the existing language
    if (existing.length > 0) {
      return existing[0]; // Return the first match (since name is unique)
    }

    // If the language doesn't exist, insert it and return the new record
    const [newObj] = await db
      .insert(languages)
      .values({ name })
      .returning(); // .returning() fetches the inserted row with its ID

    return newObj;
  }
}