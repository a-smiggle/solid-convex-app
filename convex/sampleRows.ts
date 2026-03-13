import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const statuses = ["new", "processing", "done"] as const;

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sampleRows").withIndex("by_created_at").order("desc").take(25);
  },
});

export const add = mutationGeneric({
  args: {
    label: v.string(),
  },
  returns: v.id("sampleRows"),
  handler: async (ctx, args) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return await ctx.db.insert("sampleRows", {
      label: args.label,
      status,
      createdAt: Date.now(),
    });
  },
});