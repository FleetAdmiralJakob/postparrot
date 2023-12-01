import { api } from "~/trpc/server";
import {
  clerkClient,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";
import { Suspense } from "react";
import { CreatePost } from "~/app/_components/create-post";
import PostView, { type Post } from "~/app/_components/post-view";

export const runtime = "edge";

export default function Home() {
  return (
    <>
      <div className="mb-8 flex w-full flex-col items-center gap-3 pt-10">
        <CreatePost />
        <div className="flex justify-center gap-4">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
            <SignOutButton />
          </SignedIn>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <HomePostFeed />
      </Suspense>
    </>
  );
}

async function HomePostFeed() {
  const latestPostsFromAPI = await api.post.getLatest.query();

  const posts: Post[] = await Promise.all(
    latestPostsFromAPI.map(async (post) => {
      const userData = await clerkClient.users.getUser(post.userId);
      const imageUrl: string = userData.imageUrl;
      const username: string = userData.username
        ? "@" + userData.username.toLowerCase()
        : "Anonymous";

      if (!post.mostHeartedComment)
        return {
          ...post,
          imageUrl,
          username,
          mostHeartedComment: undefined,
        };
      const mostHeartedCommentUserData = await clerkClient.users.getUser(
        post.mostHeartedComment.userId,
      );
      const mostHeartedCommentImageUrl: string =
        mostHeartedCommentUserData.imageUrl;

      const mostHeartedCommentUsername: string =
        mostHeartedCommentUserData.username
          ? "@" + mostHeartedCommentUserData.username.toLowerCase()
          : "Anonymous";

      return {
        ...post,
        imageUrl,
        username,
        mostHeartedComment: {
          ...post.mostHeartedComment,
          imageUrl: mostHeartedCommentImageUrl,
          username: mostHeartedCommentUsername,
        },
      };
    }),
  );

  return <PostView posts={posts} />;
}
