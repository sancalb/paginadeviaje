export type Locale = "en" | "es";

export type Localized = { en: string; es: string };

export type Destination = {
  slug: string;
  name: Localized;
  tagline: Localized;
  intro: Localized;
  region: Localized;
  image: string | null;
  imageAlt: Localized;
  experiences: Localized[];
  food: Localized;
  culture: Localized;
  season: Localized;
  stay: Localized;
  duration: Localized;
  tips: Localized[];
  faq: { q: Localized; a: Localized }[];
  category: string[];
};

export type Journey = {
  slug: string;
  name: Localized;
  tagline: Localized;
  destinations: string[];
  days: number;
  style: Localized;
  itinerary: { title: Localized; detail: Localized }[];
  transport: Localized;
  stays: Localized;
  extensions: Localized;
  inclusions: Localized;
};

export function t(value: Localized, locale: Locale): string {
  return value[locale];
}

export const experienceCategories: {
  id: string;
  name: Localized;
  description: Localized;
}[] = [
  {
    id: "beach",
    name: { en: "Beaches & Relaxation", es: "Playas y descanso" },
    description: {
      en: "Unhurried coastal stays with room to adjust plans to sea conditions.",
      es: "Estancias junto al mar sin prisas, con margen para ajustar los planes a las condiciones locales.",
    },
  },
  {
    id: "culture",
    name: { en: "Culture & History", es: "Cultura e historia" },
    description: {
      en: "Museums, historic streets and living traditions, with time to understand their context.",
      es: "Museos, calles históricas y tradiciones vivas, con tiempo para conocer su contexto.",
    },
  },
  {
    id: "food",
    name: { en: "Food & Tequila", es: "Gastronomía y tequila" },
    description: {
      en: "Markets, regional cooking and conversations with the people behind each dish.",
      es: "Mercados, cocina regional y conversaciones con quienes dan vida a cada platillo.",
    },
  },
  {
    id: "nature",
    name: { en: "Adventure & Nature", es: "Aventura y naturaleza" },
    description: {
      en: "Coastal scenery, agave fields and outdoor visits that respect local environments.",
      es: "Paisajes costeros, campos de agave y visitas al aire libre que respetan el entorno.",
    },
  },
  {
    id: "luxury",
    name: { en: "Luxury Escapes", es: "Escapadas de lujo" },
    description: {
      en: "Consider a more personalized stay, with independently selected accommodation, dining and private transfers; no specific property or service is promised.",
      es: "Considera una estancia más personalizada, con alojamiento, gastronomía y traslados privados elegidos por separado; no se promete una propiedad ni un servicio concreto.",
    },
  },
  {
    id: "multi",
    name: { en: "Multi-City Journeys", es: "Viajes multidestino" },
    description: {
      en: "Connect destinations through editorial routes that leave time for transfers, local visits and rest.",
      es: "Conecta destinos mediante rutas editoriales que dejan tiempo para traslados, visitas locales y descanso.",
    },
  },
];

