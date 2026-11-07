import { z } from "zod";
import type { Inquiry } from "./inquiry-schema";
import { ApiError } from "./http";
import { safeDestinations, safeMarket } from "./travel";

const ruleSchema = z
  .object({
    tags: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
    responsibleUserId: z.number().int().positive(),
    pipelineId: z.number().int().positive(),
    statusId: z.number().int().positive(),
    task: z
      .object({
        typeId: z.number().int().positive(),
        dueInMinutes: z.number().int().min(1).max(10080),
      })
      .strict(),
  })
  .strict();

export const kommoRulesSchema = z
  .object({ en: ruleSchema, es: ruleSchema })
  .strict();
export type KommoRules = z.infer<typeof kommoRulesSchema>;

export function kommoRules(raw: string | undefined): KommoRules {
  try {
    return kommoRulesSchema.parse(JSON.parse(raw || ""));
  } catch {
    throw new ApiError(503, "KOMMO_RULES_REQUIRED");
  }
}

export function kommoCommand(
  inquiry: Inquiry,
  rules: KommoRules,
  requestId: string,
) {
  const rule = rules[inquiry.preferredLanguage];
  const market = safeMarket(inquiry.country);
  return {
    provider: "kommo" as const,
    externalId: requestId,
    tags: [
      ...new Set([
        ...rule.tags,
        "discover-mexico",
        `language:${inquiry.preferredLanguage}`,
        ...safeDestinations(inquiry.destinations).map(
          (slug) => `destination:${slug}`,
        ),
        ...(market ? [`market:${market}`] : []),
      ]),
    ],
    responsibleUserId: rule.responsibleUserId,
    pipelineId: rule.pipelineId,
    statusId: rule.statusId,
    task: {
      ...rule.task,
      text: "Follow up Discover Mexico inquiry",
      responsibleUserId: rule.responsibleUserId,
    },
  };
}
