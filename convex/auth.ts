import { actionGeneric, internalMutationGeneric, mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

const sessionUserValidator = v.object({
  id: v.id("users"),
  email: v.string(),
  fullName: v.string(),
});

const authResultValidator = v.object({
  token: v.string(),
  user: sessionUserValidator,
});

const signUpResultValidator = v.object({
  status: v.literal("pending_verification"),
});

const userSettingsValidator = v.object({
  email: v.string(),
  fullName: v.string(),
  githubLinked: v.boolean(),
});

async function getUserFromSessionToken(ctx: { db: any }, tokenInput: string) {
  const token = tokenInput.trim();
  if (!token) {
    return null;
  }

  const session = await ctx.db.query("sessions").withIndex("by_token", (q: any) => q.eq("token", token)).unique();
  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  const user = await ctx.db.get(session.userId);
  if (!user) {
    return null;
  }

  return user;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashCredential(email: string, password: string) {
  // Starter hash only; swap to a stronger password strategy before production.
  const source = `${normalizeEmail(email)}::${password}`;
  let hash = 2166136261;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function createSessionToken(userId: string) {
  return `${userId}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 12)}`;
}

function createPasswordResetToken() {
  const values = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

function createEmailVerificationToken() {
  const values = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

function readEnv(name: string) {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const value = env?.[name];
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeGitHubName(name: string | null | undefined, fallbackEmail: string) {
  const trimmed = (name ?? "").trim();
  if (trimmed.length >= 2) {
    return trimmed;
  }

  const localPart = fallbackEmail.split("@")[0] ?? "GitHub User";
  return localPart.length >= 2 ? localPart : "GitHub User";
}

export const signUp = mutationGeneric({
  args: {
    fullName: v.string(),
    email: v.string(),
    password: v.string(),
  },
  returns: signUpResultValidator,
  handler: async (ctx, args) => {
    const fullName = args.fullName.trim();
    if (fullName.length < 2) {
      throw new Error("Please enter your full name.");
    }

    const email = normalizeEmail(args.email);
    if (!email.includes("@")) {
      throw new Error("Enter a valid email address.");
    }

    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const existingUser = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).unique();
    const now = Date.now();

    let userId;

    if (existingUser) {
      if (existingUser.emailVerifiedAt) {
        throw new Error("An account with this email already exists.");
      }

      await ctx.db.patch(existingUser._id, {
        fullName,
        passwordDigest: hashCredential(email, args.password),
        updatedAt: now,
      });
      userId = existingUser._id;
    } else {
      userId = await ctx.db.insert("users", {
        fullName,
        email,
        passwordDigest: hashCredential(email, args.password),
        createdAt: now,
        updatedAt: now,
      });
    }

    const activeTokens = await ctx.db
      .query("emailVerificationTokens")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    await Promise.all(activeTokens.map((token) => ctx.db.delete(token._id)));

    const verificationToken = createEmailVerificationToken();
    await ctx.db.insert("emailVerificationTokens", {
      userId,
      token: verificationToken,
      expiresAt: now + EMAIL_VERIFICATION_TTL_MS,
      createdAt: now,
    });

    await ctx.scheduler.runAfter(0, "passwordResetEmail:sendEmailVerificationEmail" as any, {
      email,
      verificationToken,
    });

    return {
      status: "pending_verification",
    } as const;
  },
});

export const signIn = mutationGeneric({
  args: {
    email: v.string(),
    password: v.string(),
  },
  returns: authResultValidator,
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).unique();

    if (!user || user.passwordDigest !== hashCredential(email, args.password)) {
      throw new Error("Invalid email or password.");
    }

    if (!user.emailVerifiedAt) {
      throw new Error("Please verify your email before signing in.");
    }

    const now = Date.now();
    const token = createSessionToken(String(user._id));

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: now + SESSION_TTL_MS,
      createdAt: now,
    });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  },
});

export const getSession = queryGeneric({
  args: {
    token: v.string(),
  },
  returns: v.union(sessionUserValidator, v.null()),
  handler: async (ctx, args) => {
    const token = args.token.trim();
    if (!token) {
      return null;
    }

    const session = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("token", token)).unique();
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user || !user.emailVerifiedAt) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    };
  },
});

export const signOut = mutationGeneric({
  args: {
    token: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const token = args.token.trim();
    if (!token) {
      return null;
    }

    const session = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("token", token)).unique();
    if (session) {
      await ctx.db.delete(session._id);
    }

    return null;
  },
});

export const getUserSettings = queryGeneric({
  args: {
    token: v.string(),
  },
  returns: v.union(userSettingsValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await getUserFromSessionToken(ctx, args.token);
    if (!user) {
      return null;
    }

    return {
      email: user.email,
      fullName: user.fullName,
      githubLinked: Boolean(user.githubId),
    };
  },
});

