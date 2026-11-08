"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { buildGtmBootstrap, trackLinkActivation, trackPageView, type Placement } from "../lib/analytics";

export function DiscoverMeasurement() {
  const pathname = usePathname();
  const search = useSearchParams();
  const packageId = search.get("package");
  const destination = search.get("destination");
  const journey = search.get("journey");

  useEffect(() => { trackPageView(); }, [pathname, packageId, destination, journey]);
  useEffect(() => {
    const activated = (event: MouseEvent) => {
      if (event.type === "click" ? event.button !== 0 : event.button !== 1) return;
      const node = event.target instanceof Element ? event.target : null;
      const anchor = node?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;
      const placement: Placement = anchor.closest(".planner-result") ? "planner_result" :
        anchor.closest(".whatsapp-float") ? "floating" :
        anchor.closest(".branch-feature") ? "office" :
        anchor.closest(".tour-card, .tour-quote-intro, .tour-hero") ? "package" : "other";
      // Next Link handles internal navigation with preventDefault. Native WhatsApp links must not be cancelled.
      if (event.defaultPrevented && anchor.hostname === "wa.me") return;
      trackLinkActivation(anchor.href, placement, anchor.classList.contains("language"));
    };
    document.addEventListener("click", activated);
    document.addEventListener("auxclick", activated);
    return () => {
      document.removeEventListener("click", activated);
      document.removeEventListener("auxclick", activated);
    };
  }, []);

  return <Script id="discover-gtm" strategy="afterInteractive">{buildGtmBootstrap(pathname)}</Script>;
}
