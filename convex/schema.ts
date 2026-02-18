import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  habits: defineTable({
    userId: v.optional(v.string()),
    name: v.string(),
    color: v.string(),
    category: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  completions: defineTable({
    habitId: v.id("habits"),
    date: v.string(),
  })
    .index("by_habit", ["habitId"])
    .index("by_habit_date", ["habitId", "date"]),
});
