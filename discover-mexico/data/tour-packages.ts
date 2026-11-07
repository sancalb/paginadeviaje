import type { Locale, Localized } from "./content";
import { tourIdentities } from "./tour-identities";

export type TourPackage = {
  id: string;
  slugs: Localized;
  name: Localized;
  destinationSlug: string;
  gallery: string[];
  destination: Localized;
  destinations: Localized[];
  airport: "CUN" | "GDL" | "MEX";
  days: 7;
  nights: 6;
  experienceType: Localized;
  perfectFor: Localized;
  accommodation: Localized;
  mealPlan: Localized;
  transport: Localized;
  doubleOccupancy: Localized;
  homeDescription: Localized;
  highlights: Localized[];
  headline: Localized;
  intro: Localized[];
  itinerary: {
    title: Localized;
    description: Localized;
    activities: { en: string[]; es: string[] };
    optional: boolean;
    photo?: string;
  }[];
  inclusions: { en: string[]; es: string[] };
  exclusions: { en: string[]; es: string[] };
  hotels: {
    id: "comfort" | "premium" | "luxury";
    name: string;
    description: Localized;
    features: Localized[];
  }[];
  hotelNote: Localized;
  upgrades: { en: string[]; es: string[] };
  upgradesNote: Localized;
  faq: { q: Localized; a: Localized }[];
  finalTitle: Localized;
  finalDescription: Localized[];
  importantInfo: { en: string[]; es: string[] };
  whatsappMessage: Localized;
  seo: { title: Localized; description: Localized };
  commercialNotice: Localized;
  publicationStatus: "quote-only";
  price: { verified: false; confirmedUsd: null; validUntil: null };
  quoteEnabled: true;
};

