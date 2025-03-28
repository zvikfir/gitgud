ALTER TABLE "lifecycles" ALTER COLUMN "name" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "owners" ALTER COLUMN "name" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "runtimes" ALTER COLUMN "name" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "stacks" ALTER COLUMN "name" SET DEFAULT null;--> statement-breakpoint
ALTER TABLE "stacks" ALTER COLUMN "description" SET DATA TYPE varchar(1024);--> statement-breakpoint
ALTER TABLE "lifecycles" ADD COLUMN "description" varchar(1024) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "owners" ADD COLUMN "description" varchar(1024) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "runtimes" ADD COLUMN "description" varchar(1024) DEFAULT '' NOT NULL;