export const updateCurrentUserProfile = mutationGeneric({
  args: {
    token: v.string(),
    fullName: v.string(),
  },
  returns: sessionUserValidator,
  handler: async (ctx, args) => {
    const user = await getUserFromSessionToken(ctx, args.token);
    if (!user) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const fullName = args.fullName.trim();
    if (fullName.length < 2) {
      throw new Error("Please enter your full name.");
    }

    await ctx.db.patch(user._id, {
      fullName,
      updatedAt: Date.now(),
    });

    return {
      id: user._id,
      email: user.email,
      fullName,
    };
  },
});

export const changeCurrentUserPassword = mutationGeneric({
  args: {
    token: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getUserFromSessionToken(ctx, args.token);
    if (!user) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    if (args.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    if (hashCredential(user.email, args.currentPassword) !== user.passwordDigest) {
      throw new Error("Current password is incorrect.");
    }

    await ctx.db.patch(user._id, {
      passwordDigest: hashCredential(user.email, args.newPassword),
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const upsertGitHubUserSession = internalMutationGeneric({
  args: {
    githubId: v.string(),
    email: v.string(),
    fullName: v.string(),
  },
  returns: authResultValidator,
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);
    const normalizedGithubId = args.githubId.trim();
    const normalizedFullName = normalizeGitHubName(args.fullName, normalizedEmail);

    let user = await ctx.db.query("users").withIndex("by_github_id", (q) => q.eq("githubId", normalizedGithubId)).unique();
    const now = Date.now();

    if (user) {
      await ctx.db.patch(user._id, {
        email: normalizedEmail,
        fullName: normalizedFullName,
        githubId: normalizedGithubId,
        emailVerifiedAt: user.emailVerifiedAt ?? now,
        updatedAt: now,
      });

      user = {
        ...user,
        email: normalizedEmail,
        fullName: normalizedFullName,
        githubId: normalizedGithubId,
        emailVerifiedAt: user.emailVerifiedAt ?? now,
      };
    } else {
      const existingByEmail = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", normalizedEmail)).unique();

      if (existingByEmail) {
        await ctx.db.patch(existingByEmail._id, {
          githubId: normalizedGithubId,
          fullName: normalizedFullName,
          emailVerifiedAt: existingByEmail.emailVerifiedAt ?? now,
          updatedAt: now,
        });

        user = {
          ...existingByEmail,
          fullName: normalizedFullName,
          githubId: normalizedGithubId,
          emailVerifiedAt: existingByEmail.emailVerifiedAt ?? now,
        };
      } else {
        const userId = await ctx.db.insert("users", {
          fullName: normalizedFullName,
          email: normalizedEmail,
          githubId: normalizedGithubId,
          emailVerifiedAt: now,
          // Password remains required by schema for email/password users.
          passwordDigest: `github-oauth-${createPasswordResetToken()}`,
          createdAt: now,
          updatedAt: now,
        });

        user = {
          _id: userId,
          fullName: normalizedFullName,
          email: normalizedEmail,
          githubId: normalizedGithubId,
        };
      }
    }

    const token = createSessionToken(String(user._id));
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: now + SESSION_TTL_MS,
      createdAt: now,
    });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  },
});

export const completeEmailVerification = mutationGeneric({
  args: {
    token: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const token = args.token.trim();
    if (!token) {
      throw new Error("Verification token is missing.");
    }

    const verificationToken = await ctx.db
      .query("emailVerificationTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!verificationToken) {
      throw new Error("This verification link is invalid.");
    }

    if (verificationToken.usedAt) {
      throw new Error("This verification link has already been used.");
    }

    if (verificationToken.expiresAt <= Date.now()) {
      throw new Error("This verification link has expired.");
    }

    const user = await ctx.db.get(verificationToken.userId);
    if (!user) {
      throw new Error("Unable to verify this account.");
    }

    const now = Date.now();
    await ctx.db.patch(user._id, {
      emailVerifiedAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(verificationToken._id, {
      usedAt: now,
    });

    return null;
  },
});

export const signInWithGitHub = actionGeneric({
  args: {
    code: v.string(),
    redirectUri: v.string(),
  },
  returns: authResultValidator,
  handler: async (ctx, args) => {
    const clientId = readEnv("GITHUB_CLIENT_ID");
    const clientSecret = readEnv("GITHUB_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      throw new Error("GitHub OAuth is not configured on the server.");
    }

    const code = args.code.trim();
    if (!code) {
      throw new Error("GitHub authorization code is missing.");
    }

    const redirectUri = args.redirectUri.trim();
    if (!redirectUri) {
      throw new Error("GitHub redirect URI is missing.");
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error("GitHub token exchange failed.");
    }

    const tokenPayload = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenPayload.access_token) {
      throw new Error(tokenPayload.error_description ?? tokenPayload.error ?? "GitHub access token is missing.");
    }

    const accessToken = tokenPayload.access_token;

    const [userResponse, emailsResponse] = await Promise.all([
      fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "solid-convex-app",
        },
      }),
      fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "solid-convex-app",
        },
      }),
    ]);

    if (!userResponse.ok) {
      throw new Error("Unable to load your GitHub profile.");
    }

    const githubUser = (await userResponse.json()) as {
      id?: number;
      login?: string;
      name?: string | null;
      email?: string | null;
    };

    const githubEmails = emailsResponse.ok
      ? ((await emailsResponse.json()) as Array<{ email: string; primary?: boolean; verified?: boolean }>)
      : [];

    const preferredEmail =
      githubEmails.find((entry) => entry.primary && entry.verified)?.email ??
      githubEmails.find((entry) => entry.verified)?.email ??
      githubEmails[0]?.email ??
      githubUser.email ??
      undefined;

    if (!preferredEmail) {
      throw new Error("GitHub did not return an email for this account.");
    }

    const githubId = String(githubUser.id ?? "").trim();
    if (!githubId) {
      throw new Error("GitHub profile id is missing.");
    }

    return await ctx.runMutation("auth:upsertGitHubUserSession" as any, {
      githubId,
      email: preferredEmail,
      fullName: githubUser.name ?? githubUser.login ?? preferredEmail,
    });
  },
});

