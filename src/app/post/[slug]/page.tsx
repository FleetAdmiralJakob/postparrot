import { api } from "~/trpc/server";
import PostView, { type Posts } from "~/app/_components/post-view";
import { clerkClient } from "@clerk/nextjs";
import { Suspense } from "react";

export const runtime = "edge";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex w-full justify-center pt-10">
        <Post id={params.slug} />
      </div>
    </Suspense>
  );
}

async function Post({ id }: { id: string }) {
  const latestPostFromAPI = await api.post.getPostByPostId.query(id);

  const userData = await clerkClient.users.getUser(latestPostFromAPI.userId);

  const posts: Posts[] = [
    {
      ...latestPostFromAPI,
      imageUrl: userData.imageUrl,
      username: userData.username
        ? "@" + userData.username.toLowerCase()
        : "Anonymous",
    },
  ];

  return <PostView posts={posts} />;
}
