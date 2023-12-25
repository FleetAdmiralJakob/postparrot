"use client";

import { Button } from "~/app/_components/ui/button";
import { useFormStatus } from "react-dom";

export const SubmitButton = ({
  comment,
  isSignedIn,
}: {
  comment?: { postId: string };
  isSignedIn: boolean | undefined;
}) => {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={!comment ? pending || !isSignedIn : pending || !isSignedIn}
    >
      {comment
        ? pending
          ? "Commenting..."
          : "Comment"
        : pending
          ? "Posting..."
          : "Post"}
    </Button>
  );
};
