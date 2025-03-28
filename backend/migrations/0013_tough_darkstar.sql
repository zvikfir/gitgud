ALTER TABLE "contributors" RENAME TO "members";--> statement-breakpoint
ALTER TABLE "project_contributors" RENAME TO "project_members";--> statement-breakpoint
ALTER TABLE "project_members" RENAME COLUMN "contributor_id" TO "member_id";--> statement-breakpoint
ALTER TABLE "policy_contributors" DROP CONSTRAINT "policy_contributors_contributor_id_contributors_id_fk";
--> statement-breakpoint
ALTER TABLE "project_members" DROP CONSTRAINT "project_contributors_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "project_members" DROP CONSTRAINT "project_contributors_contributor_id_contributors_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "policy_contributors" ADD CONSTRAINT "policy_contributors_contributor_id_members_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_members" ADD CONSTRAINT "project_members_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
