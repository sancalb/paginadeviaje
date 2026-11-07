import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { t, type Locale } from "../data/content";
import { href } from "../lib/routes";
import { getEscapes } from "../lib/server/escapes";

export async function Escapes({ locale }: { locale: Locale }) {
  const cards = await getEscapes();
  const en = locale === "en";
  const date = new Intl.DateTimeFormat(en ? "en-US" : "es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
  const money = new Intl.NumberFormat(en ? "en-US" : "es-MX", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "code",
  });

  return (
    <section className="section escapes-section" aria-labelledby="escapes-title">
      <div className="wrap">
        <div className="section-title">
          <h2 id="escapes-title">
            {en ? "Featured Mexico Escapes" : "Escapadas destacadas por M\u00e9xico"}
          </h2>
        </div>
        <div className="escapes-grid">
          {cards.map((card) => {
            const destination = card.destination;
            const promotion = card.kind === "promotion" ? card.promotion : undefined;
            const name = t(destination.name, locale);
            const target = `${href(locale, "plan")}?${new URLSearchParams(
              promotion
                ? { destination: destination.slug, promotion: promotion.id }
                : { destination: destination.slug },
            )}`;
            return (
              <article className="escapes-card" key={destination.slug}>
                <Image
                  className="escapes-image"
                  src={`/media/${destination.slug}.webp`}
                  alt={t(destination.imageAlt, locale)}
                  width={960}
                  height={640}
                  sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                />
                <div className="promo-copy">
                  <span className="escapes-label">
                    {promotion
                      ? en
                        ? "Verified promotion"
                        : "Promoci\u00f3n verificada"
                      : en
                        ? "Trip idea \u00b7 Quote on request"
                        : "Idea de viaje \u00b7 Cotiza a tu medida"}
                  </span>
                  <h3>{name}</h3>
                  <p>{t(destination.tagline, locale)}</p>
                  {promotion && (
                    <div className="escapes-details">
                      <p className="escapes-price">
                        <strong>{money.format(promotion.price.totalUsdMinor / 100)}</strong>
                        {" \u00b7 "}
                        {en ? "Group total" : "Total del grupo"}
                      </p>
                      <p>
                        {promotion.price.occupancy.adults} {en ? "adults" : "adultos"}
                        {" \u00b7 "}
                        {promotion.price.occupancy.childrenAges.length} {en ? "children" : "menores"}
                        {" \u00b7 "}
                        {promotion.price.occupancy.rooms} {en ? "rooms" : "habitaciones"}
                      </p>
                      <ul className="escapes-inclusions" aria-label={en ? "Includes" : "Incluye"}>
                        {promotion.inclusions[locale].map((inclusion, index) => (
                          <li key={index}>{inclusion}</li>
                        ))}
                      </ul>
                      <p className="escapes-conditions">{t(promotion.conditions, locale)}</p>
                      <p>
                        {en ? "Verified: " : "Verificada: "}
                        <time dateTime={promotion.verifiedAt}>
                          {date.format(new Date(promotion.verifiedAt))} UTC
                        </time>
                      </p>
                      <p>
                        {en ? "Price valid until: " : "Precio vigente hasta: "}
                        <time dateTime={promotion.price.validUntil}>
                          {date.format(new Date(promotion.price.validUntil))} UTC
                        </time>
                      </p>
                      <p className="escapes-notice">
                        {en
                          ? "Taxes and mandatory fees included. Indicative price; requires revalidation."
                          : "Incluye impuestos y cargos obligatorios. Precio indicativo; requiere revalidaci\u00f3n."}
                      </p>
                    </div>
                  )}
                  <Link className="button button-primary" href={target}>
                    {promotion
                      ? en ? "Request this trip" : "Cotiza este viaje"
                      : en ? `Plan my ${name} trip` : `Planea mi viaje a ${name}`}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
