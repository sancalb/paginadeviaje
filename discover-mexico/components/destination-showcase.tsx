"use client";
import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  destinations,
  experienceCategories,
  t,
  type Locale,
} from "../data/content";
import { href } from "../lib/routes";
import { DestinationTile } from "./editorial";
export function DestinationShowcase({ locale }: { locale: Locale }) {
  const track = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const en = locale === "en";
  return (
    <section className="section destinations-section" id="destinos">
      <div className="destinations-showcase">
        <div className="destinations-copy reveal">
          <p className="eyebrow">{en ? "Explore Mexico" : "Inspírate"}</p>
          <h2>
            {en
              ? "Places that could be your next story."
              : "Lugares que pueden ser tu próxima historia."}
          </h2>
          <p>
            {en
              ? "Start with a place that inspires you. We’ll help connect the rest."
              : "Empieza por un lugar que te inspire. Te ayudamos a conectar el resto."}
          </p>
          <Link className="button button-primary" href={href(locale, "plan")}>
            <span className="button-icon icon-whatsapp" aria-hidden="true" />
            {en ? "Tell us your idea" : "Cuéntanos tu idea"}
          </Link>
          <Link className="text-link" href={href(locale, "destinations")}>
            {en ? "Explore all destinations" : "Explora todos los destinos"} →
          </Link>
        </div>
        <div className="destinations-carousel">
          <button
            className="carousel-arrow destination-nav destination-nav-prev"
            aria-label={en ? "Previous destinations" : "Destinos anteriores"}
            onClick={() =>
              track.current?.scrollBy({ left: -350, behavior: "smooth" })
            }
          >
            <ChevronLeft size={22} />
          </button>
          <div className="destination-track" ref={track}>
            {destinations.map((d, i) => (
              <DestinationTile
                key={d.slug}
                destination={d}
                locale={locale}
                large={i === 0}
              />
            ))}
          </div>
          <button
            className="carousel-arrow destination-nav destination-nav-next"
            aria-label={en ? "Next destinations" : "Siguientes destinos"}
            onClick={() =>
              track.current?.scrollBy({ left: 350, behavior: "smooth" })
            }
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
      <div className="inspiration-filters">
        {experienceCategories.map((c) => (
          <button
            key={c.id}
            onClick={() =>
              router.push(href(locale, "destinations") + "?interest=" + c.id)
            }
          >
            {t(c.name, locale)}
          </button>
        ))}
      </div>
    </section>
  );
}
