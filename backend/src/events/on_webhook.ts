import config from "config";
import gitlab from "../integrations/gitlab/client";
import k8sClientFactory from "../integrations/k8s/client_factory";
import { PolicyExecutionsModel } from "../models/policyExecutions";
import { ProjectsModel } from "../models/projects";
import { PolicyExecutionLogsModel } from "../models/policyExecutionLogs";
import { ContributorsModel } from "../models/contributors";
import { PolicyContributorsModel } from "../models/policyContributors";
import { getKafkaProducer, getConsumerGroup } from "../infra/kafka/kafka";
import { getAppConfig } from "../infra/config/configService";

async function executePolicy(scriptJs: string, _context: any, project: any, event: any) {
  const handleFunction = new Function(`return ${scriptJs}`)();
  return await handleFunction(_context, project, event);
}

const onWebhook = async () => {
  const appConfig = getAppConfig();
  console.log(`Starting on_webhook consumer service on Kafka Broker: ${appConfig.kafka.broker}`);
  const producer = getKafkaProducer();
  const consumerGroup = getConsumerGroup(["webhook"]);
  producer.on("ready", () => {
    console.log("Kafka Summaries Producer is connected and ready.");
  });

  producer.on("error", (err: any) => {
    console.error("Kafka Producer error: " + err);
    process.abort();
  });

  consumerGroup.on("message", async (message: any) => {
    let policyExecutionsModel = new PolicyExecutionsModel();
    let projectsModel = new ProjectsModel();
    let policyExecutionLogsModel = new PolicyExecutionLogsModel();
    let policyContributorsModel = new PolicyContributorsModel();
    let contributorsModel = new ContributorsModel();

    const event = JSON.parse(message.value);
    const date = new Date().toISOString().split("T")[0];
    const eventStartTime = new Date().getTime();
    let project_id = event.project_id || event.project?.id;
    if (!project_id) {
      return;
    }

    let event_type = event.event_name || event.object_kind;
    if (!event_type) {
      return;
    }

    console.log(
      `Received event ${event_type} for project ${project_id} with id ${event.id}`
    );

    try {
      let project = await projectsModel.findOneByExternalId(project_id);
      const executed: any[] = [];
      let logs: any[] = [];
      const ignored: any[] = [];
      const originalProjectId = project.id;
      let _context = Object.assign({}, (global as any).context);
      _context.gitlab = gitlab;
      try {
        _context.kc = await k8sClientFactory(project.id);
      } catch (ex) {
        //ignore for now
      }

      for (let policy of Object.values(project.policies)) {
        if (policy.enabled && policy.qualified.result) {
          if (executed.includes(policy.id)) {
            continue;
          }
          executed.push(policy.id);

          let executionId = (
            await policyExecutionsModel.create(policy.id, project.id, 0)
          ).id;
          let logger = {
            info: async (msg: string) => {
              await policyExecutionLogsModel.create(executionId, msg, "info");
            },
            warn: async (msg: string) => {
              await policyExecutionLogsModel.create(executionId, msg, "warn");
            },
            error: async (msg: string) => {
              await policyExecutionLogsModel.create(executionId, msg, "error");
            },
          };
          _context.logger = logger;

          logs = [];
          logger.info(`Executing policy ${policy.name}`);

          // Store and swap project.id for policy execution
          project.id = project.externalId;
          try {
            const result = await executePolicy(
              policy.scriptJs,
              _context,
              project,
              event
            );

            logger.info(
              `Policy ${policy.name} executed successfully with result: ${result}`
            );

            //record the policy contributors
            let contributors: any[] = [];
            if (event.user && typeof event.user === "object") {
              console.log("event.user", event.user);
              contributors.push(event.user.id);
            }
            if (event.commit) {
              console.log("event.commit");
              contributors.push(event.commit.author_id);
            }
            if (event.commits) {
              console.log("event.commits");
              for (let commit of event.commits) {
                let contributor = await contributorsModel.findOneByName(
                  commit.author.name
                );
                if (contributor) {
                  contributors.push(contributor.id);
                }
              }
            }
            if (event.assignee) {
              console.log("event.assignee", event.assignee);
              contributors.push(event.assignee.id);
            }
            if (event.assignees) {
              console.log("event.assignees");
              for (let assignee of event.assignees) {
                contributors.push(assignee.id);
              }
            }
            if (event.reviewer) {
              console.log("event.reviewer", event.reviewer);
              contributors.push(event.reviewer.id);
            }
            if (event.reviewers) {
              console.log("event.reviewers");
              for (let reviewer of event.reviewers) {
                contributors.push(reviewer.id);
              }
            }
            if (event.merge_request) {
              console.log("event.merge_request", event.merge_request);
              contributors.push(event.merge_request.author_id);
            }
            if (event.merge_request_assignee) {
              console.log(
                "event.merge_request_assignee",
                event.merge_request_assignee
              );
              contributors.push(event.merge_request_assignee.id);
            }
            if (event.merge_request_reviewer) {
              console.log(
                "event.merge_request_reviewer",
                event.merge_request_reviewer
              );
              contributors.push(event.merge_request_reviewer.id);
            }

            //iterate over contributors and all
            for (let contributor_id of contributors) {
              if (contributor_id) {
                //ignore nulls and such
                await policyContributorsModel.create(
                  policy.id,
                  contributor_id,
                  result
                );
              }
            }

            policyExecutionsModel.update(executionId, result, 1, "");
          } catch (ex: any) {
            logger.error(
              `Policy ${policy.name} failed with error: ${ex.message}`
            );

            policyExecutionsModel.update(executionId, 0, 2, ex.message);
          }
          // Restore project.id
          project.id = originalProjectId;
        } else {
          ignored.push(policy.id);

          let executionId = (
            await policyExecutionsModel.create(
              policy.id,
              project.id,
              policy.enabled ? -1 : -2
            )
          ).id;
        }
      }
    } catch (ex: any) {
      console.error(ex);
      console.log(
        `Failed to process Event ${event_type} for project ${project_id} with id ${event.id}: ${ex.message}`
      );
      return;
    }

    console.log(
      `Event ${event_type} for project ${project_id} with id ${event.id} processed.`
    );
  });

  consumerGroup.on("error", (err: any) => {
    console.error("Kafka ConsumerGroup error: " + err);
    // Decide if the error is fatal
    // process.abort();
  });
};

export { onWebhook };
