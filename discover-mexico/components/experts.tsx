import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "../data/content";
import { href } from "../lib/routes";
import {
  approvedExpertProfiles,
  type ExpertReview,
} from "../lib/server/experts";
import { Offices } from "./branches";

function ExpertQuote({ review, en }: { review: ExpertReview; en: boolean }) {
  const translation = en ? review.translation : undefined;
  return (
    <figure>
      <blockquote lang={translation ? "en" : "es"}>
        <p>{translation?.text ?? review.text}</p>
      </blockquote>
      {en && (
        <small>
          {translation ? "Translated from Spanish" : "Original Spanish"}
        </small>
      )}
      {translation && (
        <details>
          <summary>Read original Spanish</summary>
          <p lang="es">{review.text}</p>
        </details>
      )}
      <figcaption>
        {review.author && (
          <span>
            {review.author}
            {" \u00b7 "}
          </span>
        )}
        <a
          href={review.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          {en ? "Read on Google" : "Leer en Google"}
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}

export async function Experts({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const experts = await approvedExpertProfiles();
  const languageNames: Record<string, string> = en
    ? { en: "English", es: "Spanish" }
    : { en: "Ingl\u00e9s", es: "Espa\u00f1ol" };

  return (
    <section className="wrap section expert-section local-team" id="expertos">
      <div
        className="team-heading"
        style={{ gridColumn: "1 / -1", minWidth: 0 }}
      >
        <div>
          <p className="eyebrow">
            {en ? "Meet your local travel team" : "Conoce a tu equipo local"}
          </p>
          <h2>
            {en
              ? "Mexico is our home.\nYour trip is personal."
              : "México es nuestra casa.\nTu viaje es personal."}
          </h2>
        </div>
        <div>
          <p>
            {en
              ? "Behind deviaje.mx are the people you see in our Monterrey and Guadalajara offices. Tell us what you’re imagining, ask your questions and get to know the team who’ll help you plan it."
              : "Detrás de deviaje.mx están las personas que ves en nuestras oficinas de Monterrey y Guadalajara. Cuéntanos qué imaginas, haz tus preguntas y conoce al equipo que te ayudará a planearlo."}
          </p>
          <Link
            className="button button-secondary"
            href={href(locale, "contact")}
          >
            {en ? "Talk to your advisor" : "Habla con tu asesor"}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
      {experts.length > 0 && (
        <div
          className="three-columns"
          style={{ gridColumn: "1 / -1", minWidth: 0 }}
        >
          {experts.map((expert) => (
            <article
              key={expert.id}
              style={{ minWidth: 0, overflowWrap: "anywhere" }}
            >
              {expert.photoUrl && (
                <img
                  src={expert.photoUrl}
                  alt={expert.displayName}
                  width={240}
                  height={240}
                  loading="lazy"
                  decoding="async"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    aspectRatio: "1",
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              )}
              <h3>{expert.displayName}</h3>
              <p>
                {expert.languages
                  .map((language) => languageNames[language])
                  .join(" / ")}
              </p>
              {expert.reviewCount > 0 && (
                <p>
                  {expert.averageRating!.toLocaleString(
                    en ? "en-US" : "es-MX",
                    { maximumFractionDigits: 1 },
                  )}
                  /5
                  {" \u00b7 "}
                  {en
                    ? `${expert.reviewCount} Google ${expert.reviewCount === 1 ? "review" : "reviews"} mentioning this advisor in the available snapshot`
                    : `${expert.reviewCount} ${expert.reviewCount === 1 ? "rese\u00f1a de Google que menciona" : "rese\u00f1as de Google que mencionan"} a este asesor en los datos disponibles`}
                </p>
              )}
              {expert.quote && <ExpertQuote review={expert.quote} en={en} />}
              {expert.reviews.length > 1 && (
                <details>
                  <summary>
                    {en
                      ? "Reviews mentioning this advisor"
                      : "Rese\u00f1as que mencionan a este asesor"}
                  </summary>
                  <ul>
                    {expert.reviews
                      .filter((review) => review.url)
                      .map((review, index) => (
                        <li key={review.reviewId || `${review.url}-${index}`}>
                          <a
                            href={review.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {review.author ||
                              (en
                                ? "Google review"
                                : "Rese\u00f1a de Google")}{" "}
                            ({review.rating}/5)
                          </a>
                        </li>
                      ))}
                  </ul>
                </details>
              )}
            </article>
          ))}
        </div>
      )}
      <div id="sucursales" style={{ gridColumn: "1 / -1", minWidth: 0 }}>
        <Offices locale={locale} />
        <p className="team-photo-note">
          {en
            ? "Our real offices and the people behind your trip. Share your preferred language; we’ll confirm the advisor available to help."
            : "Nuestras oficinas reales y las personas detrás de tu viaje. Comparte tu idioma preferido; confirmaremos quién puede ayudarte."}
        </p>
      </div>
    </section>
  );
}
