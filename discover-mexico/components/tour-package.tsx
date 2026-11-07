import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  MapPin,
  PlaneLanding,
  Users,
  BedDouble,
  X,
} from "lucide-react";
import { destinations, t, type Locale } from "../data/content";
import { tourPackages, type TourPackage } from "../data/tour-packages";
import gallery from "../data/gallery.json";
import { href } from "../lib/routes";
import { tourHref, tourQuoteHref } from "../lib/tour-routes";
import { Photo } from "./editorial";
import { PhotoGallery } from "./photo-gallery";
import { Planner } from "./planner";
import { Reviews } from "./reviews";
import "../app/tour-packages.css";

function duration(tour: TourPackage, locale: Locale) {
  return locale === "en"
    ? `${tour.days} Days / ${tour.nights} Nights`
    : `${tour.days} días / ${tour.nights} noches`;
}

export function TourPackageCards({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return (
    <section
      className="section featured-experiences tour-featured"
      id="experiences"
    >
      <div className="wrap">
        <div className="section-title">
          <div>
            <p className="eyebrow">
              {en
                ? "Featured Mexico Experiences"
                : "Experiencias destacadas en México"}
            </p>
            <h2>
              {en
                ? "Your Mexico Adventure Starts Here"
                : "Tu aventura por México comienza aquí"}
            </h2>
          </div>
        </div>
        <div className="tour-home-intro">
          <p>
            {en
              ? "From breathtaking Caribbean beaches to vibrant cities and centuries-old traditions, discover carefully designed journeys that bring you closer to the best of Mexico."
              : "Desde las espectaculares playas del Caribe hasta ciudades llenas de historia y tradiciones, descubre viajes diseñados para conocer lo mejor de México."}
          </p>
          <p>
            {en
              ? "Enjoy unforgettable destinations, comfortable accommodations, authentic local experiences and personalized travel assistance."
              : "Disfruta destinos inolvidables, hospedaje cómodo, experiencias auténticas y asistencia personalizada durante tu viaje."}
          </p>
        </div>
        <div className="tour-cards-grid">
          {tourPackages.map((tour) => {
            const cover = gallery.find(
              (image) => image.src === tour.gallery[0],
            );
            return (
              <article key={tour.id} className="tour-card">
                <Link className="tour-card-main" href={tourHref(locale, tour)}>
                  <figure className="tour-card-photo">
                    {cover ? (
                      <Image
                        src={cover.src}
                        alt={t(cover.alt, locale)}
                        fill
                        sizes="(max-width: 700px) 90vw, 33vw"
                      />
                    ) : (
                      <Photo
                        slug={tour.destinationSlug}
                        alt={t(tour.destination, locale)}
                      />
                    )}
                    <figcaption>{duration(tour, locale)}</figcaption>
                  </figure>
                  <div className="tour-card-copy">
                    <p className="tour-card-type">
                      {t(tour.experienceType, locale)}
                    </p>
                    <h3>{t(tour.name, locale)}</h3>
                    <p className="tour-card-place">
                      <MapPin size={14} aria-hidden="true" />
                      {t(tour.destination, locale)}
                    </p>
                    <p>{t(tour.homeDescription, locale)}</p>
                    <ul>
                      {tour.highlights.slice(0, 4).map((highlight, index) => (
                        <li key={index}>
                          <Check size={15} aria-hidden="true" />
                          {t(highlight, locale)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
                <div className="tour-card-actions">
                  <strong className="tour-quote-label">
                    {en ? "Personalized Quote" : "Cotización personalizada"}
                  </strong>
                  <Link
                    className="button button-primary"
                    href={tourHref(locale, tour)}
                  >
                    {en ? "Explore This Journey" : "Explora este viaje"}
                    <ArrowUpRight size={17} />
                  </Link>
                  <Link
                    className="button button-secondary"
                    href={tourQuoteHref(locale, tour)}
                  >
                    {en ? "Request a Quote" : "Solicitar cotización"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <div className="tour-personalize">
          <div>
            <h3>
              {en ? "Your Journey, Your Way" : "Un viaje diseñado a tu medida"}
            </h3>
            <p>
              {en
                ? "Want to extend your stay, upgrade your hotel or add special experiences? Our travel specialists can customize your itinerary based on your dates, interests and budget."
                : "¿Quieres agregar noches, mejorar tu hotel o disfrutar experiencias especiales? Nuestros especialistas pueden personalizar tu viaje según tus fechas, intereses y presupuesto."}
            </p>
          </div>
          <Link className="text-link" href={href(locale, "plan")}>
            {en ? "Plan My Custom Trip" : "Diseñar mi viaje"}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <p className="tour-small-note">
          {en
            ? "Planned packages, quoted individually. Hotels, services and availability are confirmed in your proposal. International flights are not included."
            : "Paquetes propuestos, con cotización individual. Hoteles, servicios y disponibilidad se confirman en tu propuesta. No incluyen vuelos internacionales."}
        </p>
      </div>
    </section>
  );
}

export async function TourPackagePage({
  tour,
  locale,
}: {
  tour: TourPackage;
  locale: Locale;
}) {
  const en = locale === "en";
  const images = tour.gallery.flatMap((src) => {
    const photo = gallery.find((image) => image.src === src);
    return photo ? [photo] : [];
  });
  const whatsappNumber = process.env.WHATSAPP_NUMBER || "";
  const whatsapp = /^\+?[1-9]\d{6,14}$/.test(whatsappNumber)
    ? `https://wa.me/${whatsappNumber.replace(/^\+/, "")}?text=${encodeURIComponent(t(tour.whatsappMessage, locale))}`
    : href(locale, "contact");
  const fields = [
    {
      icon: CalendarDays,
      label: en ? "Duration" : "Duración",
      value: duration(tour, locale),
    },
    {
      icon: MapPin,
      label: en ? "Destinations" : "Destinos",
      value: tour.destinations
        .map((destination) => t(destination, locale))
        .join(" · "),
    },
    {
      icon: PlaneLanding,
      label: en ? "Arrival airport" : "Aeropuerto de llegada",
      value: tour.airport,
    },
    {
      icon: Compass,
      label: en ? "Travel style" : "Tipo de viaje",
      value: t(tour.experienceType, locale),
    },
    {
      icon: BedDouble,
      label: en ? "Accommodation" : "Hospedaje",
      value: t(tour.accommodation, locale),
    },
    {
      icon: Users,
      label: en ? "Perfect for" : "Ideal para",
      value: t(tour.perfectFor, locale),
    },
  ];
  return (
    <div className="tour-package-page">
      <section className="detail-hero tour-hero">
        <div className="photo">
          <Image
            src={`/media/${tour.destinationSlug}.webp`}
            alt={t(
              destinations.find((d) => d.slug === tour.destinationSlug)!
                .imageAlt,
              locale,
            )}
            priority
            fill
            sizes="100vw"
          />
        </div>
        <div className="detail-hero-copy wrap">
          <Link className="tour-back" href={`${href(locale)}#experiences`}>
            <ArrowLeft size={16} />
            {en ? "Discover Mexico" : "Descubre México"}
          </Link>
          <p className="eyebrow">
            {t(tour.destination, locale)} · {duration(tour, locale)}
          </p>
          <h1>{t(tour.name, locale)}</h1>
          <p className="tour-hero-style">{t(tour.experienceType, locale)}</p>
          <p>{t(tour.homeDescription, locale)}</p>
          <a className="button button-primary" href="#quote">
            {en ? "Request a Quote" : "Solicitar cotización"}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <nav
        className="wrap tour-subnav"
        aria-label={en ? "Package sections" : "Secciones del paquete"}
      >
        <a href="#tour-overview">{en ? "Overview" : "Resumen"}</a>
        <a href="#tour-itinerary">{en ? "Itinerary" : "Itinerario"}</a>
        <a href="#tour-inclusions">{en ? "Included" : "Incluye"}</a>
        <a href="#tour-hotels">{en ? "Hotel styles" : "Hospedaje"}</a>
        <a href="#tour-faq">{en ? "Questions" : "Preguntas"}</a>
        <a href="#quote">{en ? "Get a quote" : "Cotiza"}</a>
      </nav>
      <section id="tour-overview" className="wrap section tour-overview">
        <div className="tour-editorial-heading">
          <div>
            <p className="eyebrow">
              {en ? "Your Journey at a Glance" : "Tu viaje de un vistazo"}
            </p>
            <h2>{t(tour.headline, locale)}</h2>
          </div>
          <div>
            {tour.intro.map((paragraph, index) => (
              <p key={index}>{t(paragraph, locale)}</p>
            ))}
          </div>
        </div>
        <details className="tour-commercial-note">
          <summary>
            {en
              ? "Planned package · Services confirmed in your personalized quote"
              : "Paquete propuesto · Servicios por confirmar en tu cotización"}
            <ChevronDown size={17} aria-hidden="true" />
          </summary>
          <p>{t(tour.commercialNotice, locale)}</p>
        </details>
        <dl className="tour-facts">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <dt>
                <Icon size={20} aria-hidden="true" />
                {label}
              </dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="tour-highlight-list">
          <h3>
            {en ? "The experiences ahead" : "Las experiencias que te esperan"}
          </h3>
          <ul>
            {tour.highlights.map((highlight, index) => (
              <li key={index}>
                <Check size={17} aria-hidden="true" />
                {t(highlight, locale)}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="wrap tour-gallery">
        <PhotoGallery
          items={images}
          locale={locale}
          label={
            en ? "A closer look at your destination" : "Una mirada a tu destino"
          }
        />
      </div>
      <section id="tour-itinerary" className="section tour-itinerary-section">
        <div className="wrap">
          <div className="tour-section-heading">
            <p className="eyebrow">{duration(tour, locale)}</p>
            <h2>{en ? "Your 7-Day Itinerary" : "Tu itinerario de 7 días"}</h2>
          </div>
          <div className="tour-itinerary">
            {tour.itinerary.map((day, index) => (
              <details key={index} open={index === 0}>
                <summary>
                  <span className="tour-day-number">
                    {en ? "DAY" : "DÍA"} {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{t(day.title, locale)}</h3>
                  {day.optional && (
                    <span className="tour-optional-badge">
                      {en ? "Optional outing" : "Salida opcional"}
                    </span>
                  )}
                  <ChevronDown size={20} aria-hidden="true" />
                </summary>
                <div className="tour-day-content">
                  {t(day.description, locale) && (
                    <p>{t(day.description, locale)}</p>
                  )}
                  <ul>
                    {day.activities[locale].map((activity, i) => (
                      <li key={i}>{activity}</li>
                    ))}
                  </ul>
                  {day.photo && (
                    <figure className="tour-day-photo">
                      <Image
                        src={day.photo}
                        alt={t(
                          gallery.find((image) => image.src === day.photo)
                            ?.alt ||
                            destinations.find(
                              (destination) =>
                                destination.slug === tour.destinationSlug,
                            )!.imageAlt,
                          locale,
                        )}
                        width={1200}
                        height={800}
                        sizes="(max-width: 700px) 90vw, 60vw"
                      />
                      <figcaption>
                        {en
                          ? "Destination photograph, not a confirmed hotel or service."
                          : "Fotografía del destino, no de un hotel o servicio confirmado."}
                      </figcaption>
                    </figure>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section id="tour-inclusions" className="wrap section tour-inclusions">
        <div>
          <p className="eyebrow">
            {en ? "The details, clearly" : "Los detalles, claros"}
          </p>
          <h2>{en ? "What’s Included" : "Qué incluye"}</h2>
          <ul>
            {tour.inclusions[locale].map((item, index) => (
              <li key={index}>
                <Check size={18} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">
            {en ? "Plan for these separately" : "Considéralo por separado"}
          </p>
          <h2>{en ? "Not Included" : "No incluye"}</h2>
          <ul>
            {tour.exclusions[locale].map((item, index) => (
              <li key={index}>
                <X size={17} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id="tour-hotels" className="section tour-hotels">
        <div className="wrap">
          <div className="tour-section-heading">
            <p className="eyebrow">
              {en
                ? "A stay that feels like you"
                : "Un hospedaje que va contigo"}
            </p>
            <h2>
              {en
                ? "Choose Your Hotel Experience"
                : "Elige tu experiencia de hospedaje"}
            </h2>
            <p>{t(tour.hotelNote, locale)}</p>
          </div>
          <div className="tour-hotel-grid">
            {tour.hotels.map((hotel, index) => {
              const image = images[index % images.length];
              return (
                <article className="tour-hotel-card" key={hotel.id}>
                  {image && (
                    <figure>
                      <Image
                        src={image.src}
                        alt={t(image.alt, locale)}
                        width={1000}
                        height={700}
                        sizes="(max-width: 700px) 90vw, 33vw"
                      />
                      <figcaption>
                        {en
                          ? "Destination inspiration · Hotel to be confirmed"
                          : "Inspiración del destino · Hotel por confirmar"}
                      </figcaption>
                    </figure>
                  )}
                  <div>
                    <h3>{hotel.name}</h3>
                    <p>{t(hotel.description, locale)}</p>
                    <ul>
                      {hotel.features.map((feature, i) => (
                        <li key={i}>{t(feature, locale)}</li>
                      ))}
                    </ul>
                    <Link
                      className="button button-secondary"
                      href={tourQuoteHref(locale, tour, hotel.id)}
                    >
                      {en ? `Quote ${hotel.name}` : `Cotiza ${hotel.name}`}
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="wrap section tour-upgrades">
        <div>
          <p className="eyebrow">
            {en ? "Make Your Journey Your Own" : "Haz tuyo este viaje"}
          </p>
          <h2>{en ? "A little more your way." : "Un poco más a tu manera."}</h2>
          <p>{t(tour.upgradesNote, locale)}</p>
        </div>
        <ul>
          {tour.upgrades[locale].map((upgrade, index) => (
            <li key={index}>
              <ArrowUpRight size={16} aria-hidden="true" />
              {upgrade}
            </li>
          ))}
        </ul>
      </section>
      <Reviews
        locale={locale}
        preferredDestination={tour.destinationSlug}
        packageContext
      />
      <section id="tour-faq" className="wrap section tour-faq">
        <div className="tour-section-heading">
          <p className="eyebrow">
            {en ? "Before you decide" : "Antes de decidir"}
          </p>
          <h2>{en ? "Frequently Asked Questions" : "Preguntas frecuentes"}</h2>
        </div>
        {tour.faq.map((question, index) => (
          <details key={index}>
            <summary>
              {t(question.q, locale)}
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <p>{t(question.a, locale)}</p>
          </details>
        ))}
      </section>
      <section id="quote" className="section tour-quote-section">
        <div className="wrap tour-quote-grid">
          <div className="tour-quote-intro">
            <p className="eyebrow">
              {en ? "Ready to Explore?" : "¿Listo para explorar?"}
            </p>
            <h2>{t(tour.finalTitle, locale)}</h2>
            {tour.finalDescription.map((paragraph, index) => (
              <p key={index}>{t(paragraph, locale)}</p>
            ))}
            <div className="tour-quote-photo">
              <Photo
                slug={tour.destinationSlug}
                alt={t(tour.destination, locale)}
              />
            </div>
            <a
              className="button button-secondary"
              href={whatsapp}
              target={whatsapp.startsWith("https:") ? "_blank" : undefined}
              rel={
                whatsapp.startsWith("https:")
                  ? "noopener noreferrer"
                  : undefined
              }
            >
              <span className="button-icon icon-whatsapp" aria-hidden="true" />
              {en
                ? "Chat With a Travel Specialist"
                : "Habla con un especialista"}
            </a>
          </div>
          <div>
            <h3 className="tour-form-heading">
              {en
                ? "Request a Personalized Quote"
                : "Solicita una cotización personalizada"}
            </h3>
            <Planner
              locale={locale}
              initial={{
                package: tour.id,
                destination: tour.destinationSlug,
                language: locale,
              }}
            />
          </div>
        </div>
      </section>
      <section className="wrap tour-important">
        <details>
          <summary>
            {en
              ? "Important Travel Information"
              : "Información importante de viaje"}
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <ul>
            {tour.importantInfo[locale].map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>{en ? "Package code" : "Código del paquete"}</dt>
              <dd>{tour.id}</dd>
            </div>
            <div>
              <dt>{en ? "Accommodation plan" : "Régimen de hospedaje"}</dt>
              <dd>{t(tour.mealPlan, locale)}</dd>
            </div>
            <div>
              <dt>{en ? "Transportation" : "Traslados"}</dt>
              <dd>{t(tour.transport, locale)}</dd>
            </div>
            <div>
              <dt>{en ? "Occupancy basis" : "Base de ocupación"}</dt>
              <dd>{t(tour.doubleOccupancy, locale)}</dd>
            </div>
          </dl>
        </details>
      </section>
    </div>
  );
}
