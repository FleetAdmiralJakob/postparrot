import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { commentHearts, hearts, posts } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const heartRouter = createTRPCRouter({
  heartPostByPostId: publicProcedure
    .input(z.string().uuid())
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
  heartCommentByCommentId: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error("Not logged in");

      const commentFromDB = await ctx.db.query.comments.findFirst({
        where: eq(posts.id, input),
        with: {
          commentHearts: true,
        },
      });

      if (!commentFromDB) throw new Error("Comment not found");

      const heartedByMe = commentFromDB.commentHearts.some(
        (heart) => heart.userId === ctx.userId,
      );

      if (heartedByMe) {
        await ctx.db
          .delete(commentHearts)
          .where(
            and(
              eq(commentHearts.commentId, input),
              eq(commentHearts.userId, ctx.userId),
            ),
          );
      } else {
        await ctx.db.insert(commentHearts).values({
          commentId: input,
          userId: ctx.userId,
        });
      }
    }),
});
