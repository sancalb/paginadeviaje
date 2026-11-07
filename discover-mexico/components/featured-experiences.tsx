import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { destinations, t, type Locale } from "../data/content";
import {
  mexicoExperiences,
  type MexicoExperience,
} from "../data/mexico-experiences";
import { href } from "../lib/routes";
import { Photo, SectionTitle, FinalCTA } from "./editorial";
import gallery from "../data/gallery.json";
import { PhotoGallery } from "./photo-gallery";
import { TourPackageCards } from "./tour-package";

export function FeaturedExperiences({ locale }: { locale: Locale }) {
  return <TourPackageCards locale={locale} />;
}

function EditorialExperiences({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return (
    <section className="section featured-experiences" id="experiences">
      <div className="wrap">
        <SectionTitle
          locale={locale}
          label={
            en
              ? "Featured Mexico Experiences"
              : "Experiencias destacadas en México"
          }
          title={
            en
              ? "Three ways into Mexico."
              : "Tres formas de acercarte a México."
          }
        />
        <div className="journey-grid featured-experiences-grid">
          {mexicoExperiences.map((experience) => {
            const cover = gallery.find(
              (image) => image.destination === experience.destinationSlug,
            );
            return (
              <article
                className="journey-card experience-card"
                key={experience.slug}
              >
                <Link href={href(locale, "experiences", experience.slug)}>
                  <figure className="experience-card-figure">
                    {cover ? (
                      <div className="photo">
                        <Image
                          src={cover.src}
                          alt={t(cover.alt, locale)}
                          fill
                          sizes="(max-width: 700px) 85vw, 33vw"
                        />
                      </div>
                    ) : (
                      <Photo
                        slug={experience.imageSlug}
                        alt={t(experience.imageAlt, locale)}
                      />
                    )}
                    <figcaption className="experience-caption">
                      {experience.destinations
                        .map((slug) =>
                          t(
                            destinations.find(
                              (destination) => destination.slug === slug,
                            )!.name,
                            locale,
                          ),
                        )
                        .join(" · ")}
                    </figcaption>
                  </figure>
                  <h3>{t(experience.name, locale)}</h3>
                  <p>{t(experience.tagline, locale)}</p>
                  <span className="text-link">
                    {en ? "Explore this idea" : "Explora esta idea"}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ExperienceDetail({
  experience,
  locale,
}: {
  experience: MexicoExperience;
  locale: Locale;
}) {
  const en = locale === "en";
  const destination = destinations.find(
    (d) => d.slug === experience.destinationSlug,
  );
  const plannerHref = `${href(locale, "plan")}?destination=${experience.destinationSlug}`;
  const experienceImages =
    experience.destinations.length > 1
      ? experience.destinations.flatMap((slug) =>
          gallery.filter((image) => image.destination === slug).slice(0, 1),
        )
      : gallery
          .filter((image) => image.destination === experience.destinationSlug)
          .slice(0, 2);
  return (
    <>
      <section className="detail-hero experience-hero">
        <Photo
          slug={experience.imageSlug}
          alt={t(experience.imageAlt, locale)}
          priority
        />
        <div className="detail-hero-copy wrap">
          <p className="eyebrow">
            {en ? "Mexico experiences" : "Experiencias en México"}
          </p>
          <h1>{t(experience.name, locale)}</h1>
          <p>{t(experience.tagline, locale)}</p>
          <Link className="button primary" href={plannerHref}>
            {en ? "Make this idea your own" : "Dale tu forma a esta idea"}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className="section experience-intro">
        <div className="wrap">
          <p className="experience-caption">{t(experience.caption, locale)}</p>
          <Link className="text-link" href={href(locale, "experiences")}>
            {en ? "All experiences" : "Todas las experiencias"}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <div className="two-columns editorial-copy">
            <SectionTitle
              locale={locale}
              label={en ? "A closer look" : "Una mirada cercana"}
              title={en ? "A place, at your pace." : "Un lugar, a tu ritmo."}
            />
            <p className="lede">{t(experience.intro, locale)}</p>
          </div>
        </div>
      </section>
      <div className="wrap experience-gallery">
        <PhotoGallery
          items={experienceImages}
          locale={locale}
          label={en ? "Places to discover" : "Lugares por descubrir"}
        />
      </div>
      <section className="section experience-route">
        <div className="wrap">
          <SectionTitle
            locale={locale}
            label={en ? "The route" : "El recorrido"}
            title={
              en ? "Leave room between places." : "Deja espacio entre lugares."
            }
          />
          <p className="lede">{t(experience.route, locale)}</p>
          <div
            className="route-strip"
            aria-label={en ? "Destinations" : "Destinos"}
          >
            {experience.destinations.map((slug) => {
              const stop = destinations.find((d) => d.slug === slug);
              return stop ? (
                <div key={slug}>
                  <MapPin size={20} aria-hidden="true" />
                  <Link href={href(locale, "destinations", slug)}>
                    {t(stop.name, locale)}
                  </Link>
                </div>
              ) : null;
            })}
          </div>
          <div className="two-columns experience-moments">
            <div>
              <p className="eyebrow">{en ? "Perfect for" : "Ideal para"}</p>
              <p className="lede">{t(experience.perfectFor, locale)}</p>
            </div>
            <div>
              <h2>{en ? "Suggested moments" : "Momentos sugeridos"}</h2>
              <ul className="check-list">
                {experience.suggestedMoments.map((moment) => (
                  <li key={moment.en}>
                    <ArrowUpRight size={18} aria-hidden="true" />
                    {t(moment, locale)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="section experience-planning">
        <div className="wrap two-columns">
          <div>
            <p className="eyebrow">
              {en ? "Before making plans" : "Antes de hacer planes"}
            </p>
            <h2>
              {en
                ? "An idea to shape together."
                : "Una idea para darle forma juntos."}
            </h2>
          </div>
          <div>
            <p>{t(experience.planningNote, locale)}</p>
            <Link className="text-link" href={plannerHref}>
              {en ? "Tell us what interests you" : "Cuéntanos qué te interesa"}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <FinalCTA locale={locale} destination={destination} />
    </>
  );
}

export function ExperienceListing({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const cover = mexicoExperiences[0];
  return (
    <>
      <section className="detail-hero experience-hero experience-listing-hero">
        <Photo
          slug={cover.imageSlug}
          alt={t(cover.imageAlt, locale)}
          priority
        />
        <div className="detail-hero-copy wrap">
          <p className="eyebrow">
            {en ? "Discover Mexico" : "Descubre México"}
          </p>
          <h1>{en ? "Mexico experiences" : "Experiencias en México"}</h1>
          <p>
            {en
              ? "The Caribbean, agave country and the capital. Three ideas with room for your own rhythm."
              : "El Caribe, la región agavera y la capital. Tres ideas con espacio para tu propio ritmo."}
          </p>
          <a className="button primary" href="#experiences">
            {en ? "Explore the ideas" : "Explora las ideas"}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
      <EditorialExperiences locale={locale} />
      <section className="wrap section experience-listing-note">
        <p>
          {en
            ? "Editorial starting points, not scheduled departures. Visits and transport are arranged and confirmed separately; no services are included in these ideas."
            : "Puntos de partida editoriales, no salidas programadas. Las visitas y los traslados se organizan y confirman aparte; estas ideas no incluyen servicios."}
        </p>
      </section>
      <FinalCTA locale={locale} />
    </>
  );
}
