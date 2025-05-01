import express from 'express';
import bodyParser from "body-parser";
import cors from 'cors';
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import setupAuth from './auth/passport';
import https from 'https';
//this is to allow self-signed certificates
https.globalAgent.options.rejectUnauthorized = false;

import { getDb } from '../infra/db/client';
import { sessions } from '../infra/db/schema'; // Changed require to import
import { eq, lt } from "drizzle-orm";

import projects from "./projects";
import policies from "./policies";
import events from "./events";
import badges from "./badges";
import webhook from "./webhook";
import kpis from "./kpis";
import stacks from "./stacks";
import owners from "./owners";
import lifecycles from "./lifecycles";
import runtime_types from "./runtime_types";
import usersRouter from "./users";  // renamed from 'users' to 'usersRouter'
import llm from './llm';
import publicFacing from './public';

import { errorHandler, NotFoundError } from './middleware/errorHandler';
import management from './management';

const packageJson = require("../../package.json"); // Import package.json

async function cleanupExpiredSessions() {
  const db = getDb();
  const now = new Date();
  await db.delete(sessions).where(lt(sessions.expiresAt, now));
}

async function setupSessionCleanup() {
  // Run cleanup every 5 minutes
  setInterval(cleanupExpiredSessions, 5 * 60 * 1000);
}

// New function to create and configure the Express app
async function createApp() {
  const app = express();

  // Assign app to global context if needed, though maybe reconsider this pattern
  if (global.context) {
    global.context.app = app;
  } else {
    global.context = { app };
  }

  app.use(bodyParser.json());
  app.use(cors({
    origin: 'http://localhost:3000' // Consider making this configurable
  }));

  // --- Passport/Auth Setup ---
  setupAuth(app);

  // --- Public / Unauthenticated Routes --- 
  app.use("/gitlab/webhook", webhook());
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // --- Swagger --- 
  const swaggerOptions = {
    // ... existing swagger options ...
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: "Gitgud API",
        version: "1.0.0",
        description: "API documentation for Gitgud service",
      },
      servers: [
        {
          url: "http://localhost:3000", // Consider making this dynamic
        },
      ],
    },
    apis: ["./src/server/*.ts"],
  };
  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // --- Public API --- 
  app.use("/api/public", publicFacing());

  // --- Session/Auth Middleware for Protected Routes --- 
  app.use(async (req, res, next) => {
    const db = getDb();
    const sessionId = req.cookies.session_id;
    if (sessionId) {
      try {
        const now = new Date();
        const [session] = await db
          .select()
          .from(sessions)
          .where(eq(sessions.id, sessionId));
        if (session && new Date(session.expiresAt) > now) {
          req.user = session.data as any;
          const newExpiresAt = new Date();
          newExpiresAt.setHours(newExpiresAt.getHours() + 24);
          await db
            .update(sessions)
            .set({ expiresAt: newExpiresAt })
            .where(eq(sessions.id, sessionId));
          return next();
        }
      } catch (ex) {
        console.error("exception in middleware", ex.message);
      }
    }
    // Only send 401 if no user was found and the route is not public
    // This check might need refinement depending on your exact public/private routes
    if (!req.path.startsWith('/api/public') && !req.path.startsWith('/gitlab/') && req.path !== '/health') {
      res.status(401).send("Unauthorized");
    } else {
      next(); // Allow access to public routes even without session
    }
  });

  // --- Protected API Routes --- 
  app.use("/api/users", usersRouter());
  app.use("/api/policies", policies());
  app.use("/api/management", management());
  app.use("/api/projects", projects());
  app.use("/api/events", events());
  app.use("/api/badges", badges());
  app.use("/api/kpis", kpis());
  app.use("/api/stacks", stacks());
  app.use("/api/runtime_types", runtime_types());
  app.use("/api/owners", owners());
  app.use("/api/lifecycles", lifecycles());
  app.use("/api/llm", llm());
  app.get("/api/version", (req, res) => {
    res.json({ version: packageJson.version });
  });

  // --- Error Handling --- 
  app.use((req, res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
  });
  app.use(errorHandler);

  // Setup session cleanup (runs in background, doesn't need to block app return)
  setupSessionCleanup();

  return app; // Return the configured app instance
}

// Export createApp for testing
export { createApp };
