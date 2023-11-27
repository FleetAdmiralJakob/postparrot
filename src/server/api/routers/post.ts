import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { posts } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const postRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ content: z.string().min(1).max(300) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error("Not logged in");

      await ctx.db.insert(posts).values({
        content: input.content,
        userId: ctx.userId,
      });
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.posts.findMany({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit: 100,
    });
  }),
  getPostByPostId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.select().from(posts).where(eq(posts.id, input));
  }),
  getPostsByUserId: publicProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.db
        .select()
        .from(posts)
        .where(eq(posts.userId, input))
        .orderBy(desc(posts.createdAt))
        .limit(100);
    }),
});
