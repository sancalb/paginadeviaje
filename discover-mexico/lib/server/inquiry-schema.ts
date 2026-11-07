import { z } from "zod";
import { destinationSlugs, safeDestinations } from "./travel";

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value));
const required = (max: number) => text(max).refine((value) => value.length > 0);
const day = text(10).default("");

export function isDay(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

export const inquirySchema = z
  .object({
    locale: z.enum(["en", "es"]),
    destinations: z.array(z.enum(destinationSlugs)).min(1).max(12),
    origin: text(120).default(""),
    dates: z
      .object({ mode: z.enum(["flexible", "exact"]), start: day, end: day })
      .strict()
      .superRefine((value, ctx) => {
        if (
          (value.start && !isDay(value.start)) ||
          (value.end && !isDay(value.end)) ||
          (value.mode === "exact" &&
            (!isDay(value.start) || !isDay(value.end))) ||
          (value.start && value.end && value.end <= value.start)
        ) {
          ctx.addIssue({ code: "custom", message: "Invalid travel dates" });
        }
      }),
    adults: z.number().int().min(1).max(50),
    childrenAges: z.array(z.number().int().min(0).max(17)).max(20),
    style: z.enum(["essential", "comfort", "premium"]),
    interests: z.array(required(100)).max(20),
    budget: z.enum([
      "discuss",
      "under-1000",
      "1000-2000",
      "2000-4000",
      "4000+",
    ]),
    name: required(120),
    country: required(80),
    email: z.string().trim().max(254).email(),
    phone: z
      .string()
      .trim()
      .min(6)
      .max(32)
      .regex(/^\+?[\d\s().-]+$/),
    preferredLanguage: z.enum(["en", "es"]),
    comments: text(2000).default(""),
    consent: z.literal(true),
    website: text(200).default(""),
    startedAt: z.number().int().positive(),
  })
  .strict();

export type Inquiry = z.infer<typeof inquirySchema>;

export function travelContext(inquiry: Inquiry, requestId: string) {
  const en = inquiry.locale === "en";
  const dates =
    inquiry.dates.mode === "exact"
      ? `${inquiry.dates.start} / ${inquiry.dates.end}`
      : en ? "flexible" : "flexibles";
  const origin = /^[A-Z]{3}$/.test(inquiry.origin.trim().toUpperCase())
    ? ` | ${en ? "origin" : "origen"}: ${inquiry.origin.trim().toUpperCase()}`
    : "";
  // Only known slugs and IATA-shaped origins; no arbitrary free text or contact fields.
  return `Discover Mexico | ${en ? "request" : "solicitud"}: ${requestId} | ${en ? "language" : "idioma"}: ${inquiry.preferredLanguage === "en" ? en ? "English" : "inglés" : en ? "Spanish" : "español"} | ${en ? "destinations" : "destinos"}: ${safeDestinations(inquiry.destinations).join(", ")}${origin} | ${en ? "dates" : "fechas"}: ${dates} | ${en ? "adults" : "adultos"}: ${inquiry.adults} | ${en ? "children" : "menores"}: ${inquiry.childrenAges.length}`;
}
