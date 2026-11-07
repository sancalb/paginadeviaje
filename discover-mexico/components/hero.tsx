"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import type { Locale } from "../data/content";
import { href } from "../lib/routes";

const scenes = [
  {
    slug: "mexico-city",
    name: { en: "Mexico City", es: "Ciudad de México" },
    line: {
      en: "A thousand stories. One extraordinary city.",
      es: "Mil historias. Una ciudad extraordinaria.",
    },
  },
  {
    slug: "cancun",
    name: { en: "Cancún", es: "Cancún" },
    line: {
      en: "A little more blue. A little less hurry.",
      es: "Un poco más de azul. Un poco menos de prisa.",
    },
  },
  {
    slug: "oaxaca",
    name: { en: "Oaxaca", es: "Oaxaca" },
    line: {
      en: "Culture you can see, feel and taste.",
      es: "Cultura que se ve, se siente y se saborea.",
    },
  },
  {
    slug: "tequila",
    name: { en: "Tequila, Jalisco", es: "Tequila, Jalisco" },
    line: {
      en: "A landscape with a story of its own.",
      es: "Un paisaje con una historia propia.",
    },
  },
  {
    slug: "puerto-vallarta",
    name: { en: "Puerto Vallarta", es: "Puerto Vallarta" },
    line: {
      en: "Where the mountains meet the Pacific.",
      es: "Donde las montañas se encuentran con el Pacífico.",
    },
  },
  {
    slug: "riviera-maya",
    name: { en: "Riviera Maya", es: "Riviera Maya" },
    line: {
      en: "Ancient stories beside the Caribbean.",
      es: "Historias antiguas junto al Caribe.",
    },
  },
  {
    slug: "guadalajara",
    name: { en: "Guadalajara", es: "Guadalajara" },
    line: {
      en: "Take your time. Find your Jalisco.",
      es: "Ve sin prisa. Encuentra tu Jalisco.",
    },
  },
  {
    slug: "los-cabos",
    name: { en: "Los Cabos", es: "Los Cabos" },
    line: {
      en: "The coastline is only the beginning.",
      es: "La costa es solo el comienzo.",
    },
  },
];

export function Hero({ locale }: { locale: Locale }) {
  const media = useRef<HTMLDivElement>(null);
  const state = useRef({ index: 0, layer: 0, busy: false, sequence: 0 });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reduced, setReduced] = useState(true);
  const en = locale === "en";
  const show = useCallback(async (candidate: number) => {
    const current = state.current;
    if (current.busy) return;
    candidate = (candidate + scenes.length) % scenes.length;
    if (candidate === current.index) return;
    const layers = media.current?.querySelectorAll("img");
    if (!layers || layers.length !== 2) return;
    current.busy = true;
    const sequence = ++current.sequence;
    const next = 1 - current.layer;
    layers[next].src = `/media/${scenes[candidate].slug}.webp`;
    try {
      await layers[next].decode();
    } catch {
      current.busy = false;
      return;
    }
    if (sequence !== state.current.sequence || !media.current) return;
    layers[next].classList.add("is-active");
    layers[current.layer].classList.remove("is-active");
    current.index = candidate;
    current.layer = next;
    setIndex(candidate);
    window.setTimeout(() => {
      if (state.current.sequence === sequence) current.busy = false;
    }, 980);
    const preload = new Image();
    preload.src = `/media/${scenes[(candidate + 1) % scenes.length].slug}.webp`;
  }, []);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(motion.matches);
    sync();
    motion.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      state.current.sequence++;
    };
  }, []);
  useEffect(() => {
    if (paused || hovered || reduced) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) void show(state.current.index + 1);
    }, 7000);
    return () => clearInterval(timer);
  }, [paused, hovered, reduced, show]);
  return (
    <section
      className="hero cinematic-hero"
      id="inicio"
      aria-label="Discover Mexico by deviaje.mx"
      aria-roledescription={en ? "carousel" : "carrusel"}
    >
      <div className="hero-media is-crossfade" ref={media} aria-hidden="true">
        <img
          className="is-active"
          src="/media/mexico-city.webp"
          alt=""
          fetchPriority="high"
        />
        <img src="/media/mexico-city.webp" alt="" decoding="async" />
      </div>
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-copy reveal">
          <p className="eyebrow">Discover Mexico by deviaje.mx</p>
          <h1>
            {en
              ? "Discover Mexico.\nMake it yours."
              : "Descubre México.\nHazlo tuyo."}
          </h1>
          <p className="hero-lede">
            {en
              ? "The places you’ve dreamed of. The Mexico you haven’t met yet. A local team to help bring it all together."
              : "Los lugares que sueñas. El México que aún no conoces. Un equipo local para ayudarte a conectar todo."}
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href={href(locale, "plan")}>
              {en ? "Plan my Mexico trip" : "Planea mi viaje por México"}
              <ArrowUpRight size={19} />
            </Link>
            <Link className="hero-explore-link" href="#destinos">
              {en ? "Find your inspiration" : "Encuentra tu inspiración"}
              <ArrowDown size={18} />
            </Link>
          </div>
        </div>
      </div>
      <div
        className="hero-cinema-footer wrap"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setHovered(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setHovered(false);
        }}
      >
        <Link
          className="hero-scene-caption"
          href={href(locale, "destinations", scenes[index].slug)}
        >
          <span className="scene-counter">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(scenes.length).padStart(2, "0")}
          </span>
          <span>
            <strong>{scenes[index].name[locale]}</strong>
            <small>{scenes[index].line[locale]}</small>
          </span>
          <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
        <div className="hero-cinema-controls">
          <div className="hero-scene-dots">
            {scenes.map((scene, i) => (
              <button
                key={scene.slug}
                type="button"
                className={index === i ? "is-active" : ""}
                aria-label={`${en ? "Show" : "Mostrar"} ${scene.name[locale]}`}
                aria-pressed={index === i}
                onClick={() => {
                  setPaused(true);
                  void show(i);
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="hero-icon-button"
            onClick={() => {
              setPaused(true);
              void show(state.current.index - 1);
            }}
            aria-label={
              en ? "Previous destination photo" : "Foto del destino anterior"
            }
          >
            <ChevronLeft size={21} />
          </button>
          <button
            type="button"
            className="hero-icon-button"
            onClick={() => {
              setPaused(true);
              void show(state.current.index + 1);
            }}
            aria-label={
              en ? "Next destination photo" : "Foto del destino siguiente"
            }
          >
            <ChevronRight size={21} />
          </button>
          {!reduced && (
            <button
              type="button"
              className="hero-icon-button"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
              aria-label={
                paused
                  ? en
                    ? "Play slideshow"
                    : "Reanudar presentación"
                  : en
                    ? "Pause slideshow"
                    : "Pausar presentación"
              }
            >
              {paused ? <Play size={17} /> : <Pause size={17} />}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
