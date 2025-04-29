const config = require("config");

const webServer = require("./server");
const start_event_service = require("./events/start_event_service");

import { Context } from './types/context';
import { setupApplication } from './app-setup'; // Import the consolidated setup function

global.context = {
  version: require("../package.json").version,
  root: __dirname,
  config,
} as Context;

(async () => {
  try {
    // Setup application context, services, and create the app instance
    const app = await setupApplication();

    // Start the Web Server
    const port = process.env.PORT || 3001;
    app.listen(port, '0.0.0.0', () => {
      console.log(`[web-server] Server is running on http://0.0.0.0:${port}`);
      console.log(`[web-server] Swagger UI available at http://0.0.0.0:${port}/api-docs`);
    });

  } catch (ex) {
    console.error("[main] Failed to start application:", ex);
    process.exit(1); // Exit if initialization fails
  }
})();

// Graceful shutdown logic (if any) can remain here
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  // Add any necessary cleanup here (e.g., close database connections, stop services)
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  // Add any necessary cleanup here
  process.exit(0);
});
