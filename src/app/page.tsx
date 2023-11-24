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
import Image from "next/image";
import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const runtime = "edge";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center pt-10">
      <div className="mb-8 flex flex-col items-center gap-3">
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
        <PostFeed />
      </Suspense>
    </main>
  );
}

async function PostFeed() {
  const latestPostsFromAPI = await api.post.getLatest.query();

  interface Post {
    imageUrl: string;
    id: number;
    content: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    userId: string;
    username: string;
  }

  const posts: Post[] = await Promise.all(
    latestPostsFromAPI.map(async (post) => {
      const userData = await clerkClient.users.getUser(post.userId);
      const imageUrl: string = userData.imageUrl;
      const username: string = userData.username
        ? "@" + userData.username.toLowerCase()
        : "Anonymous";
      return {
        ...post,
        imageUrl,
        username,
      };
    }),
  );

  return (
    <div className="flex h-full w-3/5 flex-col gap-3 overflow-x-hidden overflow-y-scroll md:w-2/5">
      {posts.map((post) => {
        return (
          <div key={post.id} className="mb-4 flex items-center gap-4">
            <Image
              src={post.imageUrl}
              alt="user"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <p className="text-sm font-bold text-gray-500">
                {post.username} · {dayjs(post.createdAt).fromNow()}
              </p>
              <p className="font-bold">{post.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
