"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
} from "lucide-react";
import { t, type Locale, type Localized } from "../data/content";

export type GalleryItem = {
  src: string;
  alt: Localized;
  caption: Localized;
  author?: string;
  sourceUrl?: string;
  license?: string;
  licenseUrl?: string;
};

export function PhotoGallery({
  items,
  locale,
  label,
}: {
  items: GalleryItem[];
  locale: Locale;
  label?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const en = locale === "en";
  const item = selected === null ? null : items[selected];
  useEffect(() => {
    if (selected === null || !modal.current) return;
    const dialog = modal.current;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("is-photo-modal-open");
    return () => {
      document.body.classList.remove("is-photo-modal-open");
    };
  }, [selected]);
  function close() {
    modal.current?.close();
    setSelected(null);
    trigger.current?.focus({ preventScroll: true });
  }
  function move(delta: number) {
    setSelected((index) =>
      index === null ? null : (index + delta + items.length) % items.length,
    );
  }
  if (!items.length) return null;
  return (
    <div className="editorial-gallery">
      {label && <p className="eyebrow">{label}</p>}
      <div
        className="photo-gallery-track"
        aria-label={
          label || (en ? "Destination gallery" : "Galería del destino")
        }
      >
        {items.map((photo, index) => (
          <figure className="gallery-frame" key={photo.src}>
            <button
              type="button"
              className="gallery-open"
              aria-label={`${en ? "Enlarge photo" : "Ampliar foto"}: ${t(photo.alt, locale)}`}
              onClick={(event) => {
                trigger.current = event.currentTarget;
                setSelected(index);
              }}
            >
              <Image
                src={photo.src}
                alt={t(photo.alt, locale)}
                width={1200}
                height={900}
                sizes="(max-width: 700px) 85vw, 50vw"
              />
              <span aria-hidden="true">
                <Expand size={18} />
              </span>
            </button>
            <figcaption>
              {t(photo.caption, locale)}
              {photo.author && (
                <small className="gallery-attribution">
                  {photo.author}
                  {photo.licenseUrl && (
                    <a
                      href={photo.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      · {photo.license}
                    </a>
                  )}
                </small>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      <dialog
        ref={modal}
        className="gallery-dialog"
        aria-label={en ? "Photo viewer" : "Visor de fotografías"}
        onClose={() => {
          setSelected(null);
          trigger.current?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
        }}
      >
        {item && (
          <div className="gallery-dialog-inner">
            <button
              className="gallery-close icon-control"
              type="button"
              onClick={close}
              aria-label={en ? "Close gallery" : "Cerrar galería"}
              autoFocus
            >
              <X size={24} />
            </button>
            <img
              className="gallery-full-image"
              src={item.src}
              alt={t(item.alt, locale)}
            />
            <div className="gallery-caption">
              <div>
                <p>{t(item.caption, locale)}</p>
                {item.author && <small>{item.author}</small>}
                {item.licenseUrl && (
                  <a
                    href={item.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.license}
                  </a>
                )}
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {en ? "Photo source" : "Fuente de la foto"}
                    <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
              {items.length > 1 && (
                <div className="gallery-controls">
                  <button
                    className="icon-control"
                    type="button"
                    onClick={() => move(-1)}
                    aria-label={en ? "Previous photo" : "Foto anterior"}
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <span aria-live="polite">
                    {selected! + 1} / {items.length}
                  </span>
                  <button
                    className="icon-control"
                    type="button"
                    onClick={() => move(1)}
                    aria-label={en ? "Next photo" : "Foto siguiente"}
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