export const destinations: Destination[] = [
  {
    slug: "mexico-city",
    name: { en: "Mexico City", es: "Ciudad de México" },
    tagline: {
      en: "A city best explored one neighborhood at a time.",
      es: "Una ciudad para descubrir barrio por barrio.",
    },
    intro: {
      en: "Build your visit around a few neighborhoods, not a checklist across the entire capital. Historic plazas, major museums and everyday street food offer different ways into the city.",
      es: "Organiza la visita alrededor de algunos barrios, no de una lista que atraviese toda la capital. Las plazas históricas, los grandes museos y la comida cotidiana ofrecen distintas formas de conocerla.",
    },
    region: { en: "Central Mexico", es: "Centro de México" },
    image: "/media/mexico-city.webp",
    imageAlt: {
      en: "Historic architecture in Mexico City",
      es: "Arquitectura histórica de Ciudad de México",
    },
    experiences: [
      {
        en: "Explore the Historic Center around the Zócalo and Bellas Artes.",
        es: "Recorre el Centro Histórico entre el Zócalo y Bellas Artes.",
      },
      {
        en: "Pair a museum visit with a walk in Chapultepec.",
        es: "Combina una visita a un museo con un paseo por Chapultepec.",
      },
      {
        en: "Set aside a separate outing for the plazas and cafés of Coyoacán.",
        es: "Dedica una salida aparte a las plazas y los cafés de Coyoacán.",
      },
    ],
    food: {
      en: "Try tacos, tamales and a neighborhood market meal. Ask about fillings and salsas rather than assuming that a familiar dish is prepared the same way everywhere.",
      es: "Prueba tacos, tamales y una comida en un mercado de barrio. Pregunta por los rellenos y las salsas: un mismo platillo puede prepararse de distintas maneras.",
    },
    culture: {
      en: "Read the city through its layers: Mexica history, colonial buildings and contemporary art coexist, often within the same neighborhood.",
      es: "Lee la ciudad por capas: la historia mexica, los edificios virreinales y el arte contemporáneo conviven, a menudo dentro del mismo barrio.",
    },
    season: {
      en: "Choose dates around the exhibitions and celebrations that interest you. Keep outdoor walks and museum visits interchangeable.",
      es: "Elige las fechas según las exposiciones y celebraciones que te interesen. Mantén flexibilidad para alternar paseos al aire libre y museos.",
    },
    stay: {
      en: "Consider the Historic Center for heritage visits, Reforma for a central hotel base, or Roma and Condesa for cafés and neighborhood walks. Check the exact location and street noise.",
      es: "Considera el Centro Histórico para visitas patrimoniales, Reforma como base hotelera o Roma y Condesa para cafés y paseos de barrio. Revisa la ubicación exacta y el ruido de la calle.",
    },
    duration: {
      en: "Allow 3 to 5 days for a first visit.",
      es: "Dedica de 3 a 5 días a una primera visita.",
    },
    tips: [
      {
        en: "Group each day geographically; cross-city transfers can absorb much of the day.",
        es: "Agrupa cada día por zonas; los traslados de un extremo a otro pueden consumir buena parte de la jornada.",
      },
      {
        en: "Leave the arrival day light and build in breaks between walks.",
        es: "Deja ligero el día de llegada e incluye descansos entre paseos.",
      },
      {
        en: "Choose a few museum priorities instead of trying to see every collection.",
        es: "Elige algunos museos prioritarios en lugar de intentar ver todas las colecciones.",
      },
    ],
    faq: [
      {
        q: { en: "Do I need a car?", es: "¿Necesito coche?" },
        a: {
          en: "Not for a neighborhood-based visit. Combine walking with public transport or arranged rides according to your route and comfort.",
          es: "No para una visita por barrios. Combina caminatas con transporte público o traslados organizados según tu ruta y comodidad.",
        },
      },
      {
        q: {
          en: "Can I combine the center and Coyoacán in one outing?",
          es: "¿Puedo combinar el centro y Coyoacán en una salida?",
        },
        a: {
          en: "You can, but separate outings leave more room for visits and reduce time spent crossing the city.",
          es: "Puedes hacerlo, pero dedicarles salidas separadas permite visitar con más calma y reduce el tiempo cruzando la ciudad.",
        },
      },
    ],
    category: ["culture", "food", "multi"],
  },
  {
    slug: "guadalajara",
    name: { en: "Guadalajara", es: "Guadalajara" },
    tagline: {
      en: "Public plazas, creative neighborhoods and the flavors of Jalisco.",
      es: "Plazas, barrios creativos y sabores de Jalisco.",
    },
    intro: {
      en: "Guadalajara makes a rewarding urban base before exploring the wider state. Balance its historic center with contemporary cafés, galleries and a visit to nearby Tlaquepaque.",
      es: "Guadalajara ofrece una buena base urbana antes de explorar el estado. Combina su centro histórico con cafés contemporáneos, galerías y una visita al cercano Tlaquepaque.",
    },
    region: {
      en: "Jalisco · Western Mexico",
      es: "Jalisco · Occidente de México",
    },
    image: "/media/guadalajara.webp",
    imageAlt: {
      en: "Historic plazas in Guadalajara",
      es: "Plazas históricas de Guadalajara",
    },
    experiences: [
      {
        en: "Walk the central plazas around the cathedral.",
        es: "Camina por las plazas del centro alrededor de la catedral.",
      },
      {
        en: "Make time for the murals at Museo Cabañas.",
        es: "Reserva tiempo para los murales del Museo Cabañas.",
      },
      {
        en: "Visit Tlaquepaque for craft shops and pedestrian streets in the metropolitan area.",
        es: "Visita Tlaquepaque para conocer talleres, tiendas de artesanía y calles peatonales de la zona metropolitana.",
      },
    ],
    food: {
      en: "Start with a torta ahogada or birria, then explore the variety of neighborhood kitchens. Ask for sauces separately when you want to choose the heat level.",
      es: "Empieza con una torta ahogada o birria y después explora las cocinas de barrio. Pide las salsas aparte si prefieres decidir cuánto picante añadir.",
    },
    culture: {
      en: "Mariachi, public art and craft traditions are useful starting points, but leave room for the contemporary creative scene as well.",
      es: "El mariachi, el arte público y las tradiciones artesanales son un buen comienzo; deja espacio también para la escena creativa contemporánea.",
    },
    season: {
      en: "If a festival is your priority, plan around its announced program. For a quieter trip, keep major holiday periods in mind when choosing dates.",
      es: "Si tu prioridad es un festival, organiza el viaje alrededor de su programa anunciado. Para una visita tranquila, considera los periodos vacacionales al elegir fechas.",
    },
    stay: {
      en: "The center suits heritage-focused days; the Americana area works for restaurants and neighborhood walks. Choose based on your actual daily routes.",
      es: "El centro conviene para jornadas patrimoniales; la zona Americana, para restaurantes y paseos de barrio. Elige según los recorridos que realmente harás.",
    },
    duration: {
      en: "Allow 2 to 3 days, plus time for Tequila.",
      es: "Dedica de 2 a 3 días, más tiempo para Tequila.",
    },
    tips: [
      {
        en: "Treat Tlaquepaque as a separate outing rather than a quick central-city stop.",
        es: "Trata Tlaquepaque como una salida propia y no como una parada rápida del centro.",
      },
      {
        en: "Leave room between meals if food is a focus of your visit.",
        es: "Deja espacio entre comidas si la gastronomía es parte central de tu visita.",
      },
    ],
    faq: [
      {
        q: {
          en: "Is Tequila part of Guadalajara?",
          es: "¿Tequila forma parte de Guadalajara?",
        },
        a: {
          en: "No. It is a separate town in Jalisco and needs its own road transfer or organized excursion.",
          es: "No. Es una localidad distinta de Jalisco y necesita su propio traslado por carretera o excursión organizada.",
        },
      },
      {
        q: {
          en: "Is Tlaquepaque worth a separate visit?",
          es: "¿Vale la pena dedicar una visita a Tlaquepaque?",
        },
        a: {
          en: "Yes, particularly for craft shopping and a slower walk. Allow time to talk with makers and compare work.",
          es: "Sí, especialmente para conocer artesanía y pasear con calma. Deja tiempo para conversar con los creadores y comparar piezas.",
        },
      },
    ],
    category: ["culture", "food", "multi"],
  },
  {
    slug: "tequila",
    name: { en: "Tequila", es: "Tequila" },
    tagline: {
      en: "The landscape and people behind a celebrated spirit.",
      es: "El paisaje y las personas detrás de una bebida emblemática.",
    },
    intro: {
      en: "Visit Tequila for its town center and surrounding agave landscape, not only a tasting. A thoughtful producer visit connects farming, craft and the finished drink.",
      es: "Visita Tequila por su centro y el paisaje agavero que lo rodea, no solo por una degustación. Una visita bien elegida permite conectar el campo, el oficio y la bebida.",
    },
    region: { en: "Jalisco · Agave country", es: "Jalisco · Región agavera" },
    image: "/media/tequila.webp",
    imageAlt: {
      en: "Blue agave fields in the Tequila region",
      es: "Campos de agave azul en la región de Tequila",
    },
    experiences: [
      {
        en: "Explore the town square and surrounding streets on foot.",
        es: "Explora a pie la plaza y las calles del centro.",
      },
      {
        en: "Choose a producer visit that explains the production process.",
        es: "Elige una visita a un productor que explique el proceso de elaboración.",
      },
      {
        en: "Arrange access to agave fields with a local host rather than entering working land independently.",
        es: "Organiza una visita a campos de agave con un anfitrión local en lugar de entrar por tu cuenta a terrenos de trabajo.",
      },
    ],
    food: {
      en: "Balance tastings with a proper regional meal, such as birria. Ask your host about food options and alcohol-free alternatives before choosing an experience.",
      es: "Equilibra las degustaciones con una comida regional, como birria. Pregunta por las opciones de comida y alternativas sin alcohol antes de elegir una experiencia.",
    },
    culture: {
      en: "The agave landscape is a working environment. Learning about cultivation and production adds more depth than collecting tasting stops.",
      es: "El paisaje agavero es un entorno de trabajo. Conocer el cultivo y la elaboración aporta más que acumular paradas de degustación.",
    },
    season: {
      en: "Choose dates to suit the pace you want and leave flexibility for outdoor visits. Popular holiday periods may feel busier.",
      es: "Elige fechas según el ritmo que buscas y deja flexibilidad para las visitas al aire libre. Los periodos vacacionales populares pueden tener más afluencia.",
    },
    stay: {
      en: "Stay in town for a slower evening, or use Guadalajara as your base for a day trip. Check transfers when considering a rural property.",
      es: "Duerme en el pueblo para disfrutar una tarde tranquila o usa Guadalajara como base para una excursión. Revisa los traslados si eliges un alojamiento rural.",
    },
    duration: {
      en: "One full day, or 2 days with an overnight stay.",
      es: "Un día completo, o 2 días con una noche en el pueblo.",
    },
    tips: [
      {
        en: "Arrange a driver or organized transport if your visit includes alcohol.",
        es: "Organiza un conductor o transporte contratado si la visita incluye alcohol.",
      },
      {
        en: "Choose fewer visits with time for questions, food and rest.",
        es: "Elige pocas visitas y deja tiempo para preguntas, comida y descanso.",
      },
    ],
    faq: [
      {
        q: {
          en: "Can I enjoy Tequila without drinking?",
          es: "¿Puedo disfrutar Tequila sin beber?",
        },
        a: {
          en: "Yes. Focus on the landscape, town and production story; ask the host how the visit works without a tasting.",
          es: "Sí. Céntrate en el paisaje, el pueblo y la historia de la elaboración; pregunta al anfitrión cómo se adapta la visita sin degustación.",
        },
      },
      {
        q: {
          en: "Is an overnight stay necessary?",
          es: "¿Es necesario pasar la noche?",
        },
        a: {
          en: "No, but it gives you more room for a relaxed town visit without fitting everything around a return transfer.",
          es: "No, pero permite recorrer el pueblo con más calma sin ajustar todo al traslado de regreso.",
        },
      },
    ],
    category: ["culture", "food", "nature", "multi"],
  },
  {
    slug: "puerto-vallarta",
    name: { en: "Puerto Vallarta", es: "Puerto Vallarta" },
    tagline: {
      en: "A walkable waterfront with mountains behind the bay.",
      es: "Un malecón para caminar y montañas detrás de la bahía.",
    },
    intro: {
      en: "Puerto Vallarta pairs an established town with a coastal escape on Banderas Bay. Split your time between waterfront walks, local meals and unhurried beach days.",
      es: "Puerto Vallarta combina la vida de una ciudad con una escapada costera en Bahía de Banderas. Alterna paseos junto al mar, comidas locales y días de playa sin prisas.",
    },
    region: {
      en: "Jalisco · Pacific coast",
      es: "Jalisco · Costa del Pacífico",
    },
    image: "/media/puerto-vallarta.webp",
    imageAlt: {
      en: "Puerto Vallarta waterfront on Banderas Bay",
      es: "Paseo costero de Puerto Vallarta en Bahía de Banderas",
    },
    experiences: [
      {
        en: "Walk the Malecón and explore the streets of the center.",
        es: "Camina por el Malecón y explora las calles del centro.",
      },
      {
        en: "Spend time around the Zona Romántica and Los Muertos beach.",
        es: "Dedica tiempo a la Zona Romántica y la playa Los Muertos.",
      },
      {
        en: "Consider a coastal boat outing, leaving the choice to local sea conditions.",
        es: "Considera una salida en embarcación por la costa, según las condiciones locales del mar.",
      },
    ],
    food: {
      en: "Look for regional seafood dishes such as pescado zarandeado alongside everyday taco spots. A waterfront view and a good local kitchen need not be the same stop.",
      es: "Busca preparaciones regionales de pescado, como el zarandeado, y también taquerías de barrio. La mejor vista al mar y una buena cocina local no tienen que estar en el mismo lugar.",
    },
    culture: {
      en: "Public sculpture, galleries and daily life around the center give the town an identity beyond its beach hotels.",
      es: "La escultura pública, las galerías y la vida cotidiana del centro dan identidad a la ciudad más allá de sus hoteles de playa.",
    },
    season: {
      en: "Keep boat and beach plans flexible, with town walks or galleries as alternatives. Choose holiday dates consciously if you prefer a quieter visit.",
      es: "Mantén flexibles los planes de playa y navegación, con paseos urbanos o galerías como alternativas. Considera las vacaciones al elegir fechas si prefieres tranquilidad.",
    },
    stay: {
      en: "Choose the center or Zona Romántica for walking access to town; consider the hotel zone or Marina Vallarta for a resort-oriented base. Check distances to your preferred activities.",
      es: "Elige el centro o la Zona Romántica para recorrer la ciudad a pie; considera la zona hotelera o Marina Vallarta para una estancia centrada en el hotel. Revisa las distancias a tus actividades.",
    },
    duration: {
      en: "Allow 3 to 5 days for town and coast.",
      es: "Dedica de 3 a 5 días a la ciudad y la costa.",
    },
    tips: [
      {
        en: "Keep a land-based alternative for any boat excursion.",
        es: "Ten una alternativa en tierra para cualquier excursión en embarcación.",
      },
      {
        en: "Check the route on a map: hillside streets can involve steps and slopes.",
        es: "Revisa la ruta en un mapa: las calles de las laderas pueden incluir escaleras y pendientes.",
      },
    ],
    faq: [
      {
        q: {
          en: "Can I combine city walks with beach time?",
          es: "¿Puedo combinar paseos urbanos y playa?",
        },
        a: {
          en: "Yes. Staying near the center makes that combination straightforward, while more distant beaches need a separate outing.",
          es: "Sí. Alojarte cerca del centro facilita esa combinación; las playas más alejadas necesitan una salida aparte.",
        },
      },
      {
        q: {
          en: "Should every day include an excursion?",
          es: "¿Conviene hacer una excursión cada día?",
        },
        a: {
          en: "No. Leave open time for the waterfront, meals and rest rather than filling every day with transfers.",
          es: "No. Deja tiempo libre para el paseo costero, las comidas y el descanso en lugar de llenar cada día de traslados.",
        },
      },
    ],
    category: ["beach", "nature", "food", "culture", "multi", "luxury"],
  },
  {
    slug: "cancun",
    name: { en: "Cancún", es: "Cancún" },
    tagline: {
      en: "Caribbean beach days with room to explore beyond the hotel.",
      es: "Días de Caribe con espacio para salir del hotel.",
    },
    intro: {
      en: "Choose Cancún when you want a beach-centered stay with options for independent outings. The Hotel Zone and downtown offer different experiences, so choose your base before filling the itinerary.",
      es: "Elige Cancún para una estancia centrada en la playa con opciones de salidas independientes. La Zona Hotelera y el centro ofrecen experiencias distintas; decide tu base antes de llenar el itinerario.",
    },
    region: {
      en: "Quintana Roo · Mexican Caribbean",
      es: "Quintana Roo · Caribe mexicano",
    },
    image: "/media/cancun.webp",
    imageAlt: {
      en: "Caribbean shoreline in Cancún",
      es: "Costa del Caribe en Cancún",
    },
    experiences: [
      {
        en: "Leave a full day for the beach rather than scheduling an outing immediately after arrival.",
        es: "Deja un día completo para la playa en lugar de programar una excursión inmediatamente después de llegar.",
      },
      {
        en: "Explore downtown for local restaurants and a different view of the city.",
        es: "Explora el centro para conocer restaurantes locales y otra cara de la ciudad.",
      },
      {
        en: "Consider Isla Mujeres as a separate island excursion with its own return transfer.",
        es: "Considera Isla Mujeres como una excursión independiente con su propio traslado de regreso.",
      },
    ],
    food: {
      en: "Look beyond international resort menus for regional cooking, including cochinita pibil and seafood preparations. Downtown can make a useful change of scene for a meal.",
      es: "Busca cocina regional más allá de los menús internacionales de los hoteles, como cochinita pibil y preparaciones de pescado. El centro ofrece un cambio de ambiente para comer.",
    },
    culture: {
      en: "Make space for learning about Maya history and contemporary communities rather than treating the region solely as a resort coastline.",
      es: "Haz espacio para conocer la historia maya y sus comunidades contemporáneas, sin reducir la región a una costa de hoteles.",
    },
    season: {
      en: "Choose dates around your preferred pace and keep water activities flexible. Beach and sea conditions vary; do not build the entire trip around a promised beach appearance.",
      es: "Elige fechas según el ritmo que prefieras y mantén flexibles las actividades acuáticas. Las condiciones de playa y mar varían; no bases todo el viaje en una apariencia de playa garantizada.",
    },
    stay: {
      en: "The Hotel Zone suits a beach-first trip; downtown suits an urban base with separate beach outings. Check the specific property location rather than relying on its Cancún address.",
      es: "La Zona Hotelera conviene para priorizar la playa; el centro, para una base urbana con salidas al mar. Revisa la ubicación concreta del alojamiento, no solo su dirección en Cancún.",
    },
    duration: {
      en: "Allow 3 to 5 days, or combine with the Riviera Maya.",
      es: "Dedica de 3 a 5 días o combina con la Riviera Maya.",
    },
    tips: [
      {
        en: "Factor hotel-to-excursion transfers into the day, not only the activity itself.",
        es: "Cuenta los traslados entre hotel y excursión como parte del día, no solo la actividad.",
      },
      {
        en: "Ask locally about sea conditions before choosing a water-based outing.",
        es: "Consulta localmente las condiciones del mar antes de elegir una salida acuática.",
      },
    ],
    faq: [
      {
        q: {
          en: "Are Cancún and the Riviera Maya the same place?",
          es: "¿Cancún y la Riviera Maya son el mismo lugar?",
        },
        a: {
          en: "No. Cancún is a city; the Riviera Maya is a coastal region farther south with several different bases.",
          es: "No. Cancún es una ciudad; la Riviera Maya es una región costera más al sur con distintas localidades donde alojarse.",
        },
      },
      {
        q: {
          en: "Do I need to change hotels to visit Isla Mujeres?",
          es: "¿Necesito cambiar de hotel para visitar Isla Mujeres?",
        },
        a: {
          en: "Not necessarily. A day trip is an option, but leave enough room for the journey to and from the island.",
          es: "No necesariamente. Puedes hacer una excursión de un día, dejando margen para ir y volver de la isla.",
        },
      },
    ],
    category: ["beach", "nature", "food", "multi", "luxury"],
  },
  {
    slug: "riviera-maya",
    name: { en: "Riviera Maya", es: "Riviera Maya" },
    tagline: {
      en: "A coastal region to explore from a carefully chosen base.",
      es: "Una región costera para explorar desde una base bien elegida.",
    },
    intro: {
      en: "The Riviera Maya is not a single town. Puerto Morelos, Playa del Carmen and Tulum offer different ways to combine the coast, cenotes and archaeological visits without changing hotels every night.",
      es: "La Riviera Maya no es un solo pueblo. Puerto Morelos, Playa del Carmen y Tulum permiten combinar costa, cenotes y visitas arqueológicas de distintas maneras sin cambiar de hotel cada noche.",
    },
    region: {
      en: "Quintana Roo · Mexican Caribbean",
      es: "Quintana Roo · Caribe mexicano",
    },
    image: "/media/riviera-maya.webp",
    imageAlt: {
      en: "Coastal landscape in the Riviera Maya",
      es: "Paisaje costero de la Riviera Maya",
    },
    experiences: [
      {
        en: "Visit the archaeological site of Tulum with time to understand its coastal setting.",
        es: "Visita la zona arqueológica de Tulum con tiempo para comprender su entorno costero.",
      },
      {
        en: "Choose a locally managed cenote visit with an emphasis on caring for the water.",
        es: "Elige una visita a un cenote de gestión local que priorice el cuidado del agua.",
      },
      {
        en: "Spend an unhurried day in the coastal town nearest your base.",
        es: "Dedica un día tranquilo a la localidad costera más cercana a tu alojamiento.",
      },
    ],
    food: {
      en: "Seek out regional dishes and small local kitchens as well as hotel restaurants. Ask about ingredients if you want to explore Maya and Yucatecan influences in the cooking.",
      es: "Busca platillos regionales y cocinas locales además de los restaurantes del hotel. Pregunta por los ingredientes para conocer las influencias mayas y yucatecas de la cocina.",
    },
    culture: {
      en: "Maya heritage includes living languages, food and community knowledge, not only archaeological remains. Choose visits that acknowledge that continuity.",
      es: "El patrimonio maya incluye lenguas vivas, alimentación y conocimientos comunitarios, no solo vestigios arqueológicos. Elige visitas que reconozcan esa continuidad.",
    },
    season: {
      en: "Keep a balance of inland and coastal activities and leave space to change plans. Conditions at individual beaches can differ even within the same trip.",
      es: "Equilibra actividades de costa e interior y deja espacio para cambiar de plan. Las condiciones pueden variar de una playa a otra durante el mismo viaje.",
    },
    stay: {
      en: "Compare Puerto Morelos for a smaller-town base, Playa del Carmen for an urban coastal stay and Tulum for access to its surrounding area. In Tulum, town and beach accommodation are distinct choices.",
      es: "Compara Puerto Morelos como base de menor escala, Playa del Carmen para una estancia urbana costera y Tulum para explorar sus alrededores. En Tulum, alojarse en el pueblo o en la playa son decisiones distintas.",
    },
    duration: {
      en: "Allow 4 to 6 days from one base.",
      es: "Dedica de 4 a 6 días desde una sola base.",
    },
    tips: [
      {
        en: "Map your planned visits before selecting a hotel; the region covers more than one town.",
        es: "Ubica las visitas en un mapa antes de elegir hotel; la región abarca varias localidades.",
      },
      {
        en: "Choose operators who explain how their activities protect cenotes and coastal habitats.",
        es: "Elige operadores que expliquen cómo cuidan los cenotes y los hábitats costeros durante sus actividades.",
      },
    ],
    faq: [
      {
        q: {
          en: "Should I stay in several towns?",
          es: "¿Conviene alojarme en varias localidades?",
        },
        a: {
          en: "For a short trip, one well-chosen base usually leaves more time for visits and rest than repeated hotel changes.",
          es: "En un viaje corto, una base bien elegida suele dejar más tiempo para visitas y descanso que cambiar de hotel repetidamente.",
        },
      },
      {
        q: {
          en: "Can I see Tulum and a cenote in one day?",
          es: "¿Puedo visitar Tulum y un cenote el mismo día?",
        },
        a: {
          en: "Yes, if the locations work together. Keep the plan focused and leave room for transfers and a meal.",
          es: "Sí, si las ubicaciones encajan. Mantén un plan acotado y deja margen para los traslados y una comida.",
        },
      },
    ],
    category: ["beach", "nature", "culture", "food", "multi", "luxury"],
  },
  {
    slug: "oaxaca",
    name: { en: "Oaxaca", es: "Oaxaca" },
    tagline: {
      en: "Markets, makers and a city worth lingering in.",
      es: "Mercados, creadores y una ciudad para quedarse.",
    },
    intro: {
      en: "This guide focuses on Oaxaca de Juárez and the Central Valleys, not the entire state. Use the city as a base for markets, neighborhood walks and thoughtful visits to nearby archaeological and craft communities.",
      es: "Esta guía se centra en Oaxaca de Juárez y los Valles Centrales, no en todo el estado. Usa la ciudad como base para mercados, paseos de barrio y visitas a zonas arqueológicas y comunidades artesanales cercanas.",
    },
    region: { en: "Oaxaca · Southern Mexico", es: "Oaxaca · Sur de México" },
    image: "/media/oaxaca.webp",
    imageAlt: {
      en: "Streets in the historic center of Oaxaca de Juárez",
      es: "Calles del centro histórico de Oaxaca de Juárez",
    },
    experiences: [
      {
        en: "Walk the historic center around Santo Domingo and the main square.",
        es: "Recorre el centro histórico entre Santo Domingo y el Zócalo.",
      },
      {
        en: "Visit Monte Albán as a dedicated outing from the city.",
        es: "Dedica una salida desde la ciudad a Monte Albán.",
      },
      {
        en: "Arrange a workshop visit in the Central Valleys to learn directly from a maker.",
        es: "Organiza una visita a un taller de los Valles Centrales para aprender directamente de sus creadores.",
      },
    ],
    food: {
      en: "Explore tlayudas, moles and market breakfasts without trying to taste everything in one sitting. A cooking session can help connect ingredients with regional techniques.",
      es: "Explora tlayudas, moles y desayunos de mercado sin intentar probar todo de una sentada. Una sesión de cocina puede ayudar a relacionar ingredientes y técnicas regionales.",
    },
    culture: {
      en: "Oaxaca is culturally diverse. Ask about the specific community and maker behind a textile or carving rather than treating all work as one tradition.",
      es: "Oaxaca es culturalmente diversa. Pregunta por la comunidad y la persona detrás de un textil o una talla, en lugar de tratar todas las piezas como una sola tradición.",
    },
    season: {
      en: "If you travel for a celebration, plan around its local context and leave room for changes. Choose less event-focused dates for more relaxed city and workshop visits.",
      es: "Si viajas por una celebración, planea con atención a su contexto local y deja margen para cambios. Elige fechas menos ligadas a eventos si buscas visitas urbanas y talleres con más calma.",
    },
    stay: {
      en: "The historic center works for walking between major city sights. Jalatlaco and Xochimilco offer neighborhood settings; check the walking route and noise around each property.",
      es: "El centro histórico permite caminar entre las principales visitas urbanas. Jalatlaco y Xochimilco ofrecen ambientes de barrio; revisa los recorridos a pie y el ruido alrededor de cada alojamiento.",
    },
    duration: {
      en: "Allow 3 to 5 days for the city and nearby valleys.",
      es: "Dedica de 3 a 5 días a la ciudad y los valles cercanos.",
    },
    tips: [
      {
        en: "Group valley visits by direction instead of crossing the city several times.",
        es: "Agrupa las visitas a los valles por rumbo para evitar cruzar la ciudad varias veces.",
      },
      {
        en: "Ask before photographing people or work in progress, and respect a declined invitation.",
        es: "Pregunta antes de fotografiar personas o trabajos en proceso y respeta una respuesta negativa.",
      },
      {
        en: "Treat a coastal extension as a separate stage, not a quick city excursion.",
        es: "Considera una extensión a la costa como una etapa aparte, no como una excursión rápida desde la ciudad.",
      },
    ],
    faq: [
      {
        q: {
          en: "Does this destination include the Oaxaca coast?",
          es: "¿Este destino incluye la costa de Oaxaca?",
        },
        a: {
          en: "The suggestions here focus on the city and Central Valleys. A coastal stay needs additional days and its own transport planning.",
          es: "Estas propuestas se centran en la ciudad y los Valles Centrales. Una estancia costera necesita días adicionales y su propia organización de transporte.",
        },
      },
      {
        q: {
          en: "Is a guide useful at Monte Albán?",
          es: "¿Es útil visitar Monte Albán con guía?",
        },
        a: {
          en: "A knowledgeable local guide can help explain the site beyond its buildings. Choose the visit according to your interests and preferred pace.",
          es: "Un guía local con conocimiento puede explicar el sitio más allá de sus edificios. Elige la visita según tus intereses y el ritmo que prefieras.",
        },
      },
    ],
    category: ["culture", "food", "nature", "multi"],
  },
  {
    slug: "los-cabos",
    name: { en: "Los Cabos", es: "Los Cabos" },
    tagline: {
      en: "Desert scenery, coastal coves and two different town bases.",
      es: "Paisajes desérticos, caletas y dos bases distintas junto al mar.",
    },
    intro: {
      en: "Los Cabos brings together Cabo San Lucas, San José del Cabo and the corridor between them. Choose a base according to the town life, hotel setting and coast you want to experience.",
      es: "Los Cabos reúne Cabo San Lucas, San José del Cabo y el corredor que los conecta. Elige tu base según la vida urbana, el entorno del hotel y la costa que quieras conocer.",
    },
    region: {
      en: "Baja California Sur · Baja Peninsula",
      es: "Baja California Sur · Península de Baja California",
    },
    image: "/media/los-cabos.webp",
    imageAlt: {
      en: "Desert meeting the sea in Los Cabos",
      es: "Encuentro del desierto y el mar en Los Cabos",
    },
    experiences: [
      {
        en: "Explore the center and galleries of San José del Cabo.",
        es: "Explora el centro y las galerías de San José del Cabo.",
      },
      {
        en: "Consider a boat outing to see El Arco from Cabo San Lucas when sea conditions allow.",
        es: "Considera una salida en embarcación para observar El Arco desde Cabo San Lucas cuando las condiciones del mar lo permitan.",
      },
      {
        en: "Visit a coastal cove such as Santa María or Chileno, choosing activities according to local conditions.",
        es: "Visita una caleta como Santa María o Chileno y elige las actividades según las condiciones locales.",
      },
    ],
    food: {
      en: "Explore fish tacos, regional seafood and restaurants that work with Baja ingredients. Leave space for a simple local meal as well as destination dining.",
      es: "Explora tacos de pescado, productos del mar y restaurantes que trabajan con ingredientes de Baja California. Deja espacio para una comida local sencilla además de restaurantes de autor.",
    },
    culture: {
      en: "Gallery visits and conversations with local hosts add context to a trip often centered on the landscape and hotels.",
      es: "Las visitas a galerías y las conversaciones con anfitriones locales aportan contexto a un viaje que suele centrarse en el paisaje y los hoteles.",
    },
    season: {
      en: "Choose dates around your main interests and keep sea outings flexible. Confirm seasonal nature experiences with a responsible local operator instead of assuming they happen year-round.",
      es: "Elige fechas según tus intereses principales y mantén flexibles las salidas al mar. Confirma las experiencias estacionales de naturaleza con un operador responsable en lugar de asumir que ocurren todo el año.",
    },
    stay: {
      en: "Compare Cabo San Lucas for marina access, San José del Cabo for town and galleries, and the corridor for resort stays. Check whether your chosen beach suits the activities you want.",
      es: "Compara Cabo San Lucas por su acceso a la marina, San José del Cabo por el centro y las galerías, y el corredor para una estancia de hotel. Revisa si la playa elegida corresponde a las actividades que buscas.",
    },
    duration: {
      en: "Allow 4 to 6 days with time away from scheduled activities.",
      es: "Dedica de 4 a 6 días y deja tiempo sin actividades programadas.",
    },
    tips: [
      {
        en: "Oceanfront does not mean suitable for swimming; check local guidance and current conditions.",
        es: "Estar frente al mar no significa que una playa sea apta para nadar; consulta las indicaciones locales y las condiciones del momento.",
      },
      {
        en: "Plan transport between the two towns rather than expecting to walk between them.",
        es: "Organiza transporte entre las dos localidades en lugar de contar con recorrerlas a pie.",
      },
    ],
    faq: [
      {
        q: {
          en: "Are Cabo San Lucas and San José del Cabo the same town?",
          es: "¿Cabo San Lucas y San José del Cabo son la misma localidad?",
        },
        a: {
          en: "No. They are separate towns within Los Cabos, connected by a coastal corridor.",
          es: "No. Son localidades distintas dentro de Los Cabos, conectadas por un corredor costero.",
        },
      },
      {
        q: {
          en: "Can I swim at every hotel beach?",
          es: "¿Puedo nadar en la playa de cualquier hotel?",
        },
        a: {
          en: "No. Some beaches are unsuitable for swimming. Check the specific beach and follow local advice; a sea view alone is not a swimming guarantee.",
          es: "No. Algunas playas no son aptas para nadar. Revisa la playa concreta y sigue las indicaciones locales; una vista al mar no garantiza poder nadar.",
        },
      },
    ],
    category: ["beach", "nature", "food", "culture", "luxury"],
  },
];

