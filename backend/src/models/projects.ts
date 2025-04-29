import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { projects, languages, owners, stacks, runtimes, projectOwners, projectLanguages, projectStacks, projectRuntimes, members, projectMembers, projectDisabledPolicies, lifecycles, contributors, projectContributors } from '../db/schema';
import { OwnersModel } from './owners'
import { LanguagesModel } from './languages'
import { LifecyclesModel } from './lifecycles';
import { StacksModel } from './stacks';
import { RuntimeModel } from './runtimes';
import { UserStacksModel } from './userStacks';
import { GitLabService } from '../integrations/gitlab/gitlab_service';

import { PoliciesModel } from './policies';
import { ProjectDisabledPoliciesModel } from './projectDisabledPolicies';

import { Project } from '../types/project'
import { PolicyExecutionsModel } from './policyExecutions';
import { PolicyExecutionLogsModel } from './policyExecutionLogs';
import { KPIsModel } from './kpis';  // Update import
import { MembersModel } from './members';
import { ContributorsModel } from './contributors';
import { ProjectMembersModel } from '../models/projectMembers';
import { ProjectContributorsModel } from './projectContributors';

export class ProjectsModel {
  gitlab_service: GitLabService;

  constructor() {
    this.gitlab_service = new GitLabService();
  }

  async create(project: any, add_kpis: boolean, add_webhook: boolean): Promise<Project> {
    const db = getDb();
    console.log('creating project:', project);
    const lifecycleModel = new LifecyclesModel();
    const membersModel = new MembersModel();
    const contributorsModel = new ContributorsModel();
    const projectMembersModel = new ProjectMembersModel();
    const projectContributorsModel = new ProjectContributorsModel();
    let existing = await db
      .select({
        id: projects.id,
        webhookId: projects.webhookId,
      })
      .from(projects)
      .where(eq(projects.externalId, project.id)) as any;

    //console.log('existing:', existing);
    // If the language exists, return the existing language
    if (existing.length == 0) {
      //console.log('creating');
      // Insert the project

      const lifecycle = await lifecycleModel.create(project.lifecycle, '');
      //console.log('lifecycle:', lifecycle);

      const [newProject] = await db
        .insert(projects)
        .values({
          externalId: project.id,
          name: project.name,
          description: project.description,
          pathWithNamespace: project.path_with_namespace,
          webUrl: project.web_url,
          //tags: project.topics,
          lifecycleId: lifecycle.id,
          default_branch: project.default_branch
        })
        .returning(); // Get the new project with its ID

      //iterate over the project.members and add them to the db as contriburs
      //console.log('creating members');
      for (let member of project.members) {
        member = await membersModel.create(member.id, member.username, member.name, member.avatar_url, member.web_url);
        await projectMembersModel.create(newProject.id, member.id);
      }

      for (let contributor of project.contributors) {
        console.log("contributor3:", contributor);
        contributor = await contributorsModel.create(contributor.name, contributor.email);
        console.log("contributor4:", contributor);
        await projectContributorsModel.create(newProject.id, contributor.id);
      }

      //handle owners
      //console.log('creating owners');
      let ownersModel = new OwnersModel();
      for (let owner of project.owners) {
        const ownerRecord = await ownersModel.create(owner, '');
        await db.insert(projectOwners).values({
          projectId: newProject.id,
          ownerId: ownerRecord.id,
        });
        //console.log('ownerRecord:', ownerRecord);
      }

      //handle languages
      let languagesModel = new LanguagesModel();
      for (let language of Object.keys(project.languages)) {
        const languageRecord = await languagesModel.create(language);
        await db.insert(projectLanguages).values({
          projectId: newProject.id,
          languageId: languageRecord.id,
        });
        //console.log('languageRecord:', languageRecord);
      }

      //handle stack
      let stacksModel = new StacksModel();
      for (let stack of project.stack) {
        const stackRecord = await stacksModel.create(stack.label, '');
        await db.insert(projectStacks).values({
          projectId: newProject.id,
          stackId: stackRecord.id,
        });
        //console.log('stackRecord:', stackRecord);
      }

      //handle runtime
      let runtimeModel = new RuntimeModel();
      for (let runtime of project.runtimes) {
        const runtimeRecord = await runtimeModel.create(runtime.label, '');
        await db.insert(projectRuntimes).values({
          projectId: newProject.id,
          runtimeId: runtimeRecord.id,
        });
        //console.log('runtimeRecord:', runtimeRecord);
      }

      if (add_webhook) {
        let webhook_id = await this.gitlab_service.add_webhook(project.id);
        newProject.webhookId = webhook_id;
        //store in db
        await db
          .update(projects)
          .set(newProject)
          .where(eq(projects.id, newProject.id));
      }

      if (add_kpis) {
        await this.gitlab_service.add_badge(project.id, 'coverage');
      }
      console.log(`Project ${newProject.id} created`);
      return this.findOne(newProject.id);
    }
    else {

      //iterate over the project.members and add them to the db as contriburs
      console.log('creating members');
      for (let member of project.members) {
        await membersModel.create(member.id, member.username, member.name, member.avatar_url, member.web_url);
        await projectMembersModel.createByMemberExternalId(existing[0].id, member.id);
      }

      for (let contributor of project.contributors) {
        console.log("contributor:", contributor);
        contributor = await contributorsModel.create(contributor.name, contributor.email);
        console.log("contributor2:", contributor);
        await projectContributorsModel.create(existing[0].id, contributor.id);
      }
      if (add_webhook) {
        let webhook_id = await this.gitlab_service.add_webhook(project.id);
        existing[0].webhookId = webhook_id;
        //store in db
        await db
          .update(projects)
          .set(existing[0])
          .where(eq(projects.id, existing[0].id));
      }

      if (add_kpis) {
        await this.gitlab_service.add_badge(project.id, 'coverage');
      }
      return this.findOne(existing[0].id);
    }
  }

