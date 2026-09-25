import { betterAuth } from "better-auth"
import { emailOTP, username, bearer } from "better-auth/plugins"
import { expo } from "@better-auth/expo"
import { nextCookies } from "better-auth/next-js"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { eq } from "drizzle-orm";
import { isProduction } from "@/lib/utils"
import { db } from "../database/client";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail, sendMagicLinkEmail } from "../email/email";
import { account, session, user, verification } from "@/lib/database/schemas";
import { sendOTPEmailVerification, sendOTPForgetPasswordEmail } from "../email";
import { BIRTHDAY_MESSAGES, birthdayProblem, birthdaySchema } from "@/lib/validations/account";

const { LOCAL_ORIGIN, NODE_ENV } = process.env;

if (!LOCAL_ORIGIN || LOCAL_ORIGIN === undefined || LOCAL_ORIGIN === '' && NODE_ENV === 'development') {
  throw new Error('LOCAL_ORIGIN is not set. This is required for development.');
};

export const auth = betterAuth({
  // App schemes for Tribe Mobile (Expo); see tribe-mobile/docs/AUTH.md
  trustedOrigins: [LOCAL_ORIGIN, "http://localhost:3000", "tribe://", "tribe-dev://", "tribe-preview://", "exp://"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    }
  }),
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
      },
      displayName: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      location: {
        type: "string",
        required: false,
      },
      profileCompleted: {
        type: "boolean",
        required: false,
      },
      tourCompleted: {
        type: "boolean",
        required: false,
      },
      // TRI-16. Sent by the sign-up forms (web and mobile) as 'YYYY-MM-DD'. Required and 13+ for email
      // sign-up (the hooks.before below, with specific error codes); optional here so social sign-ups
      // may leave it null. The validator keeps /update-user from setting an under-13 or malformed date.
      birthday: {
        type: "string",
        required: false,
        validator: { input: birthdaySchema.nullable() },
      },
      // Written through PATCH /user/profile only; returned in the session user (GET /user/profile)
      // (input: false — sign-up and /update-user reject them, so the zod rules there are the only way in)
      phone: { type: "string", required: false, input: false },
      language: { type: "string", required: false, input: false, defaultValue: "en" },
      timezone: { type: "string", required: false, input: false },
    },
  },
  hooks: {
    // Age gate (TRI-16, TRI-106): email sign-up must carry a real birthday of someone 13 or older.
    // 400 { code: BIRTHDAY_REQUIRED | BIRTHDAY_INVALID | UNDER_MIN_AGE, message }; nothing is written.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      const problem = birthdayProblem((ctx.body as { birthday?: unknown } | undefined)?.birthday);
      if (problem) {
        throw new APIError("BAD_REQUEST", { code: problem, message: BIRTHDAY_MESSAGES[problem] });
      }
    }),
  },
  databaseHooks: {
    session: {
      create: {
        // A deleted account's tombstone (TRI-16) never gets a session, whatever path tries to create one.
        // A deactivated account (TRI-293) signing in is reactivated: every session comes from a sign-in.
        before: async (newSession) => {
          const [row] = await db
            .select({ deletedAt: user.deletedAt, deactivatedAt: user.deactivatedAt })
            .from(user)
            .where(eq(user.id, newSession.userId))
            .limit(1);
          if (!row || row.deletedAt) return false;
          if (row.deactivatedAt) {
            await db.update(user).set({ deactivatedAt: null }).where(eq(user.id, newSession.userId));
          }
        },
      },
    },
  },
  advanced: {
    database: {
      generateId: false, // Let database generate UUIDs automatically
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          email: profile.email,
          name: profile.name,
          displayName: profile.name,
          profileCompleted: true,
          emailVerified: true,
          image: profile.picture,
        };
      },
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          email: profile.email,
          name: profile.global_name || profile.username,
          displayName: profile.display_name || profile.username,
          profileCompleted: true,
          emailVerified: profile.verified,
          image: profile.image_url || undefined,
        };
      },
    },
  },
  plugins: [
    expo(),
    bearer(),
    // username({
    //   maxUsernameLength: 30,

    // }),
    emailOTP({
      otpLength: 6,
      // OTP verifies and resets only; accounts are created by email sign-up, which enforces the age gate (TRI-106)
      disableSignUp: true,
      sendVerificationOnSignUp: false,
      sendVerificationOTP: async ({ email, type, otp }) => {
        if (type === "email-verification") {
          sendOTPEmailVerification({
            to: email,
            otp,
          });
        } else if (type === "forget-password") {
          sendOTPForgetPasswordEmail({
            to: email,
            otp,
          });
        }
      },
    }),
    nextCookies(), // must stay last so cookies set by other plugins reach Next
  ],
  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  // Email configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: /*isProduction*/ false,
    // A reset is often because the account was compromised: sign every other device out (TRI-235).
    revokeSessionsOnPasswordReset: true,
    sendEmailVerification: async ({ user, verificationUrl }: { user: any; verificationUrl: string }) => {
      try {
        await sendVerificationEmail({
          to: user.email,
          verificationUrl,
          userName: user.name || undefined,
        });
      } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error;
      }
    },
    sendPasswordReset: async ({ user, resetUrl }: { user: any; resetUrl: string }) => {
      try {
        await sendPasswordResetEmail({
          to: user.email,
          resetUrl,
          userName: user.name || undefined,
        });
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw error;
      }
    },
    sendWelcomeEmail: async ({ user, loginUrl }: { user: any; loginUrl: string }) => {
      try {
        await sendWelcomeEmail({
          to: user.email,
          userName: user.name || 'User',
          loginUrl,
        });
      } catch (error) {
        console.error('Failed to send welcome email:', error);
        // Don't throw here as welcome email is not critical
      }
    },
  },
  // Magic link configuration
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ user, magicLink }: { user: any; magicLink: string }) => {
      try {
        await sendMagicLinkEmail({
          to: user.email,
          magicLink,
          userName: user.name || undefined,
        });
      } catch (error) {
        console.error('Failed to send magic link email:', error);
        throw error;
      }
    },
  },
})