// Editorial routes, not bookable packages; each itinerary entry represents one day.
export const journeys: Journey[] = [
  {
    slug: "mexico-city-oaxaca",
    name: {
      en: "Mexico's Cultural Heart",
      es: "El corazón cultural de México",
    },
    tagline: {
      en: "Eight days of neighborhoods, markets and living heritage.",
      es: "Ocho días de barrios, mercados y patrimonio vivo.",
    },
    destinations: ["mexico-city", "puebla", "oaxaca"],
    days: 8,
    style: {
      en: "Culture and food across Mexico City, Puebla and Oaxaca, with time reserved for each intercity journey.",
      es: "Cultura y gastronomía en Ciudad de México, Puebla y Oaxaca, con tiempo reservado para cada traslado entre ciudades.",
    },
    itinerary: [
      {
        title: {
          en: "Arrive in Mexico City",
          es: "Llegada a Ciudad de México",
        },
        detail: {
          en: "Settle into your accommodation, take a short neighborhood walk and keep the first meal close to your base. Leave major visits for tomorrow.",
          es: "Instálate, da un paseo corto por el barrio y elige una primera comida cerca de tu alojamiento. Deja las visitas principales para mañana.",
        },
      },
      {
        title: { en: "Historic Center", es: "Centro Histórico" },
        detail: {
          en: "Explore the Zócalo area and continue toward Bellas Artes. Choose one museum or heritage visit rather than rushing between several interiors.",
          es: "Explora la zona del Zócalo y continúa hacia Bellas Artes. Elige un museo o una visita patrimonial en lugar de apresurarte entre varios recintos.",
        },
      },
      {
        title: {
          en: "Puebla: arrival and historic center",
          es: "Puebla: llegada y centro histórico",
        },
        detail: {
          en: "Travel from Mexico City to Puebla and settle in for the night. If arrival leaves time, explore the historic center around the main square and choose a local meal; keep other visits optional.",
          es: "Viaja de Ciudad de México a Puebla e instálate para pasar la noche. Si la llegada deja tiempo, recorre el centro histórico alrededor del Zócalo y elige una comida local; deja las demás visitas como opcionales.",
        },
      },
      {
        title: {
          en: "Travel from Puebla to Oaxaca",
          es: "Traslado de Puebla a Oaxaca",
        },
        detail: {
          en: "Reserve the day for the overland journey to Oaxaca and arrival at your accommodation. Keep any evening walk close to your base and avoid committing to additional sightseeing.",
          es: "Reserva el día para el trayecto terrestre a Oaxaca y la llegada al alojamiento. Mantén cualquier paseo de la tarde cerca de tu base y evita comprometerte con visitas adicionales.",
        },
      },
      {
        title: {
          en: "Oaxaca markets and center",
          es: "Mercados y centro de Oaxaca",
        },
        detail: {
          en: "Start with a market meal, then explore the streets around Santo Domingo and the main square. Leave room to browse and learn about regional ingredients.",
          es: "Empieza con una comida de mercado y recorre las calles entre Santo Domingo y el Zócalo. Deja tiempo para mirar y conocer los ingredientes regionales.",
        },
      },
      {
        title: {
          en: "Central Valleys and local makers",
          es: "Valles Centrales y creadores locales",
        },
        detail: {
          en: "Arrange a focused visit to a craft workshop in the Central Valleys. Choose one area, speak with the makers and leave time for the return to Oaxaca rather than adding distant stops.",
          es: "Organiza una visita acotada a un taller artesanal de los Valles Centrales. Elige una zona, conversa con sus creadores y deja tiempo para regresar a Oaxaca en lugar de añadir paradas lejanas.",
        },
      },
      {
        title: { en: "Monte Albán", es: "Monte Albán" },
        detail: {
          en: "Visit Monte Albán with a focused archaeological outing. Return to the city for a slow afternoon, a neighborhood walk or a cooking experience arranged separately.",
          es: "Visita Monte Albán en una salida dedicada a la zona arqueológica. Regresa a la ciudad para una tarde tranquila, un paseo de barrio o una experiencia de cocina organizada aparte.",
        },
      },
      {
        title: {
          en: "Final morning and departure",
          es: "Última mañana y salida",
        },
        detail: {
          en: "If your departure allows, enjoy breakfast and a final walk near your accommodation. Keep the day free of distant valley visits and allow room for your onward transfer.",
          es: "Si tu salida lo permite, disfruta un desayuno y un último paseo cerca del alojamiento. Evita visitas lejanas a los valles y deja margen para el traslado de salida.",
        },
      },
    ],
    transport: {
      en: "Plan arrival in Mexico City and departure from Oaxaca. Arrange separate overland journeys from Mexico City to Puebla and from Puebla to Oaxaca, checking the actual route with your chosen provider. No departures or journey times are assumed.",
      es: "Planea llegar a Ciudad de México y salir desde Oaxaca. Organiza trayectos terrestres separados de Ciudad de México a Puebla y de Puebla a Oaxaca, revisando la ruta real con el proveedor elegido. No se presuponen salidas ni tiempos de viaje.",
    },
    stays: {
      en: "Suggested distribution: 2 nights in Mexico City, 1 in Puebla and 4 in Oaxaca. Select each accommodation independently; no particular hotel is part of this outline.",
      es: "Distribución sugerida: 2 noches en Ciudad de México, 1 en Puebla y 4 en Oaxaca. Elige cada alojamiento por separado; esta propuesta no incluye un hotel concreto.",
    },
    extensions: {
      en: "Add nights in Mexico City for Chapultepec or Coyoacán, or another night in Puebla for a slower visit. A stay on the Oaxaca coast needs a separate travel stage and additional nights.",
      es: "Añade noches en Ciudad de México para Chapultepec o Coyoacán, u otra noche en Puebla para visitar con más calma. Una estancia en la costa de Oaxaca necesita una etapa de traslado aparte y noches adicionales.",
    },
    inclusions: {
      en: "Editorial reference only. Accommodation, transport, meals, guides, activities and admissions are not included; arrange and confirm each service separately.",
      es: "Referencia editorial únicamente. No incluye alojamiento, transporte, comidas, guías, actividades ni entradas; organiza y confirma cada servicio por separado.",
    },
  },
  {
    slug: "jalisco-city-agave-coast",
    name: {
      en: "Tequila Culture & Pacific Coast",
      es: "Cultura del tequila y costa del Pacífico",
    },
    tagline: {
      en: "Seven days from Guadalajara to Puerto Vallarta via Tequila.",
      es: "Siete días de Guadalajara a Puerto Vallarta pasando por Tequila.",
    },
    destinations: ["guadalajara", "tequila", "puerto-vallarta"],
    days: 7,
    style: {
      en: "An urban start, an agave-country outing and a relaxed coastal finish.",
      es: "Un inicio urbano, una salida a la región agavera y un cierre tranquilo junto al mar.",
    },
    itinerary: [
      {
        title: { en: "Arrive in Guadalajara", es: "Llegada a Guadalajara" },
        detail: {
          en: "Settle in and take a short walk around your base. Choose a local dinner without scheduling a long excursion on arrival.",
          es: "Instálate y da un paseo corto cerca del alojamiento. Elige una cena local sin programar una excursión larga al llegar.",
        },
      },
      {
        title: {
          en: "Guadalajara and Tlaquepaque",
          es: "Guadalajara y Tlaquepaque",
        },
        detail: {
          en: "Explore the central plazas, then make a separate outing to Tlaquepaque for pedestrian streets and craft shops. Leave time for the transfer between the two areas.",
          es: "Explora las plazas del centro y después haz una salida a Tlaquepaque para conocer calles peatonales y artesanía. Deja tiempo para trasladarte entre ambas zonas.",
        },
      },
      {
        title: { en: "Tequila day trip", es: "Excursión a Tequila" },
        detail: {
          en: "Travel from Guadalajara to Tequila for a producer visit, town walk and regional meal. Arrange transport that does not depend on driving after a tasting, then return to Guadalajara.",
          es: "Viaja de Guadalajara a Tequila para visitar un productor, pasear por el pueblo y comer cocina regional. Organiza transporte que no dependa de conducir después de una degustación y regresa a Guadalajara.",
        },
      },
      {
        title: {
          en: "Travel to Puerto Vallarta",
          es: "Traslado a Puerto Vallarta",
        },
        detail: {
          en: "Dedicate the day to the road journey and check-in. If arrival leaves time, take a short waterfront walk; keep boat outings for another day.",
          es: "Dedica el día al trayecto por carretera y la llegada al alojamiento. Si queda tiempo, da un paseo corto junto al mar; deja las salidas en embarcación para otro día.",
        },
      },
      {
        title: { en: "Town and waterfront", es: "Ciudad y malecón" },
        detail: {
          en: "Walk the Malecón and central streets, then continue toward the Zona Romántica at your own pace. Leave the afternoon open for rest or time by the beach.",
          es: "Recorre el Malecón y las calles del centro y continúa hacia la Zona Romántica a tu ritmo. Deja la tarde abierta para descansar o estar junto a la playa.",
        },
      },
      {
        title: {
          en: "A flexible coastal day",
          es: "Un día flexible en la costa",
        },
        detail: {
          en: "Choose a locally arranged coastal outing if sea conditions suit it, or stay on land for beach time, galleries and a leisurely seafood meal.",
          es: "Elige una salida costera organizada localmente si las condiciones del mar lo permiten, o quédate en tierra para disfrutar la playa, las galerías y una comida de pescado sin prisa.",
        },
      },
      {
        title: {
          en: "Departure from Puerto Vallarta",
          es: "Salida desde Puerto Vallarta",
        },
        detail: {
          en: "Keep your last morning close to the hotel. Fit in breakfast or a final waterfront stroll only if your onward transfer leaves room.",
          es: "Mantén la última mañana cerca del hotel. Incluye un desayuno o un último paseo junto al mar solo si el traslado de salida deja margen.",
        },
      },
    ],
    transport: {
      en: "Arrive in Guadalajara and leave from Puerto Vallarta. Arrange a return excursion to Tequila and a separate intercity road transfer to the coast; neither is included.",
      es: "Llega a Guadalajara y sal desde Puerto Vallarta. Organiza una excursión de ida y vuelta a Tequila y un traslado por carretera independiente a la costa; ninguno está incluido.",
    },
    stays: {
      en: "Suggested distribution: 3 nights in Guadalajara and 3 in Puerto Vallarta. Tequila is a day trip, so no third hotel is necessary.",
      es: "Distribución sugerida: 3 noches en Guadalajara y 3 en Puerto Vallarta. Tequila se visita en excursión, por lo que no hace falta un tercer hotel.",
    },
    extensions: {
      en: "Add a night in Tequila for a slower agave-country visit, or extra nights in Puerto Vallarta for more downtime. Either choice lengthens this seven-day outline.",
      es: "Añade una noche en Tequila para conocer la región agavera con calma, o noches en Puerto Vallarta para descansar más. Ambas opciones amplían esta propuesta de siete días.",
    },
    inclusions: {
      en: "Editorial reference only, not a packaged tour. Hotels, transfers, producer visits, tastings, meals and excursions must be selected and arranged separately.",
      es: "Referencia editorial, no un paquete turístico. Hoteles, traslados, visitas a productores, degustaciones, comidas y excursiones se eligen y organizan por separado.",
    },
  },
  {
    slug: "cancun-riviera-maya",
    name: { en: "Best Yucatan", es: "Lo mejor de Yucatán" },
    tagline: {
      en: "Seven days with space for the coast, Maya heritage and rest.",
      es: "Siete días para la costa, el patrimonio maya y el descanso.",
    },
    destinations: ["cancun", "riviera-maya", "chichen-itza"],
    days: 7,
    style: {
      en: "A Yucatán Peninsula route with two coastal bases, Maya heritage and a dedicated day for Chichén Itzá.",
      es: "Una ruta por la península de Yucatán con dos bases costeras, patrimonio maya y un día dedicado a Chichén Itzá.",
    },
    itinerary: [
      {
        title: { en: "Arrive in Cancún", es: "Llegada a Cancún" },
        detail: {
          en: "Transfer to your accommodation and settle in. Keep the day simple, with a meal nearby and a short walk if arrival time permits.",
          es: "Trasládate al alojamiento e instálate. Mantén el día sencillo, con una comida cerca y un paseo corto si la hora de llegada lo permite.",
        },
      },
      {
        title: { en: "Cancún at your own pace", es: "Cancún a tu ritmo" },
        detail: {
          en: "Leave room for a full beach day, adjusting to local conditions. For a change of scene, plan a separate downtown meal rather than another long excursion.",
          es: "Deja espacio para un día de playa y ajústalo a las condiciones locales. Para cambiar de ambiente, organiza una comida en el centro en vez de otra excursión larga.",
        },
      },
      {
        title: {
          en: "Move to the Riviera Maya",
          es: "Traslado a la Riviera Maya",
        },
        detail: {
          en: "Transfer to a single Riviera Maya base, such as Playa del Carmen. Settle in and explore nearby on foot instead of adding a distant activity to the moving day.",
          es: "Trasládate a una sola base en la Riviera Maya, como Playa del Carmen. Instálate y explora los alrededores a pie sin añadir una actividad lejana al día de cambio de hotel.",
        },
      },
      {
        title: { en: "Tulum and a cenote", es: "Tulum y un cenote" },
        detail: {
          en: "Arrange a focused outing to the archaeological site of Tulum and a cenote on a compatible route. Leave space for a meal and return travel instead of adding more stops.",
          es: "Organiza una salida acotada a la zona arqueológica de Tulum y un cenote en una ruta compatible. Deja espacio para comer y regresar en lugar de añadir más paradas.",
        },
      },
      {
        title: {
          en: "A day without transfers",
          es: "Un día sin traslados largos",
        },
        detail: {
          en: "Stay near your base for the beach, cafés and rest. Keep this day open as a buffer if an earlier outdoor activity needs to move.",
          es: "Quédate cerca de tu base para disfrutar la playa, los cafés y el descanso. Mantén este día abierto por si necesitas mover una actividad al aire libre.",
        },
      },
      {
        title: { en: "Chichén Itzá", es: "Chichén Itzá" },
        detail: {
          en: "Dedicate the day to a separately arranged return journey to Chichén Itzá in the state of Yucatán. Allow for the road travel, a focused archaeological visit and a meal; do not add more distant stops. Confirm the route from your actual Riviera Maya base before committing.",
          es: "Dedica el día a un viaje de ida y vuelta organizado aparte a Chichén Itzá, en el estado de Yucatán. Contempla el trayecto por carretera, una visita arqueológica acotada y una comida; no añadas otras paradas lejanas. Confirma la ruta desde tu base real en la Riviera Maya antes de cerrar el plan.",
        },
      },
      {
        title: {
          en: "Final morning and departure",
          es: "Última mañana y salida",
        },
        detail: {
          en: "Keep the day for packing, a nearby breakfast and your airport transfer. Plan from the actual location of your hotel and departure airport, not the regional destination name.",
          es: "Reserva el día para preparar el equipaje, desayunar cerca y trasladarte al aeropuerto. Planea desde la ubicación real del hotel y del aeropuerto de salida, no desde el nombre de la región.",
        },
      },
    ],
    transport: {
      en: "Arrange arrival transport to Cancún, one hotel-to-hotel transfer, and separate outings to Tulum and Chichén Itzá. The Chichén Itzá visit involves inland road travel, not a nearby coastal stop; confirm the route with your provider without assuming journey times. Choose the departure airport before finalizing your base.",
      es: "Organiza el traslado de llegada a Cancún, un traslado entre hoteles y salidas separadas a Tulum y Chichén Itzá. La visita a Chichén Itzá implica un trayecto terrestre al interior, no una parada costera cercana; confirma la ruta con tu proveedor sin dar por hechos tiempos de viaje. Elige el aeropuerto de salida antes de cerrar tu base.",
    },
    stays: {
      en: "Suggested distribution: 2 nights in Cancún and 4 in one Riviera Maya base. A single-base version is possible if avoiding a hotel change matters more than exploring both areas.",
      es: "Distribución sugerida: 2 noches en Cancún y 4 en una sola base de la Riviera Maya. Puedes mantener una única base si prefieres evitar un cambio de hotel a explorar ambas zonas.",
    },
    extensions: {
      en: "Add a separate day for Isla Mujeres from Cancún, or extra nights near your Riviera Maya base. Do not squeeze another island excursion into departure day.",
      es: "Añade un día independiente para Isla Mujeres desde Cancún o noches adicionales cerca de tu base en la Riviera Maya. No intentes sumar otra excursión a una isla el día de salida.",
    },
    inclusions: {
      en: "Editorial reference only. No flights, accommodation, transfers, meals, activities, guides or admissions are included. Confirm arrangements individually and keep outdoor plans adaptable.",
      es: "Referencia editorial únicamente. No incluye vuelos, alojamiento, traslados, comidas, actividades, guías ni entradas. Confirma cada servicio por separado y mantén adaptables los planes al aire libre.",
    },
  },
];
