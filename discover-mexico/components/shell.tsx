"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import type { Locale } from "../data/content";
import { href, alternatePath } from "../lib/routes";
export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <span className="brand-lockup">
      <span className="brand">
        <img
          className={footer ? "" : "logo-on-dark"}
          src={`/media/logo-${footer ? "white" : "yellow"}.png`}
          alt="deviaje.mx"
        />
        {!footer && (
          <img
            className="logo-on-light"
            src="/media/logo-black.png"
            alt=""
            aria-hidden="true"
          />
        )}
      </span>
      <small>Discover Mexico</small>
    </span>
  );
}
export function Header({ locale }: { locale: Locale }) {
  const path = usePathname();
  const isHome = path === href(locale);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const en = locale === "en";
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => setOpen(false), [path]);
  return (
    <header
      className={`site-header ${scrolled || !isHome ? "is-scrolled" : ""}`}
    >
      <Link href={href(locale)} aria-label="deviaje.mx · Discover Mexico">
        <Brand />
      </Link>
      <Link className="mobile-quote" href={href(locale, "plan")}>
        {en ? "Plan my trip" : "Mi viaje"}
      </Link>
      <button
        className="menu-toggle"
        type="button"
        aria-label={en ? "Toggle navigation" : "Abrir navegación"}
        aria-controls="discover-nav"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav
        id="discover-nav"
        className={`main-nav ${open ? "is-open" : ""}`}
        aria-label={en ? "Main navigation" : "Navegación principal"}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <Link href={href(locale, "destinations")}>
          {en ? "Destinations" : "Destinos"}
        </Link>
        <Link href={`${href(locale)}#experiences`}>
          {en ? "Mexico Packages" : "Paquetes por México"}
        </Link>
        <Link href={href(locale, "tours")}>
          {en ? "Mexico Journeys" : "Circuitos"}
        </Link>
        <Link href={`${href(locale)}#resenas`}>
          {en ? "Reviews" : "Reseñas"}
        </Link>
        <details className="nav-more">
          <summary>
            {en ? "Meet deviaje" : "Conoce deviaje"}
            <ChevronDown size={14} />
          </summary>
          <div>
            <Link href={`${href(locale)}#expertos`}>
              {en ? "Our Travel Experts" : "Nuestros asesores"}
            </Link>
            <Link href={href(locale, "about")}>
              {en ? "About Us" : "Nosotros"}
            </Link>
            <Link href={href(locale, "contact")}>
              {en ? "Contact" : "Contacto"}
            </Link>
          </div>
        </details>
        <Link
          className="language"
          href={alternatePath(path)}
          lang={en ? "es" : "en"}
        >
          {en ? "EN / ES" : "ES / EN"}
        </Link>
        <Link className="nav-cta" href={href(locale, "plan")}>
          {en ? "Plan My Trip" : "Planea mi viaje"}
        </Link>
      </nav>
    </header>
  );
}
export function Footer({
  locale,
  whatsappNumber,
}: {
  locale: Locale;
  whatsappNumber?: string;
}) {
  const en = locale === "en";
  return (
    <>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href={href(locale)}>
              <Brand footer />
            </Link>
            <p>
              {en
                ? "Personal journeys. Real travel experts."
                : "Viajes personalizados. Asesores reales."}
            </p>
            <div className="footer-social">
              <a
                href="https://www.instagram.com/agenciadeviaje.mx/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className="footer-social-icon footer-social-instagram"
                  aria-hidden="true"
                />
                Instagram
              </a>
              <a
                href="https://www.facebook.com/agenciadeviaje.mx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className="footer-social-icon footer-social-facebook"
                  aria-hidden="true"
                />
                Facebook
              </a>
            </div>
          </div>
          <nav className="footer-links" aria-label={en ? "Explore" : "Explora"}>
            <p>{en ? "Explore" : "Explora"}</p>
            <Link href={href(locale, "destinations")}>
              {en ? "Destinations" : "Destinos"}
            </Link>
            <Link href={`${href(locale)}#experiences`}>
              {en ? "Mexico Packages" : "Paquetes por México"}
            </Link>
            <Link href={href(locale, "experiences")}>
              {en ? "Experiences" : "Experiencias"}
            </Link>
            <Link href={href(locale, "tours")}>
              {en ? "Mexico Journeys" : "Circuitos por México"}
            </Link>
            <Link href={`${href(locale)}#personajes`}>
              {en ? "Travel companions" : "Equipo viajero"}
            </Link>
            <Link href={href(locale, "travel")}>
              {en ? "Travel information" : "Información para viajar"}
            </Link>
          </nav>
          <nav
            className="footer-links"
            aria-label={en ? "Confidence" : "Confianza"}
          >
            <p>{en ? "Confidence" : "Confianza"}</p>
            <Link href={`${href(locale)}#expertos`}>
              {en ? "Our Travel Experts" : "Nuestros asesores"}
            </Link>
            <Link href={`${href(locale)}#resenas`}>
              {en ? "Reviews" : "Reseñas"}
            </Link>
            <Link href={href(locale, "about")}>
              {en ? "About Us" : "Nosotros"}
            </Link>
            {[
              ["Monterrey", "tX8O89KmEiMsLPtea"],
              ["Guadalajara", "ctm8ggcWMxuWFL2av"],
            ].map(([name, id]) => (
              <a
                key={id}
                href={`https://share.google/${id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className="footer-social-icon footer-social-google"
                  aria-hidden="true"
                />
                Google · {name}
              </a>
            ))}
          </nav>
          <nav
            className="footer-links footer-contact"
            aria-label={en ? "Contact" : "Contacto"}
          >
            <p>{en ? "Let’s talk" : "Hablemos"}</p>
            <Link className="footer-cta" href={href(locale, "plan")}>
              {en ? "Plan My Mexico Trip" : "Planea mi viaje"}
              <ArrowUpRight size={17} />
            </Link>
            <Link href={href(locale, "contact")}>
              {en ? "Contact" : "Contacto"}
            </Link>
            <a href="tel:+528135294738">Monterrey · 81 3529 4738</a>
            <a href="tel:+523334855963">Guadalajara · 33 3485 5963</a>
            <a className="parent-site-link" href="https://deviaje.mx" hrefLang="es-MX">
              {en
                ? "Looking for trips beyond Mexico? Visit deviaje.mx (Spanish)"
                : "¿Buscas otros destinos? Visita deviaje.mx"}
            </a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} deviaje.mx · Discover Mexico</span>
          <span>
            <Link href={href(locale, "privacy")}>
              {en ? "Privacy Policy" : "Aviso de privacidad"}
            </Link>
            <span aria-hidden="true">·</span>
            <Link href={href(locale, "terms")}>
              {en ? "Terms & Conditions" : "Términos y condiciones"}
            </Link>
          </span>
        </div>
      </footer>
      <WhatsappFloat locale={locale} number={whatsappNumber} />
    </>
  );
}
export function RevealObserver() {
  const path = usePathname();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".reveal:not(.is-visible)")
      .forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, [path]);
  return null;
}
function WhatsappFloat({
  locale,
  number,
}: {
  locale: Locale;
  number?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 520);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <Link
      className={`whatsapp-float ${visible ? "is-visible" : ""}`}
      href={
        number
          ? `https://wa.me/${number}?text=${encodeURIComponent(locale === "en" ? "Hello! I’m interested in planning a trip to Mexico. Could you help me?" : "Hola, me gustaría planear un viaje por México. ¿Me ayudan?")}`
          : href(locale, "plan")
      }
      target={number ? "_blank" : undefined}
      rel={number ? "noopener noreferrer" : undefined}
    >
      <span className="button-icon icon-whatsapp" aria-hidden="true" />
      <span>
        <small>
          {locale === "en"
            ? "Planning your Mexico trip?"
            : "¿Planeamos tu viaje?"}
        </small>
        {locale === "en" ? "Plan My Trip" : "Escríbenos"}
      </span>
    </Link>
  );
}
