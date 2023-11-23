import { api } from "~/trpc/server";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";
import { Suspense } from "react";
import { CreatePost } from "~/app/_components/create-post";

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
        <CrudShowcase />
      </Suspense>
    </main>
  );
}

async function CrudShowcase() {
  const latestPosts = await api.post.getLatest.query();

  return (
    <div className="flex h-full w-3/5 flex-col gap-5 overflow-y-scroll md:w-96">
      {latestPosts ? (
        latestPosts.map((post) => (
          <div key={post.id} className="mb-4">
            <h3 className="overflow-hidden text-lg font-bold">
              {post.content}
            </h3>
          </div>
        ))
      ) : (
        <p>There are no posts</p>
      )}
    </div>
  );
}
