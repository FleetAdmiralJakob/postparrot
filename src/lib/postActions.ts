import { clerkClient } from "@clerk/nextjs";
import { type Post } from "~/app/_components/post-view";
import { type RouterOutputs } from "~/trpc/shared";

export const fetchAndFormatUser = async (userId: string) => {
  try {
    const userData = await clerkClient.users.getUser(userId);
    const imageUrl: string = userData.imageUrl;
    const username: string = userData.username
      ? "@" + userData.username.toLowerCase()
      : "Anonymous";

    return { imageUrl, username };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const assemblePost = async (
  post: RouterOutputs["post"]["getLatest"][0],
  userData: { imageUrl: string; username: string },
  userDataComment: { imageUrl: string; username: string } | undefined,
): Promise<Post> => {
  if (!userDataComment || !post.mostHeartedComment)
    return {
      ...post,
      imageUrl: userData.imageUrl,
      username: userData.username,
      mostHeartedComment: undefined,
    };

  return {
    ...post,
    imageUrl: userData.imageUrl,
    username: userData.username,
    mostHeartedComment: {
      ...post.mostHeartedComment,
      imageUrl: userDataComment.imageUrl,
      username: userDataComment.username,
    },
  };
};
