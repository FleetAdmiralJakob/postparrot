"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";
import { useAuth } from "@clerk/nextjs";

export function CreatePost() {
  const router = useRouter();
  const [content, setContent] = useState("");

  const createPost = api.post.create.useMutation({
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
        createPost.mutate({ content });
      }}
      className="flex w-11/12 flex-col gap-2 md:w-96"
    >
      <textarea
        placeholder="Title"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="h-24 w-full resize-none rounded-3xl px-4 py-2 text-black"
      />
      {!isSignedIn && (
        <p className="text-sm text-gray-500">You must be logged in to post.</p>
      )}
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createPost.isLoading || !isSignedIn}
      >
        {createPost.isLoading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
