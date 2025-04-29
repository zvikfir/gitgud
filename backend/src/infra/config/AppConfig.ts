export interface AppConfig {
  gitlab: {
    uri: string;
    access_token: string;
    client_id?: string;
    client_secret?: string;
  };
  kafka: {
    broker: string;
    username?: string;
    password?: string;
  };
  api?: {
    port: number;
  };
  frontend?: {
    port: number;
    auth?: {
      provider: string;
    };
  };
  webhook?: {
    port: number;
    security_token: string;
  };
  postgres: {
    url: string;
  };
  gitgud?: {
    host?: string;
  };
}
