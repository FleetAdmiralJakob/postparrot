import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { commentHearts, comments, hearts, posts } from "~/server/db/schema";
import { and, eq, ilike } from "drizzle-orm";

export const postRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ content: z.string().min(1).max(300) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error("Not logged in");

      if (input.content.trim() === "") throw new Error("Post cannot be empty");
      input.content = input.content.trim();

      await ctx.db.insert(posts).values({
        content: input.content,
        userId: ctx.userId,
      });
    }),
  createComment: publicProcedure
    .input(
      z.object({ content: z.string().min(1).max(300), postId: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) throw new Error("Not logged in");

      if (input.content.trim() === "") throw new Error("Post cannot be empty");
      input.content = input.content.trim();

      await ctx.db.insert(comments).values({
        content: input.content,
        postId: input.postId,
        userId: ctx.userId,
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const postsFromDB = await ctx.db.query.posts.findMany({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit: 100,
      with: {
        hearts: true,
        comments: {
          orderBy: (comments, { desc }) => [desc(comments.createdAt)],
          with: {
            commentHearts: true,
          },
        },
      },
    });

    return postsFromDB.map((post) => {
      let mostHeartedComment;

      if (post.comments && post.comments.length > 0) {
        mostHeartedComment = post.comments.reduce((acc, comment) => {
          if (!acc) return comment;
          if (comment.commentHearts.length > (acc.commentHearts?.length ?? 0)) {
            return comment;
          }
          return acc;
        }, post.comments[0]);
      }

      const { comments, ...postWithoutComments } = post;

      return {
        ...postWithoutComments,
        hearts: post.hearts.length,
        commentAmount: post.comments.length,
        heartedByMe: post.hearts.some((heart) => heart.userId === ctx.userId),
        mostHeartedComment: mostHeartedComment
          ? {
              ...mostHeartedComment,
              hearts: mostHeartedComment.commentHearts.length,
              heartedByMe: mostHeartedComment.commentHearts.some(
                (heart) => heart.userId === ctx.userId,
              ),
            }
          : undefined,
      };
    });
  }),
  getPostByPostId: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const postFromDB = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input),
        with: {
          hearts: true,
          comments: {
            orderBy: (comments, { desc }) => [desc(comments.createdAt)],
            with: {
              commentHearts: true,
            },
          },
        },
      });

      if (!postFromDB) throw new Error("Post not found");

      let mostHeartedComment;
      let commentsWithEverything;

      if (postFromDB.comments && postFromDB.comments.length > 0) {
        mostHeartedComment = postFromDB.comments.reduce((acc, comment) => {
          if (!acc) return comment;
          if (comment.commentHearts.length > (acc.commentHearts?.length ?? 0)) {
            return comment;
          }
          return acc;
        }, postFromDB.comments[0]);
        commentsWithEverything = postFromDB.comments.map((comment) => {
          const { commentHearts, ...commentWithoutHearts } = comment;
          return {
            ...commentWithoutHearts,
            hearts: commentHearts.length,
            heartedByMe: commentHearts.some(
              (heart) => heart.userId === ctx.userId,
            ),
          };
        });
      }

      return {
        ...postFromDB,
        hearts: postFromDB.hearts.length,
        commentAmount: postFromDB.comments.length,
        heartedByMe: postFromDB.hearts.some(
          (heart) => heart.userId === ctx.userId,
        ),
        mostHeartedComment: mostHeartedComment
          ? {
              ...mostHeartedComment,
              hearts: mostHeartedComment.commentHearts.length,
              heartedByMe: mostHeartedComment.commentHearts.some(
                (heart) => heart.userId === ctx.userId,
              ),
            }
          : undefined,
        comments: commentsWithEverything ?? [],
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
          comments: {
            orderBy: (comments, { desc }) => [desc(comments.createdAt)],
            with: {
              commentHearts: true,
            },
          },
        },
      });

      return postsFromDB.map((post) => {
        let mostHeartedComment;

        if (post.comments && post.comments.length > 0) {
          mostHeartedComment = post.comments.reduce((acc, comment) => {
            if (!acc) return comment;
            if (
              comment.commentHearts.length > (acc.commentHearts?.length ?? 0)
            ) {
              return comment;
            }
            return acc;
          }, post.comments[0]);
        }

        const { comments, ...postWithoutComments } = post;

        return {
          ...postWithoutComments,
          hearts: post.hearts.length,
          heartedByMe: post.hearts.some((heart) => heart.userId === ctx.userId),
          commentAmount: post.comments.length,
          mostHeartedComment: mostHeartedComment
            ? {
                ...mostHeartedComment,
                hearts: mostHeartedComment.commentHearts.length,
                heartedByMe: mostHeartedComment.commentHearts.some(
                  (heart) => heart.userId === ctx.userId,
                ),
              }
            : undefined,
        };
      });
    }),
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
  findPostsBySearch: publicProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const postsFromDB = await ctx.db.query.posts.findMany({
        where: ilike(posts.content, `%${input}%`),
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        limit: 100,
        with: {
          hearts: true,
          comments: {
            orderBy: (comments, { desc }) => [desc(comments.createdAt)],
            with: {
              commentHearts: true,
            },
          },
        },
      });

      return postsFromDB.map((post) => {
        let mostHeartedComment;

        if (post.comments && post.comments.length > 0) {
          mostHeartedComment = post.comments.reduce((acc, comment) => {
            if (!acc) return comment;
            if (
              comment.commentHearts.length > (acc.commentHearts?.length ?? 0)
            ) {
              return comment;
            }
            return acc;
          }, post.comments[0]);
        }

        const { comments, ...postWithoutComments } = post;

        return {
          ...postWithoutComments,
          hearts: post.hearts.length,
          heartedByMe: post.hearts.some((heart) => heart.userId === ctx.userId),
          commentAmount: post.comments.length,
          mostHeartedComment: mostHeartedComment
            ? {
                ...mostHeartedComment,
                hearts: mostHeartedComment.commentHearts.length,
                heartedByMe: mostHeartedComment.commentHearts.some(
                  (heart) => heart.userId === ctx.userId,
                ),
              }
            : undefined,
        };
      });
    }),
});
