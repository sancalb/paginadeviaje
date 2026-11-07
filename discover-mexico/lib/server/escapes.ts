import { destinations, type Destination, type Localized } from "../../data/content";
import { getPromotions } from "./promotions";

const mexicoSlugs = new Set([
  "cancun",
  "oaxaca",
  "puerto-vallarta",
  "mexico-city",
  "guadalajara",
  "tequila",
  "riviera-maya",
  "los-cabos",
]);
const ideaSlugs = ["cancun", "oaxaca", "puerto-vallarta"] as const;
type PublicPromotion = Awaited<ReturnType<typeof getPromotions>>[number];
type VerifiedPromotion = PublicPromotion & {
  inclusions: { en: string[]; es: string[] };
  conditions: Localized;
  verifiedAt: string;
};

export type Escape =
  | { kind: "idea"; destination: Destination }
  | {
      kind: "promotion";
      destination: Destination;
      promotion: VerifiedPromotion;
    };

function isVerified(
  promotion: PublicPromotion,
  now: number,
): promotion is VerifiedPromotion {
  return (
    /^[a-z0-9-]{1,80}$/.test(promotion.id) &&
    promotion.state === "published" &&
    promotion.destinations.length > 0 &&
    promotion.destinations.every((slug) => mexicoSlugs.has(slug)) &&
    !!promotion.inclusions?.en.length &&
    !!promotion.inclusions?.es.length &&
    !!promotion.conditions?.en.trim() &&
    !!promotion.conditions?.es.trim() &&
    !!promotion.verifiedAt &&
    Date.parse(promotion.verifiedAt) <= now &&
    Date.parse(promotion.expiresAt) > now &&
    Date.parse(promotion.price.validUntil) > now &&
    promotion.price.currency === "USD" &&
    promotion.price.basis === "group-total" &&
    Number.isSafeInteger(promotion.price.totalUsdMinor) &&
    promotion.price.totalUsdMinor >= 0
  );
}

export async function getEscapes(path = process.env.PROMOTIONS_PATH): Promise<Escape[]> {
  let promotions: PublicPromotion[];
  try {
    promotions = await getPromotions(path);
  } catch {
    // An unavailable feed must not turn editorial ideas into priced offers.
    promotions = [];
  }

  const cards: Escape[] = [];
  const used = new Set<string>();
  const now = Date.now();
  for (const promotion of promotions) {
    if (!isVerified(promotion, now)) continue;
    const destination = destinations.find(
      (item) => item.slug === promotion.destinations[0],
    );
    if (!destination || used.has(destination.slug)) continue;
    cards.push({ kind: "promotion", destination, promotion });
    used.add(destination.slug);
    if (cards.length === 3) return cards;
  }

  for (const slug of ideaSlugs) {
    if (used.has(slug)) continue;
    const destination = destinations.find((item) => item.slug === slug);
    if (!destination) continue;
    cards.push({ kind: "idea", destination });
    if (cards.length === 3) break;
  }
  return cards;
}
