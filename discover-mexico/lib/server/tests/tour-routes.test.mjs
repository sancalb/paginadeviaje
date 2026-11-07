import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import { transpileModule, ModuleKind, JsxEmit } from "typescript";
import { destinations, journeys } from "../../../data/content.ts";
import { mexicoExperiences } from "../../../data/mexico-experiences.ts";
import { tourPackages, getTourPackageBySlug } from "../../../data/tour-packages.ts";
import { tourIdentities, getTourIdentityById, getTourIdentityBySlug } from "../../../data/tour-identities.ts";
import { href, alternatePath, sections, siteUrl } from "../../routes.ts";
import { tourHref, tourQuoteHref } from "../../tour-routes.ts";
import sitemap from "../../../app/sitemap.ts";

// Exercise the real route and metadata in memory, isolating the UI owner's component.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/navigation") return nextResolve("next/navigation.js", context);
    if (specifier.endsWith("/components/tour-package")) {
      return {
        url: "data:text/javascript,export async function TourPackagePage() { return null; }",
        shortCircuit: true,
      };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!decodeURIComponent(url).endsWith("/app/[locale]/tours/[slug]/page.tsx")) {
      return nextLoad(url, context);
    }
    return {
      format: "module",
      shortCircuit: true,
      source: transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ModuleKind.ESNext, jsx: JsxEmit.ReactJSX },
      }).outputText,
    };
  },
});
let route;
try {
  route = await import("../../../app/[locale]/tours/[slug]/page.tsx");
} finally {
  hooks.deregister();
}

const props = (locale, slug) => ({ params: Promise.resolve({ locale, slug }) });
const isNotFound = (error) => error.digest === "NEXT_HTTP_ERROR_FALLBACK;404";
const locales = ["en", "es"];

test("lightweight identities exactly match the catalog without itinerary or pricing fields", () => {
  assert.equal(tourIdentities.length, 3);
  assert.equal(new Set(tourIdentities.map((tour) => tour.id)).size, 3);
  assert.deepEqual(tourIdentities, tourPackages.map(({ id, slugs, name, destinationSlug }) => ({
    id, slugs, name, destinationSlug,
  })));
  for (const identity of tourIdentities) {
    assert.deepEqual(Object.keys(identity).sort(), ["destinationSlug", "id", "name", "slugs"]);
    assert.equal(getTourIdentityById(identity.id), identity);
    for (const locale of locales) {
      assert.equal(getTourIdentityBySlug(locale, identity.slugs[locale]), identity);
      assert.equal(tourHref(locale, { slugs: identity.slugs }), tourHref(locale, identity));
      assert.equal(
        tourQuoteHref(locale, { id: identity.id, destinationSlug: identity.destinationSlug }),
        tourQuoteHref(locale, identity),
      );
    }
  }
  assert.equal(getTourIdentityById("unknown-package"), undefined);
  assert.equal(getTourIdentityBySlug("en", "unknown-package"), undefined);
  assert.equal(getTourIdentityBySlug("es", "cancun-all-inclusive"), undefined);
});

test("client route imports never load the full tour catalog, including transitive dependencies", () => {
  const source = `
    import assert from "node:assert/strict";
    import { registerHooks } from "node:module";
    registerHooks({
      resolve(specifier, context, nextResolve) {
        if (/tour-packages(?:\\.ts)?$/.test(specifier)) {
          throw new Error("Full tour catalog must not be a runtime dependency: " + specifier);
        }
        return nextResolve(specifier, context);
      },
    });
    const { alternatePath } = await import("./lib/routes.ts");
    const { tourHref, tourQuoteHref } = await import("./lib/tour-routes.ts");
    const { tourIdentities } = await import("./data/tour-identities.ts");
    for (const tour of tourIdentities) {
      assert.equal(alternatePath(tourHref("en", tour)), tourHref("es", tour));
      assert.equal(new URL(tourQuoteHref("es", tour), "https://example.test").searchParams.get("package"), tour.id);
    }
  `;
  execFileSync(process.execPath, [
    "--experimental-strip-types",
    "--import", new URL("./register.mjs", import.meta.url).href,
    "--input-type=module", "-e", source,
  ], {
    cwd: fileURLToPath(new URL("../../../", import.meta.url)),
    stdio: "pipe",
  });
});

