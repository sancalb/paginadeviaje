const whatsappBase = "https://wa.me/";
const whatsappChoice = document.querySelector("[data-whatsapp-choice]");
const whatsappChoiceLinks = whatsappChoice?.querySelectorAll("[data-choice-phone]");
const whatsappChoiceClose = whatsappChoice?.querySelectorAll("[data-whatsapp-close]");
let lastWhatsappTrigger = null;

function setWhatsappLink(anchor, message) {
  const phone = anchor.dataset.phone || anchor.dataset.choicePhone || "";
  anchor.href = `${whatsappBase}${phone}?text=${encodeURIComponent(message)}`;
  anchor.target = "_blank";
  anchor.rel = "noopener";
}

function openWhatsappChoice(message, trigger) {
  if (!whatsappChoice || !whatsappChoiceLinks?.length) {
    setWhatsappLink(trigger, message);
    return;
  }

  lastWhatsappTrigger = trigger;
  whatsappChoiceLinks.forEach((link) => {
    setWhatsappLink(link, message);
  });
  whatsappChoice.hidden = false;
  document.body.classList.add("is-whatsapp-choice-open");
  whatsappChoice.querySelector("[data-whatsapp-close]")?.focus();
}

function closeWhatsappChoice() {
  if (!whatsappChoice) return;
  whatsappChoice.hidden = true;
  document.body.classList.remove("is-whatsapp-choice-open");
  lastWhatsappTrigger?.focus();
}

function enableWhatsapp(anchor, message) {
  if (anchor.dataset.phone) {
    setWhatsappLink(anchor, message);
    return;
  }

  anchor.href = "#whatsapp";
  anchor.addEventListener("click", (event) => {
    event.preventDefault();
    openWhatsappChoice(message, anchor);
  });
}

document.querySelectorAll(".whatsapp-link").forEach((anchor) => {
  const message = anchor.dataset.message || "Hola deviaje, quiero hablar con mi asesor para planear mi viaje.";
  enableWhatsapp(anchor, message);
});

document.querySelectorAll(".whatsapp-trip").forEach((anchor) => {
  const card = anchor.closest("[data-trip]");
  const trip = card?.dataset.trip || "un viaje";
  enableWhatsapp(anchor, `Hola deviaje, me gustaría que me ayuden a planear este destino: ${trip}.`);
});

whatsappChoiceClose?.forEach((control) => {
  control.addEventListener("click", closeWhatsappChoice);
});

whatsappChoiceLinks?.forEach((link) => {
  link.addEventListener("click", closeWhatsappChoice);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !whatsappChoice?.hidden) {
    closeWhatsappChoice();
  }
  if (event.key === "Escape" && fridaHost?.classList.contains("is-frida-open")) {
    closeFridaMenu();
  }
  if (event.key === "Escape" && reviewModal && !reviewModal.hidden) {
    closeReviewModal();
  }
});

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const whatsappFloat = document.querySelector("[data-whatsapp-float]");

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
  whatsappFloat?.classList.toggle("is-visible", window.scrollY > 520);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const heroImage = document.querySelector("[data-hero-image]");
const heroSlides = [
  "public/assets/photos/hero-japan.avif",
  "public/assets/photos/hero-rome.avif",
  "public/assets/photos/hero-caribbean.avif",
  "public/assets/photos/hero-egypt.avif",
  "public/assets/photos/las-vegas.avif",
  "public/assets/photos/europe.avif",
  "public/assets/photos/japan.avif",
  "public/assets/photos/caribbean.avif",
  "public/assets/photos/egypt-wide.avif",
  "public/assets/photos/south-america.avif",
  "public/assets/photos/falls.avif",
  "public/assets/photos/paris.avif",
  "public/assets/photos/las-vegas-sign.avif",
  "public/assets/photos/egypt.avif",
  "public/assets/photos/group-las-vegas-deviaje.jpg",
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroImage && !reduceMotion) {
  const heroMedia = heroImage.closest(".hero-media");
  const secondaryHeroImage = heroImage.cloneNode();
  const heroImageLayers = [heroImage, secondaryHeroImage];
  let slideIndex = 0;
  let activeHeroLayer = 0;
  let isHeroTransitioning = false;

  secondaryHeroImage.removeAttribute("data-hero-image");
  secondaryHeroImage.setAttribute("aria-hidden", "true");
  secondaryHeroImage.loading = "eager";
  secondaryHeroImage.decoding = "async";
  heroImage.classList.add("is-active");
  heroMedia?.classList.add("is-crossfade");
  heroMedia?.append(secondaryHeroImage);

  const heroPreloadImages = new Map();
  const preloadHeroSlide = (src) => {
    if (heroPreloadImages.has(src)) return heroPreloadImages.get(src);

    const preload = new Image();
    preload.decoding = "async";
    preload.src = src;
    heroPreloadImages.set(src, preload);
    return preload;
  };

  preloadHeroSlide(heroSlides[1]);

  const decodeHeroImage = async (image) => {
    if (typeof image.decode !== "function") return;

    try {
      await image.decode();
    } catch {
      // A failed decode should not block the carousel from continuing.
    }
  };

  const advanceHeroSlide = async () => {
    if (isHeroTransitioning) return;
    isHeroTransitioning = true;

    slideIndex = (slideIndex + 1) % heroSlides.length;
    const nextSrc = heroSlides[slideIndex];
    const nextLayer = (activeHeroLayer + 1) % heroImageLayers.length;
    const currentImage = heroImageLayers[activeHeroLayer];
    const nextImage = heroImageLayers[nextLayer];

    preloadHeroSlide(nextSrc);

    if (nextImage.getAttribute("src") !== nextSrc) {
      nextImage.src = nextSrc;
    }

    await decodeHeroImage(nextImage);

    window.requestAnimationFrame(() => {
      nextImage.classList.add("is-active");
      currentImage.classList.remove("is-active");
      activeHeroLayer = nextLayer;

      window.setTimeout(() => {
        isHeroTransitioning = false;
        preloadHeroSlide(heroSlides[(slideIndex + 1) % heroSlides.length]);
      }, 980);
    });
  };

  window.setInterval(advanceHeroSlide, 5600);
}

const destinationCatalogUrl = "/data/destinations.json";
const homeMain = document.querySelector("[data-home-main]");
const destinationPage = document.querySelector("[data-destination-page]");
const fridaPage = document.querySelector("[data-frida-page]");
const fridaHost = document.querySelector("[data-frida-menu-host]");
const fridaTrigger = document.querySelector("[data-frida-trigger]");
const fridaMenu = document.querySelector("[data-frida-menu]");
const fridaMenuContent = document.querySelector("[data-frida-menu-content]");
const fridaCrew = fridaHost?.closest(".mini-crew");
const fridaHeroDestinations = document.querySelector("[data-frida-hero-destinations]");
const fridaCategoryStack = document.querySelector("[data-frida-categories]");
let destinationCatalogPromise = null;
let fridaCloseTimer = null;

