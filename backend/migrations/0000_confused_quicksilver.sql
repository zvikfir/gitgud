CREATE TABLE IF NOT EXISTS "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(1024),
	"kpi_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kpis" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(1024)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lifecycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "owners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(1024) DEFAULT '' NOT NULL,
	"uuid" varchar(1024) DEFAULT '' NOT NULL,
	"description" varchar(2048),
	"version" varchar DEFAULT '' NOT NULL,
	"badge_id" integer DEFAULT -1 NOT NULL,
	"criteria" json DEFAULT '{}'::json NOT NULL,
	"long_description" text,
	"tags" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ordinal" integer DEFAULT 1000 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"draft" boolean DEFAULT false NOT NULL,
	"script_js" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "policy_execution_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_execution_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"message" varchar(2048),
	"level" varchar(256)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "policy_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"policy_id" integer,
	"status" integer,
	"result" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"message" varchar(2048)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_disabled_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"policy_id" integer,
	"enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_languages" (
	"project_id" integer NOT NULL,
	"language_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_owners" (
	"project_id" integer NOT NULL,
	"owner_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_runtimes" (
	"project_id" integer NOT NULL,
	"runtime_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_stacks" (
	"project_id" integer NOT NULL,
	"stack_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" integer NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"path_with_namespace" varchar(2048) NOT NULL,
	"web_url" varchar(2048) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"webhook_id" varchar(256),
	"tags" varchar(2048) NOT NULL,
	"lifecycle_id" integer NOT NULL,
	"default_branch" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "runtimes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "badges" ADD CONSTRAINT "badges_kpi_id_kpis_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpis"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "policy_execution_logs" ADD CONSTRAINT "policy_execution_logs_policy_execution_id_policy_executions_id_fk" FOREIGN KEY ("policy_execution_id") REFERENCES "public"."policy_executions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "policy_executions" ADD CONSTRAINT "policy_executions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "policy_executions" ADD CONSTRAINT "policy_executions_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_disabled_policies" ADD CONSTRAINT "project_disabled_policies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_disabled_policies" ADD CONSTRAINT "project_disabled_policies_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_languages" ADD CONSTRAINT "project_languages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_languages" ADD CONSTRAINT "project_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_owners" ADD CONSTRAINT "project_owners_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_owners" ADD CONSTRAINT "project_owners_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_runtimes" ADD CONSTRAINT "project_runtimes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_runtimes" ADD CONSTRAINT "project_runtimes_runtime_id_runtimes_id_fk" FOREIGN KEY ("runtime_id") REFERENCES "public"."runtimes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_stacks" ADD CONSTRAINT "project_stacks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_stacks" ADD CONSTRAINT "project_stacks_stack_id_stacks_id_fk" FOREIGN KEY ("stack_id") REFERENCES "public"."stacks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_lifecycle_id_lifecycles_id_fk" FOREIGN KEY ("lifecycle_id") REFERENCES "public"."lifecycles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
