"use client";

import { useState } from "react";
import type { Locale } from "../data/content";

// Public locations and contact links from the original deviaje.mx HTML.
const branches = [
  {
    name: "Monterrey",
    image: "/media/mty.avif",
    address:
      "Blvd. Puerta del Sol 1013, Colinas de San Jemo 3er Sector, Monterrey, N.L.",
    whatsapp: "https://wa.me/528135294738",
    phone: "81 3529 4738",
    tel: "+528135294738",
    maps: "https://share.google/tX8O89KmEiMsLPtea",
    lat: 25.6934103,
    lng: -100.3696098,
  },
  {
    name: "Guadalajara",
    image: "/media/gdl.avif",
    address:
      "Av. de las Américas 453-Local 7, Ladrón de Guevara, Guadalajara, Jal.",
    whatsapp: "https://wa.me/523334855963",
    phone: "33 3485 5963",
    tel: "+523334855963",
    maps: "https://share.google/ctm8ggcWMxuWFL2av",
    lat: 20.6853199,
    lng: -103.3737003,
  },
];

function BranchMap({
  branch,
  locale,
}: {
  branch: (typeof branches)[number];
  locale: Locale;
}) {
  const [failed, setFailed] = useState(false);
  const zoom = 16;
  const scale = 2 ** zoom;
  const latitude = (branch.lat * Math.PI) / 180;
  const fractionalX = ((branch.lng + 180) / 360) * scale;
  const fractionalY =
    ((1 - Math.asinh(Math.tan(latitude)) / Math.PI) / 2) * scale;
  const tileX = Math.floor(fractionalX);
  const tileY = Math.floor(fractionalY);
  const pixelX = (fractionalX - tileX) * 256;
  const pixelY = (fractionalY - tileY) * 256;
  const tiles = [];
  // Include an adjacent tile only where centering exposes a tile edge.
  for (
    let y = Math.floor((pixelY - 61) / 256);
    y <= Math.floor((pixelY + 61) / 256);
    y++
  ) {
    for (
      let x = Math.floor((pixelX - 61) / 256);
      x <= Math.floor((pixelX + 61) / 256);
      x++
    ) {
      tiles.push({ x, y });
    }
  }
  return (
    <a
      className="branch-map-thumb"
      href={branch.maps}
      target="_blank"
      rel="noopener noreferrer"
      style={{ width: 122, height: 122 }}
      aria-label={
        locale === "en"
          ? `Open map of the ${branch.name} office`
          : `Abrir mapa de la sucursal ${branch.name}`
      }
    >
      <span
        className={`branch-map-canvas${failed ? " is-map-unavailable" : ""}`}
        data-map-label={`deviaje ${branch.name}`}
        data-lat={branch.lat}
        data-lng={branch.lng}
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: "100%",
        }}
      >
        {!failed &&
          tiles.map(({ x, y }) => (
            <img
              key={`${x}/${y}`}
              src={`https://tile.openstreetmap.org/${zoom}/${tileX + x}/${tileY + y}.png`}
              alt=""
              width="256"
              height="256"
              loading="lazy"
              decoding="async"
              style={{
                position: "absolute",
                width: 256,
                height: 256,
                minWidth: 256,
                maxWidth: "none",
                borderRadius: 0,
                left: `calc(50% + ${x * 256 - pixelX}px)`,
                top: `calc(50% + ${y * 256 - pixelY}px)`,
              }}
              onError={() => setFailed(true)}
            />
          ))}
        {!failed && (
          <span
            className="branch-map-pin"
            role="img"
            aria-label={`deviaje ${branch.name}`}
            title={`deviaje ${branch.name}`}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%) rotate(-45deg)",
            }}
          />
        )}
      </span>
    </a>
  );
}

export function Offices({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return (
    <div className="branch-layout">
      {branches.map((branch) => {
        const message = en
          ? `Hello deviaje ${branch.name}, I'd like to plan a trip to Mexico. Could you help me in English?`
          : `Hola deviaje ${branch.name}, me gustaría planear un viaje a México.`;
        return (
          <article
            className="branch-feature reveal is-visible"
            key={branch.name}
          >
            <img
              src={branch.image}
              alt={
                en
                  ? `deviaje ${branch.name} office`
                  : `Sucursal deviaje ${branch.name}`
              }
              loading="lazy"
              decoding="async"
            />
            <div className="branch-body">
              <div className="branch-copy">
                <h3>{branch.name}</h3>
                <p>{branch.address}</p>
                <p>
                  <a href={`tel:${branch.tel}`}>{branch.phone}</a>
                </p>
                <small>
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    © OpenStreetMap contributors
                  </a>
                </small>
              </div>
              <BranchMap branch={branch} locale={locale} />
              <div className="branch-actions">
                <a
                  className="button button-whatsapp-secondary"
                  href={`${branch.whatsapp}?text=${encodeURIComponent(message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${branch.name}`}
                >
                  <span
                    className="button-icon icon-whatsapp"
                    aria-hidden="true"
                  />
                  WhatsApp
                </a>
                <a
                  className="button button-secondary"
                  href={branch.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    en
                      ? `Directions to ${branch.name}`
                      : `Cómo llegar a ${branch.name}`
                  }
                >
                  <span className="button-icon icon-pin" aria-hidden="true" />
                  {en ? "Get directions" : "Cómo llegar"}
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function Branches({ locale }: { locale: Locale }) {
  return (
    <section className="section branches-section" id="sucursales">
      <div className="section-heading reveal is-visible">
        <p className="eyebrow">
          {locale === "en" ? "Our offices" : "Sucursales"}
        </p>
        <h2>
          {locale === "en"
            ? "Real advisors, close to you."
            : "Asesores reales, cerca de ti."}
        </h2>
      </div>
      <Offices locale={locale} />
    </section>
  );
}
