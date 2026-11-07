import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinations } from "../../../../data/content";
import {
  getTourPackageBySlug,
  tourPackages,
} from "../../../../data/tour-packages";
import { TourPackagePage } from "../../../../components/tour-package";
import { href, siteUrl } from "../../../../lib/routes";
import { tourHref } from "../../../../lib/tour-routes";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return tourPackages.flatMap((tour) =>
    (["en", "es"] as const).map((locale) => ({
      locale,
      slug: tour.slugs[locale],
    })),
  );
}

async function resolveTour(params: Props["params"]) {
  const { locale, slug } = await params;
  if (locale !== "en" && locale !== "es") notFound();
  const tour = getTourPackageBySlug(locale, slug);
  if (!tour) notFound();
  const destination = destinations.find((d) => d.slug === tour.destinationSlug);
  if (!destination) notFound();
  return { locale, tour, destination } as const;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tour, destination } = await resolveTour(params);
  const title = tour.seo.title[locale];
  const description = tour.seo.description[locale];
  const canonical = siteUrl() + tourHref(locale, tour);
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: {
        en: siteUrl() + tourHref("en", tour),
        es: siteUrl() + tourHref("es", tour),
        "x-default": siteUrl() + tourHref("en", tour),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: locale === "en" ? "en_US" : "es_MX",
      alternateLocale: locale === "en" ? "es_MX" : "en_US",
      images: destination.image
        ? [{
            url: new URL(destination.image, siteUrl() + "/").href,
            alt: destination.imageAlt[locale],
          }]
        : [],
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale, tour, destination } = await resolveTour(params);
  const canonical = siteUrl() + tourHref(locale, tour);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        "@id": canonical + "#trip",
        name: tour.name[locale],
        description: tour.seo.description[locale],
        identifier: tour.id,
        url: canonical,
        ...(destination.image
          ? { image: new URL(destination.image, siteUrl() + "/").href }
          : {}),
        itinerary: {
          "@type": "ItemList",
          itemListElement: tour.itinerary.map((day, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: day.title[locale],
            description: day.description[locale],
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": canonical + "#breadcrumbs",
        itemListElement: [
          {
            name: locale === "en" ? "Home" : "Inicio",
            item: siteUrl() + href(locale),
          },
          { name: tour.name[locale], item: canonical },
        ].map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          ...item,
        })),
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <TourPackagePage tour={tour} locale={locale} />
    </>
  );
}
