export type ManagedAgent = {
  id: string;
  workspace: string;
  model?: string;
  agentDir?: string;
  skills?: string[];
  bind?: string[];
  default: boolean;
};

export type OpenClawAgentsFile = {
  defaults: {
    workspace: string;
    skipBootstrap?: boolean;
    repoRoot?: string;
  };
  list: ManagedAgent[];
};

export type OpenClawConfigFile = {
  $schema?: string;
  gateway: {
    mode: "local";
    bind: string;
    port: number;
    auth: {
      mode: "token";
      token: string;
    };
  };
  agents: {
    defaults: {
      workspace: string;
      skipBootstrap?: boolean;
      repoRoot?: string;
    };
    list: ManagedAgent[];
  };
  tools?: {
    agentToAgent?: {
      enabled: boolean;
      allow: string[];
    };
    sessions?: {
      visibility: "self" | "tree" | "agent" | "all";
    };
  };
  models?: Record<string, unknown>;
};
