"use client";

import { Heart } from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import cn from "classnames";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

/**
 * HeartComponent is a React component that allows users to "heart" or "unheart" a post or a comment.
 * It displays a heart icon and the current number of hearts. The heart icon can be clicked to toggle the heart status.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.hearts - The current number of hearts.
 * @param {boolean} props.heartedByMe - Whether the current user has hearted the item.
 * @param {string} [props.postId] - The ID of the post, if the item is a post.
 * @param {string} [props.commentId] - The ID of the comment, if the item is a comment.
 *
 * @returns {JSX.Element} The rendered HeartComponent.
 */
const HeartComponent = ({
  hearts,
  heartedByMe: initialheartedByMe,
  postId,
  commentId,
}:
  | {
      hearts: number;
      heartedByMe: boolean;
      postId: string;
      commentId?: undefined;
    }
  | {
      hearts: number;
      heartedByMe: boolean;
      commentId: string;
      postId?: undefined;
    }) => {
  const router = useRouter();

  const { isSignedIn } = useAuth();

  const heartPost = api.heart.heartPostByPostId.useMutation({
    onSuccess: () => {
      router.refresh();
    },
    onError: () => {
      // Reset to original state in case of api call failure
      setLocalHearts(hearts);
      setHeartsByMe(initialheartedByMe);
    },
  });

  const heartComment = api.heart.heartCommentByCommentId.useMutation({
    onSuccess: () => {
      router.refresh();
    },
    onError: () => {
      // Reset to original state in case of api call failure
      setLocalHearts(hearts);
      setHeartsByMe(initialheartedByMe);
    },
  });

  const [localHearts, setLocalHearts] = useState(hearts);
  const [heartedByMe, setHeartsByMe] = useState(initialheartedByMe);

  useEffect(() => {
    // Update local state when prop updates
    setLocalHearts(hearts);
    setHeartsByMe(initialheartedByMe);
  }, [hearts, initialheartedByMe]);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => {
          // Optimistic update
          setLocalHearts(heartedByMe ? localHearts - 1 : localHearts + 1);
          setHeartsByMe(!heartedByMe);

          if (postId) {
            heartPost.mutate(postId);
          } else if (commentId) {
            heartComment.mutate(commentId);
          }
        }}
        disabled={heartPost.isLoading || !isSignedIn}
        className="disabled:opacity-50"
      >
        <Heart
          className={cn(
            heartedByMe
              ? "fill-red-500 text-red-500 transition-all duration-200 ease-in-out hover:fill-transparent"
              : "fill-transparent transition-all duration-200 ease-in-out hover:fill-red-500",
          )}
        />
      </button>
      {localHearts}
    </div>
  );
};

export default HeartComponent;
