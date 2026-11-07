import Link from "next/link";
import { RouteMap } from "./route-map";
import { PhotoGallery, type GalleryItem } from "./photo-gallery";
import galleryData from "../data/gallery.json";
import { itineraryLocations } from "../data/travel-editorial";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, MapPin, Check } from "lucide-react";
import {
  destinations,
  journeys,
  t,
  type Destination,
  type Journey,
  type Locale,
} from "../data/content";
import { href } from "../lib/routes";

const gallery: (GalleryItem & { destination: string })[] = galleryData;

export function Photo({
  slug,
  alt,
  className = "",
  priority = false,
}: {
  slug: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (!destinations.some((d) => d.slug === slug))
    return (
      <div className={`photo ${className}`}>
        <span className="image-placeholder">{alt}</span>
      </div>
    );
  return (
    <div className={`photo ${className}`}>
      <Image
        src={`/media/${slug}.webp`}
        alt={alt}
        fill
        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 60vw, 50vw"
        priority={priority}
      />
    </div>
  );
}
export function SectionTitle({
  locale,
  label,
  title,
  link,
}: {
  locale: Locale;
  label: string;
  title: string;
  link?: "destinations" | "tours";
}) {
  return (
    <div className="section-title">
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
      </div>
      {link && (
        <Link className="text-link" href={href(locale, link)}>
          {locale === "en" ? "Explore all" : "Explorar todos"}
          <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}
export function DestinationTile({
  destination: d,
  locale,
  large = false,
}: {
  destination: Destination;
  locale: Locale;
  large?: boolean;
}) {
  return (
    <Link
      className={`destination-tile destination-card ${large ? "large is-featured" : ""}`}
      href={href(locale, "destinations", d.slug)}
    >
      <Photo slug={d.slug} alt={t(d.imageAlt, locale)} />
      <div className="destination-content">
        <span>{t(d.region, locale)}</span>
        <h3>{t(d.name, locale)}</h3>
        <p>{t(d.tagline, locale)}</p>
        <span className="destination-arrow" aria-hidden="true">
          <ArrowUpRight size={20} />
        </span>
      </div>
    </Link>
  );
}
export function JourneyCard({
  journey: j,
  locale,
}: {
  journey: Journey;
  locale: Locale;
}) {
  const en = locale === "en";
  const firstDestination = destinations.find(
    (d) => d.slug === j.destinations[0],
  );
  return (
    <article className="journey-card">
      <Link href={href(locale, "tours", j.slug)}>
        <div className="journey-card-visual">
          <Photo
            slug={j.destinations[0]}
            alt={
              firstDestination
                ? t(firstDestination.imageAlt, locale)
                : t(j.name, locale)
            }
          />
        </div>
        <div className="journey-meta">
          <span>
            {j.days} {en ? "suggested days" : "días sugeridos"}
          </span>
          <span>
            {j.destinations.length}{" "}
            {en ? "places along the way" : "lugares en la ruta"}
          </span>
        </div>
        <h3>{t(j.name, locale)}</h3>
        <ol
          className="journey-card-route"
          aria-label={en ? "Journey route" : "Recorrido"}
        >
          {j.destinations.map((slug) => {
            const destination = destinations.find((d) => d.slug === slug);
            const image = gallery.find((item) => item.destination === slug);
            const name = destination
              ? t(destination.name, locale)
              : slug === "puebla"
                ? "Puebla"
                : slug === "chichen-itza"
                  ? "Chichén Itzá"
                  : slug;
            return (
              <li key={slug}>
                {image ? (
                  <img src={image.src} alt="" loading="lazy" />
                ) : destination ? (
                  <Photo slug={slug} alt="" />
                ) : null}
                <span>{name}</span>
              </li>
            );
          })}
        </ol>
        <p className="journey-card-summary">{t(j.style, locale)}</p>
        <span className="text-link">
          {locale === "en" ? "Discover this journey" : "Descubre este circuito"}
          <ArrowUpRight size={17} />
        </span>
      </Link>
    </article>
  );
}
export function FinalCTA({
  locale,
  destination,
}: {
  locale: Locale;
  destination?: Destination;
}) {
  const en = locale === "en";
  return (
    <section className="final-cta">
      <img
        src={"/media/" + (destination?.slug || "cancun") + ".webp"}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <div className="final-characters" aria-hidden="true">
        <img src="/media/diego-cutout.webp" alt="" loading="lazy" />
        <img src="/media/chente-cutout.webp" alt="" loading="lazy" />
      </div>
      <div className="final-cta-copy reveal">
        <p className="eyebrow">{en ? "Let’s talk" : "Escríbenos"}</p>
        <h2>
          {destination
            ? en
              ? "Your " + t(destination.name, locale) + " story starts here."
              : "Tu historia en " +
                t(destination.name, locale) +
                " empieza aquí."
            : en
              ? "Let’s plan the Mexico\nyou came here for."
              : "Planeemos ese México\nque quieres descubrir."}
        </h2>
        <p>
          {en
            ? "A place, a feeling, a few days away. Tell us where your imagination is taking you."
            : "Un lugar, una emoción, unos días para ti. Cuéntanos a dónde te está llevando la imaginación."}
        </p>
        <div className="final-actions">
          <Link
            className="button button-primary"
            href={
              href(locale, "plan") +
              (destination ? "?destination=" + destination.slug : "")
            }
          >
            <span className="button-icon icon-whatsapp" aria-hidden="true" />
            {destination
              ? en
                ? "Plan my " + t(destination.name, locale) + " trip"
                : "Planea mi viaje a " + t(destination.name, locale)
              : en
                ? "Plan My Mexico Trip"
                : "Planea mi viaje por México"}
          </Link>
        </div>
      </div>
    </section>
  );
}
export function DestinationDetail({
  destination: d,
  locale,
}: {
  destination: Destination;
  locale: Locale;
}) {
  const en = locale === "en";
  const images = gallery.filter((item) => item.destination === d.slug);
  const matching = journeys.filter((j) => j.destinations.includes(d.slug));
  return (
    <>
      <section className="detail-hero">
        <Photo slug={d.slug} alt={t(d.imageAlt, locale)} priority />
        <div className="detail-hero-copy wrap">
          <p className="eyebrow">{t(d.region, locale)} · México</p>
          <h1>{t(d.name, locale)}</h1>
          <p>{t(d.tagline, locale)}</p>
          <Link
            className="button primary"
            href={`${href(locale, "plan")}?destination=${d.slug}`}
          >
            {locale === "en"
              ? `I want to visit ${t(d.name, locale)}`
              : `Quiero visitar ${t(d.name, locale)}`}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <nav
        className="wrap guide-subnav"
        aria-label={en ? "Destination guide" : "Guía del destino"}
      >
        <a href="#discover">{en ? "Discover" : "Descubre"}</a>
        <a href="#experiences">{en ? "Experiences" : "Experiencias"}</a>
        <a href="#before-you-go">{en ? "Before you go" : "Antes de ir"}</a>
      </nav>
      <section id="discover" className="wrap section destination-intro">
        <div>
          <p className="eyebrow">{en ? "Discover" : "Descubre"}</p>
          <h2>{t(d.name, locale)}</h2>
        </div>
        <div>
          <p className="lede">{t(d.intro, locale)}</p>
          <div className="facts">
            <p>
              <small>{locale === "en" ? "Take your time" : "A tu ritmo"}</small>
              {t(d.duration, locale)}
            </p>
          </div>
        </div>
      </section>
      <div className="wrap guide-gallery">
        {images.length > 0 ? (
          <PhotoGallery
            items={images.slice(0, 2)}
            locale={locale}
            label={t(d.name, locale)}
          />
        ) : (
          <figure className="guide-photo-fallback">
            <Photo slug={d.slug} alt={t(d.imageAlt, locale)} />
            <figcaption>{t(d.imageAlt, locale)}</figcaption>
          </figure>
        )}
      </div>
      <section id="experiences" className="section">
        <div className="wrap">
          <SectionTitle
            locale={locale}
            label={
              locale === "en"
                ? "What stays with you"
                : "Lo que se queda contigo"
            }
            title={
              en
                ? `Experience ${t(d.name, locale)}`
                : `Vive ${t(d.name, locale)}`
            }
          />
          <ol className="guide-experiences">
            {d.experiences.map((e, i) => (
              <li key={i}>
                <span className="number" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{t(e, locale)}</h3>
              </li>
            ))}
          </ol>
        </div>
      </section>
      {images.length > 2 && (
        <div className="wrap guide-gallery">
          <PhotoGallery
            items={images.slice(2)}
            locale={locale}
            label={t(d.name, locale)}
          />
        </div>
      )}
      <section className="section guide-local-life">
        <div className="wrap two-columns">
          <article>
            <h3>{locale === "en" ? "At the table" : "A la mesa"}</h3>
            <p>{t(d.food, locale)}</p>
          </article>
          <article>
            <h3>
              {locale === "en"
                ? "Beyond the postcard"
                : "Más allá de la postal"}
            </h3>
            <p>{t(d.culture, locale)}</p>
          </article>
        </div>
      </section>
      <section
        id="before-you-go"
        className="wrap section two-columns guide-planner"
      >
        <div>
          <p className="eyebrow">{en ? "Before you go" : "Antes de ir"}</p>
          <h2>
            {locale === "en"
              ? "Make room for what matters."
              : "Haz espacio para lo que importa."}
          </h2>
        </div>
        <div className="guide-planner-notes">
          <article>
            <h3>{en ? "When to go" : "Cuándo ir"}</h3>
            <p>{t(d.season, locale)}</p>
          </article>
          <article>
            <h3>{en ? "Where to stay" : "Dónde hospedarte"}</h3>
            <p>{t(d.stay, locale)}</p>
          </article>
          <article>
            <h3>{en ? "Keep in mind" : "Ten en cuenta"}</h3>
            <ul className="check-list">
              {d.tips.map((tip, i) => (
                <li key={i}>
                  <Check size={18} aria-hidden="true" />
                  {t(tip, locale)}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
      {matching.length > 0 && (
        <section className="wrap section guide-related">
          <SectionTitle
            locale={locale}
            label={locale === "en" ? "Keep exploring" : "Sigue explorando"}
            title={
              locale === "en"
                ? "Make it part of a bigger story."
                : "Hazlo parte de una historia más grande."
            }
          />
          <div className="journey-grid">
            {matching.map((j) => (
              <JourneyCard journey={j} locale={locale} key={j.slug} />
            ))}
          </div>
        </section>
      )}
      <section className="wrap section faq">
        <p className="eyebrow">
          {locale === "en" ? "Your questions" : "Tus preguntas"}
        </p>
        <h2>
          {locale === "en"
            ? "A few things you might be wondering."
            : "Quizá te estás preguntando…"}
        </h2>
        {d.faq.map((f, i) => (
          <details key={i}>
            <summary>{t(f.q, locale)}</summary>
            <p>{t(f.a, locale)}</p>
          </details>
        ))}
      </section>
      <FinalCTA locale={locale} destination={d} />
    </>
  );
}
export function JourneyDetail({
  journey: j,
  locale,
}: {
  journey: Journey;
  locale: Locale;
}) {
  const en = locale === "en";
  const locations = itineraryLocations[j.slug] ?? [];
  const firstDestination = destinations.find(
    (d) => d.slug === j.destinations[0],
  );
  return (
    <>
      <section className="detail-hero">
        <Photo
          slug={j.destinations[0]}
          alt={
            firstDestination
              ? t(firstDestination.imageAlt, locale)
              : t(j.name, locale)
          }
          priority
        />
        <div className="detail-hero-copy wrap">
          <p className="eyebrow">
            {locale === "en"
              ? "A journey to make your own"
              : "Un circuito para hacerlo tuyo"}
          </p>
          <h1>{t(j.name, locale)}</h1>
          <p>{t(j.tagline, locale)}</p>
          <Link
            className="button primary"
            href={`${href(locale, "plan")}?journey=${j.slug}`}
          >
            {locale === "en"
              ? "Customize this journey"
              : "Personaliza este circuito"}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <nav
        className="wrap guide-subnav"
        aria-label={en ? "Journey guide" : "Guía del circuito"}
      >
        <a href="#discover">{en ? "Discover" : "Descubre"}</a>
        <a href="#experiences">{en ? "Experiences" : "Experiencias"}</a>
        <a href="#before-you-go">{en ? "Before you go" : "Antes de ir"}</a>
      </nav>
      <section id="discover" className="wrap section journey-overview">
        <div className="section-title">
          <div>
            <p className="eyebrow">{en ? "The route" : "La ruta"}</p>
            <h2>
              {j.days} {en ? "days, at your own pace" : "días, a tu ritmo"}
            </h2>
          </div>
          <p>{t(j.style, locale)}</p>
        </div>
        <div className="notice">
          {locale === "en"
            ? "Suggested itinerary · Not a confirmed departure. Availability, inclusions and final pricing are prepared individually."
            : "Itinerario de referencia · No es una salida confirmada. Disponibilidad, inclusiones y precio final se cotizan de forma individual."}
        </div>
        <div
          className="route-strip"
          aria-label={locale === "en" ? "Journey route" : "Recorrido"}
        >
          {j.destinations.map((slug, i) => (
            <div key={slug}>
              <MapPin size={22} />
              {destinations.find((d) => d.slug === slug) ? (
                <Link href={href(locale, "destinations", slug)}>
                  {t(destinations.find((d) => d.slug === slug)!.name, locale)}
                </Link>
              ) : slug === "puebla" ? (
                "Puebla"
              ) : slug === "chichen-itza" ? (
                "Chichén Itzá"
              ) : (
                slug
              )}
              {i < j.destinations.length - 1 && <ArrowRight size={20} />}
            </div>
          ))}
        </div>
        <RouteMap stops={j.destinations} locale={locale} />
      </section>
      <section id="experiences" className="wrap section two-columns">
        <div className="sticky-copy">
          <p className="eyebrow">
            {j.days} {locale === "en" ? "suggested days" : "días sugeridos"}
          </p>
          <h2>
            {locale === "en"
              ? "The journey, day by day."
              : "El viaje, día a día."}
          </h2>
        </div>
        <ol className="itinerary">
          {j.itinerary.map((day, i) => {
            const slug = locations[i];
            const showGallery = slug && locations.indexOf(slug) === i;
            const images = showGallery
              ? gallery.filter((item) => item.destination === slug)
              : [];
            const destination = destinations.find((d) => d.slug === slug);
            const name = destination
              ? t(destination.name, locale)
              : slug === "puebla"
                ? "Puebla"
                : slug === "chichen-itza"
                  ? "Chichén Itzá"
                  : slug;
            return (
              <li key={i}>
                <span>
                  {locale === "en" ? "DAY" : "DÍA"}{" "}
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{t(day.title, locale)}</h3>
                <p>{t(day.detail, locale)}</p>
                {showGallery && (
                  <div className="journey-day-gallery">
                    {images.length > 0 ? (
                      <PhotoGallery
                        items={images.slice(0, 2)}
                        locale={locale}
                        label={name}
                      />
                    ) : destination ? (
                      <figure className="guide-photo-fallback">
                        <Photo
                          slug={slug}
                          alt={t(destination.imageAlt, locale)}
                        />
                        <figcaption>
                          {t(destination.imageAlt, locale)}
                        </figcaption>
                      </figure>
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
      <section id="before-you-go" className="wrap section journey-planner">
        <p className="eyebrow">{en ? "Before you go" : "Antes de ir"}</p>
        <h2>{en ? "The practical details" : "Los detalles prácticos"}</h2>
        <div className="three-columns travel-notes">
          {[
            ["Where to stay", "Dónde dormir", j.stays],
            ["Getting around", "Cómo trasladarte", j.transport],
            ["Stay a little longer", "Qué puedes añadir", j.extensions],
          ].map(([en, es, body]) => (
            <article key={String(en)}>
              <h3>{locale === "en" ? String(en) : String(es)}</h3>
              <p>{t(body as typeof j.stays, locale)}</p>
            </article>
          ))}
        </div>
        <p className="notice">{t(j.inclusions, locale)}</p>
      </section>
      <FinalCTA locale={locale} />
    </>
  );
}
