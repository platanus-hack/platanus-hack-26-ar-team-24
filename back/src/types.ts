import { z } from "zod";

export const userProfileSchema = z.object({
  name: z.string().min(1),
  age: z.union([z.string(), z.number()]).optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  personal: z.record(z.string(), z.unknown()).default({}),
  social: z.record(z.string(), z.unknown()).default({}),
  professional: z.record(z.string(), z.unknown()).default({}),
  extra: z.record(z.string(), z.unknown()).default({})
});

export const graderProfileSchema = z.object({
  overallScore: z.number().min(0).max(1),
  personalScore: z.number().min(0).max(1),
  socialScore: z.number().min(0).max(1),
  professionalScore: z.number().min(0).max(1),
  summary: z.string().min(1),
  personalitySummary: z.string().min(1),
  strengths: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  conversationStyle: z.string().min(1),
  values: z.array(z.string()).default([])
});

export const judgeDecisionSchema = z.object({
  done: z.boolean(),
  score: z.number().min(0).max(1),
  outcome: z.enum(["match", "no_match", "continue"]),
  summary: z.string().min(1),
  sharedInterests: z.array(z.string()).default([]),
  reasons: z.array(z.string()).default([])
});

export const conversationConfigSchema = z.object({
  agentA: z.string().min(1),
  agentB: z.string().min(1),
  openingMessage: z.string().min(1),
  turnsPerAgent: z.coerce.number().int().min(1).max(5).default(3),
  maxRounds: z.coerce.number().int().min(1).max(10).default(5),
  thinking: z.enum(["off", "minimal", "low", "medium", "high"]).default("minimal")
});

export const matchmakingRequestSchema = z.object({
  purpose: z.string().min(1),
  turnsPerAgent: z.coerce.number().int().min(1).max(5).default(2),
  maxRounds: z.coerce.number().int().min(1).max(10).default(3),
  thinking: z.enum(["off", "minimal", "low", "medium", "high"]).default("minimal"),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  minScore: z.number().min(0).max(1).default(0)
});

export const profiledAgentCreateSchema = z.object({
  id: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9][a-z0-9-_]*$/)
    .optional(),
  user: userProfileSchema
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type GraderProfile = z.infer<typeof graderProfileSchema>;
export type JudgeDecision = z.infer<typeof judgeDecisionSchema>;
export type ConversationConfig = z.infer<typeof conversationConfigSchema>;
export type MatchmakingRequest = z.infer<typeof matchmakingRequestSchema>;
export type ProfiledAgentCreate = z.infer<typeof profiledAgentCreateSchema>;

export type TranscriptMessage = {
  speaker: string;
  text: string;
  round: number;
  turn: number;
};

export type RuntimeMessageResult = {
  result?: {
    status?: string;
    summary?: string;
    result?: {
      payloads?: Array<{
        text?: string | null;
      }>;
      finalAssistantVisibleText?: string;
      finalAssistantRawText?: string;
      meta?: {
        yielded?: boolean;
      };
    };
  };
};
