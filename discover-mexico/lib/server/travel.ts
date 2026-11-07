// Publication allowlist, not arbitrary visitor text. Keep in sync when destinations are approved.
export const destinationSlugs = [
  "mexico-city",
  "guadalajara",
  "tequila",
  "puerto-vallarta",
  "cancun",
  "riviera-maya",
  "oaxaca",
  "los-cabos",
] as const;
const destinations = new Set<string>(destinationSlugs);
export function safeDestinations(values: string[]) {
  return [...new Set(values.filter((value) => destinations.has(value)))];
}

const markets: Record<string, string> = {
  us: "US",
  usa: "US",
  "united states": "US",
  "estados unidos": "US",
  mx: "MX",
  mexico: "MX",
  méxico: "MX",
  ca: "CA",
  canada: "CA",
  canadá: "CA",
  gb: "GB",
  uk: "GB",
  "united kingdom": "GB",
  "reino unido": "GB",
  es: "ES",
  spain: "ES",
  españa: "ES",
  ar: "AR",
  argentina: "AR",
  co: "CO",
  colombia: "CO",
  br: "BR",
  brazil: "BR",
  brasil: "BR",
  fr: "FR",
  france: "FR",
  francia: "FR",
  de: "DE",
  germany: "DE",
  alemania: "DE",
};
export function safeMarket(country: string) {
  const key = country.trim().toLowerCase();
  return Object.hasOwn(markets, key) ? markets[key] : null;
}
