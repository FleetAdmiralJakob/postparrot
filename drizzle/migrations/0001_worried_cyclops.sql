ALTER TABLE "new-twitter-clone_post" RENAME COLUMN "name" TO "content";--> statement-breakpoint
DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "new-twitter-clone_post" ("content");