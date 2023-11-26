CREATE TABLE IF NOT EXISTS "postparrot_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
DROP TABLE "new-twitter-clone_post";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "postparrot_post" ("content");