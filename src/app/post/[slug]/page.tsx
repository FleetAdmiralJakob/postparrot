import { api } from "~/trpc/server";
import PostView, {
  type Post,
  type PostWithComments,
} from "~/app/_components/post-view";
import { Suspense } from "react";
import { fetchAndFormatUser } from "~/lib/postActions";
import { z } from "zod";

export const runtime = "edge";

const idSchema = z.string().uuid();

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback="Loading...">
      <Post id={params.slug} />
    </Suspense>
  );
}

async function Post({ id }: { id: string }) {
  idSchema.safeParse(id);
  if (!idSchema.safeParse(id).success) {
    return <div>Post not found</div>;
  }
  const latestPostFromAPI = await api.post.getPostByPostId.query(id);

  const userData = await fetchAndFormatUser(latestPostFromAPI.userId);
  if (!userData) {
    return <div>Post not found</div>;
  }

  let posts: PostWithComments[] = [];

  if (!latestPostFromAPI.mostHeartedComment)
    posts = [
      {
        ...latestPostFromAPI,
        imageUrl: userData.imageUrl,
        username: userData.username,
        mostHeartedComment: undefined,
        comments: await Promise.all(
          latestPostFromAPI.comments.map(async (comment) => {
            const commentUserData = await fetchAndFormatUser(comment.userId);
            if (!commentUserData) {
              return null;
            }
            return {
              ...comment,
              imageUrl: commentUserData.imageUrl,
              username: commentUserData.username,
            };
          }),
        ),
      },
    ];

  if (latestPostFromAPI.mostHeartedComment) {
    const mostHeartedCommentUserData = await fetchAndFormatUser(
      latestPostFromAPI.mostHeartedComment.userId,
    );
    if (!mostHeartedCommentUserData) {
      posts = [
        {
          ...latestPostFromAPI,
          imageUrl: userData.imageUrl,
          username: userData.username,
          mostHeartedComment: undefined,
          comments: await Promise.all(
            latestPostFromAPI.comments.map(async (comment) => {
              const commentUserData = await fetchAndFormatUser(comment.userId);
              if (!commentUserData) {
                return null;
              }
              return {
                ...comment,
                imageUrl: commentUserData.imageUrl,
                username: commentUserData.username,
              };
            }),
          ),
        },
      ];
      return <PostView posts={posts} replies />;
    }
    const mostHeartedCommentImageUrl: string =
      mostHeartedCommentUserData.imageUrl;

    const mostHeartedCommentUsername: string =
      mostHeartedCommentUserData.username;

    posts = [
      {
        ...latestPostFromAPI,
        imageUrl: userData.imageUrl,
        username: userData.username,
        mostHeartedComment: {
          ...latestPostFromAPI.mostHeartedComment,
          imageUrl: mostHeartedCommentImageUrl,
          username: mostHeartedCommentUsername,
        },
        comments: await Promise.all(
          latestPostFromAPI.comments.map(async (comment) => {
            const commentUserData = await fetchAndFormatUser(comment.userId);
            if (!commentUserData) {
              return null;
            }
            return {
              ...comment,
              imageUrl: commentUserData.imageUrl,
              username: commentUserData.username,
            };
          }),
        ),
      },
    ];
  }

  return <PostView posts={posts} replies />;
}
