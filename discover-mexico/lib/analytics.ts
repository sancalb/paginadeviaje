import { destinations, journeys, type Locale } from "../data/content";
import { mexicoExperiences } from "../data/mexico-experiences";
import { tourIdentities, getTourIdentityById } from "../data/tour-identities";
import { href, sections } from "./routes";

export const GTM_CONTAINER_ID = "GTM-K45KXVZR";
const siteOrigin = "https://discover.deviaje.mx";
const destinationIds = new Set(destinations.map((d) => d.slug));
type Context = {
  language: Locale | null;
  page_path: string;
  page_type: string;
  page_title: string;
  package_id: string | null;
  package_name: string | null;
  destination: string | null;
  destinations: string | null;
  journey_id: string | null;
};
export type Placement = "floating" | "office" | "package" | "planner_result" | "other";
export type Selection = { packageId?: string; destinations?: string[] };
type EventName = "page_view" | "view_package" | "select_package" | "whatsapp_click" |
  "quote_request_validated" | "quote_request_received" | "generate_lead";
export type AnalyticsEvent = Record<string, string | null> & { event: EventName };
const routes = new Map<string, Context>();

function addRoute(locale: Locale, path: string, type: string, title: string, slugs: string[] = []) {
  const ids = slugs.filter((slug) => destinationIds.has(slug));
  routes.set(path, {
    language: locale, page_path: path, page_type: type, page_title: title,
    package_id: null, package_name: null, destination: ids.length === 1 ? ids[0] : null,
    destinations: ids.length ? ids.join("|") : null, journey_id: null,
  });
}
for (const locale of ["en", "es"] as const) {
  addRoute(locale, href(locale), "home", "Discover Mexico by deviaje.mx");
  for (const key of Object.keys(sections) as (keyof typeof sections)[]) {
    addRoute(locale, href(locale, key), key, `Discover Mexico · ${sections[key][locale]}`);
  }
  addRoute(locale, `/${locale}/photo-credits`, "photo_credits", locale === "en" ? "Photo credits" : "Créditos fotográficos");
  for (const d of destinations) addRoute(locale, href(locale, "destinations", d.slug), "destination", d.name[locale], [d.slug]);
  for (const j of journeys) {
    const path = href(locale, "tours", j.slug);
    addRoute(locale, path, "journey", j.name[locale], j.destinations);
    routes.get(path)!.journey_id = j.slug;
  }
  for (const e of mexicoExperiences) addRoute(locale, href(locale, "experiences", e.slug), "experience", e.name[locale], e.destinations);
  for (const tour of tourIdentities) {
    const path = `/${locale}/tours/${tour.slugs[locale]}`;
    addRoute(locale, path, "package", tour.name[locale], [tour.destinationSlug]);
    Object.assign(routes.get(path)!, { package_id: tour.id, package_name: tour.name[locale] });
  }
}

function applySelection(context: Context, selection: Selection): Context {
  const tour = getTourIdentityById(selection.packageId || "");
  const ids = tour ? [tour.destinationSlug] :
    [...new Set((selection.destinations || []).filter((slug) => destinationIds.has(slug)))];
  return {
    ...context,
    package_id: tour?.id || null,
    package_name: tour ? tour.name[context.language || "en"] : null,
    destination: ids.length === 1 ? ids[0] : null,
    destinations: ids.length ? ids.join("|") : null,
  };
}

// Only known route/catalog values cross the measurement boundary. Never forward a raw URL.
export function contextForUrl(input: string): Context {
  let url: URL;
  try { url = new URL(input, siteOrigin); } catch { url = new URL(siteOrigin); }
  const path = url.pathname.replace(/\/$/, "") || "/";
  const found = routes.get(path);
  if (!found) {
    const language = /^\/(en|es)(?:\/|$)/.exec(path)?.[1] as Locale | undefined;
    return {
      language: language || null, page_path: language ? `/${language}/404` : "/404",
      page_type: "not_found", page_title: "Discover Mexico · Not found",
      package_id: null, package_name: null, destination: null, destinations: null, journey_id: null,
    };
  }
  const context = { ...found };
  if (context.page_type !== "plan") return context;
  const tour = getTourIdentityById(url.searchParams.get("package") || "");
  const journey = journeys.find((j) => j.slug === url.searchParams.get("journey"));
  const slugs = tour ? [tour.destinationSlug] : url.searchParams.get("journey") ?
    journey?.destinations || [] : [url.searchParams.get("destination") || ""];
  return {
    ...applySelection(context, { packageId: tour?.id, destinations: slugs }),
    journey_id: journey?.slug || null,
  };
}

function locationFor(input: string, context: Context) {
  const url = new URL(input, siteOrigin);
  return url.origin + context.page_path;
}
export function safeReferrer(input: string, current: string): string {
  if (!input) return "";
  try {
    const ref = new URL(input);
    if (!/^https?:$/.test(ref.protocol)) return "";
    return ref.origin === new URL(current, siteOrigin).origin
      ? ref.origin + contextForUrl(input).page_path : ref.origin;
  } catch { return ""; }
}

export function classifyInquiryResponse(payload: unknown, status: number) {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.requestId !== "string" || !/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(p.requestId)) return null;
  if (p.mode === "development" && status === 200) return "validated";
  if (p.mode === "live" && p.status === "queued" && status === 202) return "queued";
  if (p.mode === "live" && p.status === "delivered" && status === 200) return "delivered";
  return null;
}

