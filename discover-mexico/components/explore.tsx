"use client";
import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, SlidersHorizontal } from "lucide-react";
import {
  destinations,
  journeys,
  experienceCategories,
  t,
  type Locale,
} from "../data/content";
import { DestinationTile, JourneyCard } from "./editorial";
import { href } from "../lib/routes";
export function QuickSearch({ locale }: { locale: Locale }) {
  function validate(event: FormEvent<HTMLFormElement>) {
    const invalid = event.currentTarget.querySelector<HTMLInputElement>(":invalid");
    if (!invalid) return;
    event.preventDefault();
    invalid.setCustomValidity(locale === "en" ? "Please check the travel month and choose between 1 and 20 travelers." : "Revisa el mes del viaje y elige entre 1 y 20 viajeros.");
    invalid.reportValidity();
  }
  return (
    <form className="quick-search" action={href(locale, "plan")} noValidate onSubmit={validate} onInput={event => {
      if (event.target instanceof HTMLInputElement) event.target.setCustomValidity("");
    }}>
      <label>
        {locale === "en" ? "Traveling from" : "Viajas desde"}
        <input
          name="origin"
          placeholder={
            locale === "en" ? "Your city or airport" : "Tu ciudad o aeropuerto"
          }
          maxLength={100}
        />
      </label>
      <label>
        {locale === "en" ? "Where to?" : "¿A dónde?"}
        <select name="destination">
          <option value="">
            {locale === "en" ? "Somewhere in Mexico" : "Un lugar en México"}
          </option>
          {destinations.map((d) => (
            <option key={d.slug} value={d.slug}>
              {t(d.name, locale)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {locale === "en" ? "When?" : "¿Cuándo?"}
        <input
          type="month"
          name="month"
          aria-label={locale === "en" ? "Travel month" : "Mes del viaje"}
        />
      </label>
      <label>
        {locale === "en" ? "Travelers" : "Viajeros"}
        <input name="adults" type="number" min={1} max={20} defaultValue={2} />
      </label>
      <button className="button primary" type="submit">
        {locale === "en" ? "Let’s plan" : "Planeemos"}
        <ArrowUpRight size={18} />
      </button>
    </form>
  );
}
export function DestinationExplorer({ locale }: { locale: Locale }) {
  const [category, setCategory] = useState("all");
  useEffect(() => {
    const interest = new URLSearchParams(window.location.search).get(
      "interest",
    );
    if (experienceCategories.some((c) => c.id === interest))
      setCategory(interest!);
  }, []);
  const options = [
    { id: "all", name: { en: "All of Mexico", es: "Todo México" } },
    ...experienceCategories,
  ];
  return (
    <>
      <div
        className="filter-chips"
        aria-label={
          locale === "en" ? "Experience filters" : "Filtros de experiencias"
        }
      >
        {options.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            aria-pressed={category === c.id}
          >
            {t(c.name, locale)}
          </button>
        ))}
      </div>
      <div className="destination-grid">
        {destinations
          .filter((d) => category === "all" || d.category.includes(category))
          .map((d, i) => (
            <DestinationTile
              destination={d}
              locale={locale}
              key={d.slug}
              large={i === 0}
            />
          ))}
      </div>
      {!destinations.some(
        (d) => category === "all" || d.category.includes(category),
      ) && (
        <p>
          {locale === "en"
            ? "Tell us your interests and we’ll help find the right place."
            : "Cuéntanos tus intereses y te ayudamos a encontrar el lugar."}
          <Link href={href(locale, "plan")}> →</Link>
        </p>
      )}
    </>
  );
}
export function TourExplorer({ locale }: { locale: Locale }) {
  const [duration, setDuration] = useState("all");
  const [destination, setDestination] = useState("all");
  const [interest, setInterest] = useState("all");
  const [budget, setBudget] = useState("all");
  const filtered = journeys.filter(
    (j) =>
      (duration === "all" ||
        (duration === "week" ? j.days <= 7 : j.days > 7)) &&
      (destination === "all" || j.destinations.includes(destination)) &&
      (interest === "all" ||
        j.destinations.some((s) =>
          destinations.find((d) => d.slug === s)?.category.includes(interest),
        )),
  );
  return (
    <>
      <div className="tour-filters">
        <SlidersHorizontal size={20} />
        <label>
          {locale === "en" ? "Duration" : "Duración"}
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="all">
              {locale === "en" ? "Any duration" : "Cualquier duración"}
            </option>
            <option value="week">
              {locale === "en" ? "Up to 7 days" : "Hasta 7 días"}
            </option>
            <option value="long">
              {locale === "en" ? "8+ days" : "8+ días"}
            </option>
          </select>
        </label>
        <label>
          {locale === "en" ? "Destination" : "Destino"}
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            <option value="all">
              {locale === "en" ? "All destinations" : "Todos los destinos"}
            </option>
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug}>
                {t(d.name, locale)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {locale === "en" ? "Interests / style" : "Intereses / estilo"}
          <select
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
          >
            <option value="all">
              {locale === "en" ? "Any interest" : "Cualquier interés"}
            </option>
            {experienceCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c.name, locale)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {locale === "en" ? "Budget per person" : "Presupuesto por persona"}
          <select value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="all">
              {locale === "en" ? "Let’s discuss" : "Por definir"}
            </option>
            <option value="1000-2000">USD 1,000–2,000</option>
            <option value="2000-4000">USD 2,000–4,000</option>
            <option value="4000+">USD 4,000+</option>
          </select>
        </label>
      </div>
      {budget !== "all" && (
        <p className="notice">
          {locale === "en"
            ? "These journeys are individually quoted. Your budget will help us tailor the proposal; it is not a listed price."
            : "Estos circuitos se cotizan de forma individual. Tu presupuesto nos ayuda a personalizar la propuesta; no es un precio publicado."}
          <Link
            href={`${href(locale, "plan")}?budget=${encodeURIComponent(budget)}`}
          >
            {" "}
            {locale === "en"
              ? "Plan with this budget"
              : "Planea con este presupuesto"}{" "}
            →
          </Link>
        </p>
      )}
      <div className="journey-grid">
        {filtered.map((j) => (
          <JourneyCard journey={j} locale={locale} key={j.slug} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="notice">
          {locale === "en"
            ? "No suggested journey matches these filters. We can create one for you."
            : "Ningún itinerario de referencia coincide. Podemos crear uno para ti."}
          <Link href={href(locale, "plan")}> →</Link>
        </p>
      )}
    </>
  );
}