const fridaTeaserSlugs = ["oaxaca", "nueva-york", "cusco", "cartagena"];
const fridaHeroSlugs = ["oaxaca", "nueva-york", "cusco"];
const fridaCategoryConfig = [
  {
    title: "Historia & cultura",
    copy: "Rutas para caminar con calma, mirar distinto y volver con algo más que fotos.",
    slugs: ["oaxaca", "cusco", "cartagena", "buenos-aires"],
  },
  {
    title: "Sabores & calles",
    copy: "Ciudades para perderse entre barrios, mesas, mercados y conversaciones.",
    slugs: ["chicago", "nueva-york", "medellin", "bogota", "panama"],
  },
  {
    title: "Grandes ciudades",
    copy: "Escapadas con ritmo, luces, parques, compras y planes para todos.",
    slugs: ["las-vegas", "los-angeles-disney", "miami", "orlando-disney", "rio-de-janeiro"],
  },
  {
    title: "Sol & mar",
    copy: "Playas, descanso y días que se sienten más ligeros desde el primer paso.",
    slugs: ["cancun", "playa-del-carmen", "puerto-vallarta", "los-cabos", "mazatlan", "puerto-escondido", "acapulco", "punta-cana", "montego-bay", "san-jose"],
  },
  {
    title: "México",
    copy: "Viajes cercanos con carácter propio, perfectos para ir con familia, amigos o pareja.",
    slugs: ["oaxaca", "cancun", "playa-del-carmen", "puerto-vallarta", "los-cabos", "mazatlan", "puerto-escondido", "acapulco"],
  },
  {
    title: "Latinoamérica",
    copy: "Cultura viva, ciudades cálidas y paisajes que cuentan historias enormes.",
    slugs: ["medellin", "cartagena", "rio-de-janeiro", "buenos-aires", "cusco", "panama", "san-jose", "bogota"],
  },
  {
    title: "Estados Unidos",
    copy: "Clásicos para escaparse, celebrar, ir a parques o descubrir una ciudad nueva.",
    slugs: ["las-vegas", "chicago", "los-angeles-disney", "nueva-york", "miami", "orlando-disney"],
  },
];

function loadDestinationCatalog() {
  if (!destinationCatalogPromise) {
    destinationCatalogPromise = fetch(destinationCatalogUrl, { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo cargar el catálogo de destinos");
        return response.json();
      })
      .then((data) => Array.isArray(data.destinations) ? data.destinations : []);
  }

  return destinationCatalogPromise;
}

function destinationUrl(destination) {
  return `/destinos/${destination.slug}`;
}

function isDesktopFridaMenu() {
  return window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)").matches;
}

function openFridaMenu() {
  window.clearTimeout(fridaCloseTimer);
  fridaHost?.classList.add("is-frida-open");
  fridaCrew?.classList.add("has-frida-open");
  fridaMenu?.setAttribute("aria-hidden", "false");
  fridaTrigger?.setAttribute("aria-expanded", "true");
}

function closeFridaMenu() {
  window.clearTimeout(fridaCloseTimer);
  fridaHost?.classList.remove("is-frida-open");
  fridaCrew?.classList.remove("has-frida-open");
  fridaMenu?.setAttribute("aria-hidden", "true");
  fridaTrigger?.setAttribute("aria-expanded", "false");
}

function scheduleFridaClose() {
  window.clearTimeout(fridaCloseTimer);
  fridaCloseTimer = window.setTimeout(closeFridaMenu, 210);
}

function findDestinationsBySlug(destinations, slugs) {
  return slugs
    .map((slug) => destinations.find((destination) => destination.slug === slug))
    .filter(Boolean);
}

function decorateDestinationImage(element, destination) {
  if (destination.heroImage) {
    element.classList.add("has-image");
    element.style.setProperty("--destination-image", `url("${destination.heroImage}")`);
  }
}

function createFridaTeaserLink(destination) {
  const link = document.createElement("a");
  link.className = "frida-teaser-link";
  link.href = destinationUrl(destination);
  decorateDestinationImage(link, destination);

  const meta = document.createElement("span");
  meta.textContent = [destination.country, destination.code].filter(Boolean).join(" · ");
  const title = document.createElement("strong");
  title.textContent = destination.name;
  const arrow = document.createElement("small");
  arrow.textContent = "→";
  arrow.setAttribute("aria-hidden", "true");

  link.append(meta, title, arrow);
  return link;
}

function renderFridaMenu(destinations) {
  if (!fridaMenuContent) return;

  fridaMenuContent.replaceChildren();

  const strip = document.createElement("div");
  strip.className = "frida-teaser-strip";
  findDestinationsBySlug(destinations, fridaTeaserSlugs).forEach((destination) => {
    strip.append(createFridaTeaserLink(destination));
  });

  const explore = document.createElement("a");
  explore.className = "frida-menu-explore";
  explore.href = "/frida";
  explore.textContent = "Explorar con Frida →";

  fridaMenuContent.append(strip, explore);
}

async function initFridaMenu() {
  if (!fridaHost || !fridaTrigger || !fridaMenu || !fridaMenuContent) return;

  try {
    const destinations = await loadDestinationCatalog();
    renderFridaMenu(destinations);
  } catch {
    fridaMenuContent.textContent = "";
    return;
  }

  fridaHost.addEventListener("pointerenter", () => {
    if (isDesktopFridaMenu()) openFridaMenu();
  });
  fridaHost.addEventListener("pointerleave", () => {
    if (isDesktopFridaMenu()) scheduleFridaClose();
  });
  fridaMenu.addEventListener("pointerenter", () => window.clearTimeout(fridaCloseTimer));
  fridaMenu.addEventListener("pointerleave", () => {
    if (isDesktopFridaMenu()) scheduleFridaClose();
  });
  fridaTrigger.addEventListener("focus", () => {
    if (isDesktopFridaMenu()) openFridaMenu();
  });
  fridaTrigger.addEventListener("blur", () => {
    if (isDesktopFridaMenu()) scheduleFridaClose();
  });
  fridaMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeFridaMenu();
  });
}

function createFridaWorldCard(destination, index = 0) {
  const link = document.createElement("a");
  link.className = "frida-world-card";
  link.href = destinationUrl(destination);
  decorateDestinationImage(link, destination);
  if (index === 0) link.classList.add("is-leading");

  const meta = document.createElement("span");
  meta.textContent = [destination.region, destination.code].filter(Boolean).join(" · ");
  const title = document.createElement("strong");
  title.textContent = destination.name;
  const copy = document.createElement("p");
  copy.textContent = destination.tagline && !destination.tagline.includes("por completar")
    ? destination.tagline
    : destination.shortDescription;
  const arrow = document.createElement("small");
  arrow.textContent = "Ver destino →";

  link.append(meta, title, copy, arrow);
  return link;
}

