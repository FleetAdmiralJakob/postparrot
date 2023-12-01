CREATE TABLE IF NOT EXISTS "postparrot_comment_heart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_id_idx" ON "postparrot_comment_heart" ("comment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "postparrot_comment_heart" ("user_id");