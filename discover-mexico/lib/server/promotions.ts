import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { ApiError } from "./http";
import { priceUsd, pricingInputSchema } from "./pricing";

export const promotionStates = [
  "draft",
  "review",
  "approved",
  "published",
  "expired",
] as const;
export const promotionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{1,80}$/),
    title: z.string().min(1).max(200),
    destinations: z.array(z.string().min(1).max(100)).min(1).max(12),
    state: z.enum(promotionStates),
    pricing: pricingInputSchema,
    approvedBy: z.string().min(1).max(100).optional(),
    approvedAt: z.string().datetime({ offset: true }).optional(),
    publishedAt: z.string().datetime({ offset: true }).optional(),
    expiresAt: z.string().datetime({ offset: true }),
    inclusions: z
      .object({
        en: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
        es: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
      })
      .strict()
      .optional(),
    conditions: z
      .object({
        en: z.string().trim().min(1).max(2000),
        es: z.string().trim().min(1).max(2000),
      })
      .strict()
      .optional(),
    verifiedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
export type Promotion = z.infer<typeof promotionSchema>;
type State = Promotion["state"];
const transitions: Record<State, readonly State[]> = {
  draft: ["review", "expired"],
  review: ["draft", "approved", "expired"],
  approved: ["review", "published", "expired"],
  published: ["expired"],
  expired: [],
};

export function transitionPromotion(
  promotion: Promotion,
  next: State,
  actor: { id: string; canApprove: boolean },
  now = Date.now(),
): Promotion {
  const value = promotionSchema.parse(promotion);
  if (!actor.id || !transitions[value.state].includes(next))
    throw new ApiError(409, "PROMOTION_TRANSITION_INVALID");
  const updated = { ...value, state: next };
  if (["approved", "published"].includes(next)) {
    if (!actor.canApprove)
      throw new ApiError(403, "PROMOTION_APPROVER_REQUIRED");
    priceUsd(value.pricing, now);
    if (Date.parse(value.expiresAt) <= now)
      throw new ApiError(409, "PROMOTION_EXPIRED");
  }
  if (next === "approved") {
    updated.approvedBy = actor.id;
    updated.approvedAt = new Date(now).toISOString();
  }
  if (next === "published") {
    if (
      !value.approvedBy ||
      !value.approvedAt ||
      Date.parse(value.approvedAt) > now
    )
      throw new ApiError(409, "PROMOTION_APPROVAL_REQUIRED");
    updated.publishedAt = new Date(now).toISOString();
  }
  if (next === "review" || next === "draft") {
    delete updated.approvedBy;
    delete updated.approvedAt;
    delete updated.publishedAt;
  }
  return updated;
}

export function publishedPromotions(
  records: unknown[],
  now = Date.now(),
  options: { allowInternationalFlights?: boolean } = {},
) {
  return records.flatMap((record) => {
    const parsed = promotionSchema.safeParse(record);
    if (!parsed.success) return [];
    const value = parsed.data;
    if (
      value.state !== "published" ||
      !value.approvedBy ||
      !value.approvedAt ||
      !value.publishedAt ||
      Date.parse(value.approvedAt) > Date.parse(value.publishedAt) ||
      Date.parse(value.publishedAt) > now ||
      Date.parse(value.expiresAt) <= now
    )
      return [];
    // Initial packages allow only explicitly domestic flights unless authorized.
    if (
      value.pricing.components.some(
        (component) =>
          component.kind === "flight" &&
          component.flightScope !== "domestic" &&
          !(
            component.flightScope === "international" &&
            options.allowInternationalFlights === true
          ),
      )
    )
      return [];
    try {
      const quote = priceUsd(value.pricing, now);
      return [
        {
          id: value.id,
          title: value.title,
          destinations: value.destinations,
          state: "published" as const,
          expiresAt: value.expiresAt,
          ...(value.inclusions && { inclusions: value.inclusions }),
          ...(value.conditions && { conditions: value.conditions }),
          ...(value.verifiedAt && { verifiedAt: value.verifiedAt }),
          price: {
            currency: quote.currency,
            basis: quote.basis,
            totalUsdMinor: quote.totalUsdMinor,
            perPersonUsdMinor: quote.perPersonUsdMinor,
            occupancy: quote.occupancy,
            taxUsdMinor: quote.taxUsdMinor,
            mandatoryFeesUsdMinor: quote.mandatoryFeesUsdMinor,
            validUntil: new Date(
              Math.min(
                Date.parse(quote.validUntil),
                Date.parse(value.expiresAt),
              ),
            ).toISOString(),
            requiresRevalidation: true,
            indicative: true,
          },
        },
      ];
    } catch {
      return [];
    }
  });
}

export async function getPromotions(path = process.env.PROMOTIONS_PATH) {
  if (!path) return [];
  // No mutations or automatic state changes: expiration is enforced again on every read.
  const raw = await readFile(resolve(/* turbopackIgnore: true */ path), "utf8");
  if (Buffer.byteLength(raw) > 1024 * 1024)
    throw new ApiError(503, "PROMOTIONS_INVALID");
  const records: unknown = JSON.parse(raw);
  if (!Array.isArray(records) || records.length > 1000)
    throw new ApiError(503, "PROMOTIONS_INVALID");
  return publishedPromotions(records, Date.now(), {
    allowInternationalFlights: process.env.ALLOW_INTERNATIONAL_FLIGHTS === "true",
  });
}