export const requestPasswordReset = mutationGeneric({
  args: {
    email: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (!email.includes("@")) {
      throw new Error("Enter a valid account email.");
    }

    const existingUser = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).unique();

    await ctx.db.insert("passwordResetRequests", {
      email,
      requestedAt: Date.now(),
    });

    if (existingUser) {
      const activeTokens = await ctx.db
        .query("passwordResetTokens")
        .withIndex("by_user_id", (q) => q.eq("userId", existingUser._id))
        .collect();
      await Promise.all(activeTokens.map((token) => ctx.db.delete(token._id)));

      const resetToken = createPasswordResetToken();
      const now = Date.now();

      await ctx.db.insert("passwordResetTokens", {
        userId: existingUser._id,
        token: resetToken,
        expiresAt: now + PASSWORD_RESET_TTL_MS,
        createdAt: now,
      });

      await ctx.scheduler.runAfter(0, internal.passwordResetEmail.sendPasswordResetEmail, {
        email,
        resetToken,
      });
    }

    return null;
  },
});

export const verifyPasswordResetToken = queryGeneric({
  args: {
    token: v.string(),
  },
  returns: v.union(
    v.object({
      ok: v.literal(true),
    }),
    v.object({
      ok: v.literal(false),
      reason: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const token = args.token.trim();
    if (!token) {
      return {
        ok: false,
        reason: "missing_token",
      } as const;
    }

    const resetToken = await ctx.db.query("passwordResetTokens").withIndex("by_token", (q) => q.eq("token", token)).unique();
    if (!resetToken) {
      return {
        ok: false,
        reason: "invalid_token",
      } as const;
    }

    if (resetToken.usedAt) {
      return {
        ok: false,
        reason: "used_token",
      } as const;
    }

    if (resetToken.expiresAt <= Date.now()) {
      return {
        ok: false,
        reason: "expired_token",
      } as const;
    }

    return {
      ok: true,
    } as const;
  },
});

export const completePasswordReset = mutationGeneric({
  args: {
    token: v.string(),
    password: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const token = args.token.trim();
    if (!token) {
      throw new Error("Reset token is missing.");
    }

    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const resetToken = await ctx.db.query("passwordResetTokens").withIndex("by_token", (q) => q.eq("token", token)).unique();
    if (!resetToken) {
      throw new Error("This reset link is invalid.");
    }

    if (resetToken.usedAt) {
      throw new Error("This reset link has already been used.");
    }

    if (resetToken.expiresAt <= Date.now()) {
      throw new Error("This reset link has expired.");
    }

    const user = await ctx.db.get(resetToken.userId);
    if (!user) {
      throw new Error("Unable to reset password for this account.");
    }

    const now = Date.now();

    await ctx.db.patch(user._id, {
      passwordDigest: hashCredential(user.email, args.password),
      updatedAt: now,
    });

    await ctx.db.patch(resetToken._id, {
      usedAt: now,
    });

    const activeSessions = await ctx.db.query("sessions").withIndex("by_user_id", (q) => q.eq("userId", user._id)).collect();
    await Promise.all(activeSessions.map((session) => ctx.db.delete(session._id)));

    return null;
  },
});