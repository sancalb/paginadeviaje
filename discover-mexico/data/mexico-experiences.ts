import { destinations, type Destination, type Localized } from "./content";

export type MexicoExperience = {
  slug: string;
  destinationSlug: string;
  destinations: string[];
  imageSlug: string;
  imageAlt: Localized;
  name: Localized;
  tagline: Localized;
  caption: Localized;
  intro: Localized;
  route: Localized;
  perfectFor: Localized;
  suggestedMoments: Localized[];
  planningNote: Localized;
};

function destination(slug: string): Destination {
  const item = destinations.find((d) => d.slug === slug);
  if (!item) throw new Error(`Unknown experience destination: ${slug}`);
  return item;
}

const cancun = destination("cancun");
const guadalajara = destination("guadalajara");
const tequila = destination("tequila");
const mexicoCity = destination("mexico-city");

export const mexicoExperiences: MexicoExperience[] = [
  {
    slug: "cancun-coast-and-city",
    destinationSlug: cancun.slug,
    destinations: [cancun.slug],
    imageSlug: cancun.slug,
    imageAlt: cancun.imageAlt,
    name: { en: "Cancún, coast and city", es: "Cancún, mar y ciudad" },
    tagline: {
      en: "Room for the Caribbean, and a different view from downtown.",
      es: "Espacio para el Caribe y otra mirada desde el centro.",
    },
    caption: {
      en: "Cancún · A shoreline to linger beside, a city to get to know.",
      es: "Cancún · Una costa para detenerse, una ciudad por conocer.",
    },
    intro: {
      en: "Let the coast set a slower pace. Keep a beach day open, then make room for a downtown meal and everyday city life. An island outing can be a separate chapter, not another stop squeezed into the same day.",
      es: "Deja que la costa marque un ritmo más lento. Reserva espacio para la playa y después para una comida en el centro y la vida cotidiana de la ciudad. Una salida a la isla puede ser otro capítulo, sin apretarla entre más paradas.",
    },
    route: {
      en: "Cancún shoreline and downtown, on separate outings. If Isla Mujeres interests you, allow a dedicated excursion and confirm the outward and return transport independently.",
      es: "La costa de Cancún y el centro, en salidas separadas. Si te interesa Isla Mujeres, dedica una excursión propia y confirma por separado el transporte de ida y vuelta.",
    },
    perfectFor: {
      en: "Travelers who enjoy quiet beach time with regional cooking and a little city exploration, without filling every day.",
      es: "Quienes disfrutan la playa con calma, la cocina regional y un poco de vida urbana, sin llenar cada día de actividades.",
    },
    suggestedMoments: cancun.experiences,
    planningNote: {
      en: "Keep the order flexible around local beach and sea conditions. Island transport and any activities require separate confirmation; this is an editorial starting point, not a bookable departure or a set of included services.",
      es: "Mantén flexible el orden según las condiciones locales de playa y mar. El transporte a la isla y las actividades necesitan confirmación aparte; esta es una idea editorial, no una salida reservable ni un conjunto de servicios incluidos.",
    },
  },
  {
    slug: "guadalajara-and-tequila",
    destinationSlug: guadalajara.slug,
    destinations: [guadalajara.slug, tequila.slug],
    imageSlug: tequila.slug,
    imageAlt: tequila.imageAlt,
    name: { en: "Guadalajara & Tequila", es: "Guadalajara y Tequila" },
    tagline: {
      en: "City streets, regional kitchens and the landscape of agave.",
      es: "Calles de ciudad, cocina regional y paisaje agavero.",
    },
    caption: {
      en: "Jalisco · From Guadalajara's plazas to Tequila's agave country.",
      es: "Jalisco · De las plazas de Guadalajara a la región agavera de Tequila.",
    },
    intro: {
      en: "Begin with Guadalajara's plazas and public art, then give Tequila its own outing. The connection is in the craft: a mural, a regional dish, the patient work behind agave. Choose a few visits with time to look and ask questions.",
      es: "Empieza por las plazas y el arte público de Guadalajara y dedica una salida propia a Tequila. El hilo está en el oficio: un mural, un platillo regional, el trabajo paciente del agave. Elige pocas visitas y deja tiempo para mirar y preguntar.",
    },
    route: {
      en: "Guadalajara, with a separate return outing to Tequila. Allow for the road journey rather than treating the town as a city-center stop; keep Tlaquepaque for another outing if you want to explore its craft shops.",
      es: "Guadalajara, con una salida independiente de ida y vuelta a Tequila. Contempla el trayecto por carretera: el pueblo no es una parada del centro urbano. Deja Tlaquepaque para otra salida si quieres explorar sus tiendas de artesanía.",
    },
    perfectFor: {
      en: "Curious travelers drawn to art, regional food and the story of agave, whether or not they choose a tasting.",
      es: "Viajeros curiosos por el arte, la comida regional y la historia del agave, con o sin degustación.",
    },
    suggestedMoments: [guadalajara.experiences[1], ...tequila.experiences],
    planningNote: {
      en: "Producer visits and access to working fields must be arranged with a local host and confirmed separately. If you choose a tasting, arrange transport that does not depend on driving afterward. This editorial route has no confirmed departure or included services.",
      es: "Las visitas a productores y el acceso a campos de trabajo se organizan con un anfitrión local y se confirman aparte. Si eliges una degustación, organiza transporte que no dependa de conducir después. Esta ruta editorial no tiene una salida confirmada ni servicios incluidos.",
    },
  },
  {
    slug: "mexico-city-neighborhoods",
    destinationSlug: mexicoCity.slug,
    destinations: [mexicoCity.slug],
    imageSlug: mexicoCity.slug,
    imageAlt: mexicoCity.imageAlt,
    name: { en: "Mexico City, neighborhood by neighborhood", es: "Ciudad de México, barrio a barrio" },
    tagline: {
      en: "Historic plazas, museum pauses and everyday tables.",
      es: "Plazas históricas, pausas de museo y mesas cotidianas.",
    },
    caption: {
      en: "Mexico City · A closer look, one part of the capital at a time.",
      es: "Ciudad de México · Una mirada cercana, una zona a la vez.",
    },
    intro: {
      en: "Give each part of the capital its own space. Follow the Historic Center's layers, pair a museum with Chapultepec, or leave a separate outing for Coyoacán's plazas and cafés. There is no need to cross the whole city to make a day feel full.",
      es: "Dale su espacio a cada zona de la capital. Sigue las capas del Centro Histórico, combina un museo con Chapultepec o deja una salida aparte para las plazas y los cafés de Coyoacán. No hace falta cruzar toda la ciudad para disfrutar el día.",
    },
    route: {
      en: "Historic Center, Chapultepec and Coyoacán as separate neighborhood outings, not a single continuous walk. Choose their order around your interests and leave room for cross-city transfers.",
      es: "Centro Histórico, Chapultepec y Coyoacán como salidas por zonas, no como un solo paseo continuo. Elige el orden según tus intereses y deja margen para trasladarte entre ellas.",
    },
    perfectFor: {
      en: "Travelers who prefer a few thoughtful cultural visits, neighborhood food and time to sit in a plaza over a citywide checklist.",
      es: "Quienes prefieren algunas visitas culturales bien elegidas, comida de barrio y tiempo en una plaza a una lista que abarque toda la ciudad.",
    },
    suggestedMoments: mexicoCity.experiences,
    planningNote: {
      en: "Choose your museum priorities and confirm opening arrangements and admissions separately before settling the route. These are suggested moments, not a timed itinerary, confirmed bookings or included services.",
      es: "Elige tus museos prioritarios y confirma por separado la apertura y las entradas antes de cerrar el recorrido. Son momentos sugeridos, no un itinerario con horarios, reservas confirmadas ni servicios incluidos.",
    },
  },
];
