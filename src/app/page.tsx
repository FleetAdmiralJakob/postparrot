import { api } from "~/trpc/server";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";
import { Suspense } from "react";
import { CreatePostOrComment } from "~/app/_components/create-post-or-comment";
import PostView, { type Post } from "~/app/_components/post-view";
import { assemblePost, fetchAndFormatUser } from "~/lib/postActions";

export const runtime = "edge";
export const preferredRegion = ["iad1"];

export default function Home() {
  return (
    <>
      <div className="mb-8 flex w-full flex-col items-center gap-3">
        <CreatePostOrComment />
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

      <Suspense fallback={<div className="h-full pt-4">Loading...</div>}>
        <HomePostFeed />
      </Suspense>
    </>
  );
}

async function HomePostFeed() {
  const latestPostsFromAPI = await api.post.getLatest.query();

  const posts: Post[] = await Promise.all(
    latestPostsFromAPI.map(async (post) => {
      const userData = await fetchAndFormatUser(post.userId);
      if (!userData) {
        return null;
      }
      let mostHeartedCommentUserData = undefined;

      if (post.mostHeartedComment)
        mostHeartedCommentUserData = await fetchAndFormatUser(
          post.mostHeartedComment.userId,
        );

      return assemblePost(post, userData, mostHeartedCommentUserData);
    }),
  );

  return <PostView posts={posts} />;
}
