import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { tourPackages } from "../../../data/tour-packages.ts";
import { tourIdentities } from "../../../data/tour-identities.ts";
const gallery = JSON.parse(readFileSync("data/gallery.json", "utf8"));
test("catalog faithfully includes 21 days, all activities, inclusions, exclusions, upgrades and FAQ in both languages", () => {
  const expected = [
    { activities: 31, inc: 6, exc: 6, faq: 8, upgrades: 8 },
    { activities: 46, inc: 10, exc: 7, faq: 8, upgrades: 7 },
    { activities: 41, inc: 9, exc: 6, faq: 9, upgrades: 7 },
  ];
  assert.equal(tourPackages.length, 3);
  for (const [index, tour] of tourPackages.entries()) {
    assert.equal(tour.days, 7);
    assert.equal(tour.nights, 6);
    assert.equal(tour.itinerary.length, 7);
    assert.equal(tour.faq.length, expected[index].faq);
    assert.deepEqual(
      tour.hotels.map((h) => h.id),
      ["comfort", "premium", "luxury"],
    );
    for (const locale of ["en", "es"]) {
      assert.equal(
        tour.itinerary.reduce((sum, d) => sum + d.activities[locale].length, 0),
        expected[index].activities,
      );
      assert.equal(tour.inclusions[locale].length, expected[index].inc);
      assert.equal(tour.exclusions[locale].length, expected[index].exc);
      assert.equal(tour.upgrades[locale].length, expected[index].upgrades);
      assert.ok(
        tour.faq.every((f) => f.q[locale].trim() && f.a[locale].trim()),
      );
      assert.ok(
        tour.itinerary.every(
          (day) => day.title[locale].trim() && day.description[locale].trim(),
        ),
      );
    }
    const identity = tourIdentities.find((i) => i.id === tour.id);
    assert.deepEqual(identity.slugs, tour.slugs);
    assert.deepEqual(identity.name, tour.name);
    assert.equal(tour.publicationStatus, "quote-only");
    assert.deepEqual(tour.price, {
      verified: false,
      confirmedUsd: null,
      validUntil: null,
    });
    assert.ok(!/(?:999|899|949)/.test(JSON.stringify(tour)));
    for (const src of tour.gallery) {
      assert.ok(gallery.some((i) => i.src === src));
      assert.ok(existsSync(`public${src}`));
    }
    for (const day of tour.itinerary)
      if (day.photo) assert.ok(existsSync(`public${day.photo}`));
  }
});
test("sensitive inclusion conditions and genuinely optional outings are preserved", () => {
  const [c, g, m] = tourPackages;
  assert.equal(c.itinerary[2].optional, true);
  assert.equal(c.itinerary[4].optional, true);
  assert.ok(c.exclusions.en.some((t) => /domestic flights/.test(t)));
  assert.ok(c.inclusions.en.some((t) => /shared transportation/.test(t)));
  assert.ok(
    g.itinerary[2].activities.en.some(
      (t) => /legal drinking age/.test(t) && /when offered/.test(t),
    ),
  );
  assert.ok(g.exclusions.en.some((t) => /train tickets/.test(t)));
  assert.ok(g.itinerary[1].activities.en.some((t) => /if included/.test(t)));
  assert.ok(m.inclusions.en.some((t) => /trajinera ride/.test(t)));
  assert.ok(
    m.faq.some(
      (f) => /Frida Kahlo/.test(f.q.en) && /not included/.test(f.a.en),
    ),
  );
});
