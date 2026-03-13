import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;

const sessionUserValidator = v.object({
  id: v.id("users"),
  email: v.string(),
  fullName: v.string(),
});

const authResultValidator = v.object({
  token: v.string(),
  user: sessionUserValidator,
});

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

export const signUp = mutationGeneric({
  args: {
    fullName: v.string(),
    email: v.string(),
    password: v.string(),
  },
  returns: authResultValidator,
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
    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      fullName,
      email,
      passwordDigest: hashCredential(email, args.password),
      createdAt: now,
      updatedAt: now,
    });

    const token = createSessionToken(String(userId));
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt: now + SESSION_TTL_MS,
      createdAt: now,
    });

    return {
      token,
      user: {
        id: userId,
        email,
        fullName,
      },
    };
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
    if (!user) {
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