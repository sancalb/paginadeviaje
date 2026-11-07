import type { Locale } from "../data/content";
import type { TourPackage } from "../data/tour-packages";
import { href } from "./routes";

export function tourHref(locale: Locale, tour: Pick<TourPackage, "slugs">): string {
  return `/${locale}/tours/${tour.slugs[locale]}`;
}

export function tourQuoteHref(
  locale: Locale,
  tour: Pick<TourPackage, "id" | "destinationSlug">,
  category?: string,
): string {
  const query = new URLSearchParams({
    package: tour.id,
    destination: tour.destinationSlug,
  });
  if (category) query.set("hotelCategory", category);
  query.set("language", locale);
  return `${href(locale, "plan")}?${query}`;
}
