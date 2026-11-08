"use client";
import { useState, useRef, useId } from "react";
import { ArrowRight, ArrowLeft, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { destinations, journeys, t, type Locale } from "../data/content";
import { getTourIdentityById } from "../data/tour-identities";
import { href } from "../lib/routes";
import { trackInquiryResponse } from "../lib/analytics";
type HotelCategory = "comfort" | "premium" | "luxury";
export function Planner({
  locale,
  initial = {},
}: {
  locale: Locale;
  initial?: Record<string, string | undefined>;
}) {
  const en = locale === "en";
  const tourPackage = getTourIdentityById(initial.package || "");
  const packageCode = tourPackage?.id || "";
  const packageDestination = tourPackage
    ? destinations.find((d) => d.slug === tourPackage.destinationSlug)
    : undefined;
  const [hotelCategory, setHotelCategory] = useState<HotelCategory>(
    tourPackage &&
      (initial.hotelCategory === "comfort" ||
        initial.hotelCategory === "premium" ||
        initial.hotelCategory === "luxury")
      ? initial.hotelCategory
      : "comfort",
  );
  const [packageLanguage, setPackageLanguage] = useState<Locale>(
    tourPackage && (initial.language === "en" || initial.language === "es")
      ? initial.language
      : locale,
  );
  const countryListId = useId();
  const packageCommentsPrefix = tourPackage
    ? [
        "[Discover Mexico package]",
        `${en ? "Package ID" : "ID del paquete"}: ${tourPackage.id}`,
        `${en ? "Package name" : "Nombre del paquete"}: ${t(tourPackage.name, locale)}`,
        `${en ? "Package code" : "Código del paquete"}: ${packageCode}`,
        `${en ? "Destination" : "Destino"}: ${tourPackage.destinationSlug}`,
        `${en ? "Locale" : "Idioma de la página"}: ${locale}`,
        `${en ? "Language" : "Idioma"}: ${packageLanguage}`,
        `${en ? "Hotel category" : "Categoría de hotel"}: ${hotelCategory}`,
        "",
        "",
      ].join("\n")
    : "";
  const commentsMaxLength = Math.max(0, 2000 - packageCommentsPrefix.length);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(
    tourPackage
      ? [tourPackage.destinationSlug]
      : initial.journey
        ? journeys
            .find((j) => j.slug === initial.journey)
            ?.destinations.filter((s) =>
              destinations.some((d) => d.slug === s),
            ) || []
        : initial.destination &&
            destinations.some((d) => d.slug === initial.destination)
          ? [initial.destination]
          : [],
  );
  const [interests, setInterests] = useState<string[]>([]);
  const [mode, setMode] = useState("flexible");
  const [children, setChildren] = useState(0);
  const [style, setStyle] = useState("comfort");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    mode: string;
    requestId: string;
    whatsappUrl?: string | null;
  } | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const started = useRef(Date.now());
  const id = useRef("");
  const labels = en
    ? [
        "Your places",
        "Your dates",
        "Your people",
        "Your style",
        "Your interests",
        "Your budget",
        "Say hello",
      ]
    : [
        "Tus destinos",
        "Tus fechas",
        "Tus viajeros",
        "Tu estilo",
        "Tus intereses",
        "Tu presupuesto",
        "Nos conocemos",
      ];
  const toggle = (value: string, list: string[], set: (v: string[]) => void) =>
    set(
      list.includes(value) ? list.filter((s) => s !== value) : [...list, value],
    );
  function validateStep() {
    const invalid = form.current?.querySelector<HTMLInputElement>(
      ".planner-step:not([hidden]) :invalid",
    );
    if (!invalid) return true;
    const label = invalid.closest("label")?.childNodes[0]?.textContent?.trim() ||
      (en ? "This field" : "Este campo");
    const v = invalid.validity;
    const message = v.valueMissing
      ? en ? `${label}: please complete this field.` : `${label}: completa este campo.`
      : v.typeMismatch
        ? en ? "Enter a valid email address." : "Escribe un correo electrónico válido."
        : v.rangeOverflow || v.rangeUnderflow || v.stepMismatch || v.badInput
          ? en ? `${label}: enter a number between ${invalid.min} and ${invalid.max}.` : `${label}: escribe un número entre ${invalid.min} y ${invalid.max}.`
          : en ? `${label}: please check this value.` : `${label}: revisa este dato.`;
    setError(message);
    invalid.setAttribute("aria-invalid", "true");
    invalid.focus();
    return false;
  }
  function next() {
    setError("");
    if (step === 0 && !selected.length) {
      setError(
        en ? "Choose at least one destination." : "Elige al menos un destino.",
      );
      return;
    }
    if (step === 1 && mode === "exact") {
      const dates = new FormData(form.current!);
      const start = String(dates.get("start") || "");
      const end = String(dates.get("end") || "");
      if (start && end && end <= start) {
        setError(
          en
            ? "Your return must be after your start date."
            : "El regreso debe ser después del inicio.",
        );
        return;
      }
    }
    if (!validateStep()) return;
    setStep(step + 1);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 6) {
      next();
      return;
    }
    setError("");
    if (!validateStep()) return;
    setBusy(true);
    const data = new FormData(form.current!);
    if (!id.current) id.current = crypto.randomUUID();
    const body = {
      locale,
      destinations: selected,
      origin: String(data.get("origin") || ""),
      dates: {
        mode,
        start: String(data.get("start") || ""),
        end: String(data.get("end") || ""),
      },
      adults: Number(data.get("adults") || 2),
      childrenAges: Array.from({ length: children }, (_, i) =>
        Number(data.get(`child-${i}`)),
      ),
      // Luxury keeps its own category in comments; the existing API enum is unchanged.
      style: tourPackage
        ? hotelCategory === "comfort" ? "comfort" : "premium"
        : style,
      interests,
      budget: String(data.get("budget") || ""),
      name: String(data.get("name") || ""),
      country: String(data.get("country") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      preferredLanguage: String(data.get("preferredLanguage") || locale),
      comments: tourPackage
        ? packageCommentsPrefix +
          String(data.get("comments") || "").slice(0, commentsMaxLength)
        : String(data.get("comments") || ""),
      consent: data.get("consent") === "on",
      website: String(data.get("website") || ""),
      startedAt: started.current,
    };
    const measurementSource = window.location.href;
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": id.current,
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "FAILED");
      trackInquiryResponse(payload, response.status, {
        packageId: tourPackage?.id,
        destinations: selected,
      }, measurementSource);
      if (tourPackage && payload.whatsappUrl) {
        try {
          const url = new URL(payload.whatsappUrl);
          url.searchParams.set(
            "text",
            packageCommentsPrefix + (url.searchParams.get("text") || ""),
          );
          payload.whatsappUrl = url.toString();
        } catch {
          // Keep the server response intact if its URL cannot be parsed.
        }
      }
      setResult(payload);
    } catch {
      setError(
        en
          ? "We couldn’t prepare your request. Check your details and try again. Nothing has been confirmed."
          : "No pudimos preparar tu solicitud. Revisa tus datos e intenta de nuevo. No se ha confirmado ninguna reservación.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (result)
    return (
      <section className="planner-result">
        <span className="success-icon">
          <Check />
        </span>
        <h2>
          {result.mode === "development"
            ? en
              ? "Your trip outline is ready."
              : "La idea de tu viaje está lista."
            : en
              ? "Your request has been received."
              : "Recibimos tu solicitud."}
        </h2>
        <p>
          {result.mode === "development"
            ? en
              ? "The online request service is not enabled yet. Your contact details have not been sent to our CRM. Continue with your trip outline on WhatsApp when available."
              : "El servicio de solicitudes en línea aún no está habilitado. Tus datos de contacto no se enviaron a nuestro CRM. Puedes continuar con el resumen de viaje por WhatsApp cuando esté disponible."
            : en
              ? "Our team will review the details and follow up. This is a planning request, not a booking."
              : "Nuestro equipo revisará los detalles para dar seguimiento. Esta es una solicitud, no una reservación."}
        </p>
        <small>
          {en ? "Reference" : "Referencia"}: {result.requestId}
        </small>
        {result.whatsappUrl && (
          <a
            className="button primary"
            href={result.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {en ? "Continue on WhatsApp" : "Continuar por WhatsApp"}
            <ExternalLink size={18} />
          </a>
        )}
        <Link className="text-link" href={href(locale, "contact")}>
          {en ? "Contact our offices" : "Contacta a nuestras sucursales"}
          <ArrowRight size={18} />
        </Link>
      </section>
    );
  return (
    <div className="planner">
      <div className="planner-progress">
        <span>0{step + 1} / 07</span>
        <strong>{labels[step]}</strong>
        <progress
          value={step + 1}
          max={7}
          aria-label={en ? "Planning progress" : "Progreso"}
        />
      </div>
      <form ref={form} onSubmit={submit} noValidate onInput={(event) => {
        (event.target as HTMLElement).removeAttribute("aria-invalid");
      }}>
        <section className="planner-step" hidden={step !== 0}>
          {tourPackage ? (
            <>
              <h2>{en ? "Your package" : "Tu paquete"}</h2>
              <div className="form-grid tour-package-context">
                <label>
                  {en ? "Package" : "Paquete"}
                  <input readOnly value={t(tourPackage.name, locale)} />
                </label>
                <label>
                  {en ? "Package code" : "Código del paquete"}
                  <input readOnly value={packageCode} />
                </label>
                <label>
                  {en ? "Destination" : "Destino"}
                  <input
                    readOnly
                    value={packageDestination
                      ? t(packageDestination.name, locale)
                      : tourPackage.destinationSlug}
                  />
                </label>
                <label>
                  {en ? "Locale" : "Idioma de la página"}
                  <input readOnly value={locale === "en" ? "English" : "Español"} />
                </label>
              </div>
            </>
          ) : (
            <>
              <h2>
                {en
                  ? "Where does your Mexico story begin?"
                  : "¿Dónde empieza tu historia en México?"}
              </h2>
              <p>
                {en
                  ? "Pick a place. Or a few. We’ll help connect the dots."
                  : "Elige un lugar, o varios. Te ayudamos a unir los puntos."}
              </p>
              <div className="destination-options">
                {destinations.map((d) => (
                  <label
                    className={selected.includes(d.slug) ? "selected" : ""}
                    key={d.slug}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(d.slug)}
                      onChange={() => toggle(d.slug, selected, setSelected)}
                    />
                    {t(d.name, locale)}
                  </label>
                ))}
              </div>
            </>
          )}
          <label>
            {tourPackage
              ? en ? "Traveling from (optional)" : "Viajas desde (opcional)"
              : en ? "Traveling from" : "Viajas desde"}
            <input
              name="origin"
              required={!tourPackage && step === 0}
              maxLength={100}
              defaultValue={initial.origin || ""}
              placeholder={en ? "City or airport" : "Ciudad o aeropuerto"}
            />
          </label>
        </section>
        <section className="planner-step" hidden={step !== 1}>
          <h2>
            {en
              ? "A date, or a little flexibility?"
              : "¿Fechas definidas o un poco de flexibilidad?"}
          </h2>
          <div className="segmented">
            {["flexible", "exact"].map((v) => (
              <button
                type="button"
                aria-pressed={mode === v}
                key={v}
                onClick={() => setMode(v)}
              >
                {v === "flexible"
                  ? en
                    ? "Flexible dates"
                    : "Fechas flexibles"
                  : en
                    ? "Exact dates"
                    : "Fechas exactas"}
              </button>
            ))}
          </div>
          <div className="form-grid">
            <label>
              {en ? "Start date" : "Fecha de inicio"}
              <input
                type="date"
                name="start"
                required={step === 1 && mode === "exact"}
              />
            </label>
            <label>
              {en ? "End date" : "Fecha de regreso"}
              <input
                type="date"
                name="end"
                required={step === 1 && mode === "exact"}
              />
            </label>
          </div>
          <p>
            {en
              ? "If your dates are flexible, leave them open and tell us more in the final step."
              : "Si tus fechas son flexibles, déjalas abiertas y cuéntanos más al final."}
          </p>
        </section>
        <section className="planner-step" hidden={step !== 2}>
          <h2>{en ? "Who’s coming along?" : "¿Quién viene contigo?"}</h2>
          <div className="form-grid">
            <label>
              {en ? "Adults" : "Adultos"}
              <input
                type="number"
                name="adults"
                min={1}
                max={20}
                defaultValue={initial.adults || 2}
                required={step === 2}
              />
            </label>
            <label>
              {en ? "Children" : "Menores"}
              <input
                type="number"
                min={0}
                max={8}
                value={children}
                onChange={(e) =>
                  setChildren(Math.min(8, Math.max(0, Number(e.target.value))))
                }
              />
            </label>
            {Array.from({ length: children }, (_, i) => (
              <label key={i}>
                {en ? "Age of child" : "Edad del menor"} {i + 1}
                <input
                  name={`child-${i}`}
                  type="number"
                  min={0}
                  max={17}
                  defaultValue={8}
                  required={step === 2}
                />
              </label>
            ))}
          </div>
        </section>
        <section className="planner-step" hidden={step !== 3}>
          <h2>{tourPackage
            ? en ? "Hotel category" : "Categoría de hotel"
            : en ? "What feels like you?" : "¿Qué va más contigo?"}</h2>
          <div className="style-options">
            {(tourPackage ? [
              ["comfort", "Comfort"],
              ["premium", "Premium"],
              ["luxury", "Luxury"],
            ] : [
              [
                "essential",
                en ? "Essential" : "Esencial",
                en
                  ? "Thoughtful choices, focused on the experience."
                  : "Opciones prácticas para disfrutar la experiencia.",
              ],
              [
                "comfort",
                en ? "Comfort" : "Confort",
                en
                  ? "A comfortable base and room to explore."
                  : "Una base cómoda y espacio para explorar.",
              ],
              [
                "premium",
                en ? "Premium" : "Premium",
                en
                  ? "Special stays and a more personal pace."
                  : "Hospedajes especiales y un ritmo más personal.",
              ],
            ]).map(([id, title, description]) => (
              <button
                key={id}
                type="button"
                aria-pressed={(tourPackage ? hotelCategory : style) === id}
                onClick={() => tourPackage
                  ? setHotelCategory(id as HotelCategory)
                  : setStyle(id)}
              >
                <strong>{title}</strong>
                {description && <span>{description}</span>}
              </button>
            ))}
          </div>
        </section>
        <section className="planner-step" hidden={step !== 4}>
          <h2>{en ? "Follow what moves you." : "Sigue lo que te mueve."}</h2>
          <div className="destination-options">
            {[
              ["culture", "Culture", "Cultura"],
              ["beaches", "Beaches", "Playas"],
              ["gastronomy", "Gastronomy", "Gastronomía"],
              ["adventure", "Adventure", "Aventura"],
              ["history", "History", "Historia"],
              ["nature", "Nature", "Naturaleza"],
              ["luxury", "Luxury", "Lujo"],
              ["family", "Family travel", "Viajes en familia"],
            ].map(([id, a, b]) => (
              <label
                key={id}
                className={interests.includes(id) ? "selected" : ""}
              >
                <input
                  type="checkbox"
                  checked={interests.includes(id)}
                  onChange={() => toggle(id, interests, setInterests)}
                />
                {en ? a : b}
              </label>
            ))}
          </div>
        </section>
        <section className="planner-step" hidden={step !== 5}>
          <h2>
            {en ? "A budget to guide us." : "Un presupuesto para orientarnos."}
          </h2>
          <p>
            {en
              ? "An estimate per person, in USD. We’ll confirm scope and pricing together."
              : "Estimado por persona, en USD. Definiremos alcance y precio contigo."}
          </p>
          <label>
            {en ? "Estimated budget" : "Presupuesto estimado"}
            <select name="budget" defaultValue={initial.budget || "discuss"}>
              <option value="discuss">
                {en ? "Let’s discuss" : "Lo platicamos"}
              </option>
              <option value="under-1000">
                {en ? "Under USD 1,000" : "Menos de USD 1,000"}
              </option>
              <option value="1000-2000">USD 1,000–2,000</option>
              <option value="2000-4000">USD 2,000–4,000</option>
              <option value="4000+">USD 4,000+</option>
            </select>
          </label>
        </section>
        <section className="planner-step" hidden={step !== 6}>
          <h2>{en ? "Let’s make it personal." : "Empecemos a conocernos."}</h2>
          <div className="form-grid">
            <label>
              {en ? "Full name" : "Nombre completo"}
              <input
                name="name"
                autoComplete="name"
                required={step === 6}
                minLength={2}
                maxLength={100}
              />
            </label>
            <label>
              {en ? "Country" : "País"}
              <input
                name="country"
                autoComplete="country-name"
                list={tourPackage ? countryListId : undefined}
                required={step === 6}
                maxLength={80}
              />
              {tourPackage && (
                <datalist id={countryListId}>
                  {[
                    ["Mexico", "México"],
                    ["United States", "Estados Unidos"],
                    ["Canada", "Canadá"],
                    ["United Kingdom", "Reino Unido"],
                    ["Spain", "España"],
                    ["France", "Francia"],
                    ["Germany", "Alemania"],
                    ["Italy", "Italia"],
                    ["Colombia", "Colombia"],
                    ["Argentina", "Argentina"],
                    ["Brazil", "Brasil"],
                    ["Chile", "Chile"],
                    ["Australia", "Australia"],
                    ["Japan", "Japón"],
                  ].map(([a, b]) => <option key={a} value={en ? a : b} />)}
                </datalist>
              )}
            </label>
            <label>
              {en ? "Email" : "Correo electrónico"}
              <input
                name="email"
                type="email"
                autoComplete="email"
                required={step === 6}
                maxLength={254}
              />
            </label>
            <label>
              {en
                ? "WhatsApp with country code"
                : "WhatsApp con código de país"}
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 212 555 0123"
                required={step === 6}
                maxLength={30}
                minLength={6}
                pattern="\+?[0-9\s().\-]+"
              />
            </label>
            <label>
              {en ? "Preferred language" : "Idioma preferido"}
              <select
                name="preferredLanguage"
                defaultValue={tourPackage ? packageLanguage : locale}
                onChange={tourPackage ? (event) => {
                  const value = event.target.value;
                  if (value === "en" || value === "es") setPackageLanguage(value);
                } : undefined}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </label>
          </div>
          <label>
            {en
              ? "Anything else we should know?"
              : "¿Algo más que debamos saber?"}
            <textarea
              name="comments"
              maxLength={commentsMaxLength}
              rows={3}
              defaultValue={
                initial.month
                  ? en
                    ? `Preferred month: ${initial.month}`
                    : `Mes preferido: ${initial.month}`
                  : ""
              }
            />
          </label>
          <label className="consent">
            <input type="checkbox" name="consent" required={step === 6} />
            <span>
              {en
                ? "I agree to the processing of my details for this travel request."
                : "Acepto el tratamiento de mis datos para esta solicitud de viaje."}{" "}
              <Link href={href(locale, "privacy")}>
                {en ? "Privacy notice" : "Aviso de privacidad"}
              </Link>
            </span>
          </label>
        </section>
        <div className="honeypot" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <p className="form-error" role="alert">
          {error}
        </p>
        <div className="planner-actions">
          {step > 0 && (
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                setError("");
                setStep(step - 1);
              }}
            >
              <ArrowLeft size={17} />
              {en ? "Back" : "Atrás"}
            </button>
          )}
          {step < 6 ? (
            <button className="button primary" type="button" onClick={next}>
              {en ? "Continue" : "Continuar"}
              <ArrowRight size={17} />
            </button>
          ) : (
            <button className="button primary" type="submit" disabled={busy}>
              {busy
                ? en
                  ? "Preparing…"
                  : "Preparando…"
                : en
                  ? "Send my trip request"
                  : "Enviar mi solicitud"}
              <ArrowUpRightIcon />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
function ArrowUpRightIcon() {
  return <ExternalLink size={17} />;
}
