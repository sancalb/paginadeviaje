import type { Locale, Localized } from "./content";

export type TourIdentity = {
  id: string;
  slugs: Localized;
  name: Localized;
  destinationSlug: string;
};

export const tourIdentities: TourIdentity[] = [
  {
    id: "MEX-CUN-7D6N",
    slugs: { en: "cancun-all-inclusive", es: "cancun-todo-incluido" },
    name: { en: "Cancun All-Inclusive Escape", es: "Canc\u00fan Todo Incluido" },
    destinationSlug: "cancun",
  },
  {
    id: "MEX-GDL-7D6N",
    slugs: { en: "guadalajara-tequila", es: "guadalajara-tequila" },
    name: { en: "Guadalajara & Tequila Experience", es: "Guadalajara y Tequila" },
    destinationSlug: "guadalajara",
  },
  {
    id: "MEX-MEX-7D6N",
    slugs: { en: "mexico-city", es: "ciudad-de-mexico" },
    name: { en: "Mexico City Discovery", es: "Descubre Ciudad de M\u00e9xico" },
    destinationSlug: "mexico-city",
  },
];

export function getTourIdentityById(id: string): TourIdentity | undefined {
  return tourIdentities.find((tour) => tour.id === id);
}

export function getTourIdentityBySlug(
  locale: Locale,
  slug: string,
): TourIdentity | undefined {
  return tourIdentities.find((tour) => tour.slugs[locale] === slug);
}
