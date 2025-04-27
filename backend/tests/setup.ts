import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import supertest from 'supertest';
import { execSync } from 'child_process';
import config from 'config';
import { setupApplication } from '../src/app-setup'; // Import the consolidated setup function

vi.setConfig({hookTimeout: 90000}); // 90 seconds for slow CI/docker pulls

let container: any;
let app: any; // Will hold the Express app
let request: supertest.SuperTest<supertest.Test>; // Will hold the supertest agent

export async function setupTestApp({ seedFile = 'backend/data/seed-data.json' } = {}) {
  beforeAll(async () => {
    console.log('[test-setup] Starting PostgreSQL container...');
    container = await new PostgreSqlContainer()
      .withDatabase('postgres')
      .withUsername('postgres')
      .withPassword('test')
      .start();
    console.log('[test-setup] PostgreSQL container started.');

    const connectionUri = container.getConnectionUri();
    process.env.DATABASE_URL = connectionUri; // Keep for potential direct use elsewhere
    process.env.NODE_ENV = 'test';

    // --- Override node-config --- 
    console.log(`[test-setup] Overriding config 'postgres.url' with: ${connectionUri}`);
    config.util.setModuleDefaults('postgres', {
      url: connectionUri
    });
    // --- End Override ---

    // --- Setup Application (Context, Services, Express App) ---
    console.log('[test-setup] Setting up application...');
    app = await setupApplication(); // Call the consolidated setup function
    request = supertest(app); // Create supertest agent from the returned app
    console.log('[test-setup] Application setup complete.');
    // --- End Setup ---

    console.log('[test-setup] Running migrations...');
    // Ensure config is overridden before migrations if they use the config
    execSync('npm run migrate', { cwd: 'backend', stdio: 'inherit', env: { ...process.env, GITGUD_PG_URL: connectionUri } }); // Also pass env here just in case migrate runs separately
    console.log('[test-setup] Migrations complete.');

    // Seed data (optional, adjust as needed)
    if (seedFile) {
      console.log(`[test-setup] (Optional) Would seed data from: ${seedFile}`);
      // execSync(`psql ${process.env.DATABASE_URL} < ${seedFile}`);
    }

    console.log('[test-setup] Test environment ready.');
    // return request; // Removed return from beforeAll
  });

  afterAll(async () => {
    // --- Stop Event Service (Placeholder) ---
    // if (typeof stop_event_service === 'function') {
    //   console.log('[test-setup] Stopping event service...');
    //   await stop_event_service();
    //   console.log('[test-setup] Event service stopped.');
    // }
    // --- End Stop Event Service ---

    if (container) {
      console.log('[test-setup] Stopping PostgreSQL container...');
      await container.stop();
      console.log('[test-setup] PostgreSQL container stopped.');
    }
  });

  afterEach(async () => {
    // Implement table truncation if needed
  });

  return () => request; // Return the function that returns the request object
}