function renderFridaHeroDestinations(destinations) {
  if (!fridaHeroDestinations) return;

  fridaHeroDestinations.replaceChildren();
  findDestinationsBySlug(destinations, fridaHeroSlugs).forEach((destination, index) => {
    const link = document.createElement("a");
    link.className = "frida-hero-destination";
    link.href = destinationUrl(destination);
    decorateDestinationImage(link, destination);

    const title = document.createElement("strong");
    title.textContent = destination.name;
    const meta = document.createElement("span");
    meta.textContent = destination.country;

    link.append(title, meta);
    link.style.setProperty("--offset", `${index * 22}px`);
    fridaHeroDestinations.append(link);
  });
}

function renderFridaCategories(destinations) {
  if (!fridaCategoryStack) return;

  fridaCategoryStack.replaceChildren();
  fridaCategoryConfig.forEach((category) => {
    const categoryDestinations = findDestinationsBySlug(destinations, category.slugs);
    if (!categoryDestinations.length) return;

    const section = document.createElement("section");
    section.className = "frida-category-panel";

    const copy = document.createElement("div");
    copy.className = "frida-category-copy";
    const title = document.createElement("h3");
    title.textContent = category.title;
    const text = document.createElement("p");
    text.textContent = category.copy;
    copy.append(title, text);

    const track = document.createElement("div");
    track.className = "frida-world-track";
    categoryDestinations.forEach((destination, index) => {
      track.append(createFridaWorldCard(destination, index));
    });

    section.append(copy, track);
    fridaCategoryStack.append(section);
  });
}

function renderFridaPage(destinations) {
  document.body.classList.add("is-frida-route");
  document.body.classList.remove("is-destination-route");
  if (homeMain) homeMain.hidden = true;
  if (destinationPage) destinationPage.hidden = true;
  if (fridaPage) fridaPage.hidden = false;
  document.title = "Frida | deviaje";

  renderFridaHeroDestinations(destinations);
  renderFridaCategories(destinations);
}

async function initFridaRoute() {
  if (!window.location.pathname.match(/^\/frida\/?$/)) return;

  try {
    const destinations = await loadDestinationCatalog();
    renderFridaPage(destinations);
  } catch {
    if (homeMain) homeMain.hidden = true;
    if (fridaPage) fridaPage.hidden = false;
    document.title = "Frida | deviaje";
  }
}

function listItems(container, items) {
  container.replaceChildren();
  (items && items.length ? items : ["Contenido editorial por completar."]).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.append(li);
  });
}

function renderCardList(container, items) {
  container.replaceChildren();
  (items && items.length ? items : ["Contenido editorial por completar."]).forEach((item, index) => {
    const article = document.createElement("article");
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const text = document.createElement("p");
    text.textContent = item;
    article.append(number, text);
    container.append(article);
  });
}

function renderGallery(container, images) {
  container.replaceChildren();
  if (!images?.length) {
    const placeholder = document.createElement("article");
    placeholder.className = "destination-gallery-placeholder";
    placeholder.textContent = "Imagen editorial pendiente para este destino.";
    container.append(placeholder);
    return;
  }

  images.slice(0, 4).forEach((image) => {
    const article = document.createElement("article");
    article.style.backgroundImage = `url("${image}")`;
    container.append(article);
  });
}

function renderTags(container, items) {
  container.replaceChildren();
  (items && items.length ? items : ["Por definir"]).forEach((item) => {
    const tag = document.createElement("span");
    tag.textContent = item;
    container.append(tag);
  });
}

function renderDestination(destination) {
  document.body.classList.add("is-destination-route");
  document.body.classList.remove("is-frida-route");
  if (homeMain) homeMain.hidden = true;
  if (destinationPage) destinationPage.hidden = false;
  if (fridaPage) fridaPage.hidden = true;
  document.title = `${destination.name} | deviaje`;

  const hero = document.querySelector("[data-destination-hero]");
  const heroMedia = document.querySelector("[data-destination-hero-media]");
  hero?.classList.toggle("has-image", Boolean(destination.heroImage));
  heroMedia?.style.setProperty("background-image", destination.heroImage ? `url("${destination.heroImage}")` : "none");

  document.querySelector("[data-destination-region]").textContent = destination.region || "Destino";
  document.querySelector("[data-destination-name]").textContent = destination.name;
  document.querySelector("[data-destination-country]").textContent = [destination.country, destination.code].filter(Boolean).join(" · ");
  document.querySelector("[data-destination-tagline]").textContent = destination.tagline || "Contenido editorial por completar.";
  document.querySelector("[data-destination-why-title]").textContent = `Por qué ir a ${destination.name}`;
  document.querySelector("[data-destination-description]").textContent = destination.shortDescription || "Contenido editorial por completar.";

  const ctaText = `Me gustaría ir a ${destination.name}`;
  const message = destination.whatsappMessage || `Hola, estoy viendo ${destination.name} en deviaje.mx y me gustaría planear un viaje a este destino.`;
  const cta = document.querySelector("[data-destination-whatsapp]");
  const ctaBottom = document.querySelector("[data-destination-whatsapp-bottom]");
  document.querySelector("[data-destination-cta]").textContent = ctaText;
  document.querySelector("[data-destination-cta-bottom]").textContent = ctaText;
  if (cta) enableWhatsapp(cta, message);
  if (ctaBottom) enableWhatsapp(ctaBottom, message);

  listItems(document.querySelector("[data-destination-frida]"), destination.fridaRecommends);
  renderCardList(document.querySelector("[data-destination-highlights]"), destination.highlights);
  renderGallery(document.querySelector("[data-destination-gallery]"), destination.galleryImages);
  renderTags(document.querySelector("[data-destination-ideal]"), destination.idealFor);
}

function renderDestinationNotFound(slug) {
  document.body.classList.add("is-destination-route");
  document.body.classList.remove("is-frida-route");
  if (homeMain) homeMain.hidden = true;
  if (destinationPage) destinationPage.hidden = false;
  if (fridaPage) fridaPage.hidden = true;
  document.title = "Destino no encontrado | deviaje";
  document.querySelector("[data-destination-region]").textContent = "Destino";
  document.querySelector("[data-destination-name]").textContent = "Destino no encontrado";
  document.querySelector("[data-destination-country]").textContent = slug;
  document.querySelector("[data-destination-tagline]").textContent = "Volvamos al catálogo para elegir una ruta disponible.";
}

