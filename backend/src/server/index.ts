import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GitLabStrategy } from 'passport-gitlab2';
import config from 'config';
import crypto from 'crypto';

const bodyParser = require("body-parser");
const cors = require('cors');

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const cookieParser = require("cookie-parser");

//this is to allow self-signed certificates
require('https').globalAgent.options.rejectUnauthorized = false;

const SESSION_EXPIRY = 0;

import { getDb } from '../infra/db/client';
import { users, userTypes, sessions } from '../infra/db/schema'; // Changed require to import
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

  // --- Passport Setup --- 
  passport.use(
    new GitLabStrategy(
      // ... existing passport config ...
      {
        clientID: config.get("gitlab.client_id"),
        clientSecret: config.get("gitlab.client_secret"),
        callbackURL: `${config.get("gitgud.host").indexOf('https://') > -1 ? config.get("gitgud.host") : `https://${config.get("gitgud.host")}`}/gitlab/auth/callback`,
        baseURL: config.get("gitlab.uri"),
      },
      function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  // --- Core Middleware --- 
  app.use(cookieParser());
  app.use(
    session({ secret: "your-secret", resave: false, saveUninitialized: true }) // Consider making secret configurable
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // --- Public / Unauthenticated Routes --- 
  app.use("/gitlab/webhook", webhook());
  app.get("/gitlab/auth", (req, res, next) => {
    req.session.returnTo = req.query.returnTo || '/';
    passport.authenticate("gitlab", { scope: ["read_user"] })(req, res, next);
  });
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  app.get(
    "/gitlab/auth/callback",
    passport.authenticate("gitlab", { failureRedirect: "/failed-login" }),
    // ... existing callback handler ...
    async (req, res) => {
      try {
        const db = getDb();
        const sessionId = crypto.randomBytes(16).toString("hex");
        const userProfile = req.user;
        let isAdmin = false;
        let userTypeId = 1;
        let userId;
        const existingUser = await db.select().from(users).where(eq(users.email, userProfile.emails[0].value)).limit(1);
        if (existingUser.length === 0) {
          await db.insert(users).values({
            name: userProfile.displayName,
            email: userProfile.emails[0].value,
            avatarUrl: userProfile.avatarUrl,
            isAdmin,
            userTypeId,
            externalId: userProfile.id
          });
          const newUser = await db.select().from(users).where(eq(users.email, userProfile.emails[0].value)).limit(1);
          userId = newUser[0].id;
        } else {
          isAdmin = existingUser[0].isAdmin || false;
          userTypeId = typeof existingUser[0].userTypeId === 'undefined' ? 1 : existingUser[0].userTypeId;
          userId = existingUser[0].id;
        }
        req.user.isAdmin = isAdmin;
        req.user.userTypeId = userTypeId;
        req.user.userType = userTypeId == 1 ? 'developer' : 'manager';
        req.user.externalId = userProfile.id;
        req.user.id = userId;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        await db.insert(sessions).values({
          id: sessionId,
          userId: userId,
          data: req.user,
          expiresAt
        });
        res.cookie("session_id", sessionId, { httpOnly: true, secure: true }); // Consider secure: process.env.NODE_ENV === 'production'
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(returnTo);
      } catch (error) {
        console.error("OAuth callback error:", error.message);
        console.error(error.stack);
        res.redirect("/failed-login");
      }
    }
  );
  app.get("/gitlab/auth/logout", async (req, res) => {
    const db = getDb();
    const sessionId = req.cookies.session_id;
    if (sessionId) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
      res.clearCookie("session_id");
    }
    req.logout(() => { });
    res.redirect("/logged-out");
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
          req.user = session.data;
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
