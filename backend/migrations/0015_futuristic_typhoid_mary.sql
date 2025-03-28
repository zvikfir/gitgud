ALTER TABLE "lifecycles" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "owners" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "policy_executions" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "policy_executions" ALTER COLUMN "policy_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "policy_executions" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "runtimes" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "stacks" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "policy_contributors" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;