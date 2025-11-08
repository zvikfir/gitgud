import passport from 'passport';
import session from 'express-session';
import { Strategy as GitLabStrategy } from 'passport-gitlab2';
import MockStrategy from 'passport-mock-strategy';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { getAppConfig } from '../../infra/config/configService';
import { getDb } from '../../infra/db/client';
import { users, sessions } from '../../infra/db/schema';
import { eq } from 'drizzle-orm';
import type { Express } from 'express';

export default function setupAuth(app: Express) {
  const appConfig = getAppConfig();

  app.use(cookieParser());
  app.use(
    session({ secret: "your-secret", resave: false, saveUninitialized: true })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  if (process.env.NODE_ENV === 'test') {
    passport.use(new MockStrategy({
      name: 'gitlab',
      user: {
        id: 'test-user',
        displayName: 'Test User',
        emails: [{ value: 'test@example.com', type: 'work' }],
        name: 'Test User',
        provider: 'gitlab',
        avatarUrl: '',
      } as any // Cast to any to satisfy User type
    }, (user: any, done) => done(null, user)));
  } else {
    passport.use(
      new GitLabStrategy(
        {
          clientID: appConfig.gitlab.client_id || '',
          clientSecret: appConfig.gitlab.client_secret || '',
          callbackURL: `${appConfig.gitgud?.host}/gitlab/auth/callback`,
          baseURL: appConfig.gitlab.uri,
        },
        function (accessToken, refreshToken, profile, done) {
          return done(null, profile);
        }
      )
    );
  }
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Auth routes
  app.get("/gitlab/auth", (req, res, next) => {
    (req as any).session.returnTo = req.query.returnTo || '/';
    passport.authenticate("gitlab", { scope: ["read_user"] })(req, res, next);
  });

  app.get(
    "/gitlab/auth/callback",
    passport.authenticate("gitlab", { failureRedirect: "/failed-login" }),
    async (req, res) => {
      try {
        const db = getDb();
        const sessionId = crypto.randomBytes(16).toString("hex");
        const userProfile = req.user as any;
        let isAdmin = false;
        let userTypeId = 1;
        let userId;
        const existingUser = await db.select().from(users).where(eq(users.email, userProfile?.emails?.[0]?.value)).limit(1);
        if (existingUser.length === 0) {
          await db.insert(users).values({
            name: userProfile?.displayName,
            email: userProfile?.emails?.[0]?.value,
            avatarUrl: userProfile?.avatarUrl,
            isAdmin,
            userTypeId,
            externalId: userProfile?.id
          });
          const newUser = await db.select().from(users).where(eq(users.email, userProfile?.emails?.[0]?.value)).limit(1);
          userId = newUser[0].id;
        } else {
          isAdmin = existingUser[0].isAdmin || false;
          userTypeId = typeof existingUser[0].userTypeId === 'undefined' ? 1 : existingUser[0].userTypeId;
          userId = existingUser[0].id;
        }
        (req.user as any).isAdmin = isAdmin;
        (req.user as any).userTypeId = userTypeId;
        (req.user as any).userType = userTypeId == 1 ? 'developer' : 'manager';
        (req.user as any).externalId = userProfile?.id;
        (req.user as any).id = userId;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        await db.insert(sessions).values({
          id: sessionId,
          userId: userId,
          data: req.user,
          expiresAt
        });
        res.cookie("session_id", sessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        const returnTo = (req as any).session.returnTo || '/';
        delete (req as any).session.returnTo;
        res.redirect(returnTo);
      } catch (error) {
        console.error("OAuth callback error:", (error as any).message);
        console.error((error as any).stack);
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
}
