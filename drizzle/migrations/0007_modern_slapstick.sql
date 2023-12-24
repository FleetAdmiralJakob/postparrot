CREATE TABLE IF NOT EXISTS "postparrot_file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(300) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"url" varchar(300) NOT NULL,
	"key" varchar(300) NOT NULL,
	"uploaded_by" varchar NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "postparrot_file" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "url_idx" ON "postparrot_file" ("url");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "key_idx" ON "postparrot_file" ("key");