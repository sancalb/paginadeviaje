import Link from "next/link";
import {
  ArrowUpRight,
  Headphones,
  HeartHandshake,
  Languages,
  MapPin,
  Route,
  ShieldCheck,
} from "lucide-react";
import type { Locale } from "../data/content";
import { href } from "../lib/routes";
import { Photo } from "./editorial";

export function WhyTravel({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const benefits = [
    {
      icon: MapPin,
      title: en ? "Real Local Experts" : "Expertos locales de verdad",
      body: en
        ? "People based in Mexico who help you choose places and routes that fit."
        : "Personas en M\u00e9xico que te ayudan a elegir lugares y rutas que van contigo.",
    },
    {
      icon: Languages,
      title: en ? "Bilingual Assistance" : "Atenci\u00f3n biling\u00fce",
      body: en
        ? "Tell us your preferred language; we'll confirm an advisor's availability."
        : "Dinos tu idioma preferido; confirmaremos la disponibilidad de un asesor.",
    },
    {
      icon: Route,
      title: en ? "Everything Connected" : "Todo conectado",
      body: en
        ? "Stays, transfers and experiences planned together, with time to enjoy them."
        : "Hospedajes, traslados y experiencias pensados juntos, con tiempo para disfrutarlos.",
    },
    {
      icon: ShieldCheck,
      title: en ? "Travel With Confidence" : "Viaja con confianza",
      body: en
        ? "We walk through your proposal, what's included and the conditions before you decide."
        : "Revisamos contigo la propuesta, lo que incluye y sus condiciones antes de que decidas.",
    },
    {
      icon: Headphones,
      title: en ? "Support Along the Way" : "Apoyo en el camino",
      body: en
        ? "Talk through questions and changes with your advisor; agree on how to stay in touch."
        : "Habla con tu asesor sobre dudas y cambios; acuerden c\u00f3mo mantenerse en contacto.",
    },
    {
      icon: HeartHandshake,
      title: en ? "Made for You" : "Hecho para ti",
      body: en
        ? "Your interests, your budget and your pace shape the trip we plan together."
        : "Tus gustos, tu presupuesto y tu ritmo dan forma al viaje que planeamos contigo.",
    },
  ];

  return (
    <section className="section help-section why-travel local-why" id="ayuda">
      <div className="section-heading section-heading-split reveal">
        <div>
          <p className="eyebrow">
            {en ? "Your trip. Our home." : "Tu viaje. Nuestra casa."}
          </p>
          <h2>
            {en
              ? "Why travel with\nlocal experts?"
              : "¿Por qué viajar\ncon expertos locales?"}
          </h2>
        </div>
        <p>
          {en
            ? "Mexico isn’t one kind of trip. Tell us what matters to you. We’ll help connect the places, the details and the moments in between."
            : "México no se vive de una sola manera. Cuéntanos qué es importante para ti. Te ayudamos a conectar los lugares, los detalles y lo que pasa entre ellos."}
        </p>
      </div>
      <div className="help-layout">
        <div className="help-photo reveal">
          <Photo slug="tequila" alt="Tequila, Jalisco" />
          <img
            className="section-character section-character-minerva"
            src="/media/minerva-cutout.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
        </div>
        <div className="help-panel reveal">
          <div className="help-grid why-grid">
            {benefits.map(({ icon: Icon, title, body }) => (
              <article className="why-benefit" key={title}>
                <Icon className="why-icon" size={22} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <Link className="button button-primary" href={href(locale, "plan")}>
            {en ? "Tell us your plan" : "Cu\u00e9ntanos tu plan"}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