async function initDestinationRoute() {
  const match = window.location.pathname.match(/^\/destinos\/([^/]+)\/?$/);
  if (!match) return;

  const slug = decodeURIComponent(match[1]);
  try {
    const destinations = await loadDestinationCatalog();
    const destination = destinations.find((item) => item.slug === slug);
    if (destination) {
      renderDestination(destination);
      return;
    }
  } catch {
    // The fallback below keeps the route readable if the JSON cannot load.
  }

  renderDestinationNotFound(slug);
}

initFridaMenu();
initFridaRoute();
initDestinationRoute();

const reviewsSection = document.querySelector("[data-google-reviews]");
const reviewsSummary = reviewsSection?.querySelector("[data-reviews-summary]");
const reviewsList = reviewsSection?.querySelector("[data-reviews-list]");
const reviewsEmpty = reviewsSection?.querySelector("[data-reviews-empty]");
const reviewsProfileLinks = reviewsSection?.querySelector("[data-reviews-profile-links]");
const reviewTabs = reviewsSection?.querySelector("[data-review-tabs]");
const reviewTabButtons = reviewsSection?.querySelectorAll("[data-review-branch]");
const reviewPrev = reviewsSection?.querySelector("[data-review-prev]");
const reviewNext = reviewsSection?.querySelector("[data-review-next]");
const reviewDots = reviewsSection?.querySelector("[data-review-dots]");
const branchMapCanvases = document.querySelectorAll("[data-branch-map]");
const reviewFormatter = new Intl.NumberFormat("es-MX");
const maxCombinedReviews = 10;
let reviewsData = null;
let activeReviewBranch = "monterrey";
let reviewOffset = 0;
let reviewModal = null;
let lastReviewModalTrigger = null;

function hasBranchReviewData(branch) {
  return Boolean(branch && (Number(branch.rating) > 0 || Number(branch.reviewCount) > 0 || branch.reviews?.length));
}

function hasAnyReviewLink(data) {
  return Object.values(data?.branches || {}).some((branch) => branch.mapsUrl);
}

function hasRenderableReviewTexts(data) {
  return Object.values(data?.branches || {}).some((branch) => (branch?.reviews || []).some((review) => getReviewText(review)));
}

function getReviewText(review) {
  return review?.text || review?.snippet || review?.comment || review?.review || review?.body || "";
}

function getReviewAuthor(review) {
  return review?.author || review?.author_name || review?.user?.name || review?.profile?.name || review?.name || "";
}

function getReviewLink(review) {
  return review?.url || review?.link || review?.review_link || review?.share_link || "";
}

