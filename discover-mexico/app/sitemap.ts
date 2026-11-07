import type { MetadataRoute } from "next";
import { destinations, journeys } from "../data/content";
import { mexicoExperiences } from "../data/mexico-experiences";
import { tourPackages } from "../data/tour-packages";
import { href, siteUrl, type Section } from "../lib/routes";
import { tourHref } from "../lib/tour-routes";
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: [Section | undefined, string | undefined][] = [
    [undefined, undefined],
    ...(
      [
        "destinations",
        "experiences",
        "tours",
        "plan",
        "about",
        "contact",
        "travel",
      ] as Section[]
    ).map((s) => [s, undefined] as [Section, undefined]),
    ...destinations.map((d) => ["destinations", d.slug] as [Section, string]),
    ...journeys.map((j) => ["tours", j.slug] as [Section, string]),
    ...mexicoExperiences.map((e) => ["experiences", e.slug] as [Section, string]),
  ];
  const existingEntries = entries.flatMap(([section, slug]) =>
    (["en", "es"] as const).map((locale) => ({
      url: siteUrl() + href(locale, section, slug),
      alternates: {
        languages: {
          en: siteUrl() + href("en", section, slug),
          es: siteUrl() + href("es", section, slug),
        },
      },
    })),
  );
  return [
    ...existingEntries,
    ...tourPackages.flatMap((tour) =>
      (["en", "es"] as const).map((locale) => ({
        url: siteUrl() + tourHref(locale, tour),
        alternates: {
          languages: {
            en: siteUrl() + tourHref("en", tour),
            es: siteUrl() + tourHref("es", tour),
          },
        },
      })),
    ),
  ];
}
