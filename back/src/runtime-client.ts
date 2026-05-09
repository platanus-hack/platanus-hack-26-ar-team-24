import type { RuntimeMessageResult } from "./types.js";

export class RuntimeClient {
  constructor(
    private runtimeUrl: string,
    private adminToken: string
  ) {}

  private async call(pathname: string, init?: RequestInit) {
    const response = await fetch(`${this.runtimeUrl}${pathname}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.adminToken}`,
        ...(init?.headers ?? {})
      }
    });

    const body = await response.json();
    return { response, body };
  }

  async listAgents() {
    const { response, body } = await this.call("/admin/agents");
    if (!response.ok) {
      throw new Error(`Failed to list agents: ${JSON.stringify(body)}`);
    }
    return body as { agents?: Array<{ id: string }> };
  }

  async createAgent(agentId: string) {
    const { response, body } = await this.call("/admin/agents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: agentId })
    });

    if (!response.ok) {
      throw new Error(`Failed to create agent \`${agentId}\`: ${JSON.stringify(body)}`);
    }

    return body;
  }

  async ensureAgentExists(agentId: string): Promise<void> {
    const body = await this.listAgents();
    const exists = body.agents?.some((agent) => agent.id === agentId);
    if (!exists) {
      await this.createAgent(agentId);
    }
  }

  async sendMessage(args: { agentId: string; message: string; thinking: string; sessionId: string }) {
    const { response, body } = await this.call(`/admin/agents/${args.agentId}/message`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: args.message,
        thinking: args.thinking,
        sessionId: args.sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`Agent \`${args.agentId}\` failed: ${JSON.stringify(body)}`);
    }

    this.assertNotYielded(body as RuntimeMessageResult, args.agentId);
    return this.extractAssistantText(body as RuntimeMessageResult);
  }

  async updateFiles(agentId: string, files: Record<string, string>) {
    const { response, body } = await this.call(`/admin/agents/${agentId}/files`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ files })
    });

    if (!response.ok) {
      throw new Error(`Failed to write profile files for \`${agentId}\`: ${JSON.stringify(body)}`);
    }

    return body;
  }

  async getFiles(agentId: string) {
    const { response, body } = await this.call(`/admin/agents/${agentId}/files`);

    if (!response.ok) {
      throw new Error(`Failed to read profile files for \`${agentId}\`: ${JSON.stringify(body)}`);
    }

    return body as {
      workspace: string;
      files: Partial<Record<"IDENTITY.md" | "SOUL.md" | "USER.md" | "AGENTS.md", string>>;
    };
  }

  private extractAssistantText(body: RuntimeMessageResult): string {
    const payloads = body.result?.result?.payloads ?? [];
    const payloadText = payloads
      .map((payload) => payload.text?.trim())
      .filter((text): text is string => Boolean(text))
      .join("\n");

    if (payloadText) return payloadText;

    const visible = body.result?.result?.finalAssistantVisibleText?.trim();
    if (visible) return visible;

    const raw = body.result?.result?.finalAssistantRawText?.trim();
    if (raw) return raw;

    throw new Error("Agent response empty");
  }

  private assertNotYielded(body: RuntimeMessageResult, agentId: string): void {
    const yielded = body.result?.result?.meta?.yielded;
    if (yielded) {
      throw new Error(`Agent \`${agentId}\` yielded (requires direct replies only)`);
    }
  }

  static extractJsonObject(text: string): string {
    const trimmed = text.trim();
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedMatch) {
      return fencedMatch[1].trim();
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return trimmed.slice(firstBrace, lastBrace + 1);
    }

    return trimmed;
  }
}
