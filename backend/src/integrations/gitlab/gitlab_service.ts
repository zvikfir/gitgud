const gitlab = require('./client');
const _ = require('lodash');
const fs = require("fs");
const unzipper = require("unzipper");
const path = require("path");
const config = require("config");
import { getAppConfig } from "../../infra/config/configService";

export class GitLabService {
    async get_projects(search = '') {
        let projects = (
            await gitlab.get(`/api/v4/projects`, {
                params: {
                    statistics: true,
                    simple: true,
                    search
                },
            })).data;
        return projects;
    }

    async get_project_languages(project_id) {
        let languages = (
            await gitlab.get(`/api/v4/projects/${project_id}/languages`, {
                statistics: true,
            })
        ).data;

        return languages;
    }

    async get_project_members(project_id) {
        let users = (
            await gitlab.get(`/api/v4/projects/${project_id}/users`, {
                statistics: true,
            })
        ).data;

        return users;
    }

    async get_project_contributors(project_id) {
        let users = (
            await gitlab.get(`/api/v4/projects/${project_id}/repository/contributors`, {
                statistics: true,
            })
        ).data;

        return users;
    }

    async get_project(project_id) {
        let project = (
            await gitlab.get(`/api/v4/projects/${project_id}`, {
                params: {
                    statistics: true,
                },
            })
        ).data;

        project = _.pick(project, [
            "id",
            "name",
            "path",
            "description",
            "web_url",
            "created_at",
            "last_activity_at",
            "topics",
            "default_branch",
            "path_with_namespace",
            "statistics",
        ]);

        project.languages = await this.get_project_languages(project_id);
        project.members = await this.get_project_members(project_id);
        project.contributors = await this.get_project_contributors(project_id);

        return project;
    }


    async download_zip(project_id, branch_name) {
        const response = await gitlab.get(
            `/api/v4/projects/${project_id}/repository/archive.zip`,
            { responseType: "arraybuffer" } // Ensure the response is treated as binary data
        );

        const zip_path = `/tmp/policies.zip`;
        const extract_path = `/tmp/policies`;
        await new Promise((resolve, reject) => {
            fs.writeFile(zip_path, response.data, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(zip_path);
                }
            });
        });

        // Extract the ZIP file
        await fs
            .createReadStream(zip_path)
            .pipe(unzipper.Extract({ path: extract_path }))
            .promise();

        // Find the top folder within the extracted path
        const folders = fs.readdirSync(extract_path).filter((file) => {
            return fs.statSync(path.join(extract_path, file)).isDirectory();
        });

        if (folders.length > 0) {
            const top_folder = path.join(extract_path, folders[0]);
            return top_folder;
        } else {
            throw new Error("No folder found in the extracted archive");
        }
    };

    async add_webhook(project_id) {
        const appConfig = getAppConfig();
        const host = appConfig.gitgud?.host || "localhost";
        const url = `${host.indexOf('https') > -1 ? host : `https://${host}`}/gitlab/webhook`;
        
        // Check if the webhook already exists
        let hooks = await gitlab.get(`/api/v4/projects/${project_id}/hooks`);
        for (let hook of hooks.data) {
            if (hook.url === url) {
                // Webhook already exists, return the existing webhook id
                return hook.id;
            }
        }

        // Create a new webhook if it doesn't exist
        let result = await gitlab.post(`/api/v4/projects/${project_id}/hooks`, {
            url,
            push_events: true,
            merge_requests_events: true,
            tag_push_events: true,
            issues_events: true,
            confidential_issues_events: true,
            note_events: true,
            job_events: true,
            pipeline_events: true,
            wiki_page_events: true,
            releases_events: true,
            emoji_events: true,
            resource_access_token_events: true,
            branch_filter_strategy: 'all_branches',
            enable_ssl_verification: false,
        });

        // Return the new webhook id
        return result.data.id;
    }

    async remove_webhook(project_id) {
        const appConfig = getAppConfig();
        const host = appConfig.gitgud?.host || "localhost";
        const url = `${host.indexOf('https') > -1 ? host : `https://${host}`}/gitlab/webhook`;
        
        let hooks = await gitlab.get(`/api/v4/projects/${project_id}/hooks`);
        for (let hook of hooks.data) {
            if (hook.url === url) {
                await gitlab.delete(`/api/v4/projects/${project_id}/hooks/${hook.id}`);
            }
        }
    }

    async add_badge(project_id, badge) {
        const appConfig = getAppConfig();
        const host = appConfig.gitgud?.host || "localhost";
        const link_url = `${host.indexOf('https') > -1 ? host : `https://${host}`}/projects/${project_id}`;
        const image_url = `${host.indexOf('https') > -1 ? host : `https://${host}`}/api/public/${project_id}/badge.svg`;

        // Check if the badge already exists
        let badges = await gitlab.get(`/api/v4/projects/${project_id}/badges`);
        for (let b of badges.data) {
            if (b.image_url === image_url) {
                // Badge already exists, return the existing badge id
                return b.id;
            }
        }

        // Create a new badge if it doesn't exist
        let result = await gitlab.post(`/api/v4/projects/${project_id}/badges`, {
            link_url,
            image_url,
        });

        // Return the new badge id
        return result.data.id;
    }

    async remove_badge(project_id, badge) {
        const appConfig = getAppConfig();
        const host = appConfig.gitgud?.host || "localhost";
        const image_url = `${host.indexOf('https') > -1 ? host : `https://${host}`}/api/public/${project_id}/badge.svg`;

        let badges = await gitlab.get(`/api/v4/projects/${project_id}/badges`);
        for (let b of badges.data) {
            if (b.image_url === image_url) {
                await gitlab.delete(`/api/v4/projects/${project_id}/badges/${b.id}`);
            }
        }
    }

    async evaluate(project_id, webhook_id) {
        //this function will run a test for each of the different webhook events using the rest api POST /projects/:id/hooks/:hook_id/test/:trigger
        // we have the hook_id stored from the generation process
        let results: any[] = [];
        let events = [
            "push_events",
            // "tag_push",
            // "issue",
            // "note",
            // "merge_request",
            // "wiki_page",
            // "pipeline",
            // "job",
            // "release",
        ];
        for (let event of events) {
            try {
                let result = await gitlab.post(`/api/v4/projects/${project_id}/hooks/${webhook_id}/test/${event}`);
                results.push(result.data);
            }
            catch (e) {
                console.log(e);
                results.push({ event, error: e.message });
            }
        }

    }
}