function getReviewImages(review) {
  const images = [];
  const add = (value) => {
    if (!value) return;
    if (typeof value === "string") {
      if (/^https?:\/\//i.test(value) && !images.includes(value)) images.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(add);
      return;
    }
    if (typeof value === "object") {
      add(value.image || value.url || value.link || value.thumbnail || value.src);
    }
  };

  add(review?.image);
  add(review?.images);
  return images;
}

function getReviewVisual(review) {
  const reviewImage = getReviewImages(review)[0];
  if (reviewImage) {
    return { src: reviewImage, kind: "review" };
  }

  if (review?.destinationImage) {
    return { src: review.destinationImage, kind: "destination" };
  }

  return null;
}

function getReviewDestination(review) {
  return review?.destination || "";
}

function getCombinedReviewsData(data) {
  const branchEntries = Object.entries(data?.branches || {});
  const branches = branchEntries.map(([, branch]) => branch);
  const branchReviewGroups = branchEntries.map(([key, branch]) => {
    const label = key === "guadalajara" ? "Guadalajara" : "Monterrey";
    return {
      key,
      branch,
      reviews: (branch?.reviews || [])
        .filter((review) => getReviewText(review))
        .map((review) => ({
          ...review,
          branchKey: key,
          branchLabel: label,
          branchMapsUrl: branch?.mapsUrl || "",
        })),
    };
  });
  const reviews = [];
  const longestBranch = Math.max(0, ...branchReviewGroups.map((group) => group.reviews.length));

  for (let index = 0; index < longestBranch; index += 1) {
    branchReviewGroups.forEach((group) => {
      if (group.reviews[index]) reviews.push(group.reviews[index]);
    });
  }

  const reviewCount = branches.reduce((total, branch) => total + (Number(branch?.reviewCount) || 0), 0);
  const weightedRatings = branches.filter((branch) => Number(branch?.rating) > 0 && Number(branch?.reviewCount) > 0);
  const rating = weightedRatings.length
    ? weightedRatings.reduce((total, branch) => total + Number(branch.rating) * Number(branch.reviewCount), 0)
      / weightedRatings.reduce((total, branch) => total + Number(branch.reviewCount), 0)
    : (() => {
        const ratings = branches.map((branch) => Number(branch?.rating)).filter((value) => value > 0);
        return ratings.length ? ratings.reduce((total, value) => total + value, 0) / ratings.length : null;
      })();

  return {
    rating,
    reviewCount,
    profileLinks: branchReviewGroups
      .filter((group) => group.branch?.mapsUrl)
      .map((group) => ({
        key: group.key,
        label: group.key === "guadalajara" ? "Guadalajara" : "Monterrey",
        mapsUrl: group.branch.mapsUrl,
      })),
    reviews,
  };
}

function getReviewBranch(data, key) {
  return data?.branches?.[key] || null;
}

function getBranchReviews(branch) {
  return (branch?.reviews || []).filter((review) => getReviewText(review));
}

function getVisibleReviewCount() {
  return window.matchMedia("(max-width: 900px)").matches ? Number.POSITIVE_INFINITY : 3;
}

function getActiveBranchWithReviews(data) {
  const active = getReviewBranch(data, activeReviewBranch);
  if (getBranchReviews(active).length) return activeReviewBranch;

  const firstAvailable = Object.entries(data?.branches || {}).find(([, branch]) => getBranchReviews(branch).length);
  return firstAvailable?.[0] || activeReviewBranch;
}

function renderStars(rating) {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return `${"★".repeat(value)}${"☆".repeat(5 - value)}`;
}

function appendReviewText(container, text, featured) {
  if (!featured) {
    container.textContent = text;
    return;
  }

  const match = text.match(/^(.{24,160}?[.!?¡!¿?])(\s+[\s\S]*)$/);

  if (!match) {
    container.textContent = text;
    return;
  }

  const lead = document.createElement("span");
  lead.className = "review-lead";
  lead.textContent = match[1];

  const rest = document.createTextNode(match[2]);
  container.append(lead, rest);
}

function ensureReviewModal() {
  if (reviewModal) return reviewModal;

  reviewModal = document.createElement("div");
  reviewModal.className = "review-modal";
  reviewModal.hidden = true;
  reviewModal.innerHTML = `
    <button class="review-modal-backdrop" type="button" data-review-modal-close aria-label="Cerrar reseña"></button>
    <section class="review-modal-panel" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <button class="review-modal-close" type="button" data-review-modal-close aria-label="Cerrar"></button>
      <figure class="review-modal-visual" data-review-modal-visual hidden>
        <img alt="" data-review-modal-image />
      </figure>
      <div class="review-modal-copy">
        <p class="review-stars" data-review-modal-stars></p>
        <p class="review-destination" data-review-modal-destination hidden></p>
        <h3 id="review-modal-title" data-review-modal-author></h3>
        <p class="review-modal-source">Google</p>
        <p class="review-modal-text" data-review-modal-text></p>
        <a class="review-google review-modal-google" href="#" target="_blank" rel="noopener" data-review-modal-link>Ver reseña en Google ↗</a>
      </div>
    </section>
  `;

  reviewModal.querySelectorAll("[data-review-modal-close]").forEach((control) => {
    control.addEventListener("click", closeReviewModal);
  });
  document.body.append(reviewModal);
  return reviewModal;
}

function openReviewModal(review, trigger) {
  const modal = ensureReviewModal();
  const visual = getReviewVisual(review);
  const visualWrap = modal.querySelector("[data-review-modal-visual]");
  const visualImage = modal.querySelector("[data-review-modal-image]");
  const destination = getReviewDestination(review);
  const destinationNode = modal.querySelector("[data-review-modal-destination]");
  const author = getReviewAuthor(review);
  const link = getReviewLink(review);

  lastReviewModalTrigger = trigger;
  modal.querySelector("[data-review-modal-stars]").textContent = renderStars(review.rating);
  modal.querySelector("[data-review-modal-author]").textContent = author;
  modal.querySelector("[data-review-modal-text]").textContent = getReviewText(review);

  if (visual) {
    visualImage.src = visual.src;
    visualImage.alt = destination || "Foto asociada a la reseña";
    visualWrap.hidden = false;
    visualWrap.dataset.visualKind = visual.kind;
  } else {
    visualImage.removeAttribute("src");
    visualWrap.hidden = true;
    visualWrap.removeAttribute("data-visual-kind");
  }

  if (destination) {
    destinationNode.textContent = destination;
    destinationNode.hidden = false;
  } else {
    destinationNode.textContent = "";
    destinationNode.hidden = true;
  }

  const googleLink = modal.querySelector("[data-review-modal-link]");
  if (link) {
    googleLink.href = link;
    googleLink.hidden = false;
  } else {
    googleLink.hidden = true;
  }

  modal.hidden = false;
  document.body.classList.add("is-review-modal-open");
  modal.querySelector(".review-modal-close")?.focus();
}

function closeReviewModal() {
  if (!reviewModal) return;
  reviewModal.hidden = true;
  document.body.classList.remove("is-review-modal-open");
  lastReviewModalTrigger?.focus();
}

function createReviewCard(review, index) {
  const article = document.createElement("article");
  article.className = "review-card";
  const storyClasses = [
    "is-story-large",
    "is-story-tall",
    "is-story-wide",
    "is-story-portrait",
    "is-story-small",
    "is-story-tall",
    "is-story-wide",
    "is-story-small",
    "is-story-portrait",
    "is-story-small",
  ];
  article.classList.add(storyClasses[index] || "is-story-small");
  if (index === 0) article.classList.add("is-featured");

  const reviewText = getReviewText(review);
  const reviewAuthor = getReviewAuthor(review);
  const reviewVisual = getReviewVisual(review);
  const reviewDestination = getReviewDestination(review);
  const shouldExpand = true;

  if (reviewVisual) {
    article.classList.add("has-review-visual");
    article.dataset.visualKind = reviewVisual.kind;

    const figure = document.createElement("figure");
    figure.className = "review-photo";
    const image = document.createElement("img");
    image.src = reviewVisual.src;
    image.alt = reviewDestination || "Foto asociada a la reseña";
    image.loading = "lazy";
    image.decoding = "async";
    figure.append(image);
    article.append(figure);
  }

  const body = document.createElement("div");
  body.className = "review-body";
  const stars = document.createElement("div");
  stars.className = "review-stars";
  stars.setAttribute("aria-label", `${review.rating || 0} de 5 estrellas`);
  stars.textContent = renderStars(review.rating);
  body.append(stars);

  if (reviewDestination) {
    const destination = document.createElement("p");
    destination.className = "review-destination";
    destination.textContent = reviewDestination;
    body.append(destination);
  }

  const text = document.createElement("p");
  text.className = "review-text";
  appendReviewText(text, reviewText, index === 0);

  const meta = document.createElement("div");
  meta.className = "review-meta";

  if (reviewAuthor) {
    const author = document.createElement("strong");
    author.textContent = reviewAuthor;
    meta.append(author);
  }

  const source = document.createElement("span");
  source.textContent = "Google";
  meta.append(source);

  body.append(text, meta);
  article.append(body);

  const actions = document.createElement("div");
  actions.className = "review-actions";

  if (shouldExpand) {
    const more = document.createElement("button");
    more.className = "review-more";
    more.type = "button";
    more.textContent = "Leer completa";
    more.addEventListener("click", () => openReviewModal(review, more));
    actions.append(more);
  }

  if (actions.children.length) {
    article.append(actions);
  }

  return article;
}

function renderReviewSummary(branch) {
  reviewsSummary.replaceChildren();

  const combined = getCombinedReviewsData(reviewsData);
  const rating = Number(combined.rating) > 0 ? Number(combined.rating).toFixed(1) : "";
  const count = Number(combined.reviewCount) > 0 ? reviewFormatter.format(combined.reviewCount) : "";

  const icon = document.createElement("span");
  icon.className = "reviews-summary-star";
  icon.textContent = "★";

  const copy = document.createElement("div");
  const ratingLine = document.createElement("strong");
  ratingLine.textContent = rating || "Google";
  copy.append(ratingLine);

  if (rating) {
    const source = document.createElement("span");
    source.className = "rating-source";
    source.textContent = "en Google";
    copy.append(source);
  }

  const stars = document.createElement("span");
  stars.className = "rating-stars";
  stars.textContent = renderStars(combined.rating || branch?.rating || 5);
  copy.append(stars);

  if (count) {
    const countLine = document.createElement("span");
    countLine.className = "rating-count";
    countLine.textContent = `${count} opiniones en Google`;
    copy.append(countLine);
  }

  reviewsSummary.append(icon, copy);
}

function renderReviewTabs() {
  reviewTabButtons?.forEach((button) => {
    const branch = button.dataset.reviewBranch;
    const branchData = getReviewBranch(reviewsData, branch);
    const hasReviews = getBranchReviews(branchData).length > 0;
    button.classList.toggle("is-active", branch === activeReviewBranch);
    button.disabled = !hasReviews;
  });
}

function renderReviewProfileLinks(profileLinks = []) {
  if (!reviewsProfileLinks) return;
  reviewsProfileLinks.replaceChildren();

  profileLinks.forEach((profile) => {
    const link = document.createElement("a");
    link.className = "reviews-google-link";
    link.href = profile.mapsUrl;
    link.target = "_blank";
    link.rel = "noopener";

    const mark = document.createElement("span");
    mark.className = "google-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "G";

    const text = document.createElement("span");
    text.textContent = `Google · ${profile.label}`;

    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";

    link.append(mark, text, arrow);
    reviewsProfileLinks.append(link);
  });
}

function renderReviewDots(totalReviews, visibleCount) {
  if (!reviewDots) return;
  reviewDots.replaceChildren();

  const pages = Number.isFinite(visibleCount) ? Math.max(1, totalReviews - visibleCount + 1) : totalReviews;
  if (pages <= 1) return;

  Array.from({ length: pages }).forEach((_, index) => {
    const dot = document.createElement("span");
    dot.classList.toggle("is-active", index === reviewOffset);
    reviewDots.append(dot);
  });
}

function renderCombinedReviews() {
  if (!reviewsData || !reviewsSection || !reviewsSummary || !reviewsList || !reviewsEmpty || !reviewsProfileLinks) {
    return;
  }

  const combined = getCombinedReviewsData(reviewsData);
  const reviews = combined.reviews
    .slice()
    .sort((a, b) => Number(Boolean(getReviewVisual(b))) - Number(Boolean(getReviewVisual(a))))
    .slice(0, maxCombinedReviews);

  reviewsSection.hidden = false;
  renderReviewSummary();
  renderReviewProfileLinks(combined.profileLinks);

  reviewsList.replaceChildren();
  reviews.forEach((review, index) => reviewsList.append(createReviewCard(review, index)));

  const showFallback = !reviews.length;
  reviewsList.hidden = showFallback;
  reviewsEmpty.hidden = !showFallback;
  reviewsEmpty.textContent = showFallback ? "" : "";
  renderReviewDots(0, 1);
  if (reviewTabs) reviewTabs.hidden = true;
  if (reviewPrev) reviewPrev.hidden = true;
  if (reviewNext) reviewNext.hidden = true;
}

async function initGoogleReviews() {
  if (!reviewsSection) return;

  try {
    const response = await fetch("/api/google-reviews", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("No se pudieron cargar reseñas");
    const data = await response.json();
    reviewsData = data;

    if (!hasAnyReviewLink(data) || !hasRenderableReviewTexts(data)) {
      reviewsSection.hidden = true;
      return;
    }

    renderCombinedReviews();
  } catch {
    reviewsSection.hidden = true;
  }
}

initGoogleReviews();

reviewTabButtons?.forEach((button) => {
  button.addEventListener("click", () => {
    activeReviewBranch = button.dataset.reviewBranch || activeReviewBranch;
    reviewOffset = 0;
    renderCombinedReviews();
  });
});

reviewPrev?.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 900px)").matches) {
    reviewsList?.scrollBy({ left: -Math.max(260, reviewsList.clientWidth * 0.9), behavior: "smooth" });
    return;
  }

  reviewOffset = Math.max(0, reviewOffset - 1);
  renderCombinedReviews();
});

