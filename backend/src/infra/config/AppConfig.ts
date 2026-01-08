export interface AppConfig {
	gitlab: {
		baseUri: string;
		clientId: string;
		clientSecret: string;
		oauthRedirectPath: string;
		accessToken: string;
	};
	kafka: {
		broker: string;
		username?: string;
		password?: string;
	};
	api?: {
		port: number;
	};
	postgres: {
		url: string;
	};
	gitgud: {
		host: string;
	};
}
