import { api } from "~/trpc/server";
import PostView, { type Posts } from "~/app/_components/post-view";
import { clerkClient } from "@clerk/nextjs";
import { Suspense } from "react";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Post id={params.slug} />
    </Suspense>
  );
}

async function Post({ id }: { id: string }) {
  const latestPostFromAPI = await api.post.getPost.query(id);

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
