import { defineConfig } from 'drizzle-kit'
import { getAppConfig } from "./src/infra/config/configService";

export default defineConfig({
    schema: './src/infra/db/schema.ts',
    out: './migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: getAppConfig().postgres.url,
    },
    strict: true,
});