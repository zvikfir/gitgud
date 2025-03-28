ALTER TABLE "contributors" ADD COLUMN "external_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "contributors" ADD COLUMN "username" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "contributors" ADD COLUMN "avatar_url" varchar(2048) NOT NULL;--> statement-breakpoint
ALTER TABLE "contributors" ADD COLUMN "web_url" varchar(2048) NOT NULL;