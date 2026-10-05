"use client"

import FlipCard from "@/components/FlipCard"
import type { FleetCategory } from "@/content/types"
import { useTranslations } from "next-intl"
import Image from "next/image"
import {
  useEffect,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react"

type FleetBusFlipCardProps = {
  bus: FleetCategory
  onShowMore: () => void
  flipped: boolean
  width: number
  height: number
}

const GENERIC_DETAIL_KEYS = [
  "detailClimate",
  "detailSafety",
  "detailConnectivity",
  "detailComfort",
] as const

export const FleetBusFlipCard = ({
  bus,
  onShowMore,
  flipped,
  width,
  height,
}: FleetBusFlipCardProps) => {
  const t = useTranslations("fleetViewer")
  const tCommon = useTranslations("common")

  const handleShowMore = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    onShowMore()
  }

  const handleShowMorePointer = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
  }

  const handleShowMoreKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.stopPropagation()
    event.preventDefault()
    onShowMore()
  }

  return (
    <div className="pointer-events-none h-full w-full">
      <FlipCard
        flipped={flipped}
        flipOnClick={false}
        draggable={false}
        tilt={false}
        glare
        width={width}
        height={height}
        radius={16}
        background="var(--brand-surface-elevated)"
        color="var(--brand-ink)"
        shadow={false}
        glareOpacity={0.12}
        hoverScale={1}
        ariaLabel={`${bus.name}: ${t("flipHint")}`}
        className="fleet-flip-card !max-w-none"
        front={
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={bus.coverImage}
              alt={bus.name}
              fill
              className="object-cover"
              sizes="(max-width:768px) 80vw, 420px"
              draggable={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
              <p className="text-lg font-semibold tracking-tight sm:text-xl">
                {bus.name}
              </p>
              <p className="mt-1 text-sm text-white/75">
                {tCommon("seats")}: {bus.seatsLabel}
              </p>
            </div>
          </div>
        }
        back={
          <div data-lenis-prevent className="flex h-full flex-col gap-2.5 overflow-y-auto p-4 sm:gap-3 sm:p-5">
            <div>
              <p className="font-label text-[0.65rem] font-semibold tracking-[0.14em] text-orange uppercase">
                {t("detailsLabel")}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
                {bus.name}
              </h3>
              <p className="mt-1 text-xs text-ink-muted sm:text-sm">
                {tCommon("seats")}: {bus.seatsLabel}
              </p>
            </div>

            <p className="line-clamp-2 text-xs leading-relaxed text-ink/75 sm:line-clamp-3 sm:text-sm">
              {bus.summary}
            </p>

            <ul className="grid grid-cols-2 gap-1.5">
              {GENERIC_DETAIL_KEYS.map((key) => (
                <li
                  key={key}
                  className="rounded-md bg-surface-muted/90 px-2 py-1.5 text-start text-[11px] leading-snug text-ink/80 sm:text-xs"
                >
                  {t(key)}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleShowMore}
                onPointerDown={handleShowMorePointer}
                onPointerUp={handleShowMorePointer}
                onKeyDown={handleShowMoreKeyDown}
                className="pointer-events-auto rounded-lg bg-orange px-3.5 py-2 text-sm font-semibold text-white hover:bg-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                tabIndex={0}
                aria-label={t("showMore")}
              >
                {t("showMore")}
              </button>
            </div>
          </div>
        }
      />
    </div>
  )
}

type FleetMoreImagesModalProps = {
  bus: FleetCategory
  open: boolean
  onClose: () => void
}

const PLACEHOLDER_COUNT = 6

export const FleetMoreImagesModal = ({
  bus,
  open,
  onClose,
}: FleetMoreImagesModalProps) => {
  const t = useTranslations("fleetViewer")

  useEffect(() => {
    if (!open) return
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  const realImages = [...bus.exteriorImages, ...bus.interiorImages].filter(
    Boolean,
  )
  const slots = Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => ({
    id: `${bus.id}-slot-${index}`,
    src: realImages[index] ?? null,
  }))

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fleet-more-images-title"
        data-lenis-prevent
        className="max-h-[min(88dvh,40rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-surface-elevated p-5 text-ink shadow-md sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="fleet-more-images-title"
              className="font-display text-2xl font-semibold tracking-tight"
            >
              {t("moreImagesTitle")}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {bus.name}: {t("moreImagesSubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-ink-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            tabIndex={0}
            aria-label={t("close")}
          >
            {t("close")}
          </button>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((slot, index) => (
            <li
              key={slot.id}
              className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-muted ring-1 ring-ink/8"
            >
              {slot.src ? (
                <Image
                  src={slot.src}
                  alt={`${bus.name} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 45vw, 220px"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 px-3 text-center">
                  <span className="text-xs font-medium text-ink/70">
                    {t("imagePlaceholder")}
                  </span>
                  <span className="text-[11px] text-ink/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
