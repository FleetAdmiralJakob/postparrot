import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs";
import { db } from "~/server/db";
import { files } from "~/server/db/schema";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  videoAndImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 4 },
    video: { maxFileSize: "16MB" },
  })
    // Set permissions and file types for this FileRoute
    .middleware(() => {
      // This code runs on your server before upload
      const user = auth();

      // If you throw, the user will not be able to upload
      if (!user || !user.userId) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      await db.insert(files).values({
        name: file.name,
        url: file.url,
        uploadedBy: metadata.userId,
        key: file.key,
      });

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
