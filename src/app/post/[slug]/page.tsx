import { api } from "~/trpc/server";
import PostView, {
  type Post,
  PostWithComments,
} from "~/app/_components/post-view";
import { clerkClient } from "@clerk/nextjs";
import { Suspense } from "react";

export const runtime = "edge";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="pt-10">Loading...</div>}>
      <div className="flex w-full justify-center pt-10">
        <Post id={params.slug} />
      </div>
    </Suspense>
  );
}

async function Post({ id }: { id: string }) {
  const latestPostFromAPI = await api.post.getPostByPostId.query(id);

  const userData = await clerkClient.users.getUser(latestPostFromAPI.userId);

  let posts: PostWithComments[] = [];

  if (!latestPostFromAPI.mostHeartedComment)
    posts = [
      {
        ...latestPostFromAPI,
        imageUrl: userData.imageUrl,
        username: userData.username
          ? "@" + userData.username.toLowerCase()
          : "Anonymous",
        mostHeartedComment: undefined,
        comments: await Promise.all(
          latestPostFromAPI.comments.map(async (comment) => {
            const commentUserData = await clerkClient.users.getUser(
              comment.userId,
            );
            return {
              ...comment,
              imageUrl: commentUserData.imageUrl,
              username: commentUserData.username
                ? "@" + commentUserData.username.toLowerCase()
                : "Anonymous",
            };
          }),
        ),
      },
    ];

  if (latestPostFromAPI.mostHeartedComment) {
    const mostHeartedCommentUserData = await clerkClient.users.getUser(
      latestPostFromAPI.mostHeartedComment.userId,
    );
    const mostHeartedCommentImageUrl: string =
      mostHeartedCommentUserData.imageUrl;

    const mostHeartedCommentUsername: string =
      mostHeartedCommentUserData.username
        ? "@" + mostHeartedCommentUserData.username.toLowerCase()
        : "Anonymous";

    posts = [
      {
        ...latestPostFromAPI,
        imageUrl: userData.imageUrl,
        username: userData.username
          ? "@" + userData.username.toLowerCase()
          : "Anonymous",
        mostHeartedComment: {
          ...latestPostFromAPI.mostHeartedComment,
          imageUrl: mostHeartedCommentImageUrl,
          username: mostHeartedCommentUsername,
        },
        comments: await Promise.all(
          latestPostFromAPI.comments.map(async (comment) => {
            const commentUserData = await clerkClient.users.getUser(
              comment.userId,
            );
            return {
              ...comment,
              imageUrl: commentUserData.imageUrl,
              username: commentUserData.username
                ? "@" + commentUserData.username.toLowerCase()
                : "Anonymous",
            };
          }),
        ),
      },
    ];
  }

  return <PostView posts={posts} replies />;
}
