const config = require("config");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const passport = require("passport");
const GitLabStrategy = require("passport-gitlab2").Strategy;
const session = require("express-session");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

//this is to allow self-signed certificates
require('https').globalAgent.options.rejectUnauthorized = false;

const SESSION_EXPIRY = 0;

import db from '../db/client';
const { users, userTypes, sessions } = require('../db/schema'); // Import the new tables
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
  const now = new Date();
  await db.delete(sessions).where(lt(sessions.expiresAt, now));
}

async function setupSessionCleanup() {
  // Run cleanup every 5 minutes
  setInterval(cleanupExpiredSessions, 5 * 60 * 1000);
}

module.exports = async () => {
  const app = express();
  const port = process.env.PORT || 3001;

  global.context.app = app;

  app.use(bodyParser.json());
  app.use(cors({
    origin: 'http://localhost:3000'
  }));


  passport.use(
    new GitLabStrategy(
      {
        clientID: config.get("gitlab.client_id"),
        clientSecret: config.get("gitlab.client_secret"),
        //ensure we have https in the callback URL
        callbackURL: `${config.get("gitgud.host").indexOf('https://') > -1 ? config.get("gitgud.host") : `https://${config.get("gitgud.host")}`}/gitlab/auth/callback`,
        baseURL: config.get("gitlab.uri"),
      },
      function (accessToken, refreshToken, profile, done) {
        // Store user profile information in session

        return done(null, profile);
      }
    )
  );

  // Serialize user into session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });


  // Middleware
  app.use(cookieParser());
  app.use(
    session({ secret: "your-secret", resave: false, saveUninitialized: true })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/gitlab/webhook", webhook());

  app.get("/gitlab/auth", (req, res, next) => {
    // Store the return URL in the session
    req.session.returnTo = req.query.returnTo || '/';
    passport.authenticate("gitlab", { scope: ["read_user"] })(req, res, next);
  });

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Setup session cleanup
  await setupSessionCleanup();

  app.get(
    "/gitlab/auth/callback",
    passport.authenticate("gitlab", { failureRedirect: "/failed-login" }),
    async (req, res) => {
      try {
        const sessionId = crypto.randomBytes(16).toString("hex");
        const userProfile = req.user;

        let isAdmin = false;
        let userTypeId = 1;
        let userId;

        // Check if the user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, userProfile.emails[0].value)).limit(1);

        if (existingUser.length === 0) {
          // Create a new user record
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
          isAdmin = existingUser[0].is_admin || false;
          userTypeId = typeof existingUser[0].user_type_id === 'undefined' ? 1 : existingUser[0].user_type_id;
          userId = existingUser[0].id;
        }

        req.user.isAdmin = isAdmin;
        req.user.userTypeId = userTypeId;
        req.user.userType = userTypeId == 1 ? 'developer' : 'manager';
        req.user.externalId = userProfile.id;
        req.user.id = userId; // Override the id with the database user id

        // Calculate expiration (e.g., 24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Store session in PostgreSQL
        await db.insert(sessions).values({
          id: sessionId,
          userId: userId,
          data: req.user,
          expiresAt
        });

        // Set the session ID as an HTTP-only cookie
        res.cookie("session_id", sessionId, { httpOnly: true, secure: true });

        // Redirect to the stored return URL or default to homepage
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo; // Clean up
        res.redirect(returnTo);
      } catch (error) {
        console.error("OAuth callback error:", error.message);
        console.error(error.stack);
        res.redirect("/failed-login");
      }
    }
  );

  app.get("/gitlab/auth/logout", async (req, res) => {
    const sessionId = req.cookies.session_id;

    if (sessionId) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
      res.clearCookie("session_id");
    }

    req.logout(() => { });
    res.redirect("/logged-out");
  });


  const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0', // Specify the OpenAPI version
      info: {
        title: "Gitgud API", // Title of your API
        version: "1.0.0", // Version of your API
        description: "API documentation for Gitgud service",
      },
      servers: [
        {
          url: "http://localhost:3000", // Replace with your server's base URL
        },
      ],
    },
    apis: ["./src/server/*.ts"], // Updated to include TypeScript files and correct path
  };

  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  app.use("/api/public", publicFacing());

  // Middleware to check session
  app.use(async (req, res, next) => {
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

          // Optionally refresh expiration
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
    res.status(401).send("Unauthorized");
  });

  app.use("/api/users", usersRouter());

  // app.get("/gitlab/auth/user", (req, res) => {
  //   if (req.isAuthenticated()) {
  //     res.json(req.user);
  //   } else {
  //     res.status(401).json({ message: "Not authenticated" });
  //   }
  // });
  //const router = express.Router();

  app.use("/api/policies", policies());
  app.use("/api/management", management())
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
    res.json({ version: packageJson.version }); // Use version from package.json
  });


  // Handle 404s
  app.use((req, res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
  });

  // Error handling middleware should be last
  app.use(errorHandler);

  //static_assets(app);



  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log(`Swagger UI available at http://0.0.0.0:${port}/api-docs`);

  });

};
