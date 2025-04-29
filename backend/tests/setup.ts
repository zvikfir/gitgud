import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka';
import { vi } from 'vitest';
import supertest from 'supertest';
import { execSync } from 'child_process';
import { setupApplication } from '../src/app-setup';
import { setConfig } from '../src/infra/config/configService';

vi.setConfig({ hookTimeout: 90000 });

let pgContainer: StartedPostgreSqlContainer;
let kafkaContainer: StartedKafkaContainer;
let app: any;
let request: supertest.SuperTest<supertest.Test>;

export async function initializeTestEnvironment({ seedFile = 'backend/data/seed-data.json' } = {}) {
  console.log('[test-setup] Starting PostgreSQL container...');
  pgContainer = await new PostgreSqlContainer()
    .withDatabase('postgres')
    .withUsername('postgres')
    .withPassword('test')
    .start();
  console.log('[test-setup] PostgreSQL container started.');

  console.log('[test-setup] Starting Kafka container...');
  kafkaContainer = await new KafkaContainer().start();
  console.log('[test-setup] Kafka container started.');

  const pgConnectionUri = pgContainer.getConnectionUri();
  const kafkaBroker = `${kafkaContainer.getHost()}:${kafkaContainer.getFirstMappedPort()}`;

  process.env.DATABASE_URL = pgConnectionUri;
  process.env.NODE_ENV = 'test';

  console.log(`[test-setup] Overriding config 'postgres.url' with: ${pgConnectionUri}`);
  setConfig("postgres", { url: pgConnectionUri });
  console.log(`[test-setup] Overriding config 'kafka.broker' with: ${kafkaBroker}`);
  setConfig("kafka", { broker: kafkaBroker });

  console.log('[test-setup] Setting up application...');
  app = await setupApplication();
  request = supertest(app); // Create supertest agent directly
  console.log('[test-setup] Application setup complete.');

  console.log('[test-setup] Running migrations...');
  execSync('npm run migrate', { cwd: 'backend', stdio: 'inherit', env: { ...process.env, GITGUD_PG_URL: pgConnectionUri } });
  console.log('[test-setup] Migrations complete.');

  if (seedFile) {
    console.log(`[test-setup] (Optional) Would seed data from: ${seedFile}`);
    // execSync(`psql ${process.env.DATABASE_URL} < ${seedFile}`);
  }

  console.log('[test-setup] Test environment ready.');
  return request; // Return the initialized request object
}

export async function cleanupTestEnvironment() {
  // --- Stop Event Service (Placeholder) ---
  // if (typeof stop_event_service === 'function') {
  //   console.log('[test-setup] Stopping event service...');
  //   await stop_event_service();
  //   console.log('[test-setup] Event service stopped.');
  // }
  // --- End Stop Event Service ---

  if (kafkaContainer) {
    console.log('[test-setup] Stopping Kafka container...');
    await kafkaContainer.stop();
    console.log('[test-setup] Kafka container stopped.');
  }

  if (pgContainer) {
    console.log('[test-setup] Stopping PostgreSQL container...');
    await pgContainer.stop();
    console.log('[test-setup] PostgreSQL container stopped.');
  }
}