test("exactly six localized package paths are statically generated", async () => {
  assert.equal(tourPackages.length, 3);
  assert.equal(route.dynamicParams, false);
  const paths = await route.generateStaticParams();
  assert.equal(paths.length, 6);
  assert.equal(new Set(paths.map(({ locale, slug }) => `/${locale}/tours/${slug}`)).size, 6);
  assert.deepEqual(paths, tourPackages.flatMap((tour) =>
    locales.map((locale) => ({ locale, slug: tour.slugs[locale] })),
  ));
  for (const tour of tourPackages) {
    for (const locale of locales) {
      assert.equal(getTourPackageBySlug(locale, tour.slugs[locale]), tour);
      assert.equal(tourHref(locale, tour), `/${locale}/tours/${tour.slugs[locale]}`);
      const other = locale === "en" ? "es" : "en";
      assert.equal(alternatePath(tourHref(locale, tour)), tourHref(other, tour));
    }
  }
});

test("quote links use the existing plan path and only approved context, never pricing", () => {
  for (const tour of tourPackages) {
    for (const locale of locales) {
      for (const category of [undefined, "", ...tour.hotels.map((hotel) => hotel.id), "Luxury & boutique"]) {
        const contaminated = { ...tour, price: 1234, currency: "USD", amount: 5678 };
        const url = new URL(tourQuoteHref(locale, contaminated, category), "https://example.test");
        assert.equal(url.pathname, href(locale, "plan"));
        assert.deepEqual(Object.fromEntries(url.searchParams), {
          package: tour.id,
          destination: tour.destinationSlug,
          ...(category ? { hotelCategory: category } : {}),
          language: locale,
        });
      }
    }
  }
});

test("metadata uses exact source SEO, canonical, both hreflangs and the destination main photo", async () => {
  for (const tour of tourPackages) {
    const destination = destinations.find((d) => d.slug === tour.destinationSlug);
    assert.ok(destination?.image);
    for (const locale of locales) {
      const metadata = await route.generateMetadata(props(locale, tour.slugs[locale]));
      const canonical = siteUrl() + tourHref(locale, tour);
      assert.deepEqual(metadata.title, { absolute: tour.seo.title[locale] });
      assert.equal(metadata.description, tour.seo.description[locale]);
      assert.deepEqual(metadata.alternates, {
        canonical,
        languages: {
          en: siteUrl() + tourHref("en", tour),
          es: siteUrl() + tourHref("es", tour),
          "x-default": siteUrl() + tourHref("en", tour),
        },
      });
      assert.equal(metadata.openGraph.title, tour.seo.title[locale]);
      assert.equal(metadata.openGraph.description, tour.seo.description[locale]);
      assert.equal(metadata.openGraph.url, canonical);
      assert.deepEqual(metadata.openGraph.images, [{
        url: new URL(destination.image, siteUrl() + "/").href,
        alt: destination.imageAlt[locale],
      }]);
      assert.doesNotMatch(JSON.stringify(metadata), /(?:USD|MXN|\$)\s*[\d,]+/i);
    }
  }
});

test("invalid locale, unknown slug and a slug from the other language return notFound", async () => {
  const invalid = [["fr", tourPackages[0].slugs.en], ["en", "unknown-package"], ["es", "unknown-package"]];
  for (const tour of tourPackages) {
    for (const locale of locales) {
      const other = locale === "en" ? "es" : "en";
      if (!tourPackages.some((candidate) => candidate.slugs[locale] === tour.slugs[other])) {
        invalid.push([locale, tour.slugs[other]]);
      }
    }
  }
  for (const [locale, slug] of invalid) {
    await assert.rejects(route.generateMetadata(props(locale, slug)), isNotFound);
    await assert.rejects(route.default(props(locale, slug)), isNotFound);
  }
});

