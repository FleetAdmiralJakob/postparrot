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

  const posts: Posts[] = await Promise.all(
    latestPostFromAPI.map(async (post) => {
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

  return <PostView posts={posts} />;
}