import { pgTable, integer, serial, varchar, timestamp, boolean, json, text, index } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    externalId: integer('external_id').notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 1024 }).notNull(),
    pathWithNamespace: varchar('path_with_namespace', { length: 2048 }).notNull(),
    webUrl: varchar('web_url', { length: 2048 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
    webhookId: varchar('webhook_id', { length: 256 }),
    tags: varchar('tags', { length: 2048 }),
    lifecycleId: integer('lifecycle_id').notNull().references(() => lifecycles.id),
    default_branch: varchar('default_branch', { length: 256 }).notNull(),
});

export const members = pgTable('members', {
    id: serial('id').primaryKey(),
    externalId: integer('external_id').notNull(),
    username: varchar('username', { length: 256 }).notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    avatarUrl: varchar('avatar_url', { length: 2048 }).notNull(),
    webUrl: varchar('web_url', { length: 2048 }).notNull(),
});

export const projectMembers = pgTable('project_members', {
    projectId: integer('project_id').notNull().references(() => projects.id),
    memberId: integer('member_id').notNull().references(() => members.id),
});

export const contributors = pgTable('contributors', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull(),
});

export const projectContributors = pgTable('project_contributors', {
    projectId: integer('project_id').notNull().references(() => projects.id),
    contributorId: integer('contributor_id').notNull().references(() => contributors.id),
});

export const owners = pgTable('owners', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 1024 }).default('').notNull(),
});

export const projectOwners = pgTable('project_owners', {
    projectId: integer('project_id').notNull().references(() => projects.id),
    ownerId: integer('owner_id').notNull().references(() => owners.id),
});

export const languages = pgTable('languages', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
});

export const projectLanguages = pgTable('project_languages', {
    projectId: integer('project_id').notNull().references(() => projects.id),
    languageId: integer('language_id').notNull().references(() => languages.id),
});

export const runtimes = pgTable('runtimes', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 1024 }).default('').notNull(),
});

export const projectRuntimes = pgTable('project_runtimes', {
    projectId: integer('project_id').notNull().references(() => projects.id),
    runtimeId: integer('runtime_id').notNull().references(() => runtimes.id),
});

export const lifecycles = pgTable('lifecycles', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 1024 }).default('').notNull(),
});

export const stacks = pgTable('stacks', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 1024 }).default('').notNull(),
});

export const projectStacks = pgTable('project_stacks', {
    projectId: integer('project_id').notNull().references(() => projects.id),
    stackId: integer('stack_id').notNull().references(() => stacks.id),
});

export const policies = pgTable("policies", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 1024 }).default("").notNull(),
    uuid: varchar("uuid", { length: 1024 }).default("").notNull(),
    description: varchar("description", { length: 2048 }),
    version: varchar("version").default("").notNull(),
    kpiId: integer("kpi_id").references(() => kpis.id), // Changed from badgeId to direct KPI reference
    criteria: json("criteria").default({}).notNull(),
    longDescription: text("long_description"),
    tags: varchar("tags", { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
    ordinal: integer("ordinal").default(1000).notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    draft: boolean("draft").default(false).notNull(),
    scriptJs: text("script_js").default("").notNull(),
});

export const policyCompliance = pgTable('policy_compliance', {
    id: serial('id').primaryKey(),
    policyId: integer('policy_id').notNull().references(() => policies.id),
    standard: varchar('standard', { length: 256 }).notNull(),
    control: varchar('control', { length: 256 }).notNull(),
    description: varchar('description', { length: 1024 }).notNull(),
});

export const policyContributors = pgTable('policy_contributors', {
    policyId: integer('policy_id').notNull().references(() => policies.id),
    contributorId: integer('contributor_id').notNull().references(() => members.id),
    result: integer('result').notNull(),
    createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
});

export const kpis = pgTable('kpis', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 1024 }).notNull(),
});

export const badges = pgTable('badges', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 1024 }).notNull(),
    kpiId: integer('kpi_id').notNull().references(() => kpis.id),
});

export const policyExecutions = pgTable('policy_executions', {
    id: serial('id').primaryKey(),
    projectId: integer('project_id').notNull().references(() => projects.id), // Made projectId required
    policyId: integer('policy_id').notNull().references(() => policies.id), // Made policyId required
    status: integer('status').notNull(), // Added default and made required
    result: integer('result'), // Added default and made required
    createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: false }).notNull().defaultNow(),
    message: varchar("message", { length: 2048 }),
});

export const projectDisabledPolicies = pgTable('project_disabled_policies', {
    id: serial('id').primaryKey(),
    projectId: integer('project_id').references(() => projects.id),
    policyId: integer('policy_id').references(() => policies.id),
    enabled: boolean('enabled').notNull().default(false),
});

export const policyExecutionLogs = pgTable('policy_execution_logs', {
    id: serial('id').primaryKey(),
    policyExecutionId: integer('policy_execution_id').references(() => policyExecutions.id),
    createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
    message: text('message'),
    level: varchar('level', { length: 256 }),
});

export const userTypes = pgTable('user_types', {
    id: serial('id').primaryKey(),
    type: varchar('type', { length: 256 }).notNull(),
});

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull(),
    avatarUrl: varchar('avatar_url', { length: 2048 }).notNull(),
    isAdmin: boolean('is_admin').default(false).notNull(),
    userTypeId: integer('user_type_id').notNull().references(() => userTypes.id),
    externalId: integer('external_id').notNull(),
});

export const sessions = pgTable('sessions', {
    id: varchar('id', { length: 256 }).notNull().primaryKey(),
    userId: integer('user_id').references(() => users.id),
    data: json('data').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: false }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
});

export const userStacks = pgTable('user_stacks', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    stackId: integer('stack_id').references(() => stacks.id),
    state: integer('state').notNull(), //0=not-following, 1=following
    createdAt: timestamp('created_at', { withTimezone: false }).notNull().defaultNow(),
});

// Add these type exports at the end of the file
export type Kpi = typeof kpis.$inferInsert;
export type Policy = typeof policies.$inferInsert;
export type Badge = typeof badges.$inferInsert;
export type Lifecycle = typeof lifecycles.$inferInsert;
export type UserType = typeof userTypes.$inferInsert;
export type Runtime = typeof runtimes.$inferInsert;

