import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./lib";

export const list = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: { name: v.string(), color: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("habits", {
      userId,
      name: args.name,
      color: args.color,
      category: args.category,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: { id: v.id("habits"), name: v.string(), color: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const habit = await ctx.db.get(args.id);
    if (!habit || habit.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, { name: args.name, color: args.color, category: args.category });
  },
});

export const remove = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const habit = await ctx.db.get(args.id);
    if (!habit || habit.userId !== userId) throw new Error("Not found");
    const completions = await ctx.db
      .query("completions")
      .withIndex("by_habit", (q) => q.eq("habitId", args.id))
      .collect();
    for (const completion of completions) {
      await ctx.db.delete(completion._id);
    }
    await ctx.db.delete(args.id);
  },
});
