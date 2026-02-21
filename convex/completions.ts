import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./lib";

export const listByHabit = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== userId) return [];
    return await ctx.db
      .query("completions")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .collect();
  },
});

export const listAll = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const all: { habitId: string; date: string }[] = [];
    for (const habit of habits) {
      const completions = await ctx.db
        .query("completions")
        .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
        .collect();
      for (const c of completions) {
        all.push({ habitId: habit._id, date: c.date });
      }
    }
    return all;
  },
});

export const toggle = mutation({
  args: { habitId: v.id("habits"), date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== userId) throw new Error("Not found");

    const existing = await ctx.db
      .query("completions")
      .withIndex("by_habit_date", (q) =>
        q.eq("habitId", args.habitId).eq("date", args.date),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("completions", {
      habitId: args.habitId,
      date: args.date,
    });
    return true;
  },
});