// Source: the complete launch catalog supplied by the user. All services remain proposed.
export const tourPackages: TourPackage[] = [
  {
    ...tourIdentities[0],
    destination: {
      en: "Cancun, Quintana Roo, Mexico",
      es: "Canc\u00fan, Quintana Roo.",
    },
    destinations: [
      {
        en: "Cancun",
        es: "Canc\u00fan",
      },
    ],
    gallery: [
      "/media/gallery/cancun-playa-delfines.webp",
      "/media/gallery/cancun-el-rey.webp",
    ],
    airport: "CUN",
    experienceType: {
      en: "All-Inclusive Beach Vacation",
      es: "Vacaciones de playa todo incluido.",
    },
    perfectFor: {
      en: "Couples, families, honeymooners and travelers seeking relaxation.",
      es: "Parejas, familias, lunamieleros y viajeros que buscan descansar.",
    },
    accommodation: {
      en: "6 nights at a selected all-inclusive resort in Cancun. Hotel to be confirmed.",
      es: "6 noches en un resort todo incluido seleccionado en Canc\u00fan. Hotel por confirmar.",
    },
    mealPlan: {
      en: "All Inclusive, according to the contracted resort plan.",
      es: "Todo incluido, de acuerdo con el plan contratado del resort.",
    },
    transport: {
      en: "Round-trip shared transportation between Cancun International Airport and the hotel.",
      es: "Traslados compartidos redondos entre el Aeropuerto Internacional de Canc\u00fan y el hotel.",
    },
    doubleOccupancy: {
      en: "Per-person pricing assumes double occupancy. Final price subject to quotation.",
      es: "Los precios por persona consideran ocupaci\u00f3n doble. Precio final sujeto a cotizaci\u00f3n.",
    },
    days: 7,
    nights: 6,
    homeDescription: {
      en: "Escape to the turquoise waters of the Mexican Caribbean. Enjoy six nights at an all-inclusive resort, featuring beautiful beaches, dining, entertainment and time to relax.",
      es: "Esc\u00e1pate al Caribe mexicano y disfruta seis noches en un resort todo incluido, con hermosas playas, restaurantes, entretenimiento y tiempo para relajarte.",
    },
    highlights: [
      {
        en: "6 nights at an all-inclusive resort.",
        es: "6 noches en resort todo incluido.",
      },
      {
        en: "Meals and beverages according to your selected hotel plan.",
        es: "Alimentos y bebidas seg\u00fan el plan contratado.",
      },
      {
        en: "Round-trip airport transfers.",
        es: "Traslados redondos del aeropuerto.",
      },
      {
        en: "Optional island and cultural excursions.",
        es: "Excursiones opcionales.",
      },
      {
        en: "Bilingual travel assistance.",
        es: "Asistencia biling\u00fce.",
      },
    ],
    headline: {
      en: "Experience Paradise in the Mexican Caribbean",
      es: "Tu escapada al para\u00edso del Caribe",
    },
    intro: [
      {
        en: "Welcome to Cancun, where white-sand beaches, turquoise Caribbean waters and world-class resorts create the perfect tropical escape.",
        es: "Descubre Canc\u00fan, donde las playas de arena blanca, las aguas turquesa del Caribe y los resorts todo incluido de nivel internacional crean el escenario perfecto para una escapada tropical y unas vacaciones inolvidables.",
      },
      {
        en: "Enjoy seven days and six nights of relaxation, dining, entertainment and unforgettable moments at an all-inclusive resort.",
        es: "Disfruta siete d\u00edas y seis noches de descanso, gastronom\u00eda, entretenimiento y momentos inolvidables en un resort todo incluido, con la posibilidad de agregar excursiones y experiencias especiales.",
      },
      {
        en: "Your vacation begins with a prearranged airport transfer and continues with the freedom to enjoy the resort at your own pace. Add exciting optional adventures or simply relax under the Caribbean sun.",
        es: "Tus vacaciones comienzan con un traslado programado desde el aeropuerto y contin\u00faan con la libertad de disfrutar el resort a tu ritmo. Agrega emocionantes aventuras opcionales o simplemente rel\u00e1jate bajo el sol del Caribe.",
      },
    ],
    itinerary: [
      {
        title: {
          en: "Welcome to Paradise",
          es: "Bienvenido al para\u00edso",
        },
        description: {
          en: "Arrival at Cancun International Airport (CUN).",
          es: "Llegada al Aeropuerto Internacional de Canc\u00fan, recepci\u00f3n y traslado al resort. Registro en el hotel y tiempo libre para conocer las instalaciones.",
        },
        activities: {
          en: [
            "Arrival at Cancun International Airport (CUN).",
            "Meet your transportation provider.",
            "Transfer to your selected all-inclusive resort.",
            "Hotel check-in according to hotel policies.",
            "Free time to explore the resort.",
            "Dinner and evening entertainment according to the resort program.",
          ],
          es: [
            "Llegada al Aeropuerto Internacional de Canc\u00fan (CUN).",
            "Encuentro con el proveedor de transporte.",
            "Traslado al resort todo incluido seleccionado.",
            "Registro en el hotel conforme a sus pol\u00edticas.",
            "Tiempo libre para explorar el resort.",
            "Cena y entretenimiento nocturno seg\u00fan el programa del resort.",
          ],
        },
        optional: false,
      },
      {
        photo: "/media/gallery/cancun-playa-delfines.webp",
        title: {
          en: "Caribbean Beach Day",
          es: "Disfruta el Caribe",
        },
        description: {
          en: "Breakfast at the resort.",
          es: "D\u00eda completo para disfrutar la playa, albercas, restaurantes y actividades incluidas en el resort.",
        },
        activities: {
          en: [
            "Breakfast at the resort.",
            "Full day to enjoy the beach and swimming pools.",
            "Explore the resort's included dining and recreational options.",
            "Enjoy available evening entertainment.",
          ],
          es: [
            "Desayuno en el resort.",
            "D\u00eda completo para disfrutar la playa y las albercas.",
            "Explora las opciones gastron\u00f3micas y recreativas incluidas del resort.",
            "Disfruta el entretenimiento nocturno disponible.",
          ],
        },
        optional: false,
      },
      {
        title: {
          en: "Island Adventure or Resort Relaxation",
          es: "Isla Mujeres o descanso",
        },
        description: {
          en: "Breakfast at the resort.",
          es: "Excursi\u00f3n opcional a Isla Mujeres con costo adicional. Tambi\u00e9n puedes permanecer en el hotel y disfrutar sus instalaciones.",
        },
        activities: {
          en: [
            "Breakfast at the resort.",
            "Optional excursion to Isla Mujeres, available at an additional cost.",
            "Discover beautiful island scenery and beaches.",
            "Alternatively, enjoy a full day at your resort.",
            "Evening at leisure.",
          ],
          es: [
            "Desayuno en el resort.",
            "Excursi\u00f3n opcional a Isla Mujeres, disponible con costo adicional.",
            "Descubre los paisajes y las playas de la isla.",
            "Como alternativa, disfruta un d\u00eda completo en tu resort.",
            "Noche libre.",
          ],
        },
        optional: true,
      },
      {
        title: {
          en: "Relax & Recharge",
          es: "Relajaci\u00f3n total",
        },
        description: {
          en: "Breakfast at the resort.",
          es: "Disfruta de las actividades del hotel. Posibilidad de contratar spa, tratamientos o experiencias especiales.",
        },
        activities: {
          en: [
            "Breakfast at the resort.",
            "Enjoy the facilities and included activities.",
            "Optional spa treatments or premium experiences at an additional cost.",
            "Free time for beach and pool relaxation.",
          ],
          es: [
            "Desayuno en el resort.",
            "Disfruta las instalaciones y las actividades incluidas.",
            "Tratamientos de spa o experiencias premium opcionales con costo adicional.",
            "Tiempo libre para descansar en la playa y las albercas.",
          ],
        },
        optional: false,
      },
      {
        title: {
          en: "Explore the Riviera Maya (Optional)",
          es: "Riviera Maya (opcional)",
        },
        description: {
          en: "Breakfast at the resort.",
          es: "Posibilidad de contratar excursiones a cenotes o sitios arqueol\u00f3gicos. Los viajeros que prefieran descansar pueden disfrutar otro d\u00eda en el resort.",
        },
        activities: {
          en: [
            "Breakfast at the resort.",
            "Optional day trip to regional attractions such as cenotes or archaeological sites, subject to availability and additional charges.",
            "Guests not joining an excursion enjoy a free resort day.",
            "Evening at leisure.",
          ],
          es: [
            "Desayuno en el resort.",
            "Excursi\u00f3n opcional de un d\u00eda a atractivos de la regi\u00f3n, como cenotes o sitios arqueol\u00f3gicos, sujeta a disponibilidad y cargos adicionales.",
            "Los hu\u00e9spedes que no participen en una excursi\u00f3n disfrutar\u00e1n un d\u00eda libre en el resort.",
            "Noche libre.",
          ],
        },
        optional: true,
      },
      {
        title: {
          en: "Your Perfect Caribbean Day",
          es: "Tu \u00faltimo d\u00eda completo en Canc\u00fan",
        },
        description: {
          en: "Breakfast at the resort.",
          es: "Tiempo libre para disfrutar las playas, albercas, restaurantes y entretenimiento del hotel.",
        },
        activities: {
          en: [
            "Breakfast at the resort.",
            "Final full day to enjoy your all-inclusive vacation.",
            "Relax on the beach, enjoy the pools and explore the resort's amenities.",
            "Optional specialty dining experiences according to hotel availability.",
          ],
          es: [
            "Desayuno en el resort.",
            "\u00daltimo d\u00eda completo para disfrutar tus vacaciones todo incluido.",
            "Descansa en la playa, disfruta las albercas y explora los servicios del resort.",
            "Experiencias gastron\u00f3micas de especialidad opcionales seg\u00fan la disponibilidad del hotel.",
          ],
        },
        optional: false,
      },
      {
        title: {
          en: "Until Next Time, Cancun",
          es: "Regreso",
        },
        description: {
          en: "Breakfast according to your departure schedule.",
          es: "Check-out y traslado programado al Aeropuerto Internacional de Canc\u00fan.",
        },
        activities: {
          en: [
            "Breakfast according to your departure schedule.",
            "Check-out.",
            "Prearranged transfer to Cancun International Airport.",
            "End of services.",
          ],
          es: [
            "Desayuno de acuerdo con tu horario de salida.",
            "Check-out.",
            "Traslado programado al Aeropuerto Internacional de Canc\u00fan.",
            "Fin de los servicios.",
          ],
        },
        optional: false,
      },
    ],
    inclusions: {
      en: [
        "6 nights at a selected all-inclusive resort in Cancun.",
        "Meals and beverages covered by the contracted resort plan.",
        "Access to included resort amenities, activities and entertainment.",
        "Round-trip shared transportation between Cancun International Airport and the hotel.",
        "Travel coordination.",
        "Bilingual assistance by WhatsApp during the trip.",
      ],
      es: [
        "6 noches en un resort todo incluido seleccionado en Canc\u00fan.",
        "Alimentos y bebidas contemplados en el plan contratado del resort.",
        "Acceso a las instalaciones, actividades y entretenimiento incluidos del resort.",
        "Traslados compartidos redondos entre el Aeropuerto Internacional de Canc\u00fan y el hotel.",
        "Coordinaci\u00f3n del viaje.",
        "Asistencia biling\u00fce por WhatsApp durante el viaje.",
      ],
    },
    exclusions: {
      en: [
        "International or domestic flights.",
        "Excursions to Isla Mujeres, cenotes or archaeological sites.",
        "Optional spa services, upgrades and premium resort amenities not included in the contracted plan.",
        "Personal purchases.",
        "Gratuities and local taxes or fees not expressly included in the final quotation.",
        "Travel insurance unless specifically added.",
      ],
      es: [
        "Vuelos internacionales o nacionales.",
        "Excursiones a Isla Mujeres, cenotes o sitios arqueol\u00f3gicos.",
        "Servicios de spa opcionales, mejoras y servicios premium del resort no incluidos en el plan contratado.",
        "Compras personales.",
        "Propinas e impuestos o cargos locales no incluidos expresamente en la cotizaci\u00f3n final.",
        "Seguro de viaje, salvo que se agregue espec\u00edficamente.",
      ],
    },
    hotels: [
      {
        id: "comfort",
        name: "Comfort",
        description: {
          en: "Well-rated all-inclusive accommodation with comfortable rooms, restaurants, swimming pools and beachfront or beach-access facilities according to the hotel selected.",
          es: "Hospedaje todo incluido bien valorado, con habitaciones c\u00f3modas, restaurantes, albercas e instalaciones frente al mar o con acceso a la playa, de acuerdo con el hotel seleccionado.",
        },
        features: [
          {
            en: "Comfortable rooms (according to the selected hotel; to be confirmed).",
            es: "Habitaciones c\u00f3modas (seg\u00fan el hotel seleccionado; por confirmar).",
          },
          {
            en: "Restaurants and swimming pools (according to the selected hotel; to be confirmed).",
            es: "Restaurantes y albercas (seg\u00fan el hotel seleccionado; por confirmar).",
          },
          {
            en: "Beachfront or beach access, according to the selected hotel (according to the selected hotel; to be confirmed).",
            es: "Frente al mar o con acceso a la playa, seg\u00fan el hotel seleccionado (seg\u00fan el hotel seleccionado; por confirmar).",
          },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        description: {
          en: "Upscale resorts with enhanced dining options, upgraded rooms and additional amenities.",
          es: "Resorts de categor\u00eda superior con mejores opciones gastron\u00f3micas, habitaciones de categor\u00eda superior y servicios adicionales.",
        },
        features: [
          {
            en: "Enhanced dining options (according to the selected hotel; to be confirmed).",
            es: "Mejores opciones gastron\u00f3micas (seg\u00fan el hotel seleccionado; por confirmar).",
          },
          {
            en: "Upgraded rooms (according to the selected hotel; to be confirmed).",
            es: "Habitaciones de categor\u00eda superior (seg\u00fan el hotel seleccionado; por confirmar).",
          },
          {
            en: "Additional amenities (according to the selected hotel; to be confirmed).",
            es: "Servicios adicionales (seg\u00fan el hotel seleccionado; por confirmar).",
          },
        ],
      },
      {
        id: "luxury",
        name: "Luxury",
        description: {
          en: "High-end resorts with premium accommodations, elevated service and luxury facilities.",
          es: "Resorts de alta gama con habitaciones premium, servicio de nivel superior e instalaciones de lujo.",
        },
        features: [
          {
            en: "Premium accommodations (according to the selected hotel; to be confirmed).",
            es: "Habitaciones premium (seg\u00fan el hotel seleccionado; por confirmar).",
          },
          {
            en: "Elevated service (according to the selected hotel; to be confirmed).",
            es: "Servicio de nivel superior (seg\u00fan el hotel seleccionado; por confirmar).",
          },
          {
            en: "Luxury facilities (according to the selected hotel; to be confirmed).",
            es: "Instalaciones de lujo (seg\u00fan el hotel seleccionado; por confirmar).",
          },
        ],
      },
    ],
    hotelNote: {
      en: "Hotel names, room categories and amenities will be confirmed in your personalized proposal.",
      es: "Los nombres de los hoteles, las categor\u00edas de habitaci\u00f3n y los servicios se confirmar\u00e1n en tu propuesta personalizada.",
    },
    upgrades: {
      en: [
        "Isla Mujeres day trip.",
        "Cenote adventure.",
        "Chichen Itza excursion.",
        "Private airport transportation.",
        "Ocean-view or upgraded room.",
        "Spa experiences.",
        "Romantic celebrations.",
        "Additional nights.",
      ],
      es: [
        "Excursi\u00f3n de un d\u00eda a Isla Mujeres.",
        "Aventura en cenotes.",
        "Excursi\u00f3n a Chich\u00e9n Itz\u00e1.",
        "Transporte privado al aeropuerto.",
        "Habitaci\u00f3n con vista al mar o de categor\u00eda superior.",
        "Experiencias de spa.",
        "Celebraciones rom\u00e1nticas.",
        "Noches adicionales.",
      ],
    },
    upgradesNote: {
      en: "Optional experiences are quoted separately.",
      es: "Las experiencias opcionales se cotizan por separado.",
    },
    faq: [
      {
        q: {
          en: "Are international flights included?",
          es: "\u00bfIncluye vuelos internacionales?",
        },
        a: {
          en: "No. The package begins and ends in Cancun. International and domestic flights are not included.",
          es: "No. El paquete comienza y termina en Canc\u00fan. Los vuelos internacionales y nacionales no est\u00e1n incluidos.",
        },
      },
      {
        q: {
          en: "Does the package include all meals and beverages?",
          es: "\u00bfEl paquete incluye todos los alimentos y bebidas?",
        },
        a: {
          en: "Yes, according to the all-inclusive plan contracted with your selected resort. Some premium services may carry additional charges.",
          es: "S\u00ed, de acuerdo con el plan todo incluido contratado con el resort seleccionado. Algunos servicios premium pueden generar cargos adicionales.",
        },
      },
      {
        q: {
          en: "Are airport transfers included?",
          es: "\u00bfLos traslados al aeropuerto est\u00e1n incluidos?",
        },
        a: {
          en: "Yes. Round-trip shared transfers between Cancun International Airport and the resort are planned as part of the package.",
          es: "S\u00ed. Los traslados compartidos redondos entre el Aeropuerto Internacional de Canc\u00fan y el resort est\u00e1n contemplados como parte del paquete.",
        },
      },
      {
        q: {
          en: "Can I choose my hotel?",
          es: "\u00bfPuedo elegir mi hotel?",
        },
        a: {
          en: "Yes. We can quote multiple resorts according to your preferences, travel dates and budget.",
          es: "S\u00ed. Podemos cotizar distintos resorts de acuerdo con tus preferencias, fechas de viaje y presupuesto.",
        },
      },
      {
        q: {
          en: "Can children travel on this package?",
          es: "\u00bfPueden viajar ni\u00f1os en este paquete?",
        },
        a: {
          en: "Yes, subject to the selected resort's policies. Family-friendly and adults-only hotel options can be quoted.",
          es: "S\u00ed, sujeto a las pol\u00edticas del resort seleccionado. Se pueden cotizar opciones de hoteles familiares y solo para adultos.",
        },
      },
      {
        q: {
          en: "Can I add excursions?",
          es: "\u00bfPuedo agregar excursiones?",
        },
        a: {
          en: "Yes. Optional activities can be added to your quotation.",
          es: "S\u00ed. Las actividades opcionales pueden agregarse a tu cotizaci\u00f3n con costo adicional.",
        },
      },
      {
        q: {
          en: "Can I travel for more than seven days?",
          es: "\u00bfPuedo viajar por m\u00e1s de siete d\u00edas?",
        },
        a: {
          en: "Yes. We can quote additional nights.",
          es: "S\u00ed. Podemos cotizar noches adicionales, sujetas a disponibilidad.",
        },
      },
      {
        q: {
          en: "What is the cancellation policy?",
          es: "\u00bfCu\u00e1l es la pol\u00edtica de cancelaci\u00f3n?",
        },
        a: {
          en: "Cancellation terms depend on the selected hotel, services and travel dates. Specific conditions will be presented before payment.",
          es: "Las condiciones de cancelaci\u00f3n dependen del hotel, los servicios y las fechas de viaje seleccionados. Las condiciones espec\u00edficas se presentar\u00e1n antes del pago.",
        },
      },
    ],
    finalTitle: {
      en: "Ready for Your Cancun Escape?",
      es: "Solicita tu viaje a Canc\u00fan",
    },
    finalDescription: [
      {
        en: "Tell us when you would like to travel, how many guests are joining and your preferred resort category.",
        es: "Ind\u00edcanos tus fechas, n\u00famero de viajeros y categor\u00eda de hotel deseada.",
      },
      {
        en: "Our bilingual team will help you choose the right vacation.",
        es: "Nuestro equipo biling\u00fce te ayudar\u00e1 a elegir las vacaciones adecuadas.",
      },
    ],
    importantInfo: {
      en: [
        "Per-person pricing assumes double occupancy. International flights are not included.",
        "Hotels for six nights and different travel seasons remain to be selected and quoted.",
        "Transfer prices and capacity for each group require confirmation.",
        "Operators, guide languages, departures, admissions and included experiences require confirmation.",
        "Final prices require commercial validation. Deposits, changes, cancellations and refunds remain to be defined.",
        "Age restrictions, accessibility and provider-specific conditions require validation.",
        "No excursions are included beyond those covered by the contracted resort plan.",
        "Meals, beverages, amenities and entertainment are subject to the contracted resort plan. Premium services may carry additional charges.",
        "Shared round-trip transfers are planned between Cancun International Airport (CUN) and the selected resort. Private transportation is an optional upgrade.",
        "Hotel check-in follows hotel policies; departure-day breakfast depends on your departure schedule.",
        "Children's stays depend on the selected resort's policies. Family-friendly and adults-only options can be quoted.",
        "Optional excursions, spa services, room upgrades and premium experiences are quoted separately, subject to availability.",
        "Hotel names, room categories and amenities will be confirmed in your personalized proposal.",
        "Cancellation terms depend on the selected hotel, services and travel dates and will be presented before payment.",
      ],
      es: [
        "Los precios por persona consideran ocupaci\u00f3n doble. No incluyen vuelos internacionales.",
        "Los hoteles para seis noches y distintas temporadas est\u00e1n pendientes de selecci\u00f3n y cotizaci\u00f3n.",
        "Los precios de los traslados y la capacidad por grupo requieren confirmaci\u00f3n.",
        "Los operadores, los idiomas de los gu\u00edas, las salidas, las entradas y las experiencias incluidas requieren confirmaci\u00f3n.",
        "Los precios finales requieren validaci\u00f3n comercial. Los anticipos, cambios, cancelaciones y reembolsos est\u00e1n pendientes de definici\u00f3n.",
        "Las restricciones de edad, la accesibilidad y las condiciones espec\u00edficas de los proveedores requieren validaci\u00f3n.",
        "No se incluyen excursiones, salvo las contempladas en el plan contratado del resort.",
        "Los alimentos, las bebidas, las instalaciones y el entretenimiento dependen del plan contratado del resort. Los servicios premium pueden generar cargos adicionales.",
        "Se contemplan traslados compartidos redondos entre el Aeropuerto Internacional de Canc\u00fan (CUN) y el resort seleccionado. El transporte privado es una mejora opcional.",
        "El registro en el hotel se realiza conforme a sus pol\u00edticas; el desayuno del d\u00eda de salida depende de tu horario de partida.",
        "La estancia de menores depende de las pol\u00edticas del resort seleccionado. Se pueden cotizar opciones familiares y solo para adultos.",
        "Las excursiones opcionales, los servicios de spa, las mejoras de habitaci\u00f3n y las experiencias premium se cotizan por separado, sujetos a disponibilidad.",
        "Los nombres de los hoteles, las categor\u00edas de habitaci\u00f3n y los servicios se confirmar\u00e1n en tu propuesta personalizada.",
        "Las condiciones de cancelaci\u00f3n dependen del hotel, los servicios y las fechas de viaje seleccionados y se presentar\u00e1n antes del pago.",
      ],
    },
    whatsappMessage: {
      en: "Hello! I'm interested in the Cancun All-Inclusive Escape, 7 days / 6 nights. Could you help me with a quote?",
      es: "\u00a1Hola! Me interesa Cancun All-Inclusive Escape, de 7 d\u00edas / 6 noches. \u00bfPodr\u00edan ayudarme con una cotizaci\u00f3n?",
    },
    seo: {
      title: {
        en: "Cancun All-Inclusive Vacation Package \u2014 7 Days",
        es: "Canc\u00fan Todo Incluido \u2014 7 D\u00edas y 6 Noches",
      },
      description: {
        en: "Enjoy a 7-day Cancun all-inclusive vacation with six nights at a resort, airport transfers and personalized bilingual travel assistance.",
        es: "Disfruta Canc\u00fan durante 7 d\u00edas y 6 noches en un resort todo incluido con traslados al aeropuerto y asistencia personalizada.",
      },
    },
    commercialNotice: {
      en: "This is a planned package offered by personalized quotation only, not a confirmed booking. Pricing is unverified. Hotels, services, providers, guide languages, departures, admissions and included experiences have not yet been confirmed and require commercial validation. The final proposal must confirm the contracted services and applicable conditions before booking.",
      es: "Este es un paquete propuesto disponible \u00fanicamente mediante cotizaci\u00f3n personalizada, no una reservaci\u00f3n confirmada. Los precios no est\u00e1n verificados. Los hoteles, servicios, proveedores, idiomas de los gu\u00edas, salidas, entradas y experiencias incluidas a\u00fan no est\u00e1n confirmados y requieren validaci\u00f3n comercial. La propuesta final deber\u00e1 confirmar los servicios contratados y las condiciones aplicables antes de reservar.",
    },
    publicationStatus: "quote-only",
    price: {
      verified: false,
      confirmedUsd: null,
      validUntil: null,
    },
    quoteEnabled: true,
  },
  {
    ...tourIdentities[1],
    destination: {
      en: "Guadalajara, Jalisco, Mexico",
      es: "Guadalajara, Jalisco, M\u00e9xico",
    },
    destinations: [
      {
        en: "Guadalajara",
        es: "Guadalajara",
      },
      {
        en: "Tequila",
        es: "Tequila",
      },
      {
        en: "Tlaquepaque",
        es: "Tlaquepaque",
      },
      {
        en: "Chapala",
        es: "Chapala",
      },
      {
        en: "Ajijic",
        es: "Ajijic",
      },
    ],
    gallery: [
      "/media/gallery/guadalajara-teatro-degollado.webp",
      "/media/gallery/tequila-church-plaza.webp",
      "/media/gallery/tequila-agave-landscape.webp",
    ],
    airport: "GDL",
    experienceType: {
      en: "Culture, Traditions & Gastronomy",
      es: "Cultura, tradiciones y gastronom\u00eda.",
    },
    perfectFor: {
      en: "Couples, cultural travelers, friends and small groups.",
      es: "Parejas, viajeros culturales, amigos y grupos peque\u00f1os.",
    },
    accommodation: {
      en: "6 nights at a selected hotel in Guadalajara. Hotel to be confirmed.",
      es: "6 noches en un hotel seleccionado en Guadalajara. Hotel por confirmar.",
    },
    mealPlan: {
      en: "According to the contracted hotel rate and experiences; breakfast must be confirmed in the quotation.",
      es: "Seg\u00fan la tarifa hotelera y las experiencias contratadas; los desayunos deben confirmarse en la cotizaci\u00f3n.",
    },
    transport: {
      en: "Round-trip shared airport transfers and scheduled excursions.",
      es: "Traslados compartidos redondos al aeropuerto y excursiones programadas.",
    },
    doubleOccupancy: {
      en: "Per-person pricing assumes double occupancy. Final price subject to quotation.",
      es: "Los precios por persona consideran ocupaci\u00f3n doble. Precio final sujeto a cotizaci\u00f3n.",
    },
    days: 7,
    nights: 6,
    homeDescription: {
      en: "Discover the heart of Mexican traditions. Explore Guadalajara's historic architecture, picturesque towns, authentic cuisine and the famous agave landscapes of Tequila.",
      es: "Descubre Guadalajara, las tradiciones mexicanas, los paisajes agaveros de Tequila, la gastronom\u00eda local y los pueblos con encanto de Jalisco.",
    },
    highlights: [
      {
        en: "6 nights in Guadalajara.",
        es: "6 noches en Guadalajara.",
      },
      {
        en: "Historic Guadalajara city tour.",
        es: "Recorrido por el Centro Hist\u00f3rico.",
      },
      {
        en: "Tequila distillery experience.",
        es: "Visita a Tequila y una destiler\u00eda.",
      },
      {
        en: "Tlaquepaque cultural visit.",
        es: "Paseo por Tlaquepaque.",
      },
      {
        en: "Chapala and Ajijic excursion.",
        es: "Excursi\u00f3n a Chapala y Ajijic.",
      },
      {
        en: "Local culinary experience.",
        es: "Experiencia gastron\u00f3mica.",
      },
    ],
    headline: {
      en: "Experience the Authentic Spirit of Mexico",
      es: "Descubre la esencia de las tradiciones mexicanas",
    },
    intro: [
      {
        en: "Discover Jalisco, a region full of traditions, unforgettable flavors, beautiful architecture and iconic landscapes.",
        es: "Conoce Jalisco, una regi\u00f3n llena de historia, tradiciones, sabores inolvidables, hermosa arquitectura y paisajes \u00fanicos y emblem\u00e1ticos.",
      },
      {
        en: "Walk through the historic streets of Guadalajara, explore the famous agave fields surrounding Tequila, discover local artisans in Tlaquepaque and enjoy the lakeside scenery of Chapala and Ajijic.",
        es: "Recorre las calles hist\u00f3ricas de Guadalajara, explora los famosos campos de agave que rodean Tequila y descubre su proceso de elaboraci\u00f3n, conoce a los artesanos locales de Tlaquepaque y disfruta de los pueblos y paisajes junto al lago de Chapala y Ajijic.",
      },
      {
        en: "This seven-day experience combines guided cultural activities with time to explore at your own pace.",
        es: "Una experiencia de siete d\u00edas que combina actividades culturales guiadas, gastronom\u00eda y tiempo libre para explorar a tu propio ritmo.",
      },
    ],
    itinerary: [
      {
        title: {
          en: "Welcome to Guadalajara",
          es: "Bienvenido a Guadalajara",
        },
        description: {
          en: "Arrival at Guadalajara International Airport (GDL).",
          es: "Llegada al Aeropuerto Internacional de Guadalajara, traslado al hotel, check-in y tiempo libre.",
        },
        activities: {
          en: [
            "Arrival at Guadalajara International Airport (GDL).",
            "Meet your transportation provider.",
            "Transfer to your hotel.",
            "Hotel check-in.",
            "Free afternoon or evening.",
            "Overnight in Guadalajara.",
          ],
          es: [
            "Llegada al Aeropuerto Internacional de Guadalajara (GDL).",
            "Encuentro con el proveedor de transporte.",
            "Traslado a tu hotel.",
            "Registro en el hotel.",
            "Tarde o noche libre.",
            "Noche de hospedaje en Guadalajara.",
          ],
        },
        optional: false,
      },
      {
        photo: "/media/guadalajara.webp",
        title: {
          en: "Discover Historic Guadalajara",
          es: "Guadalajara hist\u00f3rica",
        },
        description: {
          en: "Breakfast at your hotel if included in the confirmed hotel rate.",
          es: "Desayuno, si est\u00e1 incluido en la tarifa contratada. Recorrido guiado por el Centro Hist\u00f3rico, la Catedral y plazas representativas. Tiempo libre por la tarde.",
        },
        activities: {
          en: [
            "Breakfast at your hotel if included in the confirmed hotel rate.",
            "Guided sightseeing experience in Guadalajara's historic center.",
            "Discover the surroundings of Guadalajara Cathedral.",
            "Explore significant historic squares and cultural landmarks.",
            "Time for lunch at your leisure.",
            "Afternoon free for independent exploration.",
            "Overnight in Guadalajara.",
          ],
          es: [
            "Desayuno en tu hotel si est\u00e1 incluido en la tarifa hotelera confirmada.",
            "Recorrido guiado por el Centro Hist\u00f3rico de Guadalajara.",
            "Descubre los alrededores de la Catedral de Guadalajara.",
            "Explora plazas hist\u00f3ricas y lugares culturales representativos.",
            "Tiempo libre para comer por tu cuenta.",
            "Tarde libre para explorar de manera independiente.",
            "Noche de hospedaje en Guadalajara.",
          ],
        },
        optional: false,
      },
      {
        photo: "/media/gallery/tequila-agave-landscape.webp",
        title: {
          en: "Tequila & the Agave Landscape",
          es: "Tequila y los paisajes agaveros",
        },
        description: {
          en: "Breakfast at your hotel if included.",
          es: "Excursi\u00f3n a Tequila. Recorrido por la regi\u00f3n agavera, visita guiada a una destiler\u00eda y explicaci\u00f3n del proceso de elaboraci\u00f3n de tequila. Degustaci\u00f3n para hu\u00e9spedes con edad legal, cuando est\u00e9 contemplada por el proveedor. Regreso a Guadalajara.",
        },
        activities: {
          en: [
            "Breakfast at your hotel if included.",
            "Scheduled departure for the town of Tequila.",
            "Discover Jalisco's blue-agave-growing landscape.",
            "Guided visit to a tequila distillery.",
            "Learn about the history and production of tequila.",
            "Optional tasting for guests of legal drinking age, when offered by the selected provider.",
            "Free time to explore the town of Tequila.",
            "Return to Guadalajara.",
            "Overnight in Guadalajara.",
          ],
          es: [
            "Desayuno en tu hotel si est\u00e1 incluido.",
            "Salida programada hacia el pueblo de Tequila.",
            "Descubre los paisajes de cultivo de agave azul de Jalisco.",
            "Visita guiada a una destiler\u00eda de tequila.",
            "Conoce la historia y el proceso de elaboraci\u00f3n del tequila.",
            "Degustaci\u00f3n opcional para hu\u00e9spedes con edad legal para consumir alcohol, cuando la ofrezca el proveedor seleccionado.",
            "Tiempo libre para explorar el pueblo de Tequila.",
            "Regreso a Guadalajara.",
            "Noche de hospedaje en Guadalajara.",
          ],
        },
        optional: false,
      },
      {
        title: {
          en: "Tlaquepaque: Art, Colors & Traditions",
          es: "Tlaquepaque, arte y tradiciones",
        },
        description: {
          en: "Breakfast at your hotel if included.",
          es: "Visita a Tlaquepaque para conocer sus calles, talleres, galer\u00edas, artesan\u00edas y gastronom\u00eda. Regreso al hotel.",
        },
        activities: {
          en: [
            "Breakfast at your hotel if included.",
            "Guided or hosted visit to Tlaquepaque.",
            "Explore traditional streets and artisan shops.",
            "Discover galleries, handicrafts and local culture.",
            "Free time for shopping and local cuisine.",
            "Return to your hotel.",
            "Overnight in Guadalajara.",
          ],
          es: [
            "Desayuno en tu hotel si est\u00e1 incluido.",
            "Visita guiada o acompa\u00f1ada a Tlaquepaque.",
            "Explora sus calles tradicionales y tiendas de artesan\u00edas.",
            "Descubre galer\u00edas, artesan\u00edas y cultura local.",
            "Tiempo libre para compras y gastronom\u00eda local.",
            "Regreso a tu hotel.",
            "Noche de hospedaje en Guadalajara.",
          ],
        },
        optional: false,
      },
      {
        title: {
          en: "Lake Chapala & Ajijic",
          es: "Chapala y Ajijic",
        },
        description: {
          en: "Breakfast at your hotel if included.",
          es: "Excursi\u00f3n al lago de Chapala, paseo por su malec\u00f3n y visita al pueblo de Ajijic. Tiempo libre para recorrer sus calles y disfrutar del ambiente local.",
        },
        activities: {
          en: [
            "Breakfast at your hotel if included.",
            "Excursion to Lake Chapala.",
            "Walk along the lakeside promenade.",
            "Continue to Ajijic, a charming town known for its colorful streets and artistic atmosphere.",
            "Free time to explore, take photographs and enjoy local food.",
            "Return to Guadalajara.",
            "Overnight in Guadalajara.",
          ],
          es: [
            "Desayuno en tu hotel si est\u00e1 incluido.",
            "Excursi\u00f3n al lago de Chapala.",
            "Paseo por el malec\u00f3n junto al lago.",
            "Continuaci\u00f3n hacia Ajijic, un pueblo con encanto conocido por sus calles coloridas y su ambiente art\u00edstico.",
            "Tiempo libre para explorar, tomar fotograf\u00edas y disfrutar la comida local.",
            "Regreso a Guadalajara.",
            "Noche de hospedaje en Guadalajara.",
          ],
        },
        optional: false,
      },
      {
        title: {
          en: "Taste the Flavors of Jalisco",
          es: "Sabores de Jalisco",
        },
        description: {
          en: "Breakfast at your hotel if included.",
          es: "Experiencia gastron\u00f3mica local por definir con el proveedor, seguida de tiempo libre para compras, descanso o actividades adicionales.",
        },
        activities: {
          en: [
            "Breakfast at your hotel if included.",
            "Participate in a prearranged local culinary experience, such as a guided tasting or traditional food-focused visit.",
            "The specific activity will be confirmed in the final quotation.",
            "Afternoon free for additional sightseeing, shopping or relaxation.",
            "Optional premium cultural activities.",
            "Overnight in Guadalajara.",
          ],
          es: [
            "Desayuno en tu hotel si est\u00e1 incluido.",
            "Participa en una experiencia gastron\u00f3mica local programada, como una degustaci\u00f3n guiada o una visita enfocada en la comida tradicional.",
            "La actividad espec\u00edfica se confirmar\u00e1 en la cotizaci\u00f3n final.",
            "Tarde libre para recorridos adicionales, compras o descanso.",
            "Actividades culturales premium opcionales.",
            "Noche de hospedaje en Guadalajara.",
          ],
        },
        optional: false,
      },
      {
        title: {
          en: "Farewell, Jalisco",
          es: "Hasta pronto, Jalisco",
        },
        description: {
          en: "Breakfast according to the confirmed accommodation plan and departure time.",
          es: "Check-out y traslado programado al Aeropuerto Internacional de Guadalajara.",
        },
        activities: {
          en: [
            "Breakfast according to the confirmed accommodation plan and departure time.",
            "Hotel check-out.",
            "Prearranged transfer to Guadalajara International Airport.",
            "End of services.",
          ],
          es: [
            "Desayuno de acuerdo con el plan de hospedaje confirmado y la hora de salida.",
            "Check-out del hotel.",
            "Traslado programado al Aeropuerto Internacional de Guadalajara.",
            "Fin de los servicios.",
          ],
        },
        optional: false,
      },
    ],
    inclusions: {
      en: [
        "6 nights at a selected hotel in Guadalajara.",
        "Round-trip shared airport transfers.",
        "Guided Guadalajara historical sightseeing tour.",
        "Scheduled excursion to Tequila.",
        "Distillery visit with a local provider.",
        "Guided or hosted cultural visit to Tlaquepaque.",
        "Chapala and Ajijic excursion.",
        "One local culinary experience, with exact inclusions to be confirmed.",
        "Coordination of scheduled activities.",
        "Bilingual travel assistance.",
      ],
      es: [
        "6 noches en un hotel seleccionado en Guadalajara.",
        "Traslados compartidos redondos al aeropuerto.",
        "Recorrido hist\u00f3rico guiado por Guadalajara.",
        "Excursi\u00f3n programada a Tequila.",
        "Visita a una destiler\u00eda con un proveedor local.",
        "Visita cultural guiada o acompa\u00f1ada a Tlaquepaque.",
        "Excursi\u00f3n a Chapala y Ajijic.",
        "Una experiencia gastron\u00f3mica local, con los servicios exactos incluidos por confirmar.",
        "Coordinaci\u00f3n de las actividades programadas.",
        "Asistencia biling\u00fce durante el viaje.",
      ],
    },
    exclusions: {
      en: [
        "International or domestic flights.",
        "Meals and beverages not specified in the final quotation.",
        "Additional admission tickets or premium experiences not expressly listed.",
        "Tequila tourist train tickets.",
        "Personal purchases, gratuities and optional activities.",
        "Travel insurance unless added.",
        "Local fees not expressly included.",
      ],
      es: [
        "Vuelos internacionales o nacionales.",
        "Alimentos y bebidas no especificados en la cotizaci\u00f3n final.",
        "Entradas adicionales o experiencias premium no enumeradas expresamente.",
        "Boletos del tren tur\u00edstico a Tequila.",
        "Compras personales, propinas y actividades opcionales.",
        "Seguro de viaje, salvo contrataci\u00f3n adicional.",
        "Cargos locales no incluidos expresamente.",
      ],
    },
    hotels: [
      {
        id: "comfort",
        name: "Comfort",
        description: {
          en: "Comfortable, centrally located accommodations suitable for exploring Guadalajara.",
          es: "Hospedaje c\u00f3modo y c\u00e9ntrico, adecuado para explorar Guadalajara.",
        },
        features: [
          {
            en: "Comfortable accommodation (according to the selected hotel; to be confirmed).",
            es: "Hospedaje c\u00f3modo (seg\u00fan el hotel seleccionado; por confirmar).",
          },
          {
            en: "Central location (according to the selected hotel; to be confirmed).",
            es: "Ubicaci\u00f3n c\u00e9ntrica (seg\u00fan el hotel seleccionado; por confirmar).",
          },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        description: {
          en: "Upscale hotels with enhanced amenities and convenient locations.",
          es: "Hoteles de categor\u00eda superior con mejores instalaciones y servicios, y ubicaciones convenientes.",
        },
        features: [
          {
            en: "Enhanced amenities (according to the selected hotel; to be confirmed).",
            es: "Mejores instalaciones y servicios (seg\u00fan el hotel seleccionado; por confirmar).",
          },
          {
            en: "Convenient locations (according to the selected hotel; to be confirmed).",
            es: "Ubicaciones convenientes (seg\u00fan el hotel seleccionado; por confirmar).",
          },
        ],
      },
      {
        id: "luxury",
        name: "Luxury",
        description: {
          en: "High-end accommodations, boutique properties or premium hotel experiences.",
          es: "Hospedaje de alta gama, propiedades boutique o experiencias hoteleras premium.",
        },
        features: [
          {
            en: "High-end accommodation, boutique properties or premium hotel experiences (according to the selected hotel; to be confirmed).",
            es: "Hospedaje de alta gama, propiedades boutique o experiencias hoteleras premium (seg\u00fan el hotel seleccionado; por confirmar).",
          },
        ],
      },
    ],
    hotelNote: {
      en: "Hotel names, room categories and amenities will be confirmed in your personalized proposal.",
      es: "Los nombres de los hoteles, las categor\u00edas de habitaci\u00f3n y los servicios se confirmar\u00e1n en tu propuesta personalizada.",
    },
    upgrades: {
      en: [
        "Private transportation and guides.",
        "Premium distillery experiences.",
        "Tequila tourist train options, when operating and available.",
        "Traditional Mexican cooking experiences.",
        "Boutique hotel upgrades.",
        "Special cultural or gastronomic events.",
        "Additional nights in Guadalajara or other Mexican destinations.",
      ],
      es: [
        "Transporte y gu\u00edas privados.",
        "Experiencias premium en destiler\u00edas.",
        "Opciones del tren tur\u00edstico a Tequila, cuando est\u00e9 en operaci\u00f3n y disponible.",
        "Experiencias de cocina tradicional mexicana.",
        "Mejoras a hoteles boutique.",
        "Eventos culturales o gastron\u00f3micos especiales.",
        "Noches adicionales en Guadalajara u otros destinos de M\u00e9xico.",
      ],
    },
    upgradesNote: {
      en: "Ask us about optional upgrades. They can be quoted separately according to operating dates and availability.",
      es: "Consulta las mejoras opcionales. Se pueden cotizar por separado seg\u00fan las fechas de operaci\u00f3n y la disponibilidad.",
    },
    faq: [
      {
        q: {
          en: "Does the package include a visit to Tequila?",
          es: "\u00bfEl paquete incluye una visita a Tequila?",
        },
        a: {
          en: "Yes. A scheduled day excursion to Tequila with a distillery visit is part of the planned package.",
          es: "S\u00ed. Una excursi\u00f3n programada de un d\u00eda a Tequila con visita a una destiler\u00eda forma parte del paquete propuesto.",
        },
      },
      {
        q: {
          en: "Is the tequila train included?",
          es: "\u00bfEl tren a Tequila est\u00e1 incluido?",
        },
        a: {
          en: "No. Train experiences can be quoted separately according to operating dates and availability.",
          es: "No. Las experiencias en tren se pueden cotizar por separado de acuerdo con las fechas de operaci\u00f3n y la disponibilidad.",
        },
      },
      {
        q: {
          en: "Do I need to drink alcohol to enjoy Tequila?",
          es: "\u00bfEs necesario beber alcohol para disfrutar Tequila?",
        },
        a: {
          en: "No. Guests can enjoy the scenery, history and cultural activities without consuming alcohol.",
          es: "No. Los viajeros pueden disfrutar los paisajes, la historia y las actividades culturales sin consumir alcohol.",
        },
      },
      {
        q: {
          en: "Where will we stay?",
          es: "\u00bfD\u00f3nde nos hospedaremos?",
        },
        a: {
          en: "The base itinerary includes six nights in Guadalajara. Day trips depart from the city.",
          es: "El itinerario base incluye seis noches en Guadalajara. Las excursiones de un d\u00eda salen desde la ciudad.",
        },
      },
      {
        q: {
          en: "Are tours private?",
          es: "\u00bfLos recorridos son privados?",
        },
        a: {
          en: "The base quotation assumes scheduled shared experiences. Private services can be quoted upon request.",
          es: "La cotizaci\u00f3n base contempla experiencias compartidas programadas. Los servicios privados pueden cotizarse a solicitud.",
        },
      },
      {
        q: {
          en: "Are breakfasts included?",
          es: "\u00bfLos desayunos est\u00e1n incluidos?",
        },
        a: {
          en: "Breakfast inclusion depends on the selected hotel rate and will be confirmed in the quotation.",
          es: "La inclusi\u00f3n del desayuno depende de la tarifa del hotel seleccionado y se confirmar\u00e1 en la cotizaci\u00f3n.",
        },
      },
      {
        q: {
          en: "Can I extend my stay?",
          es: "\u00bfPuedo extender mi estancia?",
        },
        a: {
          en: "Yes. We can customize your dates and add nights or destinations.",
          es: "S\u00ed. Podemos personalizar tus fechas y agregar noches o destinos.",
        },
      },
      {
        q: {
          en: "What is the cancellation policy?",
          es: "\u00bfCu\u00e1l es la pol\u00edtica de cancelaci\u00f3n?",
        },
        a: {
          en: "Specific conditions will be provided before booking and depend on the contracted services.",
          es: "Las condiciones espec\u00edficas se proporcionar\u00e1n antes de reservar y dependen de los servicios contratados. Se entregan antes del pago.",
        },
      },
    ],
    finalTitle: {
      en: "Ready to Discover Jalisco?",
      es: "Descubre Jalisco con nosotros",
    },
    finalDescription: [
      {
        en: "Experience the culture, beauty and traditions of one of Mexico's most iconic regions.",
        es: "Vive la cultura, la belleza y las tradiciones de una de las regiones m\u00e1s emblem\u00e1ticas de M\u00e9xico.",
      },
      {
        en: "Tell us your dates, number of travelers and preferences. Our team will prepare your personalized proposal.",
        es: "Ind\u00edcanos fechas, n\u00famero de viajeros y preferencias para preparar una propuesta personalizada.",
      },
    ],
    importantInfo: {
      en: [
        "Per-person pricing assumes double occupancy. International flights are not included.",
        "Hotels for six nights and different travel seasons remain to be selected and quoted.",
        "Transfer prices and capacity for each group require confirmation.",
        "Operators, guide languages, departures, admissions and included experiences require confirmation.",
        "Final prices require commercial validation. Deposits, changes, cancellations and refunds remain to be defined.",
        "Age restrictions, accessibility and provider-specific conditions require validation.",
        "The base itinerary uses Guadalajara for all six nights; scheduled day trips depart from the city.",
        "The base quotation assumes scheduled shared services. Private transportation and guides may be quoted separately.",
        "Breakfast depends on the selected hotel rate and will be confirmed in the quotation; departure-day breakfast also depends on the departure time.",
        "A tasting is optional, only for guests of legal drinking age and only when offered by the selected provider. Alcohol consumption is not required.",
        "The Tequila tourist train is not included. Train options are quoted separately according to operating dates and availability.",
        "The exact local culinary activity and its inclusions will be confirmed in the final quotation.",
        "Specific cancellation conditions depend on the contracted services and will be provided before booking and payment.",
      ],
      es: [
        "Los precios por persona consideran ocupaci\u00f3n doble. No incluyen vuelos internacionales.",
        "Los hoteles para seis noches y distintas temporadas est\u00e1n pendientes de selecci\u00f3n y cotizaci\u00f3n.",
        "Los precios de los traslados y la capacidad por grupo requieren confirmaci\u00f3n.",
        "Los operadores, los idiomas de los gu\u00edas, las salidas, las entradas y las experiencias incluidas requieren confirmaci\u00f3n.",
        "Los precios finales requieren validaci\u00f3n comercial. Los anticipos, cambios, cancelaciones y reembolsos est\u00e1n pendientes de definici\u00f3n.",
        "Las restricciones de edad, la accesibilidad y las condiciones espec\u00edficas de los proveedores requieren validaci\u00f3n.",
        "El itinerario base contempla las seis noches en Guadalajara; las excursiones programadas de un d\u00eda salen desde la ciudad.",
        "La cotizaci\u00f3n base contempla servicios compartidos programados. El transporte y los gu\u00edas privados pueden cotizarse por separado.",
        "El desayuno depende de la tarifa hotelera seleccionada y se confirmar\u00e1 en la cotizaci\u00f3n; el desayuno del d\u00eda de salida tambi\u00e9n depende del horario de partida.",
        "La degustaci\u00f3n es opcional, \u00fanicamente para hu\u00e9spedes con edad legal para consumir alcohol y cuando la ofrezca el proveedor seleccionado. No es necesario consumir alcohol.",
        "El tren tur\u00edstico a Tequila no est\u00e1 incluido. Las opciones de tren se cotizan por separado seg\u00fan sus fechas de operaci\u00f3n y disponibilidad.",
        "La actividad gastron\u00f3mica local exacta y sus servicios incluidos se confirmar\u00e1n en la cotizaci\u00f3n final.",
        "Las condiciones espec\u00edficas de cancelaci\u00f3n dependen de los servicios contratados y se entregar\u00e1n antes de reservar y pagar.",
      ],
    },
    whatsappMessage: {
      en: "Hello! I'm interested in the Guadalajara & Tequila Experience, 7 days / 6 nights. Could you help me plan my trip?",
      es: "\u00a1Hola! Me interesa Guadalajara & Tequila Experience, de 7 d\u00edas / 6 noches. \u00bfPodr\u00edan ayudarme a planear mi viaje?",
    },
    seo: {
      title: {
        en: "Guadalajara & Tequila Tour Package \u2014 7 Days",
        es: "Guadalajara y Tequila \u2014 Viaje de 7 D\u00edas",
      },
      description: {
        en: "Discover Guadalajara, Tequila, Tlaquepaque, Chapala and Ajijic on a 7-day cultural journey through Jalisco, Mexico.",
        es: "Conoce Guadalajara, Tequila, Tlaquepaque, Chapala y Ajijic en un viaje de 7 d\u00edas lleno de cultura, gastronom\u00eda y tradiciones.",
      },
    },
    commercialNotice: {
      en: "This is a planned package offered by personalized quotation only, not a confirmed booking. Pricing is unverified. Hotels, services, providers, guide languages, departures, admissions and included experiences have not yet been confirmed and require commercial validation. The final proposal must confirm the contracted services and applicable conditions before booking.",
      es: "Este es un paquete propuesto disponible \u00fanicamente mediante cotizaci\u00f3n personalizada, no una reservaci\u00f3n confirmada. Los precios no est\u00e1n verificados. Los hoteles, servicios, proveedores, idiomas de los gu\u00edas, salidas, entradas y experiencias incluidas a\u00fan no est\u00e1n confirmados y requieren validaci\u00f3n comercial. La propuesta final deber\u00e1 confirmar los servicios contratados y las condiciones aplicables antes de reservar.",
    },
    publicationStatus: "quote-only",
    price: {
      verified: false,
      confirmedUsd: null,
      validUntil: null,
    },
    quoteEnabled: true,
  },
  {
    ...tourIdentities[2],
    destination: {
      en: "Mexico City, Mexico",
      es: "Ciudad de M\u00e9xico, M\u00e9xico",
    },
    destinations: [
      {
        en: "Mexico City",
        es: "Ciudad de M\u00e9xico",
      },
      {
        en: "Teotihuacan",
        es: "Teotihuac\u00e1n",
      },
    ],
    gallery: [
      "/media/gallery/mexico-city-chapultepec.webp",
      "/media/gallery/mexico-city-zocalo.webp",
    ],
    airport: "MEX",
    experienceType: {
      en: "History, Culture & Gastronomy",
      es: "Historia, cultura y gastronom\u00eda.",
    },
    perfectFor: {
      en: "First-time visitors, couples, cultural travelers and small groups.",
      es: "Personas que visitan M\u00e9xico por primera vez, parejas, amantes de la cultura y grupos peque\u00f1os.",
    },
    accommodation: {
      en: "6 nights at a selected hotel in Mexico City. Hotel to be confirmed.",
      es: "6 noches en un hotel seleccionado en Ciudad de M\u00e9xico. Hotel por confirmar.",
    },
    mealPlan: {
      en: "According to the contracted hotel plan; only meals expressly confirmed in the final quotation and the scheduled culinary experience.",
      es: "Seg\u00fan el plan del hotel contratado; \u00fanicamente los alimentos expresamente confirmados en la cotizaci\u00f3n final y la experiencia gastron\u00f3mica programada.",
    },
    transport: {
      en: "Round-trip shared airport transfers and scheduled excursions.",
      es: "Traslados compartidos redondos al aeropuerto y excursiones programadas.",
    },
    doubleOccupancy: {
      en: "Per-person pricing assumes double occupancy. Final price subject to quotation.",
      es: "Los precios por persona consideran ocupaci\u00f3n doble. Precio final sujeto a cotizaci\u00f3n.",
    },
    days: 7,
    nights: 6,
    homeDescription: {
      en: "Explore Mexico's fascinating capital, where ancient civilizations, historic landmarks, vibrant neighborhoods and exceptional gastronomy come together.",
      es: "Descubre una capital llena de historia, pir\u00e1mides, museos, barrios tradicionales y sabores \u00fanicos.",
    },
    highlights: [
      {
        en: "6 nights in Mexico City.",
        es: "6 noches en Ciudad de M\u00e9xico.",
      },
      {
        en: "Historic Center guided tour.",
        es: "City tour por el Centro Hist\u00f3rico.",
      },
      {
        en: "Teotihuacan archaeological excursion.",
        es: "Visita a Teotihuac\u00e1n.",
      },
      {
        en: "Chapultepec cultural experience.",
        es: "Experiencia cultural en Chapultepec.",
      },
      {
        en: "Coyoacan and Xochimilco.",
        es: "Recorrido por Coyoac\u00e1n y Xochimilco.",
      },
      {
        en: "Local culinary experience.",
        es: "Experiencia gastron\u00f3mica local.",
      },
    ],
    headline: {
      en: "Discover the Heart of Mexico",
      es: "Descubre el coraz\u00f3n de M\u00e9xico",
    },
    intro: [
      {
        en: "Mexico City is a fascinating destination where ancient history, beautiful architecture, colorful neighborhoods, art and gastronomy meet.",
        es: "Ciudad de M\u00e9xico es un destino fascinante donde conviven la historia antigua, la hermosa arquitectura, el arte, la gastronom\u00eda y los barrios coloridos y llenos de vida.",
      },
      {
        en: "Experience seven days and six nights exploring the capital's most iconic landmarks and cultural treasures, from the ancient pyramids of Teotihuacan to the canals of Xochimilco.",
        es: "Durante siete d\u00edas y seis noches conocer\u00e1s algunos de los lugares m\u00e1s representativos y los tesoros culturales de la capital, desde las antiguas pir\u00e1mides de Teotihuac\u00e1n hasta los canales de Xochimilco.",
      },
      {
        en: "Enjoy guided experiences, carefully coordinated activities and enough free time to discover the city at your own pace.",
        es: "Disfruta experiencias guiadas, actividades cuidadosamente coordinadas y suficiente tiempo libre para descubrir la ciudad a tu propio ritmo.",
      },
    ],
    itinerary: [
      {
        title: {
          en: "Welcome to Mexico City",
          es: "Bienvenido a Ciudad de M\u00e9xico",
        },
        description: {
          en: "Arrival at Mexico City International Airport (MEX).",
          es: "Llegada al Aeropuerto Internacional de Ciudad de M\u00e9xico, recepci\u00f3n, traslado al hotel y tiempo libre para descansar o explorar los alrededores.",
        },
        activities: {
          en: [
            "Arrival at Mexico City International Airport (MEX).",
            "Meet your transportation provider.",
            "Transfer to your selected hotel.",
            "Check-in.",
            "Free time to rest or explore the surrounding neighborhood.",
            "Overnight in Mexico City.",
          ],
          es: [
            "Llegada al Aeropuerto Internacional de Ciudad de M\u00e9xico (MEX).",
            "Encuentro con el proveedor de transporte.",
            "Traslado al hotel seleccionado.",
            "Check-in.",
            "Tiempo libre para descansar o explorar el barrio de los alrededores.",
            "Noche de hospedaje en Ciudad de M\u00e9xico.",
          ],
        },
        optional: false,
      },
      {
        photo: "/media/gallery/mexico-city-zocalo.webp",
        title: {
          en: "Discover the Historic Center",
          es: "Centro Hist\u00f3rico",
        },
        description: {
          en: "Breakfast if included in your selected hotel plan.",
          es: "Recorrido guiado por el Centro Hist\u00f3rico, Z\u00f3calo, alrededores de la Catedral Metropolitana y Palacio de Bellas Artes. Tiempo libre para comer y explorar.",
        },
        activities: {
          en: [
            "Breakfast if included in your selected hotel plan.",
            "Guided tour of Mexico City's historic center.",
            "Discover the Zocalo and surrounding landmarks.",
            "View the Metropolitan Cathedral and learn about the area's history.",
            "Discover the surroundings of Palacio de Bellas Artes.",
            "Time for lunch and independent exploration.",
            "Overnight in Mexico City.",
          ],
          es: [
            "Desayuno si est\u00e1 incluido en el plan del hotel seleccionado.",
            "Recorrido guiado por el Centro Hist\u00f3rico de Ciudad de M\u00e9xico.",
            "Descubre el Z\u00f3calo y los lugares emblem\u00e1ticos de sus alrededores.",
            "Contempla la Catedral Metropolitana y conoce la historia de la zona.",
            "Descubre los alrededores del Palacio de Bellas Artes.",
            "Tiempo libre para comer y explorar de manera independiente.",
            "Noche de hospedaje en Ciudad de M\u00e9xico.",
          ],
        },
        optional: false,
      },
      {
        title: {
          en: "Teotihuacan: Ancient Wonders",
          es: "Pir\u00e1mides de Teotihuac\u00e1n",
        },
        description: {
          en: "Breakfast if included.",
          es: "Excursi\u00f3n guiada a la zona arqueol\u00f3gica de Teotihuac\u00e1n. Visita a sus principales monumentos y explicaci\u00f3n hist\u00f3rica. Regreso a CDMX.",
        },
        activities: {
          en: [
            "Breakfast if included.",
            "Scheduled guided excursion to Teotihuacan.",
            "Discover the fascinating history of the archaeological site.",
            "Explore monumental avenues and view its famous pyramids.",
            "Learn about the ancient civilization that shaped this region.",
            "Return to Mexico City.",
            "Free evening.",
          ],
          es: [
            "Desayuno si est\u00e1 incluido.",
            "Excursi\u00f3n guiada programada a Teotihuac\u00e1n.",
            "Descubre la fascinante historia de la zona arqueol\u00f3gica.",
            "Recorre sus avenidas monumentales y contempla sus famosas pir\u00e1mides.",
            "Conoce la antigua civilizaci\u00f3n que dio forma a esta regi\u00f3n.",
            "Regreso a Ciudad de M\u00e9xico.",
            "Noche libre.",
          ],
        },
        optional: false,
      },
      {
        photo: "/media/gallery/mexico-city-chapultepec.webp",
        title: {
          en: "Chapultepec, Art & History",
          es: "Chapultepec, arte e historia",
        },
        description: {
          en: "Breakfast if included.",
          es: "Visita cultural a Chapultepec y experiencia en un museo seleccionado. Tiempo libre por la tarde.",
        },
        activities: {
          en: [
            "Breakfast if included.",
            "Cultural excursion to Chapultepec.",
            "Enjoy a museum visit selected for your final itinerary.",
            "Explore the park and its surroundings.",
            "Free afternoon for shopping, food or independent activities.",
            "Overnight in Mexico City.",
          ],
          es: [
            "Desayuno si est\u00e1 incluido.",
            "Excursi\u00f3n cultural a Chapultepec.",
            "Disfruta una visita a un museo seleccionado para tu itinerario final.",
            "Explora el parque y sus alrededores.",
            "Tarde libre para compras, gastronom\u00eda o actividades independientes.",
            "Noche de hospedaje en Ciudad de M\u00e9xico.",
          ],
        },
        optional: false,
      },
      {
        title: {
          en: "Coyoacan & Xochimilco",
          es: "Coyoac\u00e1n y Xochimilco",
        },
        description: {
          en: "Breakfast if included.",
          es: "Recorrido por las calles de Coyoac\u00e1n y sus espacios tradicionales. Continuaci\u00f3n hacia Xochimilco para realizar un paseo programado en trajinera.",
        },
        activities: {
          en: [
            "Breakfast if included.",
            "Explore Coyoacan, a neighborhood known for its colorful streets, plazas and cultural heritage.",
            "Discover local markets and traditional surroundings.",
            "Continue to Xochimilco for a scheduled ride on a traditional colorful trajinera.",
            "Return to your hotel.",
            "Overnight in Mexico City.",
          ],
          es: [
            "Desayuno si est\u00e1 incluido.",
            "Explora Coyoac\u00e1n, un barrio conocido por sus calles coloridas, plazas y patrimonio cultural.",
            "Descubre los mercados locales y los espacios tradicionales.",
            "Continuaci\u00f3n hacia Xochimilco para un paseo programado en una trajinera tradicional y colorida.",
            "Regreso a tu hotel.",
            "Noche de hospedaje en Ciudad de M\u00e9xico.",
          ],
        },
        optional: false,
      },
      {
        title: {
          en: "The Flavors of Mexico City",
          es: "Sabores de Ciudad de M\u00e9xico",
        },
        description: {
          en: "Breakfast if included.",
          es: "Experiencia gastron\u00f3mica local por definir con el proveedor. Tarde libre para explorar museos, mercados, tiendas o barrios de la ciudad.",
        },
        activities: {
          en: [
            "Breakfast if included.",
            "Enjoy a prearranged culinary experience, such as a guided local food tasting or traditional food-focused visit.",
            "Exact activity will be confirmed in your final quotation.",
            "Afternoon free to explore more neighborhoods, museums or local shops.",
            "Overnight in Mexico City.",
          ],
          es: [
            "Desayuno si est\u00e1 incluido.",
            "Disfruta una experiencia gastron\u00f3mica programada, como una degustaci\u00f3n guiada de comida local o una visita enfocada en la gastronom\u00eda tradicional.",
            "La actividad exacta se confirmar\u00e1 en tu cotizaci\u00f3n final.",
            "Tarde libre para explorar m\u00e1s barrios, museos o tiendas locales.",
            "Noche de hospedaje en Ciudad de M\u00e9xico.",
          ],
        },
        optional: false,
      },
      {
        title: {
          en: "Departure",
          es: "Hasta pronto, M\u00e9xico",
        },
        description: {
          en: "Breakfast according to the hotel plan and departure time.",
          es: "Check-out y traslado programado al aeropuerto.",
        },
        activities: {
          en: [
            "Breakfast according to the hotel plan and departure time.",
            "Check-out.",
            "Prearranged transfer to Mexico City International Airport.",
            "End of services.",
          ],
          es: [
            "Desayuno de acuerdo con el plan del hotel y la hora de salida.",
            "Check-out.",
            "Traslado programado al Aeropuerto Internacional de Ciudad de M\u00e9xico.",
            "Fin de los servicios.",
          ],
        },
        optional: false,
      },
    ],
    inclusions: {
      en: [
        "6 nights at a selected hotel in Mexico City.",
        "Round-trip shared airport transfers.",
        "Guided Historic Center sightseeing tour.",
        "Scheduled guided excursion to Teotihuacan.",
        "Chapultepec cultural excursion with a selected museum experience.",
        "Coyoacan and Xochimilco excursion, including a scheduled trajinera ride.",
        "One local culinary experience, with exact inclusions to be confirmed.",
        "Coordination of scheduled experiences.",
        "Bilingual travel assistance.",
      ],
      es: [
        "6 noches en un hotel seleccionado en Ciudad de M\u00e9xico.",
        "Traslados compartidos redondos al aeropuerto.",
        "Recorrido guiado por el Centro Hist\u00f3rico.",
        "Excursi\u00f3n guiada programada a Teotihuac\u00e1n.",
        "Excursi\u00f3n cultural a Chapultepec con una experiencia en un museo seleccionado.",
        "Excursi\u00f3n a Coyoac\u00e1n y Xochimilco, incluido un paseo programado en trajinera.",
        "Una experiencia gastron\u00f3mica local, con los servicios exactos incluidos por confirmar.",
        "Coordinaci\u00f3n de las experiencias programadas.",
        "Asistencia biling\u00fce durante el viaje.",
      ],
    },
    exclusions: {
      en: [
        "International or domestic flights.",
        "Meals and drinks not expressly specified in the quotation.",
        "Admission fees not specifically included in the final service list.",
        "Additional museums, exhibitions and optional activities.",
        "Personal purchases, gratuities and local fees not expressly included.",
        "Travel insurance unless added.",
      ],
      es: [
        "Vuelos internacionales o nacionales.",
        "Alimentos y bebidas no especificados expresamente en la cotizaci\u00f3n.",
        "Entradas no incluidas espec\u00edficamente en la lista final de servicios.",
        "Museos adicionales, exhibiciones y actividades opcionales.",
        "Compras personales, propinas y cargos locales no incluidos expresamente.",
        "Seguro de viaje, salvo contrataci\u00f3n adicional.",
      ],
    },
    hotels: [
      {
        id: "comfort",
        name: "Comfort",
        description: {
          en: "Comfortable accommodation with convenient access to tourist areas and transportation.",
          es: "Hospedaje c\u00f3modo con acceso conveniente a zonas tur\u00edsticas y transporte.",
        },
        features: [
          {
            en: "Comfortable accommodation (according to the selected hotel; to be confirmed).",
            es: "Hospedaje c\u00f3modo (seg\u00fan el hotel seleccionado; por confirmar).",
          },
          {
            en: "Convenient access to tourist areas and transportation (according to the selected hotel; to be confirmed).",
            es: "Acceso conveniente a zonas tur\u00edsticas y transporte (seg\u00fan el hotel seleccionado; por confirmar).",
          },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        description: {
          en: "Upscale hotels in desirable locations with enhanced amenities.",
          es: "Hoteles de categor\u00eda superior en ubicaciones atractivas con mejores instalaciones y servicios.",
        },
        features: [
          {
            en: "Desirable locations (according to the selected hotel; to be confirmed).",
            es: "Ubicaciones atractivas (seg\u00fan el hotel seleccionado; por confirmar).",
          },
          {
            en: "Enhanced amenities (according to the selected hotel; to be confirmed).",
            es: "Mejores instalaciones y servicios (seg\u00fan el hotel seleccionado; por confirmar).",
          },
        ],
      },
      {
        id: "luxury",
        name: "Luxury",
        description: {
          en: "High-end hotels or premium boutique accommodation with elevated services.",
          es: "Hoteles de alta gama u hospedaje boutique premium con servicios de nivel superior.",
        },
        features: [
          {
            en: "High-end hotels or premium boutique accommodation (according to the selected hotel; to be confirmed).",
            es: "Hoteles de alta gama u hospedaje boutique premium (seg\u00fan el hotel seleccionado; por confirmar).",
          },
          {
            en: "Elevated services (according to the selected hotel; to be confirmed).",
            es: "Servicios de nivel superior (seg\u00fan el hotel seleccionado; por confirmar).",
          },
        ],
      },
    ],
    hotelNote: {
      en: "Hotel names, room categories and amenities will be confirmed in your personalized proposal.",
      es: "Los nombres de los hoteles, las categor\u00edas de habitaci\u00f3n y los servicios se confirmar\u00e1n en tu propuesta personalizada.",
    },
    upgrades: {
      en: [
        "Private guided tours.",
        "Private airport transportation.",
        "Additional museum experiences.",
        "Premium culinary experiences.",
        "Architecture or art-focused itineraries.",
        "Additional nights.",
        "Extensions to Oaxaca, Cancun or other Mexican destinations.",
      ],
      es: [
        "Recorridos guiados privados.",
        "Transporte privado al aeropuerto.",
        "Experiencias adicionales en museos.",
        "Experiencias gastron\u00f3micas premium.",
        "Itinerarios enfocados en arquitectura o arte.",
        "Noches adicionales.",
        "Extensiones a Oaxaca, Canc\u00fan u otros destinos de M\u00e9xico.",
      ],
    },
    upgradesNote: {
      en: "Ask us about optional upgrades. They can be quoted separately according to operating dates and availability.",
      es: "Consulta las mejoras opcionales. Se pueden cotizar por separado seg\u00fan las fechas de operaci\u00f3n y la disponibilidad.",
    },
    faq: [
      {
        q: {
          en: "Are international flights included?",
          es: "\u00bfIncluye vuelos internacionales?",
        },
        a: {
          en: "No. The package begins and ends in Mexico City. Flights are not included.",
          es: "No. El paquete comienza y termina en Ciudad de M\u00e9xico. Los vuelos no est\u00e1n incluidos.",
        },
      },
      {
        q: {
          en: "Is Teotihuacan included?",
          es: "\u00bfTeotihuac\u00e1n est\u00e1 incluido?",
        },
        a: {
          en: "Yes. A guided excursion is included in the proposed itinerary. Exact admissions and other services will be confirmed before booking.",
          es: "S\u00ed. El itinerario propuesto incluye una excursi\u00f3n guiada. Las entradas exactas y los dem\u00e1s servicios se confirmar\u00e1n antes de reservar.",
        },
      },
      {
        q: {
          en: "Is Xochimilco included?",
          es: "\u00bfXochimilco est\u00e1 incluido?",
        },
        a: {
          en: "Yes. The proposed itinerary includes a scheduled trajinera experience.",
          es: "S\u00ed. El itinerario propuesto incluye una experiencia programada en trajinera.",
        },
      },
      {
        q: {
          en: "Can I visit the Frida Kahlo Museum?",
          es: "\u00bfPuedo visitar el Museo Frida Kahlo?",
        },
        a: {
          en: "We can help request and quote tickets or an additional visit, subject to museum availability and operating days. It is not included in the base package.",
          es: "Podemos ayudarte a solicitar y cotizar entradas o una visita adicional, sujeto a la disponibilidad y los d\u00edas de operaci\u00f3n del museo. No est\u00e1 incluido en el paquete base.",
        },
      },
      {
        q: {
          en: "Are the excursions private?",
          es: "\u00bfLas excursiones son privadas?",
        },
        a: {
          en: "The base package assumes scheduled shared services. Private tours can be arranged for an additional cost.",
          es: "El paquete base contempla servicios compartidos programados. Los recorridos privados pueden organizarse con costo adicional.",
        },
      },
      {
        q: {
          en: "Are meals included?",
          es: "\u00bfLos alimentos est\u00e1n incluidos?",
        },
        a: {
          en: "Only meals expressly confirmed in the final quotation, together with the scheduled culinary experience.",
          es: "\u00danicamente los alimentos confirmados expresamente en la cotizaci\u00f3n final, junto con la experiencia gastron\u00f3mica programada.",
        },
      },
      {
        q: {
          en: "Can I add extra days?",
          es: "\u00bfPuedo agregar d\u00edas adicionales?",
        },
        a: {
          en: "Yes. Additional nights and destinations can be quoted.",
          es: "S\u00ed. Se pueden cotizar noches y destinos adicionales.",
        },
      },
      {
        q: {
          en: "What happens if a museum is closed?",
          es: "\u00bfQu\u00e9 sucede si un museo est\u00e1 cerrado?",
        },
        a: {
          en: "Itinerary order may change or an alternative experience may be proposed, subject to your agreement and the final booking conditions.",
          es: "El orden del itinerario puede cambiar o se podr\u00e1 proponer una experiencia alternativa, sujeto a tu acuerdo y a las condiciones finales de la reservaci\u00f3n.",
        },
      },
      {
        q: {
          en: "What is the cancellation policy?",
          es: "\u00bfCu\u00e1l es la pol\u00edtica de cancelaci\u00f3n?",
        },
        a: {
          en: "The specific cancellation terms for your hotel and services will be confirmed before payment.",
          es: "Las condiciones espec\u00edficas de cancelaci\u00f3n del hotel y los servicios se confirmar\u00e1n antes del pago.",
        },
      },
    ],
    finalTitle: {
      en: "Experience Mexico City With Us",
      es: "Conoce Ciudad de M\u00e9xico con nosotros",
    },
    finalDescription: [
      {
        en: "Discover a capital full of remarkable stories, fascinating architecture and unforgettable flavors.",
        es: "Descubre una capital llena de historias extraordinarias, arquitectura fascinante y sabores inolvidables.",
      },
      {
        en: "Tell us your travel dates, group size and interests, and our team will prepare your personalized itinerary.",
        es: "Comparte tus fechas, n\u00famero de viajeros e intereses y prepararemos tu propuesta personalizada.",
      },
    ],
    importantInfo: {
      en: [
        "Per-person pricing assumes double occupancy. International flights are not included.",
        "Hotels for six nights and different travel seasons remain to be selected and quoted.",
        "Transfer prices and capacity for each group require confirmation.",
        "Operators, guide languages, departures, admissions and included experiences require confirmation.",
        "Final prices require commercial validation. Deposits, changes, cancellations and refunds remain to be defined.",
        "Age restrictions, accessibility and provider-specific conditions require validation.",
        "The base package assumes scheduled shared services. Private tours and airport transportation can be quoted as optional upgrades.",
        "Breakfast depends on the selected hotel plan; departure-day breakfast also depends on the departure time. Only meals expressly confirmed in the final quotation and the scheduled culinary experience are included.",
        "Exact Teotihuacan admissions and other services will be confirmed before booking. Admissions not expressly included in the final service list are excluded.",
        "The Chapultepec museum and the exact culinary activity will be selected and confirmed for the final itinerary.",
        "A scheduled trajinera ride in Xochimilco forms part of the proposed itinerary.",
        "The Frida Kahlo Museum is not included in the base package. Tickets or an additional visit may be requested and quoted, subject to availability and operating days.",
        "If a museum is closed, the itinerary order may change or an alternative may be proposed, subject to your agreement and the final booking conditions.",
        "Specific hotel and service cancellation terms will be confirmed before payment.",
      ],
      es: [
        "Los precios por persona consideran ocupaci\u00f3n doble. No incluyen vuelos internacionales.",
        "Los hoteles para seis noches y distintas temporadas est\u00e1n pendientes de selecci\u00f3n y cotizaci\u00f3n.",
        "Los precios de los traslados y la capacidad por grupo requieren confirmaci\u00f3n.",
        "Los operadores, los idiomas de los gu\u00edas, las salidas, las entradas y las experiencias incluidas requieren confirmaci\u00f3n.",
        "Los precios finales requieren validaci\u00f3n comercial. Los anticipos, cambios, cancelaciones y reembolsos est\u00e1n pendientes de definici\u00f3n.",
        "Las restricciones de edad, la accesibilidad y las condiciones espec\u00edficas de los proveedores requieren validaci\u00f3n.",
        "El paquete base contempla servicios compartidos programados. Los recorridos y el transporte al aeropuerto privados pueden cotizarse como mejoras opcionales.",
        "El desayuno depende del plan del hotel seleccionado; el desayuno del d\u00eda de salida tambi\u00e9n depende del horario de partida. Solo se incluyen los alimentos expresamente confirmados en la cotizaci\u00f3n final y la experiencia gastron\u00f3mica programada.",
        "Las entradas exactas a Teotihuac\u00e1n y los dem\u00e1s servicios se confirmar\u00e1n antes de reservar. Las entradas no incluidas expresamente en la lista final de servicios est\u00e1n excluidas.",
        "El museo de Chapultepec y la actividad gastron\u00f3mica exacta se seleccionar\u00e1n y confirmar\u00e1n para el itinerario final.",
        "Un paseo programado en trajinera en Xochimilco forma parte del itinerario propuesto.",
        "El Museo Frida Kahlo no est\u00e1 incluido en el paquete base. Se pueden solicitar y cotizar entradas o una visita adicional, sujetas a disponibilidad y d\u00edas de operaci\u00f3n.",
        "Si un museo est\u00e1 cerrado, el orden del itinerario puede cambiar o se podr\u00e1 proponer una alternativa, sujeto a tu acuerdo y a las condiciones finales de la reservaci\u00f3n.",
        "Las condiciones espec\u00edficas de cancelaci\u00f3n del hotel y los servicios se confirmar\u00e1n antes del pago.",
      ],
    },
    whatsappMessage: {
      en: "Hello! I'm interested in the Mexico City Discovery package, 7 days / 6 nights. I'd like a personalized quote.",
      es: "\u00a1Hola! Me interesa el paquete Mexico City Discovery, de 7 d\u00edas / 6 noches. Me gustar\u00eda recibir una cotizaci\u00f3n personalizada.",
    },
    seo: {
      title: {
        en: "Mexico City Vacation Package \u2014 7 Days",
        es: "Ciudad de M\u00e9xico \u2014 Paquete de 7 D\u00edas",
      },
      description: {
        en: "Explore Mexico City in 7 days, including Teotihuacan, the Historic Center, Chapultepec, Coyoacan and Xochimilco.",
        es: "Descubre Ciudad de M\u00e9xico en 7 d\u00edas con recorridos por Teotihuac\u00e1n, Centro Hist\u00f3rico, Chapultepec, Coyoac\u00e1n y Xochimilco.",
      },
    },
    commercialNotice: {
      en: "This is a planned package offered by personalized quotation only, not a confirmed booking. Pricing is unverified. Hotels, services, providers, guide languages, departures, admissions and included experiences have not yet been confirmed and require commercial validation. The final proposal must confirm the contracted services and applicable conditions before booking.",
      es: "Este es un paquete propuesto disponible \u00fanicamente mediante cotizaci\u00f3n personalizada, no una reservaci\u00f3n confirmada. Los precios no est\u00e1n verificados. Los hoteles, servicios, proveedores, idiomas de los gu\u00edas, salidas, entradas y experiencias incluidas a\u00fan no est\u00e1n confirmados y requieren validaci\u00f3n comercial. La propuesta final deber\u00e1 confirmar los servicios contratados y las condiciones aplicables antes de reservar.",
    },
    publicationStatus: "quote-only",
    price: {
      verified: false,
      confirmedUsd: null,
      validUntil: null,
    },
    quoteEnabled: true,
  },
];

export function getTourPackageById(id: string): TourPackage | undefined {
  return tourPackages.find((tour) => tour.id === id);
}

export function getTourPackageBySlug(
  locale: Locale,
  slug: string,
): TourPackage | undefined {
  return tourPackages.find((tour) => tour.slugs[locale] === slug);
}
