import config from "config";
import { z } from "zod";
import { AppConfig } from "./appConfig";

// In-memory overrides store
const overrides: Partial<AppConfig> = {};

const appConfigSchema = z
	.object({
		gitgud: z
			.object({
				host: z.string(),
			})
			.strict().optional(),
		postgres: z
			.object({
				url: z.string(),
			})
			.strict(),
		kafka: z
			.object({
				broker: z.string(),
				username: z.string().optional(),
				password: z.string().optional(),
			})
			.strict(),
		gitlab: z
			.object({
				baseUri: z.string(),
				clientId: z.string(),
				clientSecret: z.string(),
				accessToken: z.string(),
				oauthRedirectPath: z.string({}),
			})
			.strict(),
		api: z
			.object({
				port: z.number(),
			})
			.strict()
			.optional(),
	})
	.strict();

export function setConfig<K extends keyof AppConfig>(
	key: K,
	value: AppConfig[K],
) {
	overrides[key] = value;
}

export function getAppConfig(): AppConfig {
	const configMergedWithOverrides = {
		...config.util.toObject(),
		...overrides,
	};
	try {
		return appConfigSchema.parse(configMergedWithOverrides) as AppConfig;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const messages = error.errors.map(
				(e) => `${e.path.join(".")}: ${e.message} ${e.code}`,
			);
			throw new Error(
				`Configuration validation failed:\n${messages.join("\n")}`,
			);
		}
		throw error;
	}
}
