import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import config from 'config';

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    const connectionString: string = config.get('postgres.url');
    const queryClient = postgres(connectionString);
    dbInstance = drizzle(queryClient, { logger: false });
  }
  return dbInstance;
}