reviewNext?.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 900px)").matches) {
    reviewsList?.scrollBy({ left: Math.max(260, reviewsList.clientWidth * 0.9), behavior: "smooth" });
    return;
  }

  const reviews = getCombinedReviewsData(reviewsData).reviews;
  reviewOffset = Math.min(Math.max(0, reviews.length - 3), reviewOffset + 1);
  renderCombinedReviews();
});

window.addEventListener("resize", () => {
  if (reviewsData) renderCombinedReviews();
});

const reviewsMetricsCarousel = reviewsSection?.querySelector("[data-reviews-metrics]");
let carouselReviewIndex = 0;
let carouselAutoplayTimer = null;
let carouselResumeTimer = null;
let carouselScrollSyncTimer = null;
const carouselAutoplayMs = 6400;
const carouselReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function isMobileReviewCarousel() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function getCarouselBranchLabel(key) {
  return key === "guadalajara" ? "Guadalajara" : "Monterrey";
}

function getCarouselBranch(data, key) {
  return data?.branches?.[key] || null;
}

function getCarouselBranchReviews(data, key) {
  const branch = getCarouselBranch(data, key);
  return (branch?.reviews || [])
    .filter((review) => getReviewText(review))
    .map((review) => ({
      ...review,
      branchKey: key,
      branchLabel: getCarouselBranchLabel(key),
      branchMapsUrl: branch?.mapsUrl || "",
    }));
}

function getCarouselCombinedReviews(data) {
  return getCombinedReviewsData(data).reviews
    .filter((review) => getReviewText(review))
    .sort((a, b) => Number(Boolean(getReviewVisual(b))) - Number(Boolean(getReviewVisual(a))))
    .slice(0, maxCombinedReviews);
}

function getCarouselActiveBranch(data) {
  if (getCarouselBranchReviews(data, activeReviewBranch).length) return activeReviewBranch;
  return Object.keys(data?.branches || {}).find((key) => getCarouselBranchReviews(data, key).length) || activeReviewBranch;
}

function getCarouselAvatar(review) {
  return review?.reviewerImage || review?.user?.thumbnail || review?.user?.image || review?.profile?.image || "";
}

function createGoogleWord() {
  const word = document.createElement("span");
  word.className = "google-word";
  "Google".split("").forEach((letter, index) => {
    const span = document.createElement("span");
    span.textContent = letter;
    span.dataset.color = String(index);
    word.append(span);
  });
  return word;
}

function createReviewExcerpt(text, maxLength = 132) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const slice = normalized.slice(0, maxLength + 1);
  const lastSpace = slice.lastIndexOf(" ");
  const excerpt = slice.slice(0, lastSpace > 80 ? lastSpace : maxLength).trim();
  return `${excerpt}...`;
}

