import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { hearts, posts } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

export const postRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ content: z.string().min(1).max(300) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error("Not logged in");

      if (input.content.trim() === "") throw new Error("Post cannot be empty");

      await ctx.db.insert(posts).values({
        content: input.content,
        userId: ctx.userId,
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const postsFromDB = await ctx.db.query.posts.findMany({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit: 100,
      with: {
        hearts: true,
      },
    });

    return postsFromDB.map((post) => {
      return {
        ...post,
        hearts: post.hearts.length,
        heartedByMe: post.hearts.some((heart) => heart.userId === ctx.userId),
      };
    });
  }),
  getPostByPostId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const postFromDB = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input),
        with: {
          hearts: true,
        },
      });

      if (!postFromDB) throw new Error("Post not found");

      return {
        ...postFromDB,
        hearts: postFromDB.hearts.length,
        heartedByMe: postFromDB.hearts.some(
          (heart) => heart.userId === ctx.userId,
        ),
      };
    }),
  getPostsByUserId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const postsFromDB = await ctx.db.query.posts.findMany({
        where: eq(posts.userId, input),
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        limit: 100,
        with: {
          hearts: true,
        },
      });

      return postsFromDB.map((post) => {
        return {
          ...post,
          hearts: post.hearts.length,
          heartedByMe: post.hearts.some((heart) => heart.userId === ctx.userId),
        };
      });
    }),
  heartPostByPostId: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error("Not logged in");

      const postFromDB = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input),
        with: {
          hearts: true,
        },
      });

      if (!postFromDB) throw new Error("Post not found");

      const heartedByMe = postFromDB.hearts.some(
        (heart) => heart.userId === ctx.userId,
      );

      if (heartedByMe) {
        await ctx.db
          .delete(hearts)
          .where(and(eq(hearts.postId, input), eq(hearts.userId, ctx.userId)));
      } else {
        await ctx.db.insert(hearts).values({
          postId: input,
          userId: ctx.userId,
        });
      }
    }),
});
