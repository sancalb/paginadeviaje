import { destinations, t, type Locale } from "../data/content";
const positions: Record<string, [number, number]> = {
  "mexico-city": [19.433, -99.133],
  puebla: [19.043, -98.198],
  oaxaca: [17.061, -96.726],
  guadalajara: [20.674, -103.344],
  tequila: [20.882, -103.835],
  "puerto-vallarta": [20.654, -105.226],
  cancun: [21.161, -86.852],
  "riviera-maya": [20.629, -87.074],
  "chichen-itza": [20.683, -88.568],
};
export function RouteMap({
  stops,
  locale,
}: {
  stops: string[];
  locale: Locale;
}) {
  const points = stops.flatMap((slug) =>
    positions[slug]
      ? [{ slug, lat: positions[slug][0], lon: positions[slug][1] }]
      : [],
  );
  if (points.length < 2) return null;
  const minLat = Math.min(...points.map((p) => p.lat)),
    maxLat = Math.max(...points.map((p) => p.lat)),
    minLon = Math.min(...points.map((p) => p.lon)),
    maxLon = Math.max(...points.map((p) => p.lon));
  const plot = points.map((p) => ({
    ...p,
    x: 80 + ((p.lon - minLon) / Math.max(0.3, maxLon - minLon)) * 520,
    y: 80 + ((maxLat - p.lat) / Math.max(0.3, maxLat - minLat)) * 170,
  }));
  return (
    <figure className="route-map">
      <svg
        viewBox="0 0 700 340"
        role="img"
        aria-label={
          locale === "en"
            ? "Schematic route map, not for navigation"
            : "Mapa esquemático del circuito, no apto para navegación"
        }
      >
        <defs>
          <pattern
            id="map-grid"
            width="35"
            height="35"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M35 0H0V35"
              fill="none"
              stroke="#dce3d8"
              strokeWidth=".6"
            />
          </pattern>
        </defs>
        <rect width="700" height="340" fill="url(#map-grid)" />
        <polyline
          points={plot.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#ff5c34"
          strokeWidth="2"
          strokeDasharray="7 7"
        />
        {plot.map((p, i) => (
          <g key={p.slug}>
            <circle
              cx={p.x}
              cy={p.y}
              r="8"
              fill="#ff5c34"
              stroke="white"
              strokeWidth="3"
            />
            <text
              x={p.x}
              y={p.y + (i % 2 === 0 ? -20 : 32)}
              textAnchor="middle"
              fontSize="14"
              fill="#142b2a"
            >
              {destinations.find((d) => d.slug === p.slug)
                ? t(destinations.find((d) => d.slug === p.slug)!.name, locale)
                : p.slug === "puebla"
                  ? "Puebla"
                  : "Chichén Itzá"}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        {locale === "en"
          ? "Route overview · Schematic, not to scale. Transfers are planned individually."
          : "Vista del recorrido · Esquema sin escala. Los traslados se planean individualmente."}
      </figcaption>
    </figure>
  );
}
