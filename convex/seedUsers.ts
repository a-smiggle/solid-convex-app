import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

type Role = "owner" | "admin" | "billing" | "user";

const TEST_WORKSPACE_SLUG = "e2e-settings-test-workspace";

const TEST_USERS: Array<{ role: Role; email: string; fullName: string; password: string }> = [
  {
    role: "owner",
    email: "e2e+owner@example.com",
    fullName: "E2E Owner",
    password: "owner1234",
  },
  {
    role: "admin",
    email: "e2e+admin@example.com",
    fullName: "E2E Admin",
    password: "admin1234",
  },
  {
    role: "billing",
    email: "e2e+billing@example.com",
    fullName: "E2E Billing",
    password: "billing1234",
  },
  {
    role: "user",
    email: "e2e+user@example.com",
    fullName: "E2E User",
    password: "user12345",
  },
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashCredential(email: string, password: string) {
  const source = `${normalizeEmail(email)}::${password}`;
  let hash = 2166136261;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

async function deleteByWorkspaceId(ctx: { db: any }, workspaceId: any) {
  const [members, billing, integrations, security, notifications, apiKeys, auditLogs] = await Promise.all([
    ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceId))
      .collect(),
    ctx.db
      .query("workspaceBillingSettings")
      .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceId))
      .collect(),
    ctx.db
      .query("workspaceIntegrationSettings")
      .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceId))
      .collect(),
    ctx.db
      .query("workspaceSecuritySettings")
      .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceId))
      .collect(),
    ctx.db
      .query("workspaceNotificationSettings")
      .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceId))
      .collect(),
    ctx.db
      .query("workspaceApiKeys")
      .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceId))
      .collect(),
    ctx.db
      .query("workspaceAuditLogs")
      .withIndex("by_workspace_id", (q: any) => q.eq("workspaceId", workspaceId))
      .collect(),
  ]);

  await Promise.all([
    ...members.map((item: any) => ctx.db.delete(item._id)),
    ...billing.map((item: any) => ctx.db.delete(item._id)),
    ...integrations.map((item: any) => ctx.db.delete(item._id)),
    ...security.map((item: any) => ctx.db.delete(item._id)),
    ...notifications.map((item: any) => ctx.db.delete(item._id)),
    ...apiKeys.map((item: any) => ctx.db.delete(item._id)),
    ...auditLogs.map((item: any) => ctx.db.delete(item._id)),
  ]);

  await ctx.db.delete(workspaceId);
}

async function clearTestData(ctx: { db: any }) {
  const seededEmails = new Set(TEST_USERS.map((user) => normalizeEmail(user.email)));

  const [workspaces, users] = await Promise.all([ctx.db.query("workspaces").collect(), ctx.db.query("users").collect()]);

  const testWorkspaceIds = workspaces
    .filter((workspace: any) => workspace.slug === TEST_WORKSPACE_SLUG)
    .map((workspace: any) => workspace._id);

  for (const workspaceId of testWorkspaceIds) {
    await deleteByWorkspaceId(ctx, workspaceId);
  }

  const testUsers = users.filter((user: any) => seededEmails.has(normalizeEmail(user.email)));

  for (const user of testUsers) {
    const [sessions, resetTokens, verificationTokens, memberships] = await Promise.all([
      ctx.db
        .query("sessions")
        .withIndex("by_user_id", (q: any) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("passwordResetTokens")
        .withIndex("by_user_id", (q: any) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("emailVerificationTokens")
        .withIndex("by_user_id", (q: any) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("workspaceMembers")
        .withIndex("by_user_id", (q: any) => q.eq("userId", user._id))
        .collect(),
    ]);

    await Promise.all([
      ...sessions.map((item: any) => ctx.db.delete(item._id)),
      ...resetTokens.map((item: any) => ctx.db.delete(item._id)),
      ...verificationTokens.map((item: any) => ctx.db.delete(item._id)),
      ...memberships.map((item: any) => ctx.db.delete(item._id)),
    ]);

    await ctx.db.delete(user._id);
  }

  const resetRequests = await ctx.db.query("passwordResetRequests").collect();
  const testResetRequests = resetRequests.filter((request: any) => seededEmails.has(normalizeEmail(request.email)));

  await Promise.all(testResetRequests.map((request: any) => ctx.db.delete(request._id)));

  return {
    deletedUsers: testUsers.length,
    deletedWorkspaces: testWorkspaceIds.length,
  };
}

export const clearTestUsers = mutationGeneric({
  args: {},
  returns: v.object({
    ok: v.literal(true),
    deletedUsers: v.number(),
    deletedWorkspaces: v.number(),
  }),
  handler: async (ctx) => {
    const result = await clearTestData(ctx);

    return {
      ok: true as const,
      deletedUsers: result.deletedUsers,
      deletedWorkspaces: result.deletedWorkspaces,
    };
  },
});

export const seedTestUsers = mutationGeneric({
  args: {},
  returns: v.object({
    ok: v.literal(true),
    workspaceSlug: v.string(),
    credentials: v.array(
      v.object({
        role: v.union(v.literal("owner"), v.literal("admin"), v.literal("billing"), v.literal("user")),
        email: v.string(),
        password: v.string(),
      })
    ),
  }),
  handler: async (ctx) => {
    await clearTestData(ctx);

    const now = Date.now();

    const usersByRole = new Map<Role, any>();

    for (const userInput of TEST_USERS) {
      const email = normalizeEmail(userInput.email);
      const userId = await ctx.db.insert("users", {
        fullName: userInput.fullName,
        email,
        role: userInput.role,
        passwordDigest: hashCredential(email, userInput.password),
        emailVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      usersByRole.set(userInput.role, { _id: userId, ...userInput, email });
    }

    const owner = usersByRole.get("owner");
    if (!owner) {
      throw new Error("Unable to create owner test user.");
    }

    const workspaceId = await ctx.db.insert("workspaces", {
      name: "E2E Settings Test Workspace",
      slug: TEST_WORKSPACE_SLUG,
      ownerUserId: owner._id,
      createdAt: now,
      updatedAt: now,
    });

    for (const userInput of TEST_USERS) {
      const user = usersByRole.get(userInput.role);
      if (!user) {
        continue;
      }

      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: user._id,
        role: userInput.role,
        status: "active",
        addedAt: now,
        updatedAt: now,
      });
    }

    return {
      ok: true as const,
      workspaceSlug: TEST_WORKSPACE_SLUG,
      credentials: TEST_USERS.map((entry) => ({
        role: entry.role,
        email: entry.email,
        password: entry.password,
      })),
    };
  },
});
