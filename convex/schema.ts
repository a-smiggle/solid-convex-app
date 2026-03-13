import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    githubId: v.optional(v.string()),
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

  sampleRows: defineTable({
    label: v.string(),
    status: v.union(v.literal("new"), v.literal("processing"), v.literal("done")),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
});