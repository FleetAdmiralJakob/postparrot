import { api } from "~/trpc/server";
import PostView, { type Post } from "~/app/_components/post-view";
import { assemblePost, fetchAndFormatUser } from "~/lib/postActions";
import { Suspense } from "react";

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
    <Suspense fallback="Results are loading...">
      <SearchPostResults searchQuery={searchQuery} />
    </Suspense>
  );
};

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
    <PostView
      posts={posts}
      customNoPostsMessage="No posts matching this query found..."
    />
  );
}

export default SearchPage;
