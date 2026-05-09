import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { z } from "zod";
import { env } from "./env.js";
import type { ManagedAgent, OpenClawAgentsFile, OpenClawConfigFile } from "./types.js";

const execFileAsync = promisify(execFile);

const createAgentSchema = z.object({
  id: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9][a-z0-9-_]*$/),
  skills: z.array(z.string()).optional(),
  agentDir: z.string().optional(),
  bind: z.array(z.string()).optional(),
  default: z.boolean().optional()
});

const createWorkspaceSchema = z.object({
  id: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9][a-z0-9-_]*$/)
});

const sendAgentMessageSchema = z.object({
  message: z.string().min(1),
  thinking: z.enum(["off", "minimal", "low", "medium", "high"]).optional(),
  sessionId: z.string().min(1).optional()
});

const updateAgentFilesSchema = z.object({
  files: z.record(z.string(), z.string())
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type SendAgentMessageInput = z.infer<typeof sendAgentMessageSchema>;
export type UpdateAgentFilesInput = z.infer<typeof updateAgentFilesSchema>;

type CliAgentRecord = Record<string, unknown>;

export class ConfigStore {
  readonly stateDir = env.OPENCLAW_STATE_DIR;
  readonly workspaceRoot = env.OPENCLAW_WORKSPACE_ROOT;
  readonly configPath = path.join(this.stateDir, "openclaw.json");
  readonly agentsPath = path.join(this.stateDir, "agents.json");

  async ensureBaseLayout(): Promise<void> {
    await mkdir(this.stateDir, { recursive: true });
    await mkdir(this.workspaceRoot, { recursive: true });

    const mainWorkspace = path.join(this.workspaceRoot, "main");
    await mkdir(mainWorkspace, { recursive: true });
    await this.ensureBootstrapFiles(mainWorkspace, "main");

    const agents = await this.readJsonOrDefault<OpenClawAgentsFile>(this.agentsPath, {
      defaults: {
        workspace: mainWorkspace
      },
      list: [
        {
          id: "main",
          workspace: mainWorkspace,
          model: env.OPENCLAW_DEFAULT_MODEL,
          default: true
        }
      ]
    });

    const config = this.sanitizeConfig(
      await this.readJsonOrDefault<OpenClawConfigFile & { models?: Record<string, unknown> }>(this.configPath, {
        $schema: "https://docs.openclaw.ai/schema/openclaw.json",
        gateway: {
          mode: "local",
          bind: env.OPENCLAW_GATEWAY_BIND,
          port: env.OPENCLAW_GATEWAY_PORT,
          auth: {
            mode: "token",
            token: "${OPENCLAW_GATEWAY_TOKEN}"
          }
        },
        agents: {
          defaults: {
            workspace: mainWorkspace
          },
          list: agents.list
        }
      }),
      agents
    );

    await this.writeJson(this.agentsPath, agents);
    await this.writeJson(this.configPath, config);
    await this.syncAgentsToCli(agents);
  }

  async listAgents(): Promise<ManagedAgent[]> {
    const agents = await this.getAgentsFromCli();
    return agents.list;
  }

  async getConfig(): Promise<{ config: OpenClawConfigFile; agents: OpenClawAgentsFile }> {
    const [config, agents] = await Promise.all([this.readConfig(), this.readAgents()]);
    return { config, agents };
  }

  async createAgent(rawInput: unknown): Promise<ManagedAgent> {
    const input = createAgentSchema.parse(rawInput);
    const agents = await this.getAgentsFromCli();

    if (input.id === "main") {
      throw new Error("`main` is reserved by OpenClaw and cannot be created dynamically.");
    }

    if (agents.list.some((agent) => agent.id === input.id)) {
      throw new Error(`Agent \`${input.id}\` already exists.`);
    }

    const workspace = await this.createWorkspace({ id: input.id });

    const nextAgent: ManagedAgent = {
      id: input.id,
      workspace,
      model: env.OPENCLAW_DEFAULT_MODEL,
      skills: input.skills,
      bind: input.bind,
      agentDir: input.agentDir,
      default: input.default ?? false
    };

    try {
      await this.addAgentToCli(nextAgent);
      const nextAgents = await this.getAgentsFromCli();
      await this.writeJson(this.agentsPath, nextAgents);
      await this.syncConfigWithAgents(nextAgents);
      await this.validateConfig();
    } catch (error) {
      await this.writeJson(this.agentsPath, agents);
      await this.syncConfigWithAgents(agents);
      throw error;
    }

    return nextAgent;
  }

  async createWorkspace(rawInput: unknown): Promise<string> {
    const input = createWorkspaceSchema.parse(rawInput);
    const workspace = path.join(this.workspaceRoot, input.id);
    await mkdir(workspace, { recursive: true });
    await this.ensureBootstrapFiles(workspace, input.id);
    return workspace;
  }

  async validateConfig(): Promise<void> {
    await execFileAsync(
      "openclaw",
      ["config", "validate"],
      {
        env: {
          ...process.env,
          OPENCLAW_CONFIG_PATH: this.configPath,
          OPENCLAW_GATEWAY_TOKEN: env.OPENCLAW_GATEWAY_TOKEN,
          OPENCLAW_STATE_DIR: env.OPENCLAW_STATE_DIR
        }
      }
    );
  }

  async sendMessageToAgent(agentId: string, rawInput: unknown): Promise<unknown> {
    const input = sendAgentMessageSchema.parse(rawInput);
    const args = [
      "agent",
      "--agent",
      agentId,
      "--message",
      input.message,
      "--json"
    ];

    if (input.thinking) {
      args.push("--thinking", input.thinking);
    }

    if (input.sessionId) {
      args.push("--session-id", input.sessionId);
    }

    const { stdout } = await execFileAsync("openclaw", args, {
      env: {
        ...process.env,
        OPENCLAW_CONFIG_PATH: this.configPath,
        OPENCLAW_GATEWAY_TOKEN: env.OPENCLAW_GATEWAY_TOKEN,
        OPENCLAW_STATE_DIR: env.OPENCLAW_STATE_DIR,
        OPENAI_API_KEY: env.OPENAI_API_KEY
      }
    });

    try {
      return JSON.parse(stdout);
    } catch {
      return { raw: stdout.trim() };
    }
  }

  async updateAgentFiles(agentId: string, rawInput: unknown): Promise<{ workspace: string; files: string[] }> {
    const input = updateAgentFilesSchema.parse(rawInput);
    const agents = await this.getAgentsFromCli();
    const agent = agents.list.find((entry) => entry.id === agentId);

    if (!agent) {
      throw new Error(`Unknown agent id \`${agentId}\`.`);
    }

    await Promise.all(
      Object.entries(input.files).map(async ([filename, content]) => {
        const safeName = path.basename(filename);
        await writeFile(path.join(agent.workspace, safeName), content, "utf8");
      })
    );

    return {
      workspace: agent.workspace,
      files: Object.keys(input.files).map((filename) => path.basename(filename))
    };
  }

  private async readConfig(): Promise<OpenClawConfigFile> {
    const cliAgents = await this.getAgentsFromCli();
    return this.sanitizeConfig(
      await this.readJsonOrDefault<OpenClawConfigFile & { models?: Record<string, unknown> }>(this.configPath, {
        $schema: "https://docs.openclaw.ai/schema/openclaw.json",
        gateway: {
          mode: "local",
          bind: env.OPENCLAW_GATEWAY_BIND,
          port: env.OPENCLAW_GATEWAY_PORT,
          auth: {
            mode: "token",
            token: "${OPENCLAW_GATEWAY_TOKEN}"
          }
        },
        agents: {
          defaults: {
            workspace: path.join(this.workspaceRoot, "main")
          },
          list: cliAgents.list
        }
      }),
      cliAgents
    );
  }

  private async readAgents(): Promise<OpenClawAgentsFile> {
    const agents = await this.readJsonOrDefault(this.agentsPath, {
      defaults: {
        workspace: path.join(this.workspaceRoot, "main")
      },
      list: [
        {
          id: "main",
          workspace: path.join(this.workspaceRoot, "main"),
          model: env.OPENCLAW_DEFAULT_MODEL,
          default: true
        }
      ]
    });

    const normalizedAgents: OpenClawAgentsFile = {
      ...agents,
      list: agents.list.map((agent) => ({
        ...agent,
        model: env.OPENCLAW_DEFAULT_MODEL
      }))
    };

    const changed = JSON.stringify(agents) !== JSON.stringify(normalizedAgents);
    if (changed) {
      await this.writeJson(this.agentsPath, normalizedAgents);
    }

    return normalizedAgents;
  }

  private async getAgentsFromCli(): Promise<OpenClawAgentsFile> {
    try {
      const { stdout } = await execFileAsync(
        "openclaw",
        ["agents", "list", "--json"],
        {
          env: {
            ...process.env,
            OPENCLAW_CONFIG_PATH: this.configPath,
            OPENCLAW_GATEWAY_TOKEN: env.OPENCLAW_GATEWAY_TOKEN,
            OPENCLAW_STATE_DIR: env.OPENCLAW_STATE_DIR
          }
        }
      );

      const parsed = JSON.parse(stdout) as
        | { agents?: CliAgentRecord[] }
        | CliAgentRecord[];
      const list = Array.isArray(parsed) ? parsed : parsed.agents ?? [];
      const normalizedList: ManagedAgent[] = [];

      for (const agent of list) {
        const normalizedAgent = this.normalizeCliAgent(agent);
        if (normalizedAgent) {
          normalizedList.push(normalizedAgent);
        }
      }

      const normalized: OpenClawAgentsFile = {
        defaults: {
          workspace: path.join(this.workspaceRoot, "main")
        },
        list: normalizedList
      };

      await this.writeJson(this.agentsPath, normalized);
      return normalized;
    } catch {
      return this.readAgents();
    }
  }

  private async ensureBootstrapFiles(workspace: string, agentId: string): Promise<void> {
    const bootstrapFiles = new Map<string, string>([
      [
        "AGENTS.md",
        `# ${agentId}\n\nThis workspace is owned by the \`${agentId}\` agent.\nStore long-term instructions and operating notes here.\nWhen you need to contact another agent, use the session tools exposed by OpenClaw.\n`
      ],
      [
        "SOUL.md",
        `# ${agentId} Persona\n\nDefine the tone, boundaries, and goals for \`${agentId}\` here.\n`
      ],
      [
        "TOOLS.md",
        "# Tool notes\n\nDocument allowed tools, calling conventions, and external systems here.\nIf collaboration is needed, prefer OpenClaw session tools for agent-to-agent communication.\n"
      ],
      [
        "IDENTITY.md",
        `# Identity\n\nAgent id: \`${agentId}\`\n`
      ]
    ]);

    await Promise.all(
      Array.from(bootstrapFiles.entries()).map(async ([filename, content]) => {
        const filePath = path.join(workspace, filename);
        try {
          await readFile(filePath, "utf8");
        } catch {
          await writeFile(filePath, content, "utf8");
        }
      })
    );
  }

  private async readJsonOrDefault<T>(filePath: string, fallback: T): Promise<T> {
    try {
      const value = await readFile(filePath, "utf8");
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  private async writeJson(filePath: string, value: unknown): Promise<void> {
    await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  }

  private async syncConfigWithAgents(agents: OpenClawAgentsFile): Promise<void> {
    const currentConfig = await this.readJsonOrDefault<OpenClawConfigFile & { models?: Record<string, unknown> }>(
      this.configPath,
      {
        $schema: "https://docs.openclaw.ai/schema/openclaw.json",
        gateway: {
          mode: "local",
          bind: env.OPENCLAW_GATEWAY_BIND,
          port: env.OPENCLAW_GATEWAY_PORT,
          auth: {
            mode: "token",
            token: "${OPENCLAW_GATEWAY_TOKEN}"
          }
        },
        agents: {
          defaults: {
            workspace: agents.defaults.workspace
          },
          list: agents.list
        }
      }
    );

    const nextConfig = this.sanitizeConfig(currentConfig, agents);
    await this.writeJson(this.configPath, nextConfig);
  }

  private async syncAgentsToCli(agents: OpenClawAgentsFile): Promise<void> {
    const cliAgents = await this.getAgentsFromCli();
    const cliIds = new Set(cliAgents.list.map((agent) => agent.id));

    for (const agent of agents.list) {
      if (agent.id === "main" || cliIds.has(agent.id)) {
        continue;
      }

      await this.addAgentToCli(agent);
    }

    const syncedAgents = await this.getAgentsFromCli();
    await this.writeJson(this.agentsPath, syncedAgents);
    await this.syncConfigWithAgents(syncedAgents);
  }

  private async addAgentToCli(agent: ManagedAgent): Promise<void> {
    await execFileAsync(
      "openclaw",
      [
        "agents",
        "add",
        agent.id,
        "--workspace",
        agent.workspace,
        "--model",
        env.OPENCLAW_DEFAULT_MODEL,
        "--non-interactive",
        "--json"
      ],
      {
        env: {
          ...process.env,
          OPENCLAW_CONFIG_PATH: this.configPath,
          OPENCLAW_GATEWAY_TOKEN: env.OPENCLAW_GATEWAY_TOKEN,
          OPENCLAW_STATE_DIR: env.OPENCLAW_STATE_DIR
        }
      }
    );
  }

  private normalizeCliAgent(agent: CliAgentRecord): ManagedAgent | null {
    const id = typeof agent.id === "string" ? agent.id : null;
    const workspace = typeof agent.workspace === "string" ? agent.workspace : null;

    if (!id || !workspace) {
      return null;
    }

    return {
      id,
      workspace,
      model: env.OPENCLAW_DEFAULT_MODEL,
      agentDir: typeof agent.agentDir === "string" ? agent.agentDir : undefined,
      skills: Array.isArray(agent.skills)
        ? agent.skills.filter((value): value is string => typeof value === "string")
        : undefined,
      bind: Array.isArray(agent.bind)
        ? agent.bind.filter((value): value is string => typeof value === "string")
        : undefined,
      default: id === "main" ? true : Boolean(agent.default ?? agent.isDefault)
    };
  }

  private sanitizeConfig(
    config: OpenClawConfigFile & { models?: Record<string, unknown> },
    agentsFile: OpenClawAgentsFile
  ): OpenClawConfigFile {
    const nextConfig: OpenClawConfigFile & { models?: Record<string, unknown> } = {
      $schema: config.$schema ?? "https://docs.openclaw.ai/schema/openclaw.json",
      gateway: {
        mode: "local",
        bind: config.gateway?.bind ?? env.OPENCLAW_GATEWAY_BIND,
        port: config.gateway?.port ?? env.OPENCLAW_GATEWAY_PORT,
        auth: {
          mode: "token",
          token: "${OPENCLAW_GATEWAY_TOKEN}"
        }
      },
      agents: agentsFile,
      tools: {
        agentToAgent: {
          enabled: true,
          allow: agentsFile.list.map((agent) => agent.id)
        },
        sessions: {
          visibility: "all"
        }
      }
    };

    if (config.models) {
      const { default: _ignored, ...restModels } = config.models;
      if (Object.keys(restModels).length > 0) {
        nextConfig.models = restModels;
      }
    }

    return nextConfig;
  }
}

export const configStore = new ConfigStore();
