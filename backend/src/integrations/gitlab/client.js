const axios = require("axios");
const config = require("config");

class GitLabClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.get("gitlab.uri"),
      headers: {
        "Private-Token": config.get("gitlab.access_token"),
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
module.exports = client.client;
