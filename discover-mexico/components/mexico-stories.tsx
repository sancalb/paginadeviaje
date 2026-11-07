import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  MessageCircle,
  Map,
  CheckCheck,
  HeartHandshake,
} from "lucide-react";
import { destinations, t, type Locale } from "../data/content";
import { href } from "../lib/routes";
import gallery from "../data/gallery.json";

const stories = [
  {
    slug: "oaxaca",
    imageHint: /market|tlayuda|food|mercado/i,
    category: { en: "Culture, at the table", es: "Cultura, a la mesa" },
    title: {
      en: "A city you get to know by taste.",
      es: "Una ciudad que se conoce por sus sabores.",
    },
    body: {
      en: "Markets, regional cooking and living traditions. Leave room for Oaxaca beyond the postcard.",
      es: "Mercados, cocina regional y tradiciones vivas. Haz espacio para Oaxaca más allá de la postal.",
    },
  },
  {
    slug: "tequila",
    imageHint: /agave fields/i,
    category: { en: "A landscape with a story", es: "Un paisaje con historia" },
    title: { en: "Look beyond the glass.", es: "Mira más allá de la copa." },
    body: {
      en: "Agave fields and the streets of Tequila offer another way into Jalisco’s culture.",
      es: "Los campos de agave y las calles de Tequila revelan otra forma de conocer la cultura de Jalisco.",
    },
  },
  {
    slug: "riviera-maya",
    imageHint: /akumal/i,
    category: { en: "Nature, without the rush", es: "Naturaleza, sin prisa" },
    title: {
      en: "A different rhythm by the sea.",
      es: "Otro ritmo junto al mar.",
    },
    body: {
      en: "Look beyond the resort. Make room for Akumal’s shoreline and the natural landscapes of the Riviera Maya.",
      es: "Mira más allá del resort. Haz espacio para la costa de Akumal y los paisajes naturales de la Riviera Maya.",
    },
  },
];

export function MexicoStories({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return (
    <section className="section mexico-stories" aria-labelledby="stories-title">
      <div className="wrap">
        <div className="editorial-heading">
          <div>
            <p className="eyebrow">
              {en
                ? "The Mexico You Didn’t Know"
                : "El México que aún no conoces"}
            </p>
            <h2 id="stories-title">
              {en
                ? "The best parts aren’t always\non the checklist."
                : "Lo mejor no siempre\nestá en la lista."}
            </h2>
          </div>
          <p>
            {en
              ? "Go for the places. Stay curious about the people, flavors and everyday details."
              : "Ve por los lugares. Déjate sorprender por su gente, sus sabores y los pequeños detalles."}
          </p>
        </div>
        <div className="stories-grid">
          {stories.map((story, index) => {
            const photo =
              gallery.find(
                (item) =>
                  item.destination === story.slug &&
                  story.imageHint.test(item.alt.en),
              ) || gallery.find((item) => item.destination === story.slug);
            return (
              <Link
                className={`story-link story-link-${index + 1}`}
                key={story.slug}
                href={href(locale, "destinations", story.slug)}
              >
                <div className="story-image">
                  <Image
                    src={photo?.src || `/media/${story.slug}.webp`}
                    alt={
                      photo
                        ? t(photo.alt, locale)
                        : t(
                            destinations.find(
                              (destination) => destination.slug === story.slug,
                            )!.imageAlt,
                            locale,
                          )
                    }
                    width={1000}
                    height={800}
                    sizes="(max-width: 700px) 90vw, 40vw"
                  />
                  <span className="story-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                </div>
                <div className="story-copy">
                  <p className="eyebrow">{t(story.category, locale)}</p>
                  <h3>{t(story.title, locale)}</h3>
                  <p>{t(story.body, locale)}</p>
                  <span className="text-link">
                    {en
                      ? "Explore this side of Mexico"
                      : "Descubre este lado de México"}
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function JourneyWorks({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const steps = [
    {
      icon: MessageCircle,
      title: en ? "Start with a conversation" : "Empezamos platicando",
      text: en
        ? "Tell us who’s coming, what draws you to Mexico and how you like to travel."
        : "Cuéntanos quién viene, qué te atrae de México y cómo te gusta viajar.",
    },
    {
      icon: Map,
      title: en ? "Shape the journey together" : "Damos forma al viaje",
      text: en
        ? "Explore routes and possibilities with your advisor, around your interests and pace."
        : "Explora rutas y posibilidades con tu asesor, a tu ritmo y según tus gustos.",
    },
    {
      icon: CheckCheck,
      title: en ? "Know the details first" : "Conoces cada detalle",
      text: en
        ? "Review the proposal, inclusions and conditions before confirming any reservation."
        : "Revisa la propuesta, sus inclusiones y condiciones antes de confirmar cualquier reservación.",
    },
    {
      icon: HeartHandshake,
      title: en
        ? "Travel with a point of contact"
        : "Viajas con alguien a quien acudir",
      text: en
        ? "Agree how to reach your advisor for questions or changes before and during your trip."
        : "Acuerda cómo contactar a tu asesor para dudas o cambios antes y durante tu viaje.",
    },
  ];
  return (
    <section
      className="section journey-works"
      aria-labelledby="journey-works-title"
    >
      <div className="wrap">
        <div className="editorial-heading">
          <div>
            <p className="eyebrow">
              {en ? "How Your Journey Works" : "Así empieza tu viaje"}
            </p>
            <h2 id="journey-works-title">
              {en
                ? "Your idea.\nA journey we shape together."
                : "Tu idea.\nUn viaje que creamos contigo."}
            </h2>
          </div>
          <Link className="button button-secondary" href={href(locale, "plan")}>
            {en ? "Let’s start with your idea" : "Empecemos con tu idea"}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <ol className="journey-process">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title}>
              <div className="process-marker">
                <Icon size={23} aria-hidden="true" />
                <span>0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
