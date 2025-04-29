import { getAppConfig } from "../../infra/config/configService";
import axios from "axios";

const appConfig = getAppConfig();

class GitLabClient {
  constructor() {
    this.client = axios.create({
      baseURL: appConfig.gitlab.uri,
      headers: {
        "Private-Token": appConfig.gitlab.access_token,
      },
    });

    // Add a request interceptor
    this.client.interceptors.request.use(
      (config) => {
        //logger.debug(`[gitlab] Sending ${config.method.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        //logger.error('Error in request:', error);
        return Promise.reject(error);
      }
    );

    // Add a response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[gitlab] Received response with status ${response.status} from ${response.config.url}`);
        return response;
      },
      (error) => {
        //logger.error('Error in response:', error);
        return Promise.reject(error);
      }
    );
  }
}

const client = new GitLabClient();
export default client.client;
