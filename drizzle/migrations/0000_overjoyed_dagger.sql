CREATE TABLE IF NOT EXISTS "postparrot_heart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "postparrot_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" varchar(300) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_id_idx" ON "postparrot_heart" ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "postparrot_heart" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "postparrot_post" ("content");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "postparrot_post" ("user_id");