import { api } from "~/trpc/server";
import PostView, { type Post } from "~/app/_components/post-view";
import { assemblePost, fetchAndFormatUser } from "~/lib/postActions";
import { Suspense } from "react";
import { clerkClient } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export const runtime = "edge";
export const preferredRegion = ["iad1"];

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>;
}) => {
  const searchQuery = searchParams.q;

  if (!searchQuery || typeof searchQuery !== "string") {
    return (
      <div>
        <p>No search query</p>
      </div>
    );
  }

  return (
    <>
      <Suspense>
        <SearchUserResults searchQuery={searchQuery} />
      </Suspense>
      <Suspense fallback="Results are loading...">
        <SearchPostResults searchQuery={searchQuery} />
      </Suspense>
    </>
  );
};

async function SearchUserResults({ searchQuery }: { searchQuery: string }) {
  const userData = await clerkClient.users.getUserList({ query: searchQuery });

  return (
    <div className="mb-4 w-3/5 md:w-2/5">
      <h1 className="flex w-full justify-center text-2xl font-bold">Users</h1>
      <div className="flex flex-col gap-4">
        {userData.length === 0 && (
          <p className="text-center">No users found...</p>
        )}
        {userData.map((user) => {
          return (
            <Link
              key={user.id}
              href={`/user/${user.id}`}
              className="flex items-center gap-4"
            >
              <Image
                src={user.imageUrl}
                alt={
                  (user.username
                    ? "@" + user.username.toLowerCase()
                    : "Anonymous") + "'s profile picture"
                }
                width={50}
                height={50}
                className="rounded-full"
              />
              <p>
                {user.username
                  ? "@" + user.username.toLowerCase()
                  : "Anonymous"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

async function SearchPostResults({ searchQuery }: { searchQuery: string }) {
  const latestPostsFromAPI =
    await api.post.findPostsBySearch.query(searchQuery);

  const sortedPosts = latestPostsFromAPI.sort((a, b) => b.hearts - a.hearts);

  const posts: Post[] = await Promise.all(
    sortedPosts.map(async (post) => {
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

  return (
    <>
      <h1 className="text-2xl font-bold">Posts</h1>
      <PostView
        posts={posts}
        customNoPostsMessage="No posts matching this query found..."
      />
    </>
  );
}

export default SearchPage;
