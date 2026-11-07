import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { mexicoExperiences } from "../../../data/mexico-experiences.ts";
import { destinations, journeys } from "../../../data/content.ts";
import { itineraryLocations } from "../../../data/travel-editorial.ts";
import { href, alternatePath } from "../../routes.ts";

const gallery = JSON.parse(readFileSync("data/gallery.json", "utf8"));
const credits = JSON.parse(readFileSync("data/image-credits.json", "utf8"));
test("three editorial Mexico experiences reuse actual destinations and have both languages, no invented pricing", () => {
  assert.equal(mexicoExperiences.length, 3);
  assert.equal(new Set(mexicoExperiences.map((e) => e.slug)).size, 3);
  for (const e of mexicoExperiences) {
    assert.ok(destinations.some((d) => d.slug === e.destinationSlug));
    assert.ok(
      e.destinations.every((s) => destinations.some((d) => d.slug === s)),
    );
    for (const field of [
      "name",
      "tagline",
      "caption",
      "intro",
      "route",
      "perfectFor",
      "planningNote",
      "imageAlt",
    ]) {
      assert.ok(e[field].en.trim());
      assert.ok(e[field].es.trim());
    }
    for (const field of [
      "price",
      "priceUsd",
      "hotel",
      "hotels",
      "discount",
      "expiresAt",
    ])
      assert.equal(e[field], undefined);
    assert.ok(e.suggestedMoments.length >= 3);
  }
});
test("experience links and language switches are symmetric, including deep links", () => {
  for (const item of mexicoExperiences) {
    const en = href("en", "experiences", item.slug),
      es = href("es", "experiences", item.slug);
    assert.equal(en, `/en/experiences/${item.slug}`);
    assert.equal(es, `/es/experiencias/${item.slug}`);
    assert.equal(alternatePath(en), es);
    assert.equal(alternatePath(es), en);
  }
});
test("all eight guides have two distinct additional photos with commercial attribution and real files", async () => {
  assert.ok(gallery.length >= 16);
  assert.equal(new Set(gallery.map((p) => p.src)).size, gallery.length);
  for (const destination of destinations)
    assert.ok(
      gallery.filter((p) => p.destination === destination.slug).length >= 2,
    );
  for (const photo of gallery) {
    assert.ok(photo.src.startsWith("/media/gallery/"));
    assert.ok(photo.author.trim());
    assert.ok(/^https:\/\//.test(photo.sourceUrl));
    assert.ok(
      /^CC BY/.test(photo.license) || /public domain|CC0/i.test(photo.license),
    );
    assert.ok(/^https:\/\//.test(photo.licenseUrl));
    assert.ok(
      photo.alt.en && photo.alt.es && photo.caption.en && photo.caption.es,
    );
    const bytes = readFileSync(resolve("public", photo.src.slice(1)));
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.format, "webp");
    assert.ok(metadata.width <= 1600 && metadata.width >= 600);
    const credit = credits.images.find((c) => c.path === `public${photo.src}`);
    assert.ok(credit, "missing photo credit");
    assert.equal(
      credit.sha256,
      createHash("sha256").update(bytes).digest("hex"),
    );
  }
});
test("day-by-day journey photo locations correspond to the actual itinerary, never a fabricated place", () => {
  for (const journey of journeys) {
    assert.equal(
      itineraryLocations[journey.slug].length,
      journey.itinerary.length,
    );
    assert.ok(
      itineraryLocations[journey.slug].every((s) =>
        journey.destinations.includes(s),
      ),
    );
  }
});