function createCarouselReviewCard(review, index) {
  const article = document.createElement("article");
  article.className = "review-card";
  article.dataset.reviewIndex = String(index);

  const reviewText = getReviewText(review);
  const reviewAuthor = getReviewAuthor(review);
  const reviewLink = getReviewLink(review);
  const reviewVisual = getReviewVisual(review);
  const reviewDestination = getReviewDestination(review);
  const badgeText = reviewDestination || review.branchLabel || "";

  const figure = document.createElement("figure");
  figure.className = "review-photo";
  if (reviewVisual) {
    article.classList.add("has-review-visual");
    article.dataset.visualKind = reviewVisual.kind;
    const image = document.createElement("img");
    image.src = reviewVisual.src;
    image.alt = reviewDestination || "Foto asociada a la reseña";
    image.loading = "lazy";
    image.decoding = "async";
    figure.append(image);
  } else {
    figure.classList.add("is-empty");
    const empty = document.createElement("span");
    empty.textContent = "Reseña de viaje";
    figure.append(empty);
  }

  if (badgeText) {
    const badge = document.createElement("span");
    badge.className = "review-destination-badge";
    badge.textContent = `⌖ ${badgeText}`;
    figure.append(badge);
  }

  const body = document.createElement("div");
  body.className = "review-body";

  const stars = document.createElement("div");
  stars.className = "review-stars";
  stars.setAttribute("aria-label", `${review.rating || 0} de 5 estrellas`);
  stars.textContent = renderStars(review.rating);

  const text = document.createElement("p");
  text.className = "review-text";
  text.textContent = createReviewExcerpt(reviewText);

  const meta = document.createElement("div");
  meta.className = "review-meta";
  if (reviewAuthor) {
    const author = document.createElement("strong");
    author.textContent = reviewAuthor;
    meta.append(author);
  }
  const source = document.createElement("span");
  source.append(createGoogleWord());
  meta.append(source);

  body.append(stars, text, meta);

  const actions = document.createElement("div");
  actions.className = "review-actions";

  const more = document.createElement("button");
  more.className = "review-more";
  more.type = "button";
  more.textContent = "Ver más";
  more.addEventListener("click", () => {
    pauseCarouselAutoplay();
    openReviewModal(review, more);
  });
  actions.append(more);

  if (reviewLink) {
    const link = document.createElement("a");
    link.className = "review-google";
    link.href = reviewLink;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Ver reseña en Google ↗";
    actions.append(link);
  }

  article.append(figure, body, actions);
  return article;
}

function renderCarouselSummary(branch) {
  if (!reviewsSummary) return;
  reviewsSummary.replaceChildren();

  const combined = getCombinedReviewsData(reviewsData);
  const ratingValue = Number(combined.rating) > 0 ? Number(combined.rating) : Number(branch?.rating) || 0;
  const countValue = Number(combined.reviewCount) > 0 ? Number(combined.reviewCount) : Number(branch?.reviewCount) || 0;
  const rating = ratingValue > 0 ? ratingValue.toFixed(1) : "";
  const count = countValue > 0 ? reviewFormatter.format(countValue) : "";

  const ratingLine = document.createElement("strong");
  ratingLine.className = "reviews-rating-number";
  ratingLine.textContent = rating || "Google";
  reviewsSummary.append(ratingLine);

  const stars = document.createElement("span");
  stars.className = "rating-stars";
  stars.textContent = renderStars(ratingValue || 5);
  reviewsSummary.append(stars);

  if (count) {
    const countLine = document.createElement("span");
    countLine.className = "rating-count";
    countLine.append(document.createTextNode(`· ${count} opiniones en `), createGoogleWord());
    reviewsSummary.append(countLine);
  }
}

function renderCarouselTabs() {
  reviewTabButtons?.forEach((button) => {
    const branch = button.dataset.reviewBranch;
    const hasReviews = getCarouselBranchReviews(reviewsData, branch).length > 0;
    button.classList.toggle("is-active", branch === activeReviewBranch);
    button.disabled = !hasReviews;
  });
}

function renderCarouselMetrics(branch) {
  if (!reviewsMetricsCarousel) return;
  reviewsMetricsCarousel.replaceChildren();

  const combined = getCombinedReviewsData(reviewsData);
  const ratingValue = Number(combined.rating) > 0 ? Number(combined.rating) : Number(branch?.rating) || 0;
  const countValue = Number(combined.reviewCount) > 0 ? Number(combined.reviewCount) : Number(branch?.reviewCount) || 0;
  const rating = ratingValue > 0 ? ratingValue.toFixed(1) : "5.0";
  const count = countValue > 0 ? reviewFormatter.format(countValue) : "";
  const metrics = [
    { kind: "star", value: rating, label: "Calificación promedio" },
    { kind: "list", value: count ? `${count}+` : "+", label: "Opiniones reales" },
    { kind: "google", value: "Google", label: "Fuente de reseñas" },
    { kind: "pin", value: "MTY + GDL", label: "Sucursales activas" },
  ];

  metrics.forEach((metric) => {
    const item = document.createElement("article");
    const icon = document.createElement("span");
    icon.className = `review-metric-icon review-metric-icon-${metric.kind}`;
    icon.setAttribute("aria-hidden", "true");
    const copy = document.createElement("div");
    const value = document.createElement("strong");
    value.textContent = metric.value;
    const label = document.createElement("span");
    label.textContent = metric.label;
    copy.append(value, label);
    item.append(icon, copy);
    reviewsMetricsCarousel.append(item);
  });
}

function renderCarouselDots(totalReviews) {
  if (!reviewDots) return;
  reviewDots.replaceChildren();
  const visibleDots = Math.min(totalReviews, 6);
  if (visibleDots <= 1) return;
  const activeDot = totalReviews > visibleDots
    ? Math.round((carouselReviewIndex / Math.max(1, totalReviews - 1)) * (visibleDots - 1))
    : carouselReviewIndex;

  Array.from({ length: visibleDots }).forEach((_, index) => {
    const dot = document.createElement("span");
    dot.classList.toggle("is-active", index === activeDot);
    reviewDots.append(dot);
  });
}

function updateCarouselPositions() {
  const cards = [...reviewsList?.querySelectorAll(".review-card") || []];
  const total = cards.length;
  if (!total) return;
  carouselReviewIndex = ((carouselReviewIndex % total) + total) % total;

  cards.forEach((card, index) => {
    const diff = (index - carouselReviewIndex + total) % total;
    card.classList.toggle("is-active", diff === 0);
    card.classList.toggle("is-next", diff === 1);
    card.classList.toggle("is-prev", diff === total - 1);
    card.classList.toggle("is-hidden", diff !== 0 && diff !== 1 && diff !== total - 1);
  });

  renderCarouselDots(total);

  if (isMobileReviewCarousel()) {
    const activeCard = cards[carouselReviewIndex];
    reviewsList?.scrollTo({ left: Math.max(0, (activeCard?.offsetLeft || 0) - 18), behavior: "smooth" });
  }
}

function syncCarouselIndexFromScroll() {
  if (!reviewsList || !isMobileReviewCarousel()) return;
  const cards = [...reviewsList.querySelectorAll(".review-card")];
  const total = cards.length;
  if (!total) return;

  const scrollLeft = reviewsList.scrollLeft;
  let closestIndex = carouselReviewIndex;
  let closestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const distance = Math.abs((card.offsetLeft - 18) - scrollLeft);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  carouselReviewIndex = closestIndex;
  cards.forEach((card, index) => {
    const diff = (index - carouselReviewIndex + total) % total;
    card.classList.toggle("is-active", diff === 0);
    card.classList.toggle("is-next", diff === 1);
    card.classList.toggle("is-prev", diff === total - 1);
    card.classList.toggle("is-hidden", diff !== 0 && diff !== 1 && diff !== total - 1);
  });
  renderCarouselDots(total);
}

