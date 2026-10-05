"use client"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/cn"
import { createBusStage } from "@/lib/lab/busStage"
import "@/styles/lab-home.css"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

gsap.registerPlugin(ScrollTrigger)

type LabHomeProps = {
  hero: { eyebrow: string; lines: readonly string[]; sub: string }
  points: readonly { title: string; description: string }[]
  closing: { title: string; subtitle: string }
}

const SCENE_COUNT = 4

const pillClass =
  "inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"

export const LabHome = ({ hero, points, closing }: LabHomeProps) => {
  const t = useTranslations("common")
  const locale = useLocale()
  const reduced = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const track = trackRef.current
    if (!canvas || !track) return

    const paint = (p: number) => {
      const s = p * (SCENE_COUNT - 1)
      sceneRefs.current.forEach((el, i) => {
        if (!el) return
        const d = s - i
        const o = Math.min(Math.max(1 - Math.abs(d) * 2.4, 0), 1)
        el.style.opacity = String(o)
        el.style.visibility = o > 0.01 ? "visible" : "hidden"
        el.style.pointerEvents = o > 0.6 ? "auto" : "none"
        el.style.transform = `translate3d(0, ${(-d * 36).toFixed(1)}px, 0)`
      })
      const active = Math.round(s)
      dotRefs.current.forEach((el, i) => {
        if (el) el.dataset.active = String(i === active)
      })
    }
    paint(0)

    const stage = createBusStage({
      container: canvas,
      modelUrl: "/models/bus_durrah.glb",
      side: locale === "ar" ? -1 : 1,
      animate: !reduced,
      onFrame: paint,
      onReady: () => setReady(true),
      onError: () => setFailed(true),
    })

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => stage.setProgress(self.progress),
    })
    stage.setProgress(trigger.progress)

    return () => {
      trigger.kill()
      stage.dispose()
    }
  }, [locale, reduced])

  const setScene = (i: number) => (el: HTMLDivElement | null) => {
    sceneRefs.current[i] = el
  }

  return (
    <div ref={trackRef} className="lab-home" data-lab-home>
      <div className="lab-home__stage">
        {failed ? (
          <Image
            src="/hero/cover.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="lab-home__poster"
          />
        ) : null}
        <div
          ref={canvasRef}
          className="lab-home__canvas"
          data-ready={ready}
          aria-hidden
        />

        <div ref={setScene(0)} className="lab-home__scene" data-first>
          <p className="font-label mb-4 text-xs font-semibold tracking-[0.22em] text-orange-text uppercase rtl:tracking-wide">
            {hero.eyebrow}
          </p>
          <h1 className="text-5xl leading-[1.05] font-semibold tracking-tight md:text-7xl">
            {hero.lines.map((line, i) => (
              <span
                key={line}
                className={cn("block", i === hero.lines.length - 1 && "text-wordmark")}
              >
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-5 text-lg text-ink-muted">{hero.sub}</p>
          <Link
            href="/quote"
            className={cn(pillClass, "mt-8 bg-ink text-white shadow-lg")}
          >
            {t("requestQuote")}
          </Link>
        </div>

        {points.slice(0, 2).map((point, i) => (
          <div key={point.title} ref={setScene(i + 1)} className="lab-home__scene">
            <h2 className="text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
              {point.title}
            </h2>
            <p className="mt-4 text-lg text-ink-muted">{point.description}</p>
          </div>
        ))}

        <div ref={setScene(3)} className="lab-home__scene lab-home__scene--center">
          <h2 className="text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
            {closing.title}
          </h2>
          <p className="mt-4 text-lg text-ink-muted">{closing.subtitle}</p>
          <Link
            href="/quote"
            className={cn(pillClass, "mt-8 bg-ink text-white shadow-lg")}
          >
            {t("requestQuote")}
          </Link>
        </div>

        <div className="lab-home__progress" aria-hidden>
          {Array.from({ length: SCENE_COUNT }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el
              }}
              className="lab-home__dot"
              data-active={i === 0}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
