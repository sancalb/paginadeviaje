"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { destinations, t, type Locale } from "../data/content";
import { href } from "../lib/routes";

const desktopQuery =
  "(hover: hover) and (pointer: fine) and (min-width: 901px)";
const teaserSlugs = [
  "oaxaca",
  "mexico-city",
  "guadalajara",
  "tequila",
] as const;
const crew = [
  {
    slug: "diego",
    name: "Diego",
    role: { en: "Destination Explorer", es: "Explorador de Destinos" },
    phrase: {
      en: "I want to discover where to go.",
      es: "Quiero descubrir a dónde ir.",
    },
  },
  {
    slug: "chente",
    name: "Chente",
    role: { en: "Ambassador of Joy", es: "Embajador de la Alegría" },
    phrase: {
      en: "I know where. I want to know what to do.",
      es: "Ya sé a dónde. Quiero saber qué hacer.",
    },
  },
  {
    slug: "diana",
    name: "Diana",
    role: { en: "Deal Hunter", es: "Cazadora de Ofertas" },
    phrase: {
      en: "Show me a great opportunity.",
      es: "Enséñame una buena oportunidad.",
    },
  },
  {
    slug: "frida",
    name: "Frida",
    role: { en: "Guardian of Culture", es: "Guardiana de la Cultura" },
    phrase: {
      en: "I want to experience something different.",
      es: "Quiero conocer algo diferente.",
    },
  },
  {
    slug: "minerva",
    name: "Minerva",
    role: { en: "Protector of Travelers", es: "Protectora de los Viajeros" },
    phrase: {
      en: "I want to have everything under control.",
      es: "Quiero tener todo bajo control.",
    },
  },
  {
    slug: "tenoch",
    name: "Tenoch",
    role: {
      en: "Conqueror of Experiences",
      es: "Conquistador de Experiencias",
    },
    phrase: {
      en: "I'm planning something special.",
      es: "Estoy planeando algo especial.",
    },
  },
];
const teaserDestinations = teaserSlugs.flatMap((slug) => {
  const destination = destinations.find((item) => item.slug === slug);
  return destination ? [destination] : [];
});

export function Characters({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const host = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const panelId = `frida-destinations-${id}`;
  const titleId = `frida-menu-title-${id}`;
  const catalogHref = href(locale, "destinations");

  function cancelClose() {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      if (
        !host.current?.contains(document.activeElement) &&
        !host.current?.matches(":hover")
      ) {
        setOpen(false);
      }
    }, 240);
  }

  useEffect(() => {
    const media = window.matchMedia(desktopQuery);
    function syncDesktop() {
      setDesktop(media.matches);
      if (!media.matches) {
        cancelClose();
        setOpen(false);
      }
    }
    syncDesktop();
    media.addEventListener("change", syncDesktop);
    return () => {
      media.removeEventListener("change", syncDesktop);
      cancelClose();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      cancelClose();
      // Focus stays in the host, so restoring it cannot reopen the teaser.
      if (host.current?.contains(document.activeElement))
        trigger.current?.focus();
      setOpen(false);
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open]);

  return (
    <section className="section crew-section" id="personajes">
      <div className="section-heading reveal is-visible">
        <p className="eyebrow">
          {locale === "en"
            ? "Travel companions"
            : "Compañeros de viaje"}
        </p>
        <h2>
          {locale === "en"
            ? "A little deviaje, wherever you go."
            : "Un poco de deviaje en cada aventura."}
        </h2>
      </div>
      <div
        className={`mini-crew reveal is-visible${open ? " has-frida-open" : ""}`}
        aria-label={
          locale === "en" ? "deviaje characters" : "Personajes deviaje"
        }
        // The original <=1160px scroller otherwise clips the desktop teaser.
        style={
          desktop
            ? {
                overflow: "visible",
                gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              }
            : undefined
        }
      >
        {crew.map((member) => {
          const portrait = (
            <>
              <img
                src={`/media/${member.slug}-cutout.webp`}
                alt={`${member.name}, ${t(member.role, locale)}`}
                width={150}
                height={230}
                style={{ maxWidth: "100%" }}
                loading="lazy"
                decoding="async"
              />
              <strong>{member.name}</strong>
              <span>{t(member.role, locale)}</span>
              <em>{t(member.phrase, locale)}</em>
            </>
          );
          if (member.slug !== "frida")
            return <article key={member.slug}>{portrait}</article>;

          return (
            <article
              key={member.slug}
              ref={host}
              className={`frida-member${open ? " is-frida-open" : ""}`}
              data-frida-menu-host=""
              onPointerEnter={(event) => {
                if (!desktop || event.pointerType === "touch") return;
                cancelClose();
                setOpen(true);
              }}
              onPointerLeave={() => {
                if (desktop) scheduleClose();
              }}
              onFocusCapture={(event) => {
                cancelClose();
                if (
                  desktop &&
                  !event.currentTarget.contains(event.relatedTarget)
                )
                  setOpen(true);
              }}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  scheduleClose();
              }}
            >
              <a
                ref={trigger}
                className="frida-trigger"
                href={catalogHref}
                data-frida-trigger=""
                aria-expanded={open}
                aria-controls={panelId}
              >
                {portrait}
              </a>
              <div
                className="frida-mega"
                id={panelId}
                data-frida-menu=""
                aria-hidden={!open}
                inert={!open}
                onPointerEnter={cancelClose}
                onPointerLeave={() => {
                  if (desktop) scheduleClose();
                }}
              >
                <div
                  className="frida-menu-panel"
                  role="dialog"
                  aria-modal={false}
                  aria-labelledby={titleId}
                >
                  <div className="frida-menu-copy">
                    <p className="eyebrow">Frida · {t(member.role, locale)}</p>
                    <h3 id={titleId}>
                      {locale === "en"
                        ? "Journeys with a story to tell."
                        : "Viajes que tienen algo que contar."}
                    </h3>
                    <p>
                      {locale === "en"
                        ? "Discover places through their history, flavors and way of life."
                        : "Descubre lugares por su historia, sabores y forma de vivir."}
                    </p>
                  </div>
                  <div
                    className="frida-menu-content"
                    data-frida-menu-content=""
                  >
                    <div className="frida-teaser-strip">
                      {teaserDestinations.map((destination) => (
                        <a
                          key={destination.slug}
                          className={`frida-teaser-link${destination.image ? " has-image" : ""}`}
                          href={href(locale, "destinations", destination.slug)}
                          style={
                            {
                              padding: "10px 6px",
                              "--destination-image": destination.image
                                ? `url("${destination.image}")`
                                : undefined,
                            } as CSSProperties
                          }
                          onClick={() => setOpen(false)}
                        >
                          <span style={{ color: "inherit" }}>
                            {locale === "en" ? "Mexico" : "México"}
                          </span>
                          <strong
                            style={{
                              color: "inherit",
                              fontSize: "0.72rem",
                              lineHeight: 1.2,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {t(destination.name, locale)}
                          </strong>
                          <small aria-hidden="true">
                            <ArrowRight size={14} />
                          </small>
                        </a>
                      ))}
                    </div>
                    <a
                      className="frida-menu-explore"
                      href={catalogHref}
                      onClick={() => setOpen(false)}
                    >
                      {locale === "en" ? "Explore all" : "Explorar todos"}{" "}
                      <ArrowRight
                        size={14}
                        aria-hidden="true"
                        style={{
                          display: "inline-block",
                          verticalAlign: "middle",
                        }}
                      />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
