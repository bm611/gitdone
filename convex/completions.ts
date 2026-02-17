import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getUserId(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.subject;
}

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
    } else {
      await ctx.db.insert("completions", {
        habitId: args.habitId,
        date: args.date,
      });
      return true;
    }
  },
});