export function createAnalyticsClient(options: {
  getUrl: () => string;
  getReferrer: () => string;
  push: (event: AnalyticsEvent) => void;
  configurePage?: (settings: Record<string, string>) => void;
}) {
  let lastPageKey = "";
  let previousLocation = "";
  let referrer = "";
  const receipts = new Set<string>();
  function emit(event: EventName, context: Context, extra: Record<string, string | null> = {}, sourceUrl?: string) {
    try {
      const url = sourceUrl || options.getUrl();
      options.push({
        event, measurement_source: "discover_app", ...context,
        source_page: contextForUrl(url).page_path,
        page_location: locationFor(url, contextForUrl(url)),
        page_referrer: sourceUrl && sourceUrl !== options.getUrl() ? "" : referrer,
        target_page: null, interaction_location: null, office: null,
        request_state: null, delivery_status: null, ...extra,
      });
    } catch { /* Tracking must never interrupt navigation or a request. */ }
  }
  return {
    pageView() {
      try {
        const url = options.getUrl();
        const context = contextForUrl(url);
        const key = JSON.stringify(context);
        if (key === lastPageKey) return;
        lastPageKey = key;
        referrer = previousLocation || safeReferrer(options.getReferrer(), url);
        previousLocation = locationFor(url, context);
        options.configurePage?.({ page_location: previousLocation, page_referrer: referrer, page_title: context.page_title });
        emit("page_view", context);
        if (context.page_type === "package") emit("view_package", context);
      } catch { /* Third-party failures do not change the page. */ }
    },
    linkActivated(link: string, placement: Placement, languageSwitch = false) {
      try {
        const current = new URL(options.getUrl());
        const target = new URL(link, current);
        const context = contextForUrl(current.href);
        if (target.protocol === "https:" && target.hostname === "wa.me" &&
          !target.username && !target.password && /^\/\d{7,15}\/?$/.test(target.pathname)) {
          const number = target.pathname.replace(/\D/g, "");
          const office = number === "528135294738" ? "monterrey" : number === "523334855963" ? "guadalajara" : null;
          emit("whatsapp_click", context, { interaction_location: placement, office });
          return;
        }
        if (languageSwitch || target.origin !== current.origin) return;
        const selected = contextForUrl(target.href);
        if (!selected.package_id) return;
        const opensPackage = selected.page_type === "package" &&
          (target.pathname !== current.pathname || target.hash === "#quote");
        if (!opensPackage && selected.page_type !== "plan") return;
        emit("select_package", { ...context,
          package_id: selected.package_id, package_name: selected.package_name,
          destination: selected.destination, destinations: selected.destinations,
        }, { target_page: selected.page_path, interaction_location: placement });
      } catch { /* Ignore malformed or unsupported links. */ }
    },
    inquiryResponse(payload: unknown, status: number, selection: Selection = {}, sourceUrl?: string) {
      try {
        const result = classifyInquiryResponse(payload, status);
        if (!result) return;
        const requestId = (payload as { requestId: string }).requestId;
        const url = sourceUrl || options.getUrl();
        const context = applySelection(contextForUrl(url), selection);
        const extra = {
          request_state: result === "validated" ? "validated_not_received" : "received",
          delivery_status: result === "validated" ? "not_sent" : result,
        };
        const once = (event: EventName) => {
          const key = event + ":" + requestId;
          if (receipts.has(key)) return;
          receipts.add(key);
          emit(event, context, extra, url);
        };
        once("quote_request_validated");
        if (result !== "validated") once("quote_request_received");
        if (result === "delivered") once("generate_lead");
      } catch { /* Do not alter submission success/failure behavior. */ }
    },
  };
}

declare global {
  interface Window { dataLayer?: unknown[]; }
}
function browserPush(event: AnalyticsEvent) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}
const browserClient = createAnalyticsClient({
  getUrl: () => window.location.href,
  getReferrer: () => document.referrer,
  push: browserPush,
  configurePage: (settings) => {
    window.dataLayer = window.dataLayer || [];
    (function (..._args: unknown[]) { window.dataLayer!.push(arguments); })("set", settings);
  },
});
export const trackPageView = () => browserClient.pageView();
export const trackLinkActivation = (url: string, placement: Placement, languageSwitch = false) =>
  browserClient.linkActivated(url, placement, languageSwitch);
export const trackInquiryResponse = (payload: unknown, status: number, selection: Selection, sourceUrl?: string) =>
  browserClient.inquiryResponse(payload, status, selection, sourceUrl);

export function buildGtmBootstrap(pathname: string): string {
  const context = contextForUrl(pathname);
  const initial = JSON.stringify({ ...context, page_location: siteOrigin + context.page_path,
    page_referrer: "", send_page_view: false, ads_data_redaction: true,
    allow_google_signals: false, allow_ad_personalization_signals: false,
  }).replace(/</g, "\\u003c");
  return `(function(w,d,id){
    if(w.__discoverGtmLoaded||(w.google_tag_manager&&w.google_tag_manager[id]))return;
    w.__discoverGtmLoaded=true;
    w.dataLayer=w.dataLayer||[];
    function tag(){w.dataLayer.push(arguments);}
    tag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    var initial=${initial};
    tag('set',initial);
    w.dataLayer.push(initial);
    w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var first=d.getElementsByTagName('script')[0],script=d.createElement('script');
    script.async=true;script.id='discover-gtm-loader';
    script.src='https://www.googletagmanager.com/gtm.js?id='+id;
    first.parentNode.insertBefore(script,first);
  })(window,document,'${GTM_CONTAINER_ID}');`;
}