test("page passes agreed component props and emits source-only TouristTrip and breadcrumbs", async () => {
  for (const tour of tourPackages) {
    for (const locale of locales) {
      const page = await route.default(props(locale, tour.slugs[locale]));
      const [script, template] = page.props.children;
      assert.equal(template.type.name, "TourPackagePage");
      assert.equal(template.props.tour, tour);
      assert.equal(template.props.locale, locale);
      assert.equal(script.type, "script");
      assert.equal(script.props.type, "application/ld+json");
      const payload = script.props.dangerouslySetInnerHTML.__html;
      assert.ok(!payload.includes("<"));
      const jsonLd = JSON.parse(payload);
      assert.equal(jsonLd["@context"], "https://schema.org");
      const [trip, breadcrumbs] = jsonLd["@graph"];
      assert.equal(trip["@type"], "TouristTrip");
      assert.equal(trip.name, tour.name[locale]);
      assert.equal(trip.description, tour.seo.description[locale]);
      assert.equal(trip.url, siteUrl() + tourHref(locale, tour));
      assert.deepEqual(trip.itinerary.itemListElement, tour.itinerary.map((day, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: day.title[locale],
        description: day.description[locale],
      })));
      assert.equal(breadcrumbs["@type"], "BreadcrumbList");
      assert.equal(breadcrumbs.itemListElement.length, 2);
      assert.equal(breadcrumbs.itemListElement[1].name, tour.name[locale]);
      assert.deepEqual(breadcrumbs.itemListElement.map((item) => item.item), [
        siteUrl() + href(locale),
        siteUrl() + tourHref(locale, tour),
      ]);
      assert.doesNotMatch(payload, /"(?:offers|aggregateRating|review|price|priceCurrency)"/);
    }
  }
});

test("JSON-LD escapes script termination characters without changing parsed source content", async () => {
  const tour = tourPackages[0];
  const previous = tour.name.en;
  const malicious = "Fixture </script><script>alert(1)</script>";
  try {
    tour.name.en = malicious;
    const page = await route.default(props("en", tour.slugs.en));
    const payload = page.props.children[0].props.dangerouslySetInnerHTML.__html;
    assert.ok(!payload.includes("<"));
    assert.ok(payload.includes("\\u003c/script>"));
    assert.equal(JSON.parse(payload)["@graph"][0].name, malicious);
  } finally {
    tour.name.en = previous;
  }
});

test("sitemap adds exactly six packages with reciprocal alternates and preserves old URLs", () => {
  const entries = sitemap();
  const packageEntries = entries.filter((entry) => /\/(?:en|es)\/tours\//.test(new URL(entry.url).pathname));
  assert.equal(packageEntries.length, 6);
  assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
  for (const tour of tourPackages) {
    for (const locale of locales) {
      const entry = packageEntries.find((item) => item.url === siteUrl() + tourHref(locale, tour));
      assert.ok(entry);
      assert.deepEqual(entry.alternates.languages, {
        en: siteUrl() + tourHref("en", tour),
        es: siteUrl() + tourHref("es", tour),
      });
    }
  }
  assert.deepEqual(sections.tours, { en: "mexico-tours", es: "circuitos" });
  for (const locale of locales) {
    const other = locale === "en" ? "es" : "en";
    for (const [section, items] of [["tours", journeys], ["experiences", mexicoExperiences]]) {
      for (const item of items) {
        assert.ok(entries.some((entry) => entry.url === siteUrl() + href(locale, section, item.slug)));
        assert.equal(alternatePath(href(locale, section, item.slug)), href(other, section, item.slug));
      }
    }
  }
});
