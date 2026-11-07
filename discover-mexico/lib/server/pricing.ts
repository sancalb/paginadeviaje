import { z } from "zod";
import { ApiError } from "./http";

const instant = z.string().datetime({ offset: true });
const money = z.number().int().min(0).max(1_000_000_000);
export const occupancySchema = z
  .object({
    adults: z.number().int().min(1).max(50),
    childrenAges: z.array(z.number().int().min(0).max(17)).max(20),
    rooms: z.number().int().min(1).max(30),
  })
  .strict();

export const pricingInputSchema = z
  .object({
    occupancy: occupancySchema,
    components: z
      .array(
        z
          .object({
            kind: z.enum(["flight", "hotel", "transfer", "activity"]),
            flightScope: z.enum(["domestic", "international"]).optional(),
            amountMinor: money,
            currency: z.enum(["USD", "MXN", "CAD", "EUR", "GBP"]),
            basis: z.literal("group-total"),
            includesSupplierTaxes: z.literal(true),
            occupancy: occupancySchema,
            validUntil: instant,
            revalidatedAt: instant,
          })
          .strict(),
      )
      .min(2)
      .max(30),
    fx: z
      .object({
        base: z.literal("USD"),
        source: z.string().min(1).max(120),
        asOf: instant,
        expiresAt: instant,
        usdPerUnit: z.record(
          z.string(),
          z.number().finite().positive().max(1000),
        ),
      })
      .strict(),
    marginRate: z.number().min(0).max(0.6),
    taxRate: z.number().min(0).max(1),
    mandatoryFeesUsdMinor: money,
    validUntil: instant,
    maxRevalidationAgeSeconds: z.number().int().min(1).max(3600).default(900),
  })
  .strict();

export type PricingInput = z.infer<typeof pricingInputSchema>;

export function priceUsd(input: PricingInput, now = Date.now()) {
  const result = pricingInputSchema.safeParse(input);
  if (!result.success) throw new ApiError(422, "PRICING_INVALID");
  const value = result.data;
  const occupancy = JSON.stringify(value.occupancy);
  const expiry = Math.min(
    Date.parse(value.validUntil),
    Date.parse(value.fx.expiresAt),
    ...value.components.map((component) => Date.parse(component.validUntil)),
    ...value.components.map(
      (component) =>
        Date.parse(component.revalidatedAt) +
        value.maxRevalidationAgeSeconds * 1000,
    ),
  );
  if (
    expiry <= now ||
    Date.parse(value.fx.asOf) > now ||
    Date.parse(value.fx.asOf) >= Date.parse(value.fx.expiresAt)
  ) {
    throw new ApiError(422, "PRICE_EXPIRED");
  }
  if (
    !value.components.some((item) => item.kind === "flight") ||
    !value.components.some((item) => item.kind === "hotel")
  ) {
    throw new ApiError(422, "PACKAGE_COMPONENTS_REQUIRED");
  }
  let costUsdMinor = 0;
  for (const component of value.components) {
    if (JSON.stringify(component.occupancy) !== occupancy)
      throw new ApiError(422, "OCCUPANCY_MISMATCH");
    if (Date.parse(component.revalidatedAt) > now)
      throw new ApiError(422, "REVALIDATION_INVALID");
    const rate =
      component.currency === "USD"
        ? 1
        : value.fx.usdPerUnit[component.currency];
    if (!rate) throw new ApiError(422, "FX_RATE_REQUIRED");
    costUsdMinor += Math.ceil(component.amountMinor * rate);
  }
  const subtotalUsdMinor = Math.ceil(
    (costUsdMinor + value.mandatoryFeesUsdMinor) / (1 - value.marginRate),
  );
  const taxUsdMinor = Math.ceil(subtotalUsdMinor * value.taxRate);
  const totalUsdMinor = subtotalUsdMinor + taxUsdMinor;
  if (!Number.isSafeInteger(totalUsdMinor) || totalUsdMinor > 10_000_000_000)
    throw new ApiError(422, "PRICE_OUT_OF_RANGE");
  return {
    currency: "USD" as const,
    basis: "group-total" as const,
    occupancy: value.occupancy,
    costUsdMinor,
    mandatoryFeesUsdMinor: value.mandatoryFeesUsdMinor,
    marginRate: value.marginRate,
    taxRate: value.taxRate,
    subtotalUsdMinor,
    taxUsdMinor,
    totalUsdMinor,
    perPersonUsdMinor: Math.ceil(
      totalUsdMinor /
        (value.occupancy.adults + value.occupancy.childrenAges.length),
    ),
    fx: value.fx,
    validUntil: new Date(expiry).toISOString(),
    requiresRevalidation: true as const,
    indicative: true as const,
  };
}
