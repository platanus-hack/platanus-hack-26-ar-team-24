import { randomUUID } from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import {
  conversationConfigSchema,
  matchmakingRequestSchema,
  profiledAgentCreateSchema
} from "./types.js";
import { PersistenceService } from "./persistence-service.js";
import { RuntimeClient } from "./runtime-client.js";
import { CompatibilityService } from "./compatibility-service.js";
import { getSupabaseUser } from "./supabase.js";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  OPENCLAW_RUNTIME_URL: z.string().url().default("http://localhost:8080"),
  OPENCLAW_ADMIN_API_TOKEN: z.string().min(16).default("change-me-admin-token"),
  JUDGE_AGENT_ID: z.string().min(1).default("judge"),
  GRADER_AGENT_ID: z.string().min(1).default("grader"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3001,http://127.0.0.1:3001")
});

const env = envSchema.parse(process.env);

const app = express();

const allowedOrigins = env.ALLOWED_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

const runtimeClient = new RuntimeClient(env.OPENCLAW_RUNTIME_URL, env.OPENCLAW_ADMIN_API_TOKEN);
const persistenceService = new PersistenceService();
const compatibilityService = new CompatibilityService(
  runtimeClient,
  env.GRADER_AGENT_ID,
  env.JUDGE_AGENT_ID,
  persistenceService
);

class HttpError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
  }
}

async function getAuthenticatedUserId(req: Request): Promise<string> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    throw new HttpError("Missing Authorization Bearer token", 401);
  }

  try {
    const user = await getSupabaseUser(token);
    return user.id;
  } catch {
    throw new HttpError("Invalid Supabase access token", 401);
  }
}

function getBearerToken(req: Request): string {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    throw new HttpError("Missing Authorization Bearer token", 401);
  }

  return token;
}

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
    const ownerAccessToken = getBearerToken(req);
    const ownerUserId = await getAuthenticatedUserId(req);
    const profiledParse = profiledAgentCreateSchema.safeParse(req.body);

    if (!profiledParse.success) {
      const agents = await runtimeClient.listAgents();
      res.status(201).json(agents);
      return;
    }

    const input = profiledParse.data;
    const agentId = buildAgentId(input.user.name);
    const result = await compatibilityService.createProfiledAgent(
      agentId,
      input.user,
      ownerUserId,
      ownerAccessToken
    );

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
    const ownerAccessToken = getBearerToken(req);
    const ownerUserId = await getAuthenticatedUserId(req);
    const input = conversationConfigSchema.parse(req.body);
    const result = await compatibilityService.runConversation(input, ownerUserId, ownerAccessToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/agents/:id/matchmake", async (req, res, next) => {
  try {
    const ownerAccessToken = getBearerToken(req);
    const ownerUserId = await getAuthenticatedUserId(req);
    const agentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const input = matchmakingRequestSchema.parse(req.body);
    const result = await compatibilityService.runPurposeMatchmaking(
      agentId,
      input,
      ownerUserId,
      ownerAccessToken
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get("/conversations", async (req, res, next) => {
  try {
    const ownerAccessToken = getBearerToken(req);
    const ownerUserId = await getAuthenticatedUserId(req);
    const conversations = await persistenceService.listConversations(ownerUserId, ownerAccessToken);
    res.json({ conversations });
  } catch (error) {
    next(error);
  }
});

app.get("/conversations/:id", async (req, res, next) => {
  try {
    const ownerAccessToken = getBearerToken(req);
    const ownerUserId = await getAuthenticatedUserId(req);
    const conversationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const conversation = await persistenceService.getConversation(
      ownerUserId,
      ownerAccessToken,
      conversationId
    );

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    res.json({ conversation });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  res.status(statusCode).json({ error: message });
});

app.listen(env.PORT, () => {
  console.log(`Back listening on ${env.PORT}`);
});
