import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import config from 'config';

const connectionString: string = config.get('postgres.url');

//console.log(connectionString);

const queryClient = postgres(connectionString);
const db = drizzle(queryClient, { logger: false });

export default db;