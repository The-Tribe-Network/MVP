import { betterAuth } from "better-auth"
import { emailOTP, username, bearer } from "better-auth/plugins"
import { expo } from "@better-auth/expo"
import { nextCookies } from "better-auth/next-js"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { and, eq, gt, sql } from "drizzle-orm";
import * as z from "zod";
import { isProduction } from "@/lib/utils"
import { db } from "../database/client";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail, sendMagicLinkEmail } from "../email/email";
import { account, session, user, verification } from "@/lib/database/schemas";
import { sendEmailChangedNotice, sendEmailChangeOTP, sendOTPEmailVerification, sendOTPForgetPasswordEmail } from "../email";
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
      if (ctx.path === "/sign-up/email") {
        const problem = birthdayProblem((ctx.body as { birthday?: unknown } | undefined)?.birthday);
        if (problem) {
          throw new APIError("BAD_REQUEST", { code: problem, message: BIRTHDAY_MESSAGES[problem] });
        }
        return;
      }
      if (ctx.path === "/email-otp/request-email-change" || ctx.path === "/email-otp/change-email") {
        await checkEmailChange(ctx, ctx.path === "/email-otp/request-email-change");
      }
    }),
    // Change email: tell the OLD address once the change is done (a hijacked session can't move the account quietly)
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/email-otp/change-email") return;
      const returned = ctx.context.returned as { success?: boolean } | undefined;
      const oldEmail = ctx.request ? emailChangeOldEmail.get(ctx.request) : undefined;
      const newEmail = (ctx.body as { newEmail?: string } | undefined)?.newEmail?.toLowerCase();
      if (returned?.success !== true || !oldEmail || !newEmail || oldEmail.toLowerCase() === newEmail) return;
      sendEmailChangedNotice({ to: oldEmail, newEmail }).catch((error) => {
        console.error("Failed to send email-changed notice:", error);
      });
    }),
  },
  databaseHooks: {
    session: {
      create: {
        // A deleted account's tombstone (TRI-16) never gets a session, whatever path tries to create one
        before: async (newSession) => {
          const [row] = await db
            .select({ deletedAt: user.deletedAt })
            .from(user)
            .where(eq(user.id, newSession.userId))
            .limit(1);
          if (!row || row.deletedAt) return false;
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
        } else if (type === "change-email") {
          // `email` is the NEW address here
          sendEmailChangeOTP({ to: email, otp });
        }
      },
      // Change email with a code sent to the new address (USET-03): POST /email-otp/request-email-change
      // { newEmail } → POST /email-otp/change-email { newEmail, otp }. The signed-in session is the proof of
      // ownership of the current address (no second code to it); it gets a notice instead (hooks.after).
      changeEmail: { enabled: true },
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

// Change email (USET-03). Runs before Better-Auth's emailOTP change-email endpoints so the app gets specific codes
// (Better-Auth answers a taken address with a silent 200 on request and a generic 400 on verify). Without a
// session it does nothing and the endpoint answers 401.
const EMAIL_CHANGE_SENDS_PER_MINUTE = 1;
const EMAIL_CHANGE_SENDS_PER_HOUR = 5;

// The caller's address before the change, for the notice in hooks.after (keyed by the HTTP request)
const emailChangeOldEmail = new WeakMap<Request, string>();

async function checkEmailChange(ctx: Parameters<Parameters<typeof createAuthMiddleware>[0]>[0], isSend: boolean): Promise<void> {
  // Hooks see the raw request (the bearer plugin's cookie rewrite only reaches the endpoint), so resolve the
  // session through auth.api, which accepts either the bearer or the cookie
  const headers = ctx.request?.headers ?? ctx.headers;
  if (!headers) return;
  const current = await auth.api.getSession({ headers });
  if (!current) return;
  const oldEmail = current.user.email.toLowerCase();
  if (ctx.request) emailChangeOldEmail.set(ctx.request, current.user.email);
  const raw = (ctx.body as { newEmail?: unknown } | undefined)?.newEmail;
  const newEmail = typeof raw === "string" ? raw.toLowerCase() : "";
  if (!z.string().email().safeParse(newEmail).success) {
    throw new APIError("BAD_REQUEST", { code: "INVALID_EMAIL", message: "Enter a valid email address" });
  }
  if (newEmail === oldEmail) {
    throw new APIError("BAD_REQUEST", { code: "EMAIL_SAME", message: "That's already your email address" });
  }
  const [taken] = await db.select({ id: user.id }).from(user).where(eq(user.email, newEmail)).limit(1);
  if (taken) {
    throw new APIError("CONFLICT", { code: "EMAIL_TAKEN", message: "That email address is already in use" });
  }
  if (!isSend) return;
  // Sends per account, counted from the pending codes (Better-Auth's own limiter is per IP, in memory, prod only)
  const prefix = `change-email-otp-${oldEmail}-`;
  const [counts] = await db
    .select({
      lastMinute: sql<number>`count(*) filter (where ${verification.createdAt} > now() - interval '1 minute')`.mapWith(Number),
      lastHour: sql<number>`count(*)`.mapWith(Number),
    })
    .from(verification)
    .where(and(
      sql`left(${verification.identifier}, ${prefix.length}) = ${prefix}`,
      gt(verification.createdAt, sql`now() - interval '1 hour'`),
    ));
  if (counts && (counts.lastMinute >= EMAIL_CHANGE_SENDS_PER_MINUTE || counts.lastHour >= EMAIL_CHANGE_SENDS_PER_HOUR)) {
    throw new APIError("TOO_MANY_REQUESTS", { code: "RATE_LIMITED", message: "Too many codes requested. Try again later." });
  }
}
