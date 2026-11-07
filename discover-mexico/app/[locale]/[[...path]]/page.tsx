import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinations, journeys, t, type Locale } from "../../../data/content";
import { mexicoExperiences } from "../../../data/mexico-experiences";
import {
  ExperienceDetail,
  ExperienceListing,
} from "../../../components/featured-experiences";
import { sections, href, siteUrl, type Section } from "../../../lib/routes";
import {
  Home,
  Listing,
  PlanPage,
  About,
  Contact,
  Information,
} from "../../../components/pages";
import {
  DestinationDetail,
  JourneyDetail,
} from "../../../components/editorial";
type Props = {
  params: Promise<{ locale: string; path?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
function resolve(locale: Locale, path: string[] = []) {
  const section = (Object.keys(sections) as Section[]).find(
    (s) => sections[s][locale] === path[0],
  );
  return { section, slug: path[1] };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, path = [] } = await params;
  if (raw !== "en" && raw !== "es") notFound();
  const locale: Locale = raw === "es" ? "es" : "en";
  const { section, slug } = resolve(locale, path);
  if (path.length > 2 || (path.length && !section)) notFound();
  const experience = section === "experiences"
    ? mexicoExperiences.find((e) => e.slug === slug)
    : undefined;
  if (section === "experiences" && slug && !experience) notFound();
  const item =
    section === "destinations"
      ? destinations.find((d) => d.slug === slug)
      : section === "tours"
        ? journeys.find((j) => j.slug === slug)
        : experience;
  const title = item
    ? t(item.name, locale)
    : !section
      ? locale === "en" ? "Discover Mexico Beyond the Ordinary" : "Descubre México más allá de lo habitual"
      : {
          destinations:
            locale === "en"
              ? "Explore Mexico destinations"
              : "Explora destinos de México",
          experiences:
            locale === "en" ? "Mexico experiences" : "Experiencias en México",
          tours:
            locale === "en"
              ? "Mexico tours & multi-city journeys"
              : "Circuitos por México",
          plan:
            locale === "en"
              ? "Tailor-made Mexico vacations"
              : "Viajes personalizados por México",
          about:
            locale === "en"
              ? "A Mexican agency, real people"
              : "Una agencia mexicana, personas reales",
          contact:
            locale === "en" ? "Contact our team" : "Contacta a nuestro equipo",
          privacy: locale === "en" ? "Privacy" : "Privacidad",
          terms: locale === "en" ? "Terms" : "Términos",
          travel:
            locale === "en"
              ? "Mexico travel information"
              : "Información para viajar a México",
        }[section];
  const description = item
    ? t(item.tagline, locale)
    : section === "experiences"
      ? locale === "en"
        ? "Three editorial Mexico experiences: Cancún, Guadalajara and Tequila, and Mexico City. Flexible ideas to shape around your interests, not scheduled departures."
        : "Tres experiencias editoriales en México: Cancún, Guadalajara y Tequila, y Ciudad de México. Ideas flexibles según tus intereses, no salidas programadas."
    : locale === "en"
      ? "Discover Mexico with a Mexican travel agency. Culture, beaches and personal multi-city journeys, planned with you."
      : "Descubre México con una agencia mexicana. Cultura, playas y circuitos personalizados, planeados contigo.";
  return {
    title,
    description,
    alternates: {
      canonical: href(locale, section, slug),
      languages: {
        en: href("en", section, slug),
        es: href("es", section, slug),
        "x-default": href("en", section, slug),
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl()}${href(locale, section, slug)}`,
      locale: locale === "en" ? "en_US" : "es_MX",
      type: "website",
      images: [
        `/media/${section === "experiences" ? experience?.imageSlug || mexicoExperiences[0].imageSlug : section === "destinations" && slug ? slug : "oaxaca"}.webp`,
      ],
    },
    robots:
      section === "privacy" || section === "terms"
        ? { index: false, follow: true }
        : undefined,
  };
}
export default async function Page({ params, searchParams }: Props) {
  const { locale: raw, path = [] } = await params;
  if (raw !== "en" && raw !== "es") notFound();
  const locale = raw as Locale;
  const { section, slug } = resolve(locale, path);
  if (path.length > 2 || (path.length && !section)) notFound();
  if (!section) return <Home locale={locale} />;
  if (section === "experiences") {
    if (!slug) return <ExperienceListing locale={locale} />;
    const experience = mexicoExperiences.find((e) => e.slug === slug);
    if (!experience) notFound();
    return <ExperienceDetail experience={experience} locale={locale} />;
  }
  if (section === "destinations" || section === "tours") {
    if (!slug) return <Listing locale={locale} kind={section} />;
    if (section === "destinations") {
      const d = destinations.find((d) => d.slug === slug);
      if (!d) notFound();
      return <DestinationDetail destination={d} locale={locale} />;
    }
    const j = journeys.find((j) => j.slug === slug);
    if (!j) notFound();
    return <JourneyDetail journey={j} locale={locale} />;
  }
  if (slug) notFound();
  if (section === "plan") {
    const query = await searchParams;
    const initial = Object.fromEntries(
      Object.entries(query).map(([k, v]) => [
        k,
        typeof v === "string" ? v : undefined,
      ]),
    );
    return <PlanPage locale={locale} initial={initial} />;
  }
  if (section === "about") return <About locale={locale} />;
  if (section === "contact") return <Contact locale={locale} />;
  return <Information locale={locale} kind={section} />;
}
