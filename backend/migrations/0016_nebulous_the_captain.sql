CREATE TABLE IF NOT EXISTS "policy_compliance" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_id" integer NOT NULL,
	"standard" varchar(256) NOT NULL,
	"control" varchar(256) NOT NULL,
	"description" varchar(1024) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "policies" RENAME COLUMN "badge_id" TO "kpi_id";--> statement-breakpoint
ALTER TABLE "policies" ALTER COLUMN "kpi_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "policies" ALTER COLUMN "kpi_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "policy_compliance" ADD CONSTRAINT "policy_compliance_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "policies" ADD CONSTRAINT "policies_kpi_id_kpis_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpis"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
