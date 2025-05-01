import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getAppConfig } from '../config/configService';

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    const connectionString: string = getAppConfig().postgres.url;
    const queryClient = postgres(connectionString);
    dbInstance = drizzle(queryClient, { logger: false });
  }
  return dbInstance;
}