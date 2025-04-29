import { defineConfig } from 'drizzle-kit'
import config from "config";
import { getAppConfig } from "./src/infra/config/configService";

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: getAppConfig().postgres.url,
    },
    strict: true,
});