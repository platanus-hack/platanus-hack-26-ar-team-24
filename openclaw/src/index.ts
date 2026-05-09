import express, { type NextFunction, type Request, type Response } from "express";
import http from "node:http";
import httpProxy from "http-proxy";
import { configStore } from "./config-store.js";
import { env } from "./env.js";
import { openclawRuntime } from "./openclaw-runtime.js";

const app = express();
const server = http.createServer(app);
const gatewayProxy = httpProxy.createProxyServer({
  target: `http://127.0.0.1:${env.OPENCLAW_GATEWAY_PORT}`,
  ws: true,
  changeOrigin: false
});

app.use(express.json());

function requireAdminToken(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (token !== env.ADMIN_API_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

app.get("/health", async (_req, res) => {
  res.json({
    ok: true,
    runtime: openclawRuntime.status(),
    publicBaseUrl: env.OPENCLAW_PUBLIC_BASE_URL,
    gatewayPort: env.OPENCLAW_GATEWAY_PORT
  });
});

app.get("/admin/config", requireAdminToken, async (_req, res, next) => {
  try {
    const config = await configStore.getConfig();
    res.json(config);
  } catch (error) {
    next(error);
  }
});

app.get("/admin/agents", requireAdminToken, async (_req, res, next) => {
  try {
    const agents = await configStore.listAgents();
    res.json({ agents });
  } catch (error) {
    next(error);
  }
});

app.post("/admin/agents", requireAdminToken, async (req, res, next) => {
  try {
    const agent = await configStore.createAgent(req.body);
    res.status(201).json({ agent });
  } catch (error) {
    next(error);
  }
});

app.post("/admin/workspaces", requireAdminToken, async (req, res, next) => {
  try {
    const workspace = await configStore.createWorkspace(req.body);
    res.status(201).json({ workspace });
  } catch (error) {
    next(error);
  }
});

app.post("/admin/agents/:id/message", requireAdminToken, async (req, res, next) => {
  try {
    const agentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await configStore.sendMessageToAgent(agentId, req.body);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

app.post("/admin/agents/:id/files", requireAdminToken, async (req, res, next) => {
  try {
    const agentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await configStore.updateAgentFiles(agentId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get("/admin/agents/:id/files", requireAdminToken, async (req, res, next) => {
  try {
    const agentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await configStore.getAgentFiles(agentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/admin/config/validate", requireAdminToken, async (_req, res, next) => {
  try {
    await configStore.validateConfig();
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  gatewayProxy.web(req, res);
});

server.on("upgrade", (req, socket, head) => {
  gatewayProxy.ws(req, socket, head);
});

gatewayProxy.on("error", (error, req, res) => {
  if ("writeHead" in res) {
    const httpResponse = res as http.ServerResponse;
    httpResponse.writeHead(502, { "content-type": "application/json" });
    httpResponse.end(JSON.stringify({ error: "Gateway proxy error", details: error.message }));
    return;
  }

  req.socket.destroy(error);
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected error";
  res.status(400).json({ error: message });
});

async function bootstrap() {
  await configStore.ensureBaseLayout();
  await configStore.validateConfig();
  await openclawRuntime.start();

  server.listen(env.PORT, () => {
    console.log(`OpenClaw runtime listening on ${env.PORT}`);
    console.log(`Gateway proxied from 127.0.0.1:${env.OPENCLAW_GATEWAY_PORT}`);
  });
}

void bootstrap().catch(async (error) => {
  console.error("Failed to bootstrap OpenClaw runtime", error);
  await openclawRuntime.stop();
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await openclawRuntime.stop();
    server.close(() => process.exit(0));
  });
}
