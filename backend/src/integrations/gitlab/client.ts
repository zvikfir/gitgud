import { getAppConfig } from "../../infra/config/configService";
import axios from "axios";

const appConfig = getAppConfig();

class GitLabClient {
  client: any;
  constructor() {
    this.client = axios.create({
      baseURL: appConfig.gitlab.uri,
      headers: {
        "Private-Token": appConfig.gitlab.access_token,
      },
    });
    this.client.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );
    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );
  }
}

const client = new GitLabClient();
export default client.client;