function goToCarouselReview(index, fromUser = false) {
  const total = reviewsList?.querySelectorAll(".review-card").length || 0;
  if (!total) return;
  carouselReviewIndex = ((index % total) + total) % total;
  updateCarouselPositions();
  if (fromUser) {
    pauseCarouselAutoplay();
    scheduleCarouselAutoplay();
  }
}

function stopCarouselAutoplay() {
  window.clearInterval(carouselAutoplayTimer);
  carouselAutoplayTimer = null;
}

function startCarouselAutoplay() {
  stopCarouselAutoplay();
  if (carouselReduceMotion) return;
  if (isMobileReviewCarousel()) return;
  const total = reviewsList?.querySelectorAll(".review-card").length || 0;
  if (total <= 1) return;
  carouselAutoplayTimer = window.setInterval(() => goToCarouselReview(carouselReviewIndex + 1), carouselAutoplayMs);
}

function pauseCarouselAutoplay() {
  stopCarouselAutoplay();
  window.clearTimeout(carouselResumeTimer);
}

function scheduleCarouselAutoplay() {
  window.clearTimeout(carouselResumeTimer);
  if (carouselReduceMotion || document.body.classList.contains("is-review-modal-open")) return;
  carouselResumeTimer = window.setTimeout(startCarouselAutoplay, 4200);
}

function renderReviewsCarousel() {
  if (!reviewsData || !reviewsSection || !reviewsSummary || !reviewsList || !reviewsEmpty) return;

  const reviews = getCarouselCombinedReviews(reviewsData);
  carouselReviewIndex = Math.min(Math.max(0, carouselReviewIndex), Math.max(0, reviews.length - 1));

  reviewsSection.hidden = false;
  reviewsSection.classList.add("is-carousel-reviews");
  renderCarouselSummary();
  renderCarouselMetrics();

  reviewsList.replaceChildren();
  reviews.forEach((review, index) => reviewsList.append(createCarouselReviewCard(review, index)));

  const showFallback = !reviews.length;
  reviewsList.hidden = showFallback;
  reviewsEmpty.hidden = !showFallback;
  reviewsEmpty.textContent = showFallback ? "" : "";
  if (reviewPrev) reviewPrev.hidden = reviews.length <= 1;
  if (reviewNext) reviewNext.hidden = reviews.length <= 1;
  updateCarouselPositions();
  startCarouselAutoplay();
}

async function initReviewsCarousel() {
  if (!reviewsSection) return;
  try {
    const response = await fetch("/api/google-reviews", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("No se pudieron cargar reseñas");
    reviewsData = await response.json();
    if (!hasAnyReviewLink(reviewsData) || !hasRenderableReviewTexts(reviewsData)) {
      reviewsSection.hidden = true;
      return;
    }
    renderReviewsCarousel();
  } catch {
    reviewsSection.hidden = true;
  }
}

initReviewsCarousel();

reviewTabButtons?.forEach((button) => {
  button.addEventListener("click", () => {
    activeReviewBranch = button.dataset.reviewBranch || activeReviewBranch;
    carouselReviewIndex = 0;
    pauseCarouselAutoplay();
    renderReviewsCarousel();
    scheduleCarouselAutoplay();
  });
});

reviewPrev?.addEventListener("click", (event) => {
  event.stopImmediatePropagation();
  pauseCarouselAutoplay();
  goToCarouselReview(carouselReviewIndex - 1, true);
}, true);
reviewNext?.addEventListener("click", (event) => {
  event.stopImmediatePropagation();
  pauseCarouselAutoplay();
  goToCarouselReview(carouselReviewIndex + 1, true);
}, true);
reviewsSection?.addEventListener("mouseenter", pauseCarouselAutoplay);
reviewsSection?.addEventListener("mouseleave", scheduleCarouselAutoplay);
reviewsList?.addEventListener("pointerdown", pauseCarouselAutoplay, { passive: true });
reviewsList?.addEventListener("touchstart", pauseCarouselAutoplay, { passive: true });
reviewsList?.addEventListener("scroll", () => {
  if (!isMobileReviewCarousel()) return;
  pauseCarouselAutoplay();
  window.clearTimeout(carouselScrollSyncTimer);
  carouselScrollSyncTimer = window.setTimeout(() => {
    syncCarouselIndexFromScroll();
    scheduleCarouselAutoplay();
  }, 140);
}, { passive: true });
window.addEventListener("resize", () => {
  if (reviewsData) updateCarouselPositions();
});

const baseCloseReviewModal = closeReviewModal;
closeReviewModal = function closeReviewModalAndResume() {
  baseCloseReviewModal();
  scheduleCarouselAutoplay();
};

function initBranchMaps() {
  if (!branchMapCanvases.length) return;

  if (!window.L) {
    branchMapCanvases.forEach((canvas) => canvas.classList.add("is-map-unavailable"));
    return;
  }

  branchMapCanvases.forEach((canvas) => {
    if (canvas.dataset.mapReady === "true") return;

    const lat = Number(canvas.dataset.lat);
    const lng = Number(canvas.dataset.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      canvas.classList.add("is-map-unavailable");
      return;
    }

    const map = window.L.map(canvas, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
      touchZoom: false,
    }).setView([lat, lng], 16);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);

    window.L.marker([lat, lng], {
      interactive: false,
      keyboard: false,
      title: canvas.dataset.mapLabel || "deviaje",
      icon: window.L.divIcon({
        className: "branch-map-pin",
        html: "",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      }),
    }).addTo(map);

    canvas.dataset.mapReady = "true";
    window.setTimeout(() => map.invalidateSize(), 160);
  });
}

if (document.readyState === "complete") {
  initBranchMaps();
} else {
  window.addEventListener("load", initBranchMaps, { once: true });
}

const destinationTrack = document.querySelector("[data-destination-track]");
const destinationPrev = document.querySelector("[data-destination-prev]");
const destinationNext = document.querySelector("[data-destination-next]");

function scrollDestinations(direction) {
  destinationTrack?.scrollBy({
    left: direction * Math.max(280, destinationTrack.clientWidth * 0.58),
    behavior: "smooth",
  });
}

destinationPrev?.addEventListener("click", () => scrollDestinations(-1));
destinationNext?.addEventListener("click", () => scrollDestinations(1));

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -40px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const parallaxItems = document.querySelectorAll("[data-parallax]");
let ticking = false;

function updateParallax() {
  const scrollY = window.scrollY;
  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallax || 0);
    item.style.setProperty("--parallax-y", `${scrollY * speed}px`);
  });
  ticking = false;
}

if (!reduceMotion && parallaxItems.length) {
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateParallax();
}
