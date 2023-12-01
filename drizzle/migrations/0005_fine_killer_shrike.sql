CREATE TABLE IF NOT EXISTS "postparrot_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" varchar(300) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"post_id" uuid NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_id_idx" ON "postparrot_comment" ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "postparrot_comment" ("user_id");