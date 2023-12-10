"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "~/lib/utils";
import { Textarea } from "~/app/_components/ui/textarea";
import { Button } from "~/app/_components/ui/button";

/**
 * Create a post or a comment.
 *
 * @param {Object} options - The options for creating a post or a comment.
 * @param {Object} options.comment - The comment object (optional).
 *      - comment.postId: The ID of the post where the comment will be created.
 * @param {string} options.className - The class name for the form (optional).
 *
 * @return {JSX.Element} The form component for creating a post or a comment.
 */
export function CreatePostOrComment({
  comment,
  className,
}: {
  comment?: { postId: string };
  className?: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setContent("");
    },
  });

  const createComment = api.post.createComment.useMutation({
    onSuccess: () => {
      router.refresh();
      setContent("");
    },
  });

  const { isSignedIn } = useAuth();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isSignedIn) return;

        if (!comment) {
          createPost.mutate({ content });
        } else {
          createComment.mutate({ content, postId: comment.postId });
        }
      }}
      className={cn("flex w-8/12 flex-col gap-2 md:max-w-lg", className)}
    >
      <Textarea
        placeholder={comment ? "Add a comment..." : "What's on your mind?"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="resize-none"
      />
      {!isSignedIn && (
        <p className="text-sm text-gray-500">You must be logged in to post.</p>
      )}
      <Button
        type="submit"
        disabled={
          !comment
            ? createPost.isLoading || !isSignedIn
            : createComment.isLoading || !isSignedIn
        }
      >
        {!comment
          ? createPost.isLoading
            ? "Submitting..."
            : "Submit"
          : createComment.isLoading
            ? "Submitting..."
            : "Submit"}
      </Button>
    </form>
  );
}
