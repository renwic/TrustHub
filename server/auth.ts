import * as client from "openid-client";
import { Strategy as ReplitStrategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as LocalStrategy } from "passport-local";

import passport from "passport";
import session from "express-session";
import bcrypt from "bcryptjs";
import type { Express, RequestHandler, Request, Response } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { signUpSchema, signInSchema } from "@shared/schema";

// Replit Auth Configuration
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Always use PostgreSQL session store when DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    console.log('Configuring PostgreSQL session store for production');
    try {
      const pgStore = connectPg(session);
      const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: Math.floor(sessionTtl / 1000), // TTL in seconds
        tableName: "sessions",
        pruneSessionInterval: 60, // Clean up every 60 seconds
      });
      
      // Test the store connection
      sessionStore.on('connect', () => {
        console.log('✅ PostgreSQL session store connected successfully');
      });
      
      sessionStore.on('disconnect', () => {
        console.log('⚠️ PostgreSQL session store disconnected');
      });
      
      return session({
        secret: process.env.SESSION_SECRET!,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        name: 'connect.sid',
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: sessionTtl,
        },
      });
    } catch (error) {
      console.error('❌ Failed to initialize PostgreSQL session store:', error);
      console.log('Falling back to MemoryStore');
    }
  }
  
  // Development fallback with MemoryStore
  console.log('Using MemoryStore for development (DATABASE_URL not found)');
  return session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
  provider: string = "replit"
) {
  const userData = {
    id: provider === "replit" ? claims["sub"] : `${provider}_${claims["sub"] || claims.id}`,
    email: claims["email"],
    firstName: claims["first_name"] || claims["given_name"] || claims["name"]?.split(" ")[0],
    lastName: claims["last_name"] || claims["family_name"] || claims["name"]?.split(" ")[1],
    profileImageUrl: claims["profile_image_url"] || claims["picture"],
    authProvider: provider,
    providerUserId: claims["sub"] || claims.id,
    emailVerified: claims["email_verified"] || false,
    lastLoginAt: new Date(),
  };
  
  return await storage.upsertUser(userData);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Add CORS middleware for authentication
  app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });
  
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Add session debugging middleware
  app.use((req, res, next) => {
    console.log("Session middleware check:", {
      url: req.url,
      method: req.method,
      sessionId: req.session?.id,
      passport: req.session?.passport,
      hasCookies: !!req.headers.cookie,
      isAuthenticated: req.isAuthenticated?.()
    });
    next();
  });

  // Replit Auth Strategy
  const config = await getOidcConfig();
  const replitVerify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims(), "replit");
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new ReplitStrategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/auth/replit/callback`,
      },
      replitVerify,
    );
    passport.use(strategy);
  }

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await upsertUser(profile._json, "google");
        done(null, { user, provider: "google" });
      } catch (error) {
        done(error, null);
      }
    }));
  }

  // Facebook Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ['id', 'emails', 'name', 'picture.type(large)']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await upsertUser({
          id: profile.id,
          email: profile.emails?.[0]?.value,
          first_name: profile.name?.givenName,
          last_name: profile.name?.familyName,
          picture: profile.photos?.[0]?.value
        }, "facebook");
        done(null, { user, provider: "facebook" });
      } catch (error) {
        done(error, null);
      }
    }));
  }

  // Local Strategy (Email/Password)
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user || user.authProvider !== 'email') {
        return done(null, false, { message: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Update last login
      await storage.updateLastLogin(user.id);
      done(null, { user: { id: user.id }, provider: "email" });
    } catch (error) {
      done(error, null);
    }
  }));

  passport.serializeUser((user: any, cb) => {
    console.log("Serializing user:", user);
    cb(null, user);
  });
  passport.deserializeUser((user: any, cb) => {
    console.log("Deserializing user:", user);
    cb(null, user);
  });

  // Auth Routes
  setupAuthRoutes(app, config);
}

function setupAuthRoutes(app: Express, config: any) {
  // Replit Auth Routes
  app.get("/api/auth/replit", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/auth/replit/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/login?error=replit_failed",
    })(req, res, next);
  });

  // Google Auth Routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback", 
    passport.authenticate("google", { 
      successRedirect: "/",
      failureRedirect: "/login?error=google_failed"
    })
  );

  // Facebook Auth Routes
  app.get("/api/auth/facebook",
    passport.authenticate("facebook", { scope: ["email"] })
  );

  app.get("/api/auth/facebook/callback",
    passport.authenticate("facebook", {
      successRedirect: "/",
      failureRedirect: "/login?error=facebook_failed"
    })
  );

  // Email/Password Auth Routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const validatedData = signUpSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, 12);
      
      // Create user
      const user = await storage.upsertUser({
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        authProvider: "email",
        passwordHash,
        phoneNumber: validatedData.phoneNumber,
        emailVerified: false,
        lastLoginAt: new Date(),
      });

      // Create a simple token for auth
      const authToken = `auth_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store in session and send as header
      req.session.authToken = authToken;
      req.session.userId = user.id;
      
      res.json({ 
        message: "Account created successfully", 
        user,
        authToken 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const validatedData = signInSchema.parse(req.body);
      
      // Authenticate manually
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || user.authProvider !== 'email') {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(validatedData.password, user.passwordHash || '');
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Update last login
      await storage.updateLastLogin(user.id);
      
      // Create a simple token for auth
      const authToken = `auth_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store in session
      req.session.authToken = authToken;
      req.session.userId = user.id;
      
      res.json({ 
        message: "Signed in successfully", 
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        authToken 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  // Universal logout routes (both /api/logout and /api/auth/logout)
  const logoutHandler = (req: any, res: any) => {
    const user = req.user as any;
    
    // Clear session data for token-based auth
    if (req.session) {
      req.session.authToken = null;
      req.session.userId = null;
    }
    
    req.logout(() => {
      if (user?.provider === "replit") {
        // Redirect to Replit logout
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      } else {
        // For other providers, just redirect home
        res.redirect("/");
      }
    });
  };

  app.get("/api/logout", logoutHandler);
  app.get("/api/auth/logout", logoutHandler);

  // No legacy routes - use direct auth endpoints
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Check for auth token in header
    const authTokenFromHeader = req.headers.authorization?.replace('Bearer ', '');
    const sessionUserId = req.session?.userId;
    const sessionToken = req.session?.authToken;
    
    console.log("isAuthenticated check:", {
      hasAuthTokenFromHeader: !!authTokenFromHeader,
      hasSessionUserId: !!sessionUserId,
      hasSessionToken: !!sessionToken,
      tokensMatch: authTokenFromHeader === sessionToken,
      sessionId: req.session?.id,
      authorization: req.headers.authorization
    });

    // Token-based auth: check if header token matches session token and we have userId
    if (authTokenFromHeader && sessionUserId && authTokenFromHeader === sessionToken) {
      console.log("Token-based auth successful for user:", sessionUserId);
      req.user = { id: sessionUserId };
      return next();
    }

    // If we have a token but no matching session, try to extract user ID from token
    if (authTokenFromHeader && authTokenFromHeader.startsWith('auth_')) {
      try {
        // Extract user ID from token format: auth_{userId}_{timestamp}_{random}
        const tokenParts = authTokenFromHeader.split('_');
        if (tokenParts.length >= 4) {
          const userId = tokenParts.slice(1, -2).join('_'); // Handle multi-part user IDs
          console.log("Extracted userId from token:", userId);
          
          // Verify user exists in database
          const user = await storage.getUser(userId);
          if (user) {
            console.log("Token-based auth successful via token extraction for user:", userId);
            req.user = { id: userId };
            return next();
          }
        }
      } catch (error) {
        console.error("Error extracting user from token:", error);
      }
    }

    // Fallback to passport-based auth
    const user = req.user as any;
    if (req.isAuthenticated() && user) {
      console.log("Passport-based auth successful");
      return next();
    }

    // For Replit auth, check token expiration and refresh if needed
    if (user?.claims && user?.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now > user.expires_at) {
        const refreshToken = user.refresh_token;
        if (!refreshToken) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        try {
          const config = await getOidcConfig();
          const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
          updateUserSession(user, tokenResponse);
          return next();
        } catch (error) {
          console.error("Token refresh failed:", error);
          return res.status(401).json({ message: "Unauthorized" });
        }
      }
      return next();
    }

    console.log("Authentication failed - no valid auth method");
    res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};