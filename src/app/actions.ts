"use server";
import "server-only";
import { api } from "~/trpc/server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate-path";

export async function createPostOrComment(
  comment: { postId: string } | undefined,
  isSignedIn: boolean,
  formData: FormData,
) {
  if (!isSignedIn) return;

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
