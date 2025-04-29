import config from 'config';
import { Context } from './types/context';
import { createApp } from './server'; // Import createApp
import { startEventService } from './events/start_event_service';
import { getAppConfig } from "./infra/config/configService";
// import { PoliciesModel } from './models/policies'; // Uncomment if/when policy loading is needed

/**
 * Initializes shared application context, services, and the Express app instance.
 * Returns the configured Express app, ready to be started or used for testing.
 */
export async function setupApplication() {
  console.log('[app-setup] Initializing application...');

  // 1. Initialize Global Context
  console.log('[app-setup] Setting up global context...');
  global.context = {
    version: require("../package.json").version,
    root: __dirname, // Note: __dirname will be relative to dist/app-setup.js after compilation
    config,
  } as Context;
  console.log('[app-setup] Global context set.');

  const appConfig = getAppConfig();

  // 2. Load Policies (Optional)
  // console.log('[app-setup] Initializing policies...');
  // try {
  //   let policiesModel = new PoliciesModel();
  //   await policiesModel.init_policies();
  //   console.log('[app-setup] Policies initialized.');
  // } catch (ex) {
  //   console.error('[app-setup] Failed to initialize policies:', ex);
  //   throw ex; // Re-throw to prevent startup if policies are critical
  // }

  // 3. Start Event Service
  console.log('[app-setup] Starting event service...');
  try {
    await startEventService();
    console.log('[app-setup] Event service started.');
  } catch (ex) {
    console.error('[app-setup] Failed to start event service:', ex);
    throw ex; // Re-throw to prevent startup if event service is critical
  }

  // 4. Create Express App
  console.log('[app-setup] Creating Express app instance...');
  const app = await createApp();
  console.log('[app-setup] Express app instance created.');

  console.log('[app-setup] Application setup complete.');
  return app; // Return the configured app instance
}