  async findAll(user?: any, stackId?: any): Promise<Project[]> {
    const db = getDb();
    let projectResults;

    projectResults = await db
      .select({
        id: projects.id,
        stack_id: projectStacks.stackId,
      })
      .from(projects)
      .innerJoin(projectStacks, eq(projects.id, projectStacks.projectId))

    //get the userstacks from the userstacksmodel
    let stacksModel = new StacksModel();
    let stacks = await stacksModel.findAllByUserId(user.id);

    //only show projects that are part of stacks that the user is contributor to or following
    let _projects: Project[] = [];
    for (let project of projectResults) {
      if (stacks.find(s => { return s.id == project.stack_id && ['following', 'contributor'].indexOf(s.state) > -1 })) {
        if (stackId && stackId == project.stack_id) {
          _projects.push(await this.findOne(project.id));
        }
        else if (!stackId) {
          _projects.push(await this.findOne(project.id));
        }
      }
    }
    return _projects;
  }

  async findOne(id): Promise<Project> {
    const db = getDb();
    // Fetch a single project with joined languages, stacks, and runtimes
    const projectResults = await db
      .select({
        id: projects.id,
        externalId: projects.externalId,
        webhookId: projects.webhookId,
        name: projects.name,
        description: projects.description,
        pathWithNamespace: projects.pathWithNamespace,
        default_branch: projects.default_branch,
        webUrl: projects.webUrl,
        tags: projects.tags,
        createdAt: projects.createdAt,
        lifecycleId: projects.lifecycleId,
        lifeCycleName: lifecycles.name, // Join lifecycles
        languageId: languages.id,     // Join languages
        languageName: languages.name, // Join languages
        stackId: stacks.id,           // Join stacks
        stackName: stacks.name,       // Join stacks
        runtimeId: runtimes.id,       // Join runtimes
        runtimeName: runtimes.name,    // Join runtimes
        ownerId: owners.id,           // Join owners
        ownerName: owners.name,        // Join owners
        contributorId: contributors.id,
        contributorName: contributors.name,
      })
      .from(projects)
      .leftJoin(lifecycles, eq(lifecycles.id, projects.lifecycleId))             // Join lifecycles
      .leftJoin(projectLanguages, eq(projectLanguages.projectId, projects.id))  // Join project_languages
      .leftJoin(languages, eq(languages.id, projectLanguages.languageId))       // Join languages
      .leftJoin(projectStacks, eq(projectStacks.projectId, projects.id))        // Join project_stacks
      .leftJoin(stacks, eq(stacks.id, projectStacks.stackId))                   // Join stacks
      .leftJoin(projectRuntimes, eq(projectRuntimes.projectId, projects.id))    // Join project_runtimes
      .leftJoin(runtimes, eq(runtimes.id, projectRuntimes.runtimeId))          // Join runtimes
      .leftJoin(projectOwners, eq(projectOwners.projectId, projects.id))        // Join project_owners
      .leftJoin(owners, eq(owners.id, projectOwners.ownerId))                   // Join owners
      .leftJoin(projectContributors, eq(projectContributors.projectId, projects.id))        // Join project_contributors
      .leftJoin(contributors, eq(contributors.id, projectContributors.contributorId))        // Join contributors
      .where(eq(projects.id, id));

    // Reduce the results to group languages, stacks, and runtimes by project
    const projectsMap = new Map();

    //console.log('projectResults:', projectResults);

    projectResults.forEach(row => {
      if (!projectsMap.has(row.id)) {
        projectsMap.set(row.id, {
          id: row.id,
          externalId: row.externalId,
          name: row.name,
          description: row.description,
          pathWithNamespace: row.pathWithNamespace,
          default_branch: row.default_branch,
          webUrl: row.webUrl,
          tags: row.tags,
          createdAt: row.createdAt,
          lifecycleId: row.lifecycleId,
          lifecycleName: row.lifeCycleName,
          languages: [],
          stacks: [],
          runtimes: [],
          owners: [],
          contributors: [],
          webhookId: row.webhookId
        });
      }

      const project = projectsMap.get(row.id);


      // Add language if not already added
      if (project.languages.filter(l => l.id == row.languageId).length == 0) {
        project.languages.push({ id: row.languageId, name: row.languageName });
      }

      // Add stack if not already added
      if (project.stacks.filter(s => s.id == row.stackId).length == 0) {
        project.stacks.push({ id: row.stackId, name: row.stackName });
      }

      // Add runtime if not already added
      if (project.runtimes.filter(r => r.id == row.runtimeId).length == 0) {
        project.runtimes.push({ id: row.runtimeId, name: row.runtimeName });
      }

      if (project.owners.filter(o => o.id == row.ownerId).length == 0) {
        project.owners.push({ id: row.ownerId, name: row.ownerName });
      }

      if (project.contributors.filter(c => c.id == row.contributorId).length == 0) {
        project.contributors.push({ id: row.contributorId, name: row.contributorName });
      }

    });

    // Convert map to array
    let project = Array.from(projectsMap.values())[0];
    project.policies = [];

    // let projectDisabledPoliciesModel = new ProjectDisabledPoliciesModel();
    // let disabledPolicies = await projectDisabledPoliciesModel.findByProjectId(project.id);

    // for (let disabledPolicy of disabledPolicies) {
    //   //console.log('found disabled', disabledPolicy.id);
    //   project.policies[disabledPolicy.policyId] = {
    //     enabled: disabledPolicy.enabled
    //   };
    // }

    let policiesModel = new PoliciesModel();
    let policyExecutionsModel = new PolicyExecutionsModel();
    let kpisModel = new KPIsModel();
    let policies = await policiesModel.findAll();

    let lastActivity;
    for (let policy of policies) {
      //console.log('checking policy', policy.id);
      let result = await policiesModel.isQualified(policy, project, null)
      policy.qualified = result;
      //project.policies[policy.id] = Object.assign(policy, project.policies[policy.id]);
      //project.policies[policy.id].qualified = result;

      let last_execution = await policyExecutionsModel.findLastExecutionByPolicyAndProject(policy.id, project.id);
      if (last_execution) {
        let policyExecutionLogsModel = new PolicyExecutionLogsModel();
        last_execution.logs = await policyExecutionLogsModel.fineOneByPolicyExecutionId(last_execution.id);
        policy.last_execution = last_execution;

        if (!lastActivity) {
          lastActivity = last_execution.createdAt;
        }
        else {
          if (last_execution.createdAt > lastActivity) {
            lastActivity = last_execution.createdAt;
          }
        }
      }
      project.policies.push(policy);
    }
    project.lastActivityAt = lastActivity;
    project.kpis = await kpisModel.findAllByProject(project.id);

    //sort by policy ordinal
    //project.policies.sort((a, b) => a.ordinal - b.ordinal);

    return project;
  }

  async findOneByExternalId(externalId): Promise<Project> {
    const db = getDb();
    // Fetch a single project with joined languages, stacks, and runtimes
    const projectResults = await db
      .select({
        id: projects.id,

      })
      .from(projects)
      .where(eq(projects.externalId, externalId));

    let project_id = projectResults[0].id;
    return this.findOne(project_id);
  }


}