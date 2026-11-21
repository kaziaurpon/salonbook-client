import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;

const globalForMongo = globalThis as typeof globalThis & { salonBookMongo?: MongoClient };
// A local placeholder keeps static builds independent of deployment secrets. The auth route
// returns 503 until real environment values are present, so this URI is never used for auth.
const mongoClient = globalForMongo.salonBookMongo ?? new MongoClient(mongoUri || "mongodb://127.0.0.1:27017/salonbook_missing_configuration");
if (process.env.NODE_ENV !== "production") globalForMongo.salonBookMongo = mongoClient;

const database = mongoClient.db(process.env.DATABASE_NAME || undefined);
const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  appName: "SalonBook",
  baseURL,
  // Auth routes fail closed without a real secret; this fixed value only lets static builds load config.
  secret: process.env.BETTER_AUTH_SECRET || "salonbook-static-build-placeholder-secret-never-for-auth",
  trustedOrigins: [baseURL, "http://localhost:3000"],
  database: mongodbAdapter(database, { client: mongoClient }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          requireEmailVerification: true,
        },
      }
    : {},
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      allowDifferentEmails: false,
      updateUserInfoOnLink: true,
    },
  },
  user: {
    modelName: "users",
    validateUserInfo: ({ source }) => {
      if (source.oauth?.providerId === "google") {
        const googleProfile = source.oauth.profile as { email_verified?: boolean } | undefined;
        if (googleProfile?.email_verified !== true) {
          return {
            error: "email_not_verified",
            errorDescription: "Use a Google account with a verified email address.",
          };
        }
      }
    },
    additionalFields: {
      role: {
        type: ["customer", "admin"],
        required: false,
        defaultValue: "customer",
        input: false,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Public signup (email or OAuth) always creates a customer. The local
        // provisioning CLI promotes the designated admin account afterwards.
        before: async (user) => ({
          data: { ...user, role: "customer", isBlocked: false },
        }),
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== "/sign-up/email") return;
      const password = (context.body as { password?: unknown } | undefined)?.password;
      if (typeof password !== "string" || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
        throw new APIError("BAD_REQUEST", {
          message: "Password must contain at least one uppercase and one lowercase letter.",
        });
      }
    }),
  },
  plugins: [
    jwt({
      jwt: {
        definePayload: ({ user }) => ({ id: user.id, role: user.role }),
      },
    }),
  ],
});
