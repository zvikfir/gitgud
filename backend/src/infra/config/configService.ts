import config from "config";
import { AppConfig } from "./AppConfig";

// In-memory overrides store
const overrides: Partial<AppConfig> = {};

export function setConfig<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
  overrides[key] = value;
}

export function getAppConfig(): AppConfig {
  // Merge overrides with config values
  return {
    ...config.util.toObject() as AppConfig,
    ...overrides,
  };
}
