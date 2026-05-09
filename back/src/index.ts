import { randomUUID } from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import {
  conversationConfigSchema,
  profiledAgentCreateSchema
} from "./types.js";
import { RuntimeClient } from "./runtime-client.js";
import { CompatibilityService } from "./compatibility-service.js";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  OPENCLAW_RUNTIME_URL: z.string().url().default("http://localhost:8080"),
  OPENCLAW_ADMIN_API_TOKEN: z.string().min(16).default("change-me-admin-token"),
  JUDGE_AGENT_ID: z.string().min(1).default("judge"),
  GRADER_AGENT_ID: z.string().min(1).default("grader")
});

const env = envSchema.parse(process.env);

const app = express();
app.use(express.json());

const runtimeClient = new RuntimeClient(env.OPENCLAW_RUNTIME_URL, env.OPENCLAW_ADMIN_API_TOKEN);
const compatibilityService = new CompatibilityService(
  runtimeClient,
  env.GRADER_AGENT_ID,
  env.JUDGE_AGENT_ID
);

function buildAgentId(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

  const base = slug || "user";
  const suffix = randomUUID().split("-")[0];
  return `${base}-${suffix}`;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, runtimeUrl: env.OPENCLAW_RUNTIME_URL });
});

app.get("/agents", async (_req, res, next) => {
  try {
    const agents = await runtimeClient.listAgents();
    res.json(agents);
  } catch (error) {
    next(error);
  }
});

app.get("/agents/:id/files", async (req, res, next) => {
  try {
    const agentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const files = await runtimeClient.getFiles(agentId);
    res.json({ agentId, ...files });
  } catch (error) {
    next(error);
  }
});

app.post("/agents", async (req, res, next) => {
  try {
    const profiledParse = profiledAgentCreateSchema.safeParse(req.body);

    if (!profiledParse.success) {
      const agents = await runtimeClient.listAgents();
      res.status(201).json(agents);
      return;
    }

    const input = profiledParse.data;
    const agentId = buildAgentId(input.user.name);
    const result = await compatibilityService.createProfiledAgent(agentId, input.user);

    res.status(201).json({
      agent: { id: agentId },
      grading: result
    });
  } catch (error) {
    next(error);
  }
});

app.post("/conversations/run", async (req, res, next) => {
  try {
    const input = conversationConfigSchema.parse(req.body);
    const result = await compatibilityService.runConversation(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected error";
  res.status(500).json({ error: message });
});

app.listen(env.PORT, () => {
  console.log(`Back listening on ${env.PORT}`);
});
