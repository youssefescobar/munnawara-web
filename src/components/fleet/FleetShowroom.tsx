"use client"

import { FleetCheck } from "@/components/fleet/FleetCheck"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/cn"
import type { FleetCategory } from "@/content/types"
import { useTranslations } from "next-intl"
import Image from "next/image"
import "./fleet.css"
import { useCallback, useEffect, useState } from "react"

type FleetShowroomProps = {
  categories: readonly FleetCategory[]
}

type Mode = "exterior" | "interior"

const Chevron = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("size-5 rtl:-scale-x-100", className)}
    aria-hidden
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const circleButton =
  "grid size-10 place-items-center rounded-full bg-surface-elevated/90 text-ink shadow-sm backdrop-blur transition hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"

export const FleetShowroom = ({ categories }: FleetShowroomProps) => {
  const t = useTranslations("fleetViewer")
  const tCommon = useTranslations("common")
  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState<Mode>("exterior")
  const [shot, setShot] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const bus = categories[index]
  const hasInterior = (bus?.interiorImages.length ?? 0) > 0
  const photos = bus
    ? mode === "interior" && hasInterior
      ? bus.interiorImages
      : bus.exteriorImages
    : []
  const count = photos.length
  const current = photos[Math.min(shot, count - 1)] ?? bus?.coverImage

  const step = useCallback(
    (delta: number) => setShot((s) => (s + delta + count) % Math.max(count, 1)),
    [count],
  )

  const selectBus = (next: number) => {
    setIndex(next)
    setMode("exterior")
    setShot(0)
  }

  const selectMode = (next: Mode) => {
    setMode(next)
    setShot(0)
  }

  useEffect(() => {
    if (!lightbox) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false)
      if (event.key === "ArrowRight") step(document.dir === "rtl" ? -1 : 1)
      if (event.key === "ArrowLeft") step(document.dir === "rtl" ? 1 : -1)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [lightbox, step])

  if (!bus || !current) return null

  const counter = t("photoCount", { current: Math.min(shot, count - 1) + 1, total: count })

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("categoriesLabel")}
        className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0"
      >
        {categories.map((item, i) => {
          const active = i === index
          return (
            <button
              key={item.id}
              id={`fleet-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="fleet-panel"
              onClick={() => selectBus(i)}
              className={cn(
                "group flex w-48 shrink-0 snap-start items-center gap-3 rounded-2xl p-2 pe-4 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange sm:w-56",
                active
                  ? "bg-black text-white"
                  : "bg-surface-elevated text-ink ring-1 ring-border hover:ring-ink/25",
              )}
            >
              <span className="relative aspect-[4/3] w-14 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:w-16">
                <Image
                  src={item.coverImage}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-sm leading-tight font-semibold">{item.name}</span>
                <span
                  className={cn(
                    "mt-1 block text-xs",
                    active ? "text-white/65" : "text-ink-muted",
                  )}
                >
                  <span dir="ltr" className="inline-block">
                    {item.seatsLabel}
                  </span>
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div
        id="fleet-panel"
        role="tabpanel"
        aria-labelledby={`fleet-tab-${bus.id}`}
        className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-8"
      >
        <div className="min-w-0">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[1.75rem] bg-surface-muted sm:aspect-[16/9]">
            <Image
              key={current}
              src={current}
              alt={`${bus.name} — ${counter}`}
              fill
              priority={index === 0 && shot === 0}
              sizes="(min-width:1024px) 62vw, 100vw"
              className="object-cover motion-safe:animate-[fleet-fade_450ms_ease-out]"
            />
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={t("previousShot")}
                  className={cn(circleButton, "absolute start-3 top-1/2 -translate-y-1/2")}
                >
                  <Chevron />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={t("nextShot")}
                  className={cn(circleButton, "absolute end-3 top-1/2 -translate-y-1/2")}
                >
                  <Chevron className="rotate-180" />
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => setLightbox(true)}
              aria-label={t("openPhoto")}
              className={cn(circleButton, "absolute end-3 top-3")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden
              >
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
            {hasInterior ? (
              <div className="flex rounded-full bg-surface-muted p-1" role="group">
                {(["exterior", "interior"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    onClick={() => selectMode(m)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange",
                      mode === m ? "bg-surface-elevated text-ink shadow-sm" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {t(m)}
                  </button>
                ))}
              </div>
            ) : null}
            {count > 1 ? (
              <ul className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto py-1">
                {photos.map((src, i) => (
                  <li key={src} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setShot(i)}
                      aria-label={t("photoCount", { current: i + 1, total: count })}
                      aria-current={i === shot}
                      className={cn(
                        "relative block aspect-[4/3] w-20 overflow-hidden rounded-xl bg-surface-muted ring-2 transition focus-visible:outline-none focus-visible:ring-orange sm:w-24",
                        i === shot ? "ring-orange" : "opacity-70 ring-transparent hover:opacity-100",
                      )}
                    >
                      <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <aside className="flex flex-col rounded-[1.75rem] bg-surface-elevated p-6 ring-1 ring-border sm:p-8">
          <h3 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {bus.name}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">{bus.summary}</p>

          <div className="mt-6 border-y border-border py-5">
            <p className="text-sm text-ink-muted">{tCommon("seats")}</p>
            <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-ink tabular-nums sm:text-5xl">
              <span dir="ltr" className="inline-block">
                {bus.seatsLabel}
              </span>
            </p>
          </div>

          <h4 className="mt-6 text-sm font-semibold text-ink">{t("specsAmenities")}</h4>
          <ul className="mt-3 grid gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {bus.amenities.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-snug text-ink/80">
                <FleetCheck />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/quote"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
          >
            {tCommon("requestQuote")}
          </Link>
        </aside>
      </div>

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={bus.name}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={() => setLightbox(false)}
        >
          <div className="relative aspect-[16/10] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image src={current} alt={`${bus.name} — ${counter}`} fill sizes="100vw" className="rounded-2xl object-contain" />
          </div>
          <button
            type="button"
            autoFocus
            onClick={() => setLightbox(false)}
            aria-label={tCommon("close")}
            className={cn(circleButton, "absolute end-4 top-4")}
          >
            <span aria-hidden className="text-xl leading-none">×</span>
          </button>
          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1) }}
                aria-label={t("previousShot")}
                className={cn(circleButton, "absolute start-4 top-1/2 -translate-y-1/2")}
              >
                <Chevron />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1) }}
                aria-label={t("nextShot")}
                className={cn(circleButton, "absolute end-4 top-1/2 -translate-y-1/2")}
              >
                <Chevron className="rotate-180" />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
