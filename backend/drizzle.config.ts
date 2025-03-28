import { defineConfig } from 'drizzle-kit'
import config from "config";

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: config.get("postgres.url"),
    },
    strict: true,
});