import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sampleRows: defineTable({
    label: v.string(),
    status: v.union(v.literal("new"), v.literal("processing"), v.literal("done")),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
});