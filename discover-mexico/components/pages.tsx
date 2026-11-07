import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { journeys, type Locale } from "../data/content";
import { href } from "../lib/routes";
import { Photo, SectionTitle, JourneyCard, FinalCTA } from "./editorial";
import { DestinationExplorer, TourExplorer } from "./explore";
import { Reviews } from "./reviews";
import { Planner } from "./planner";
import { Hero } from "./hero";
import { DestinationShowcase } from "./destination-showcase";
import { Characters } from "./characters";
import { Offices as OriginalOffices } from "./branches";
import { WhyTravel } from "./why-travel";
import { FeaturedExperiences } from "./featured-experiences";
import { Experts } from "./experts";
import { MexicoStories, JourneyWorks } from "./mexico-stories";
export function Home({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return (
    <>
      <Hero locale={locale} />
      <Reviews locale={locale} />
      <WhyTravel locale={locale} />
      <DestinationShowcase locale={locale} />
      <FeaturedExperiences locale={locale} />
      <section className="wrap section" id="grupales">
        <SectionTitle
          locale={locale}
          label={en ? "Mexico Journeys" : "Circuitos por México"}
          title={
            en
              ? "More than one place.\nOne unforgettable journey."
              : "Más de un destino.\nUn viaje para recordar."
          }
          link="tours"
        />
        <div className="journey-grid">
          {journeys.map((j) => (
            <JourneyCard journey={j} locale={locale} key={j.slug} />
          ))}
        </div>
        <p className="editorial-note">
          {en
            ? "Ideas to make your own. Dates, services and pricing are confirmed in your personal proposal."
            : "Ideas para hacer tuyas. Las fechas, los servicios y el precio se confirman en tu propuesta personal."}
        </p>
      </section>
      <MexicoStories locale={locale} />
      <Experts locale={locale} />
      <JourneyWorks locale={locale} />
      <Characters locale={locale} />
      <FinalCTA locale={locale} />
    </>
  );
}
export function Listing({
  locale,
  kind,
}: {
  locale: Locale;
  kind: "destinations" | "tours";
}) {
  const en = locale === "en";
  return (
    <>
      <section className="wrap page-heading">
        <p className="eyebrow">
          {kind === "destinations"
            ? en
              ? "Explore Mexico"
              : "Explora México"
            : en
              ? "Mexico journeys"
              : "Circuitos por México"}
        </p>
        <h1>
          {kind === "destinations"
            ? en
              ? "Find your kind of Mexico."
              : "Encuentra tu México."
            : en
              ? "Connect places.\nCollect stories."
              : "Conecta lugares.\nColecciona historias."}
        </h1>
        <p>
          {en
            ? "Follow your curiosity. We’ll help you shape the rest."
            : "Sigue tu curiosidad. Te ayudamos a darle forma al resto."}
        </p>
      </section>
      <section className="wrap section listing-section">
        {kind === "destinations" ? (
          <DestinationExplorer locale={locale} />
        ) : (
          <TourExplorer locale={locale} />
        )}
      </section>
      <FinalCTA locale={locale} />
    </>
  );
}
export function PlanPage({
  locale,
  initial,
}: {
  locale: Locale;
  initial: Record<string, string | undefined>;
}) {
  return (
    <section className="wrap section plan-page">
      <div className="plan-intro">
        <p className="eyebrow">
          {locale === "en" ? "Tailor-made Mexico" : "México a tu manera"}
        </p>
        <h1>
          {locale === "en"
            ? "Your Mexico.\nYour way."
            : "Tu México.\nA tu manera."}
        </h1>
        <p>
          {locale === "en"
            ? "A few ideas are all we need to start. Share what you have in mind."
            : "Unas cuantas ideas bastan para empezar. Cuéntanos qué tienes en mente."}
        </p>
        <img
          className="frida-guide"
          src="/media/frida-cutout.webp"
          alt="Frida"
        />
        <small>
          {locale === "en"
            ? "A little curiosity goes a long way."
            : "La curiosidad te lleva lejos."}
        </small>
      </div>
      <Planner locale={locale} initial={initial} />
    </section>
  );
}
export function Offices({ locale }: { locale: Locale }) {
  return <OriginalOffices locale={locale} />;
}
export function About({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return (
    <>
      <section className="wrap page-heading">
        <p className="eyebrow">
          {en ? "About deviaje.mx" : "Acerca de deviaje.mx"}
        </p>
        <h1>{en ? "From Mexico.\nWith you." : "Desde México.\nContigo."}</h1>
        <p>
          {en
            ? "We believe planning a trip should feel like talking to someone who cares about where you’re going."
            : "Creemos que planear un viaje debe sentirse como hablar con alguien a quien le importa adónde vas."}
        </p>
      </section>
      <section className="wrap section two-columns">
        <Photo slug="guadalajara" alt="Guadalajara, Jalisco" />
        <div>
          <p className="eyebrow">{en ? "Our story" : "Nuestra historia"}</p>
          <h2>
            {en
              ? "Real people.\nA shared love of travel."
              : "Personas reales.\nEl mismo gusto por viajar."}
          </h2>
          <p>
            {en
              ? "Discover Mexico is the Mexico travel division of deviaje.mx, a Mexican travel agency with offices in Monterrey and Guadalajara. Our work starts by listening: who you travel with, what you enjoy and what would make the trip feel like yours."
              : "Discover Mexico es la división especializada en viajes por México de deviaje.mx, una agencia de viajes mexicana con oficinas en Monterrey y Guadalajara. Empezamos escuchando: con quién viajas, qué disfrutas y qué haría que el viaje se sienta tuyo."}
          </p>
          <p>
            {en
              ? "We help bring the journey together, explain the options and stay in touch as you prepare. Every proposal is discussed with you before a reservation is confirmed."
              : "Te ayudamos a unir las piezas, explicar las opciones y mantener contacto mientras te preparas. Cada propuesta se revisa contigo antes de confirmar una reservación."}
          </p>
        </div>
      </section>
      <section className="wrap section">
        <SectionTitle
          locale={locale}
          label={en ? "Come say hello" : "Ven a conocernos"}
          title={
            en
              ? "Real offices. Open conversations."
              : "Oficinas reales. Conversaciones cercanas."
          }
        />
        <Offices locale={locale} />
      </section>
      <Reviews locale={locale} />
      <FinalCTA locale={locale} />
    </>
  );
}
export function Contact({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return (
    <>
      <section className="wrap page-heading">
        <p className="eyebrow">{en ? "Contact" : "Contacto"}</p>
        <h1>{en ? "It starts with hello." : "Todo empieza con un hola."}</h1>
        <p>
          {en
            ? "Tell us what you’re dreaming of. Our team will help you work out the details."
            : "Cuéntanos qué estás imaginando. Nuestro equipo te ayuda con los detalles."}
        </p>
        <Link className="button primary" href={href(locale, "plan")}>
          {en ? "Start my trip request" : "Comenzar mi solicitud"}
          <ArrowUpRight size={18} />
        </Link>
      </section>
      <section className="wrap section">
        <Offices locale={locale} />
        <p className="editorial-note">
          {en
            ? "Please confirm the language and availability of your advisor when getting in touch."
            : "Confirma el idioma y la disponibilidad de tu asesor al contactarnos."}
        </p>
      </section>
    </>
  );
}
export function Information({
  locale,
  kind,
}: {
  locale: Locale;
  kind: "privacy" | "terms" | "travel";
}) {
  const en = locale === "en";
  const titles = {
    privacy: en ? "Your privacy matters." : "Tu privacidad importa.",
    terms: en
      ? "A clear start to your journey."
      : "Un inicio claro para tu viaje.",
    travel: en ? "Before you travel to Mexico." : "Antes de viajar a México.",
  };
  return (
    <section className="wrap section information">
      <p className="eyebrow">Discover Mexico</p>
      <h1>{titles[kind]}</h1>
      {kind === "privacy" ? (
        <>
          <p className="notice">
            {en
              ? "Preview privacy information. The final legal entity, privacy contact and retention policy must be completed before online requests are enabled for production."
              : "Información preliminar de privacidad. Antes de habilitar solicitudes en producción deben completarse la razón social, el contacto de privacidad y la política de conservación."}
          </p>
          <h2>
            {en
              ? "Information you choose to share"
              : "Información que decides compartir"}
          </h2>
          <p>
            {en
              ? "A trip request asks for contact details and travel preferences to prepare a proposal and arrange follow-up. It does not require payment details, identity documents or sensitive health information."
              : "La solicitud pide datos de contacto y preferencias de viaje para preparar una propuesta y dar seguimiento. No solicita datos bancarios, documentos de identidad ni información médica sensible."}
          </p>
          <h2>{en ? "Planning and follow-up" : "Planeación y seguimiento"}</h2>
          <p>
            {en
              ? "When enabled, requests are processed by deviaje.mx and its configured CRM provider, Kommo. In development mode, contact details are not stored or sent to Kommo. WhatsApp is optional and opens only when you choose to continue; its own privacy terms apply."
              : "Al habilitarse, las solicitudes serán procesadas por deviaje.mx y su CRM configurado, Kommo. En modo desarrollo, los datos de contacto no se almacenan ni se envían a Kommo. WhatsApp es opcional y se abre cuando decides continuar; aplican sus propias condiciones de privacidad."}
          </p>
        </>
      ) : kind === "terms" ? (
        <>
          <p className="notice">
            {en
              ? "Preview travel information. Final commercial terms require approval before production launch."
              : "Información preliminar. Las condiciones comerciales definitivas requieren aprobación antes del lanzamiento."}
          </p>
          <h2>
            {en
              ? "A request is not a booking"
              : "Una solicitud no es una reservación"}
          </h2>
          <p>
            {en
              ? "Journeys shown here are editorial suggestions. Dates, hotels, activities, transport, inclusions and pricing are confirmed in your individual proposal. No booking or payment is completed on this website."
              : "Los circuitos son propuestas editoriales. Fechas, hoteles, actividades, transporte, inclusiones y precio se confirman en tu propuesta individual. Este sitio no completa reservaciones ni pagos."}
          </p>
          <h2>{en ? "Before you confirm" : "Antes de confirmar"}</h2>
          <p>
            {en
              ? "Review the proposal, supplier terms, cancellation conditions and currency with your advisor. The final written quotation takes precedence over itinerary ideas on this website."
              : "Revisa con tu asesor la propuesta, las condiciones del proveedor, cancelaciones y moneda. La cotización final por escrito prevalece sobre las ideas de itinerario de este sitio."}
          </p>
        </>
      ) : (
        <>
          <h2>{en ? "Entry requirements" : "Requisitos de entrada"}</h2>
          <p>
            {en
              ? "Requirements depend on your passport and personal circumstances. Check the official Mexican consular guidance for your country before booking. Your advisor can help you find the relevant official information."
              : "Los requisitos dependen de tu pasaporte y situación personal. Consulta la información consular oficial mexicana para tu país antes de reservar. Tu asesor puede ayudarte a localizarla."}
          </p>
          <a
            className="text-link"
            href="https://www.gob.mx/sre"
            target="_blank"
            rel="noopener noreferrer"
          >
            Secretaría de Relaciones Exteriores
            <ArrowUpRight size={18} />
          </a>
          <h2>{en ? "Plan for the distances" : "Considera las distancias"}</h2>
          <p>
            {en
              ? "Mexico is large. Plan transfer time between regions and avoid treating a long drive as a short excursion. Your itinerary should leave room for rest and changes."
              : "México es grande. Considera los tiempos de traslado entre regiones y deja espacio para descanso y ajustes."}
          </p>
          <h2>
            {en
              ? "Money, conditions and assistance"
              : "Moneda, condiciones y asistencia"}
          </h2>
          <p>
            {en
              ? "Confirm the currency, total price, occupancy, baggage, cancellation terms and any additional charges in your written quotation. Ask your advisor about suitable travel insurance and assistance options."
              : "Confirma moneda, precio total, ocupación, equipaje, cancelaciones y cargos adicionales en tu cotización. Consulta con tu asesor las opciones de seguro y asistencia para tu viaje."}
          </p>
          <h2>{en ? "Photography credits" : "Créditos fotográficos"}</h2>
          <a className="text-link" href="/image-credits.json">
            {en
              ? "Sources and licenses for destination photographs"
              : "Fuentes y licencias de fotografías de destinos"}
            <ArrowUpRight size={18} />
          </a>
        </>
      )}
    </section>
  );
}
