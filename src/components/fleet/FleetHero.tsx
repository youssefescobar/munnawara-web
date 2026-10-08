"use client"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import { useEffect, useRef } from "react"
import "./fleet.css"

gsap.registerPlugin(ScrollTrigger)

type FleetHeroProps = {
  title: string
  subtitle: string
  alt: string
  /** Names painted under each bus in the photo, in left-to-right order. */
  busLabels: readonly [string, string, string]
}

// Horizontal centre of each bus in the photo, as a fraction of image width.
const BUS_X = ["23%", "53%", "80%"] as const

export const FleetHero = ({
  title,
  subtitle,
  alt,
  busLabels,
}: FleetHeroProps) => {
  const reduced = useReducedMotion()
  const runway = useRef<HTMLElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const labels = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (reduced || !runway.current) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: runway.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      })
      // 1. headline lifts away and the bus names appear.
      tl.to(copy.current, { yPercent: -18, autoAlpha: 0, duration: 0.35 }, 0)
      tl.fromTo(
        labels.current?.children ?? [],
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.06 },
        0.25,
      )
      // 2. the photo tucks into a rounded card and rides up, handing over to the showroom.
      tl.fromTo(
        frame.current,
        { clipPath: "inset(0% 0% 0% 0% round 0rem)", scale: 1, yPercent: 0 },
        {
          clipPath: "inset(0% 4% 0% 4% round 2rem)",
          scale: 0.96,
          yPercent: -26,
          transformOrigin: "50% 100%",
          duration: 0.45,
        },
        0.55,
      )
      tl.to(labels.current, { autoAlpha: 0, duration: 0.15 }, 0.85)
    }, runway)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={runway} data-fleet-hero className="relative h-[230svh] motion-reduce:h-svh" aria-label={title}>
      <div className="fleet-hero sticky top-0 h-svh overflow-hidden">
        <div
          ref={copy}
          className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pt-28 text-center sm:pt-32 md:pt-36"
        >
          <h1 className="font-display text-[clamp(3rem,10vw,7.5rem)] leading-[0.95] font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--fleet-hero-ink-muted)] sm:text-lg md:text-xl">
            {subtitle}
          </p>
        </div>

        <div
          ref={frame}
          className="absolute inset-x-0 bottom-0 h-[58svh] will-change-transform md:h-[min(66svh,44vw)]"
        >
          <div className="fleet-hero__image absolute inset-0">
            <Image
              src="/fleet/preview.webp"
              alt={alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[50%_60%]"
            />
          </div>
          <ul
            ref={labels}
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden md:block"
          >
            {busLabels.map((name, i) => (
              <li
                key={name}
                className="absolute bottom-[6%] -translate-x-1/2 rounded-full bg-[var(--fleet-hero-ink)] px-4 py-1.5 text-sm font-medium text-white opacity-0 motion-reduce:opacity-100"
                style={{ left: BUS_X[i] }}
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
