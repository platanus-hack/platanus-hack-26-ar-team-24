import { z } from "zod";

const rawAdminApiToken = process.env.ADMIN_API_TOKEN ?? process.env.OPENCLAW_ADMIN_API_TOKEN;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  ADMIN_API_TOKEN: z.string().min(16).default("change-me-admin-token"),
  OPENCLAW_GATEWAY_TOKEN: z.string().min(16).default("change-me-gateway-token"),
  OPENCLAW_PUBLIC_BASE_URL: z.string().url().default("http://localhost:8080"),
  OPENCLAW_GATEWAY_PORT: z.coerce.number().int().positive().default(18789),
  OPENCLAW_GATEWAY_BIND: z.enum(["loopback", "lan", "tailnet", "auto", "custom"]).default("loopback"),
  OPENCLAW_STATE_DIR: z.string().default("/data/.openclaw"),
  OPENCLAW_WORKSPACE_ROOT: z.string().default("/data/workspaces"),
  OPENCLAW_DEFAULT_MODEL: z.string().default("openai/gpt-4o-mini"),
  OPENAI_API_KEY: z.string().optional()
});

export type RuntimeEnv = z.infer<typeof envSchema>;

export const env = envSchema.parse({
  ...process.env,
  ADMIN_API_TOKEN: rawAdminApiToken ?? process.env.ADMIN_API_TOKEN
});
