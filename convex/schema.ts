import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    passwordDigest: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

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

  sampleRows: defineTable({
    label: v.string(),
    status: v.union(v.literal("new"), v.literal("processing"), v.literal("done")),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
});