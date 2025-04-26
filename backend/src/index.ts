const config = require("config");

const webServer = require("./server");
const start_event_service = require("./events/start_event_service");

import { Context } from './types/context';
import { PoliciesModel } from './models/policies';

global.context = {
  version: require("../package.json").version,
  root: __dirname,
  config,
} as Context;

(async () => {
  //Load policies
  try {
    // let policiesModel = new PoliciesModel();
    //await policiesModel.init_policies();
    //Setup integration with Kafka
    await start_event_service();

    //Start the Web Server
    await webServer();
  } catch (ex) {
    console.log("Failed to start", ex);
  }
})();

// Graceful shutdown
const shutdown = () => {
  console.log("[main] Received kill signal, shutting down gracefully");
  process.exit(0);
};

// Listen for termination signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
