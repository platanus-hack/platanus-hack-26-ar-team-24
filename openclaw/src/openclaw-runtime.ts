import { execFile, spawn } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { env, type RuntimeEnv } from "./env.js";

const execFileAsync = promisify(execFile);

export class OpenClawRuntime {
  private process: ReturnType<typeof spawn> | null = null;

  constructor(private readonly runtimeEnv: RuntimeEnv) {}

  async verifyBinary(): Promise<void> {
    try {
      await execFileAsync("openclaw", ["--version"]);
      return;
    } catch {
      throw new Error(
        "OpenClaw CLI is not installed. Install it with `npm install -g openclaw@latest` or use the provided Dockerfile."
      );
    }
  }

  async start(): Promise<void> {
    if (this.process) {
      return;
    }

    await this.verifyBinary();

    const configPath = path.join(this.runtimeEnv.OPENCLAW_STATE_DIR, "openclaw.json");

    this.process = spawn(
      "openclaw",
      [
        "gateway",
        "run",
        "--port",
        String(this.runtimeEnv.OPENCLAW_GATEWAY_PORT),
        "--bind",
        this.runtimeEnv.OPENCLAW_GATEWAY_BIND,
        "--auth",
        "token",
        "--token",
        this.runtimeEnv.OPENCLAW_GATEWAY_TOKEN
      ],
      {
        env: {
          ...process.env,
          OPENCLAW_CONFIG_PATH: configPath,
          OPENCLAW_GATEWAY_PORT: String(this.runtimeEnv.OPENCLAW_GATEWAY_PORT),
          OPENCLAW_GATEWAY_TOKEN: this.runtimeEnv.OPENCLAW_GATEWAY_TOKEN,
          OPENCLAW_STATE_DIR: this.runtimeEnv.OPENCLAW_STATE_DIR
        },
        stdio: "inherit"
      }
    );

    this.process.on("exit", (code, signal) => {
      this.process = null;
      const reason = signal ? `signal ${signal}` : `code ${code ?? "unknown"}`;
      console.error(`OpenClaw gateway exited with ${reason}`);
    });
  }

  async stop(): Promise<void> {
    if (!this.process) {
      return;
    }

    this.process.kill("SIGTERM");
    this.process = null;
  }

  status() {
    return {
      pid: this.process?.pid ?? null,
      running: Boolean(this.process)
    };
  }
}

export const openclawRuntime = new OpenClawRuntime(env);
