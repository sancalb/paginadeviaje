import type { Locale } from "../data/content";
import { getTourIdentityBySlug } from "../data/tour-identities";
export const experienceSection = { en: "experiences", es: "experiencias" } as const;
export const sections = {
  destinations: { en: "destinations", es: "destinos" },
  experiences: experienceSection,
  tours: { en: "mexico-tours", es: "circuitos" },
  plan: { en: "tailor-made-trips", es: "viajes-personalizados" },
  about: { en: "about-us", es: "nosotros" },
  contact: { en: "contact", es: "contacto" },
  privacy: { en: "privacy", es: "privacidad" },
  terms: { en: "terms", es: "terminos" },
  travel: { en: "travel-information", es: "informacion-para-viajar" },
} as const;
export type Section = keyof typeof sections;
export const href = (locale: Locale, section?: Section, slug?: string) =>
  `/${locale}${section ? `/${sections[section][locale]}` : ""}${slug ? `/${slug}` : ""}`;
export const siteUrl = () =>
  (process.env.SITE_URL || "https://discover.deviaje.mx").replace(/\/$/, "");
export function alternatePath(path: string) {
  const parts = path.split("/").filter(Boolean);
  const locale: Locale = parts[0] === "es" ? "es" : "en";
  const other = locale === "en" ? "es" : "en";
  if (parts[1] === "photo-credits") return `/${other}/photo-credits`;
  if (parts[1] === "tours") {
    const tour = getTourIdentityBySlug(locale, parts[2] || "");
    return tour
      ? `/${other}/tours/${tour.slugs[other]}`
      : href(other, "tours");
  }
  const section = (Object.keys(sections) as Section[]).find(
    (key) => sections[key][locale] === parts[1],
  );
  return href(other, section, parts[2]);
}
