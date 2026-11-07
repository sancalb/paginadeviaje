import type { Metadata } from "next";
import { notFound } from "next/navigation";
import credits from "../../../data/image-credits.json";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "en" && locale !== "es") notFound();
  return {
    title: locale === "en" ? "Photo credits" : "Créditos fotográficos",
    description: locale === "en"
      ? "Photography sources, authors and licenses for Discover Mexico by deviaje.mx."
      : "Fuentes, autores y licencias de las fotografías de Discover Mexico by deviaje.mx.",
    alternates: {
      canonical: `/${locale}/photo-credits`,
      languages: {
        en: "/en/photo-credits",
        es: "/es/photo-credits",
        "x-default": "/en/photo-credits",
      },
    },
  };
}
export default async function Credits({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "en" && locale !== "es") notFound();
  return (
    <section className="wrap section information">
      <p className="eyebrow">Discover Mexico</p>
      <h1>{locale === "en" ? "Photo credits" : "Créditos fotográficos"}</h1>
      <p>
        {locale === "en"
          ? "Destination photography sourced from Wikimedia Commons. Images resized and converted to WebP."
          : "Fotografías de destinos de Wikimedia Commons. Imágenes redimensionadas y convertidas a WebP."}
      </p>
      {credits.images.map((image) => (
        <article key={image.file}>
          <h2>{image.destination}</h2>
          <p>
            {image.author} ·{" "}
            <a
              className="text-link"
              href={image.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {image.title}
            </a>{" "}
            ·{" "}
            <a
              className="text-link"
              href={image.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {image.license}
            </a>
          </p>
          <p>{image.modifications}</p>
        </article>
      ))}
    </section>
  );
}
