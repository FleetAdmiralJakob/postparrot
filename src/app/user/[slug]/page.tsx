import { api } from "~/trpc/server";
import PostView, { type Post } from "~/app/_components/post-view";
import { Suspense } from "react";
import Image from "next/image";
import { type Metadata } from "next";
import { assemblePost, fetchAndFormatUser } from "~/lib/postActions";

export const runtime = "edge";
export const preferredRegion = ["iad1"];

function hash(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (Math.imul(31, hash) + s.charCodeAt(i)) | 0;
  }
  return hash;
}

const tailwindColors: string[] = [
  "yellow-600",
  "green-600",
  "blue-600",
  "indigo-600",
  "pink-600",
  "purple-600",
  "gray-600",
];

function getColorFromUserId(userId: string): string {
  return (
    tailwindColors[Math.abs(hash(userId)) % tailwindColors.length] ?? "gray-500"
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const userData = await fetchAndFormatUser(params.slug);
  if (!userData) {
    return {
      title: `User not found - PostParrot`,
      description: `User not found on PostParrot.`,
    };
  }

  return {
    title: `${userData.username}'s profile - PostParrot`,
    description: `View ${userData.username}'s posts on PostParrot.`,
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const userData = await fetchAndFormatUser(params.slug);
  if (!userData) {
    return <div>Post not found</div>;
  }

  return (
    <>
      <Suspense>
        <div className="flex w-3/5 flex-col gap-4 border-b-2 pb-3 text-left md:w-2/5">
          <div
            className={`relative bg-${getColorFromUserId(
              userData.id,
            )} h-36 pt-10`}
          >
            <Image
              src={userData.imageUrl}
              alt={userData.username + "'s profile picture"}
              width={95}
              height={95}
              className="absolute -bottom-10 ml-6 rounded-full border-4 border-black"
            />
          </div>
          <div className="h-5" />
          <h1 className="text-2xl font-semibold">{userData.username}</h1>
        </div>
      </Suspense>
      <Suspense fallback={<div className="pt-4">Loading...</div>}>
        <Posts id={params.slug} />
      </Suspense>
    </>
  );
}

async function Posts({ id }: { id: string }) {
  const latestPostsFromAPI = await api.post.getPostsByUserId.query(id);

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
