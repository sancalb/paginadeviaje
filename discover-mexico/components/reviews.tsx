"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { destinations, type Locale } from "../data/content";

type Review = {
  reviewId?: string;
  text: string;
  rating: number;
  author?: string;
  url?: string;
  image?: string;
  images?: string[];
  translation?: {
    text: string;
    sourceLanguage: "es";
    targetLanguage: "en";
    translator: string;
  };
};
type Branch = {
  name?: string;
  rating: number | null;
  reviewCount: number;
  mapsUrl: string;
  reviews: Review[];
};
type Story = Review & {
  key: string;
  branchLabel: string;
  mexico: boolean;
  destination?: (typeof destinations)[number];
};

function safeUrl(value?: string) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const destinationMatchers = destinations.map((destination) => {
  const names = new Set([destination.name.en, destination.name.es]);
  if (destination.slug === "mexico-city") names.add("CDMX");
  if (destination.slug === "los-cabos") names.add("Cabo San Lucas");
  const alternatives = [...names].map((name) =>
    normalize(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  return {
    destination,
    pattern: new RegExp(
      `(?:^|[^a-z0-9])(${alternatives.join("|")})(?=$|[^a-z0-9])`,
      "g",
    ),
  };
});

function matchDestination(text: string) {
  const normalized = normalize(text);
  const matches = destinationMatchers.filter(({ destination, pattern }) => {
    pattern.lastIndex = 0;
    for (const match of normalized.matchAll(pattern)) {
      // These catalog names can refer to an office or a drink, not a trip.
      if (["guadalajara", "tequila"].includes(destination.slug)) {
        const before = normalized.slice(
          Math.max(0, match.index - 70),
          match.index,
        );
        if (
          !/\b(?:viaj(?:e|es|ar|amos)|visita(?:mos|r)?|tour|trip|travel(?:ed|led)?|visit(?:ed)?|vacaciones|vacation|destino|recorrido|excursion)\b[^.!?\n]{0,40}\b(?:a|en|por|to|in|around)\s*(?:la ciudad de\s*)?$/.test(
            before,
          )
        )
          continue;
      }
      return true;
    }
    return false;
  });
  // Do not assign a single destination to an ambiguous multi-stop quote.
  return {
    mexico: matches.length > 0,
    destination: matches.length === 1 ? matches[0].destination : undefined,
  };
}

function combineReviews(branches: Record<string, Branch>): Story[] {
  const groups = Object.entries(branches).map(([key, branch]) =>
    (branch.reviews || [])
      .filter((review) => review.text?.trim())
      .map((review) => ({
        ...review,
        key:
          review.reviewId ||
          safeUrl(review.url) ||
          `${review.author || ""}\n${review.text.trim()}`,
        url: safeUrl(review.url) || safeUrl(branch.mapsUrl),
        branchLabel:
          key === "guadalajara"
            ? "Guadalajara"
            : key === "monterrey"
              ? "Monterrey"
              : branch.name || "",
        ...matchDestination(review.text),
      })),
  );
  const seen = new Set<string>();
  const combined: Story[] = [];
  const longest = Math.max(0, ...groups.map((group) => group.length));
  for (let index = 0; index < longest; index++) {
    for (const group of groups) {
      const review = group[index];
      if (!review) continue;
      const quote = `${review.author || ""}\n${review.text.trim()}`;
      if (seen.has(review.key) || seen.has(quote)) continue;
      seen.add(review.key);
      seen.add(quote);
      combined.push(review);
    }
  }
  return combined
    .sort((a, b) => Number(b.mexico) - Number(a.mexico))
    .slice(0, 10);
}

function stars(rating: number) {
  const value = Number.isFinite(rating)
    ? Math.max(0, Math.min(5, Math.round(rating)))
    : 0;
  return "★".repeat(value) + "☆".repeat(5 - value);
}

function excerpt(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= 132) return normalized;
  const slice = normalized.slice(0, 133);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 80 ? lastSpace : 132).trim()}...`;
}

function GoogleWord() {
  return (
    <span className="google-word">
      {"Google".split("").map((letter, index) => (
        <span key={index} data-color={index}>
          {letter}
        </span>
      ))}
    </span>
  );
}

function useReviewImage(review: Review) {
  const [loaded, setLoaded] = useState<{ review: Review; src: string } | null>(
    null,
  );
  useEffect(() => {
    let cancelled = false;
    let pending: HTMLImageElement | null = null;
    const sources = [
      ...new Set(
        [review.image, ...(review.images || [])]
          .map(safeUrl)
          .filter((src): src is string => Boolean(src)),
      ),
    ];
    function load(index: number) {
      if (cancelled || index >= sources.length) return;
      const image = new Image();
      pending = image;
      image.onload = () => {
        if (!cancelled && image.naturalWidth > 0)
          setLoaded({ review, src: sources[index] });
      };
      image.onerror = () => load(index + 1);
      image.src = sources[index];
    }
    load(0);
    return () => {
      cancelled = true;
      if (pending) pending.onload = pending.onerror = null;
    };
  }, [review]);
  return loaded?.review === review ? loaded.src : undefined;
}

function ReviewCard({
  review,
  index,
  total,
  active,
  mobile,
  locale,
  onOpen,
}: {
  review: Story;
  index: number;
  total: number;
  active: number;
  mobile: boolean;
  locale: Locale;
  onOpen: (review: Story, trigger: HTMLButtonElement) => void;
}) {
  const src = useReviewImage(review);
  const [failed, setFailed] = useState<string>();
  const image = src && src !== failed ? src : undefined;
  const diff = (index - active + total) % total;
  const position =
    diff === 0
      ? "is-active"
      : diff === 1
        ? "is-next"
        : diff === total - 1
          ? "is-prev"
          : "is-hidden";
  const hidden = !mobile && position === "is-hidden";
  const en = locale === "en";
  const translation = en ? review.translation : undefined;
  return (
    <article
      className={`review-card ${position}${image ? " has-review-visual" : ""}`}
      data-review-index={index}
      data-visual-kind={image ? "review" : undefined}
      role="group"
      aria-roledescription={en ? "slide" : "diapositiva"}
      aria-label={`${index + 1} / ${total}`}
      aria-hidden={hidden || undefined}
      inert={hidden}
    >
      {image && (
        <figure className="review-photo">
          <img
            src={image}
            alt={
              en
                ? "Photo from this Google review"
                : "Foto de esta reseña de Google"
            }
            decoding="async"
            onError={() => setFailed(image)}
          />
          {review.destination && (
            <span className="review-destination-badge">
              {review.destination.name[locale]}
            </span>
          )}
        </figure>
      )}
      <div className="review-body">
        <div
          className="review-stars"
          aria-label={`${review.rating} ${en ? "out of 5 stars" : "de 5 estrellas"}`}
        >
          {stars(review.rating)}
        </div>
        <p className="review-text" lang={translation ? "en" : undefined}>
          {excerpt(translation?.text || review.text)}
        </p>
        {translation && (
          <small className="review-translation">Translated from Spanish</small>
        )}
        <div className="review-meta">
          {review.author && <strong>{review.author}</strong>}
          <span>
            <GoogleWord />
          </span>
        </div>
      </div>
      <div className="review-actions">
        <button
          className="review-more"
          type="button"
          onClick={(event) => onOpen(review, event.currentTarget)}
        >
          {en ? "Read more" : "Ver más"}
        </button>
        {review.url && (
          <a
            className="review-google"
            href={review.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {en ? "View on Google" : "Ver en Google"}{" "}
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}

function ReviewModal({
  review,
  locale,
  onClose,
  returnFocus,
}: {
  review: Story;
  locale: Locale;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  const close = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const src = useReviewImage(review);
  const [failed, setFailed] = useState<string>();
  const image = src && src !== failed ? src : undefined;
  const en = locale === "en";
  const [original, setOriginal] = useState(false);
  const translation = en ? review.translation : undefined;
  useEffect(() => {
    const trigger = returnFocus.current;
    const alreadyLocked = document.body.classList.contains(
      "is-review-modal-open",
    );
    document.body.classList.add("is-review-modal-open");
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const controls = panel.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]),a[href]",
      );
      if (!controls?.length) return;
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const keepFocus = (event: FocusEvent) => {
      if (!panel.current?.contains(event.target as Node))
        close.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", keepFocus);
    return () => {
      if (!alreadyLocked)
        document.body.classList.remove("is-review-modal-open");
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", keepFocus);
      trigger?.focus({ preventScroll: true });
      document.dispatchEvent(new Event("review-close"));
    };
  }, [onClose, returnFocus]);
  return (
    <div className="review-modal">
      <button
        className="review-modal-backdrop"
        type="button"
        tabIndex={-1}
        aria-label={en ? "Close review" : "Cerrar reseña"}
        onClick={onClose}
      />
      <section
        ref={panel}
        className="review-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <button
          ref={close}
          className="review-modal-close"
          type="button"
          aria-label={en ? "Close review" : "Cerrar reseña"}
          onClick={onClose}
        />
        <figure className="review-modal-visual" hidden={!image}>
          {image && (
            <img
              src={image}
              alt={
                en
                  ? "Photo from this Google review"
                  : "Foto de esta reseña de Google"
              }
              onError={() => setFailed(image)}
            />
          )}
        </figure>
        <div className="review-modal-copy">
          <div className="review-stars" aria-label={`${review.rating}/5`}>
            {stars(review.rating)}
          </div>
          <h3 id="review-modal-title">{review.author || "Google"}</h3>
          <p className="review-modal-source">
            <GoogleWord />
          </p>
          {translation && (
            <div className="review-translation-controls">
              <small>Translated from Spanish · Translation by deviaje.mx</small>
              <button
                className="review-more"
                type="button"
                aria-pressed={original}
                onClick={() => setOriginal((value) => !value)}
              >
                {original ? "Read in English" : "Read original in Spanish"}
              </button>
            </div>
          )}
          <p
            className="review-modal-text"
            lang={translation ? (original ? "es" : "en") : undefined}
          >
            {translation && !original ? translation.text : review.text}
          </p>
          {review.url && (
            <a
              className="review-google"
              href={review.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {en ? "View review on Google" : "Ver reseña en Google"}{" "}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

export function Reviews({
  locale,
  preferredDestination,
  packageContext = false,
}: {
  locale: Locale;
  preferredDestination?: string;
  packageContext?: boolean;
}) {
  const [branches, setBranches] = useState<Record<string, Branch>>({});
  const [selected, setSelected] = useState<Story | null>(null);
  const [active, setActive] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reviews = useMemo(() => {
    const sample = combineReviews(branches);
    return preferredDestination
      ? sample.sort(
          (a, b) =>
            Number(b.destination?.slug === preferredDestination) -
            Number(a.destination?.slug === preferredDestination),
        )
      : sample;
  }, [branches, preferredDestination]);
  const en = locale === "en";
  const closeModal = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/google-reviews", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.branches && !controller.signal.aborted)
          setBranches(data.branches);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const screen = window.matchMedia("(max-width: 900px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setMobile(screen.matches);
      setReduceMotion(motion.matches);
      setVisible(document.visibilityState === "visible");
    };
    sync();
    screen.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      screen.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

  const autoplay =
    reviews.length > 1 &&
    !mobile &&
    !reduceMotion &&
    visible &&
    !hovered &&
    !focused &&
    !selected &&
    !paused;
  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(
      () => setActive((index) => (index + 1) % reviews.length),
      6400,
    );
    return () => clearInterval(timer);
  }, [autoplay, reviews.length, active]);

  function goTo(index: number) {
    if (!reviews.length) return;
    const next = (index + reviews.length) % reviews.length;
    setActive(next);
    if (mobile && track.current) {
      const card = track.current.children[next] as HTMLElement | undefined;
      if (card)
        track.current.scrollTo({
          left: Math.max(0, card.offsetLeft - 18),
          behavior: reduceMotion ? "instant" : "smooth",
        });
    }
  }

  function syncScroll() {
    if (!mobile) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (!track.current) return;
      const list = track.current;
      let closest = 0,
        distance = Infinity;
      Array.from(list.children).forEach((child, index) => {
        const delta = Math.abs(
          Math.max(0, (child as HTMLElement).offsetLeft - 18) - list.scrollLeft,
        );
        if (delta < distance) {
          closest = index;
          distance = delta;
        }
      });
      setActive(closest);
    }, 140);
  }

  const list = Object.values(branches);
  const count = list.reduce((sum, branch) => sum + branch.reviewCount, 0);
  const rated = list.filter(
    (branch) =>
      branch.rating !== null && branch.rating > 0 && branch.reviewCount > 0,
  );
  const ratedCount = rated.reduce((sum, branch) => sum + branch.reviewCount, 0);
  const rating = ratedCount
    ? rated.reduce(
        (sum, branch) => sum + (branch.rating || 0) * branch.reviewCount,
        0,
      ) / ratedCount
    : 0;
  const dotCount = Math.min(6, reviews.length);
  const activeDot =
    reviews.length > dotCount
      ? Math.round((active / (reviews.length - 1)) * (dotCount - 1))
      : active;

  return (
    <>
      <section
        className="section reviews-section is-carousel-reviews"
        id="resenas"
        data-google-reviews
        hidden={!reviews.length}
        inert={Boolean(selected)}
        aria-labelledby="reviews-title"
        aria-roledescription={en ? "carousel" : "carrusel"}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setFocused(false);
        }}
      >
        <div className="reviews-inner">
          <div className="reviews-heading reveal is-visible">
            <div className="reviews-heading-copy">
              <span className="reviews-heading-star" aria-hidden="true">
                ★
              </span>
              <p className="eyebrow">
                {packageContext
                  ? en
                    ? "Travel With Confidence"
                    : "Viaja con confianza"
                  : en
                    ? "Travelers who trusted us"
                    : "Viajeros que ya confiaron"}
              </p>
              <h2 id="reviews-title">
                {packageContext
                  ? en
                    ? "Our travelers, in their own words."
                    : "Nuestros viajeros, en sus propias palabras."
                  : en
                    ? "What our travelers say"
                    : "Lo que dicen nuestros viajeros"}
              </h2>
              <p className="reviews-subtitle">
                {packageContext
                  ? en
                    ? "Reviews of deviaje.mx, not endorsements of this specific package."
                    : "Reseñas de deviaje.mx, no testimonios de este paquete específico."
                  : en
                    ? "Real experiences, journeys that happened."
                    : "Experiencias reales, viajes que sí sucedieron."}
              </p>
              <aside
                className="reviews-summary"
                data-reviews-summary
                aria-label={en ? "Google rating" : "Calificación en Google"}
              >
                {rating > 0 && (
                  <>
                    <strong className="reviews-rating-number">
                      {rating.toFixed(1)}
                    </strong>
                    <span
                      className="rating-stars"
                      aria-label={`${rating.toFixed(1)}/5`}
                    >
                      {stars(rating)}
                    </span>
                  </>
                )}
                {count > 0 && (
                  <span className="rating-count">
                    ·{" "}
                    {new Intl.NumberFormat(en ? "en-US" : "es-MX").format(
                      count,
                    )}{" "}
                    {en ? "reviews on" : "opiniones en"} <GoogleWord />
                  </span>
                )}
              </aside>
            </div>
          </div>
          <div className="reviews-shell reveal is-visible">
            <div className="reviews-content">
              <button
                className="carousel-arrow reviews-arrow reviews-arrow-prev"
                type="button"
                data-review-prev
                hidden={reviews.length <= 1}
                aria-controls="reviews-stories"
                aria-label={en ? "Previous review" : "Reseña anterior"}
                onClick={() => goTo(active - 1)}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <div className="reviews-viewport">
                <div
                  ref={track}
                  className="reviews-stories"
                  id="reviews-stories"
                  data-reviews-list
                  aria-live={autoplay ? "off" : "polite"}
                  tabIndex={mobile ? 0 : undefined}
                  aria-label={en ? "Traveler reviews" : "Reseñas de viajeros"}
                  onScroll={syncScroll}
                  onKeyDown={(event) => {
                    if (
                      event.key === "ArrowLeft" ||
                      event.key === "ArrowRight"
                    ) {
                      event.preventDefault();
                      goTo(active + (event.key === "ArrowRight" ? 1 : -1));
                    }
                  }}
                >
                  {reviews.map((review, index) => (
                    <ReviewCard
                      key={review.key}
                      review={review}
                      index={index}
                      total={reviews.length}
                      active={active}
                      mobile={mobile}
                      locale={locale}
                      onOpen={(story, trigger) => {
                        returnFocus.current = trigger;
                        setSelected(story);
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                className="carousel-arrow reviews-arrow reviews-arrow-next"
                type="button"
                data-review-next
                hidden={reviews.length <= 1}
                aria-controls="reviews-stories"
                aria-label={en ? "Next review" : "Siguiente reseña"}
                onClick={() => goTo(active + 1)}
              >
                <ChevronRight aria-hidden="true" />
              </button>
              <div className="review-dots" data-review-dots aria-hidden="true">
                {dotCount > 1 &&
                  Array.from({ length: dotCount }, (_, index) => (
                    <span
                      key={index}
                      className={index === activeDot ? "is-active" : undefined}
                    />
                  ))}
              </div>
              <div className="reviews-empty" data-reviews-empty hidden />
              <p className="reviews-trust-line">
                <span className="reviews-trust-icon" aria-hidden="true" />
                {en
                  ? "Reviews published on Google"
                  : "Opiniones publicadas en Google"}
                {!mobile && !reduceMotion && reviews.length > 1 && (
                  <button
                    className="review-more"
                    type="button"
                    aria-label={
                      paused
                        ? en
                          ? "Play reviews"
                          : "Reanudar reseñas"
                        : en
                          ? "Pause reviews"
                          : "Pausar reseñas"
                    }
                    title={
                      paused
                        ? en
                          ? "Play reviews"
                          : "Reanudar reseñas"
                        : en
                          ? "Pause reviews"
                          : "Pausar reseñas"
                    }
                    aria-pressed={paused}
                    onClick={() => setPaused((value) => !value)}
                  >
                    {paused ? (
                      <Play size={16} aria-hidden="true" />
                    ) : (
                      <Pause size={16} aria-hidden="true" />
                    )}
                  </button>
                )}
              </p>
              <p className="reviews-selection-note">
                {packageContext
                  ? en
                    ? "Selected agency reviews from both offices. When present in this sample, clear destination mentions appear first; they are not assigned to this package."
                    : "Selección de reseñas de ambas sucursales. Las menciones claras del destino dentro de esta muestra aparecen primero, sin atribuirlas a este paquete."
                  : en
                    ? "Selected reviews from both offices, prioritizing mentions of Mexico. See each office’s full profile below."
                    : "Selección de reseñas de ambas sucursales, priorizando menciones de México. Consulta los perfiles completos abajo."}
              </p>
            </div>
          </div>
        </div>
      </section>
      {selected && (
        <ReviewModal
          review={selected}
          locale={locale}
          onClose={closeModal}
          returnFocus={returnFocus}
        />
      )}
    </>
  );
}
