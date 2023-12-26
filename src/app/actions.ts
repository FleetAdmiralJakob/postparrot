"use server";
import "server-only";
import { api } from "~/trpc/server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate-path";
import { auth } from "@clerk/nextjs";

export async function createPostOrComment(
  comment: { postId: string } | undefined,
  formData: FormData,
) {
  const { userId } = auth();
  if (!userId) throw new Error("Not logged in");

  const content = formData.get("content") as string;
  if (!content) return;

  const postId = comment?.postId;

  if (postId) {
    await api.post.createComment.mutate({ content, postId });
  } else {
    await api.post.create.mutate({ content });
  }
  revalidatePath("/");
}
