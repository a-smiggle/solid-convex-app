import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const workspaceRoleValidator = v.union(v.literal("owner"), v.literal("admin"), v.literal("billing"), v.literal("user"));
const memberStatusValidator = v.union(v.literal("active"), v.literal("invited"), v.literal("suspended"));

export default defineSchema({
  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    role: v.optional(workspaceRoleValidator),
    githubId: v.optional(v.string()),
    emailVerifiedAt: v.optional(v.number()),
    passwordDigest: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_github_id", ["githubId"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user_id", ["userId"]),

  passwordResetRequests: defineTable({
    email: v.string(),
    requestedAt: v.number(),
  }).index("by_email", ["email"]),

  passwordResetTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("by_token", ["token"])
    .index("by_user_id", ["userId"]),

  emailVerificationTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("by_token", ["token"])
    .index("by_user_id", ["userId"]),

  sampleRows: defineTable({
    label: v.string(),
    status: v.union(v.literal("new"), v.literal("processing"), v.literal("done")),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),

  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerUserId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner_user_id", ["ownerUserId"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: workspaceRoleValidator,
    status: memberStatusValidator,
    addedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_user_id", ["userId"])
    .index("by_workspace_user", ["workspaceId", "userId"]),

  workspaceBillingSettings: defineTable({
    workspaceId: v.id("workspaces"),
    plan: v.string(),
    currency: v.string(),
    seatLimit: v.number(),
    billingEmail: v.string(),
    autoPayEnabled: v.boolean(),
    updatedByUserId: v.optional(v.id("users")),
    updatedAt: v.number(),
  }).index("by_workspace_id", ["workspaceId"]),

  workspaceIntegrationSettings: defineTable({
    workspaceId: v.id("workspaces"),
    slackConnected: v.boolean(),
    stripeConnected: v.boolean(),
    webhooksEnabled: v.boolean(),
    updatedByUserId: v.optional(v.id("users")),
    updatedAt: v.number(),
  }).index("by_workspace_id", ["workspaceId"]),

  workspaceSecuritySettings: defineTable({
    workspaceId: v.id("workspaces"),
    enforceTwoFactorForAdmins: v.boolean(),
    sessionTimeoutMinutes: v.number(),
    allowApiKeys: v.boolean(),
    updatedByUserId: v.optional(v.id("users")),
    updatedAt: v.number(),
  }).index("by_workspace_id", ["workspaceId"]),

  workspaceNotificationSettings: defineTable({
    workspaceId: v.id("workspaces"),
    productUpdatesEmail: v.boolean(),
    productUpdatesInApp: v.boolean(),
    securityAlertsEmail: v.boolean(),
    securityAlertsSlack: v.boolean(),
    billingNoticesEmail: v.boolean(),
    updatedByUserId: v.optional(v.id("users")),
    updatedAt: v.number(),
  }).index("by_workspace_id", ["workspaceId"]),

  workspaceApiKeys: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    scope: v.array(v.string()),
    keyPrefix: v.string(),
    status: v.union(v.literal("active"), v.literal("revoked")),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    revokedByUserId: v.optional(v.id("users")),
  })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"]),

  workspaceAuditLogs: defineTable({
    workspaceId: v.id("workspaces"),
    actorType: v.union(v.literal("user"), v.literal("system")),
    actorUserId: v.optional(v.id("users")),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    metadataJson: v.optional(v.string()),
    occurredAt: v.number(),
  })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_time", ["workspaceId", "occurredAt"])
    .index("by_actor_user_id", ["actorUserId"]),
});
