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
  const message = anchor.dataset.message || "Hola deviaje, quiero hablar con un asesor para planear mi viaje.";
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
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroImage && !reduceMotion) {
  let slideIndex = 0;
  setInterval(() => {
    slideIndex = (slideIndex + 1) % heroSlides.length;
    heroImage.style.opacity = "0";
    window.setTimeout(() => {
      heroImage.src = heroSlides[slideIndex];
      heroImage.style.opacity = "1";
    }, 220);
  }, 5600);
}

const reviewsSection = document.querySelector("[data-google-reviews]");
const reviewsSummary = reviewsSection?.querySelector("[data-reviews-summary]");
const reviewsList = reviewsSection?.querySelector("[data-reviews-list]");
const reviewsEmpty = reviewsSection?.querySelector("[data-reviews-empty]");
const reviewsGoogleLink = reviewsSection?.querySelector("[data-reviews-google-link]");
const reviewFormatter = new Intl.NumberFormat("es-MX");
let reviewsData = null;

function hasBranchReviewData(branch) {
  return Boolean(branch && (Number(branch.rating) > 0 || Number(branch.reviewCount) > 0 || branch.reviews?.length));
}

function hasAnyReviewLink(data) {
  return Object.values(data?.branches || {}).some((branch) => branch.mapsUrl);
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

function getCombinedReviewsData(data) {
  const branches = Object.values(data?.branches || {});
  const reviews = branches.flatMap((branch) => {
    return (branch?.reviews || []).filter((review) => getReviewText(review));
  });
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
    mapsUrl: branches.find((branch) => branch?.mapsUrl)?.mapsUrl || "",
    reviews,
  };
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

function createReviewCard(review, index) {
  const article = document.createElement("article");
  article.className = "review-card";
  if (index === 0) article.classList.add("is-featured");
  if (index === 2) article.classList.add("is-soft");

  const reviewText = getReviewText(review);
  const reviewAuthor = getReviewAuthor(review);
  const reviewLink = getReviewLink(review);
  const shouldExpand = reviewText.length > (index === 0 ? 260 : 170);

  const body = document.createElement("div");
  const stars = document.createElement("div");
  stars.className = "review-stars";
  stars.setAttribute("aria-label", `${review.rating || 0} de 5 estrellas`);
  stars.textContent = renderStars(review.rating);

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

  body.append(stars, text, meta);
  article.append(body);

  const actions = document.createElement("div");
  actions.className = "review-actions";

  if (shouldExpand) {
    const more = document.createElement("button");
    more.className = "review-more";
    more.type = "button";
    more.textContent = "Leer completa";
    more.addEventListener("click", () => {
      const expanded = article.classList.toggle("is-expanded");
      more.textContent = expanded ? "Contraer" : "Leer completa";
    });
    actions.append(more);
  }

  if (reviewLink) {
    const link = document.createElement("a");
    link.className = "review-google";
    link.href = reviewLink;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Ver reseña en Google ↗";
    actions.append(link);
  }

  if (actions.children.length) {
    article.append(actions);
  }

  return article;
}

function renderCombinedReviews() {
  if (!reviewsData || !reviewsSection || !reviewsSummary || !reviewsList || !reviewsEmpty || !reviewsGoogleLink) {
    return;
  }

  const branch = getCombinedReviewsData(reviewsData);
  const reviews = branch.reviews;
  const hasData = hasBranchReviewData(branch);

  reviewsSection.hidden = false;

  reviewsSummary.replaceChildren();
  if (hasData) {
    const icon = document.createElement("span");
    icon.className = "reviews-summary-star";
    icon.textContent = "★";

    const copy = document.createElement("div");
    const rating = Number(branch.rating) > 0 ? Number(branch.rating).toFixed(1) : "";
    const count = Number(branch.reviewCount) > 0 ? reviewFormatter.format(branch.reviewCount) : "";
    const ratingLine = document.createElement("strong");
    ratingLine.textContent = rating ? `${rating} en Google` : "Google";
    copy.append(ratingLine);

    if (count) {
      const countLine = document.createElement("span");
      countLine.textContent = `${count} opiniones en Google`;
      copy.append(countLine);
    }

    reviewsSummary.append(icon, copy);
  } else {
    reviewsSummary.textContent = "Google";
  }

  reviewsList.replaceChildren();
  reviews.slice(0, 3).forEach((review, index) => reviewsList.append(createReviewCard(review, index)));

  const showFallback = !reviews.length;
  reviewsList.hidden = showFallback;
  reviewsEmpty.hidden = !showFallback;
  reviewsEmpty.textContent = showFallback ? "" : "";
  reviewsGoogleLink.href = branch.mapsUrl || "#sucursales";
}

async function initGoogleReviews() {
  if (!reviewsSection) return;

  try {
    const response = await fetch("/api/google-reviews", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("No se pudieron cargar reseñas");
    const data = await response.json();
    reviewsData = data;

    if (!hasAnyReviewLink(data)) {
      reviewsSection.hidden = true;
      return;
    }

    renderCombinedReviews();
  } catch {
    reviewsSection.hidden = true;
  }
}

initGoogleReviews();

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
