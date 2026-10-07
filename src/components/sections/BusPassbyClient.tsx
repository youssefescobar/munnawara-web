"use client"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/cn"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLocale } from "next-intl"
import Image from "next/image"
import { useEffect, useRef } from "react"

gsap.registerPlugin(ScrollTrigger)

type BusPassbyClientProps = {
  eyebrow: string
  title: string
  titleAfter: string
}

export const BusPassbyClient = ({
  eyebrow,
  title,
  titleAfter,
}: BusPassbyClientProps) => {
  const reduced = useReducedMotion()
  const locale = useLocale()
  const isRtl = locale === "ar"
  const rootRef = useRef<HTMLElement>(null)
  const busRef = useRef<HTMLDivElement>(null)
  const titleBeforeRef = useRef<HTMLHeadingElement>(null)
  const titleAfterRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (reduced || !rootRef.current || !busRef.current) return

    const ctx = gsap.context(() => {
      const bus = busRef.current
      const media = bus?.firstElementChild as HTMLElement | null
      if (!bus || !media) return

      const getClearance = () => {
        const halfViewport = window.innerWidth * 0.5
        const halfBus = media.offsetWidth * 0.5
        // Extra pad so the nose/tail fully clears before/after the scrub range
        return halfViewport + halfBus + 48
      }

      const getStartX = () => (isRtl ? getClearance() : -getClearance())
      const getEndX = () => (isRtl ? -getClearance() : getClearance())

      gsap.set(bus, { x: getStartX() })
      gsap.set(titleBeforeRef.current, { opacity: 1 })
      gsap.set(titleAfterRef.current, { opacity: 0 })

      gsap.fromTo(
        bus,
        { x: getStartX },
        {
          x: getEndX,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.25,
            invalidateOnRefresh: true,
          },
        },
      )

      const copyTl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      })
      copyTl.to(titleBeforeRef.current, { opacity: 0, duration: 0.1, ease: "none" }, 0.45)
      copyTl.to(titleAfterRef.current, { opacity: 1, duration: 0.1, ease: "none" }, 0.5)
      copyTl.set({}, {}, 1)
    }, rootRef)

    return () => ctx.revert()
  }, [reduced, isRtl])

  const titleClass = cn(
    "w-full text-center font-semibold tracking-tight break-words text-ink [text-shadow:0_1px_14px_rgb(0_0_0/0.4)]",
    isRtl
      ? "text-[1.65rem] leading-[1.25] sm:text-4xl md:text-5xl lg:text-[3.75rem]"
      : "text-[1.65rem] leading-[1.2] sm:text-5xl md:text-6xl lg:text-[4.75rem]",
  )

  return (
    <section
      ref={rootRef}
      className="relative h-[140vh] bg-surface-elevated md:h-[160vh]"
      aria-label={`${title}. ${titleAfter}`}
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <p
          className={cn(
            "font-label pointer-events-none absolute inset-x-0 top-[12%] z-30 mx-auto max-w-[80rem] px-4 text-center text-[11px] font-semibold text-orange-text sm:top-[14%] sm:text-xs md:top-[15%] md:px-10",
            isRtl
              ? "tracking-wide"
              : "tracking-[0.22em] uppercase sm:tracking-[0.28em]",
          )}
        >
          {eyebrow}
        </p>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex w-full -translate-y-1/2 justify-center px-4 md:px-10">
          {reduced ? (
            <div className="mx-auto w-full max-w-4xl space-y-3 text-center">
              <h2 className={titleClass} dir={isRtl ? "rtl" : "ltr"}>
                {title}
              </h2>
              <h2 className={cn(titleClass, "text-ink/80")} dir={isRtl ? "rtl" : "ltr"}>
                {titleAfter}
              </h2>
            </div>
          ) : (
            <div className="relative mx-auto w-full min-h-[2.6em] max-w-4xl text-center">
              <h2 ref={titleBeforeRef} className={titleClass} dir={isRtl ? "rtl" : "ltr"}>
                {title}
              </h2>
              <h2
                ref={titleAfterRef}
                className={cn(titleClass, "absolute inset-x-0 top-0")}
                dir={isRtl ? "rtl" : "ltr"}
                aria-hidden
              >
                {titleAfter}
              </h2>
            </div>
          )}
        </div>

        <div
          ref={busRef}
          className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center will-change-transform"
          aria-hidden
        >
          <div
            className={cn(
              "relative h-auto w-[min(112vw,82rem)] md:w-[min(160vw,82rem)]",
              isRtl && "-scale-x-100",
            )}
          >
            <Image
              src="/motion/bus-top.png"
              alt=""
              width={1800}
              height={452}
              className="h-auto w-full select-none drop-shadow-[0_24px_60px_rgb(26_18_16/0.18)]"
              sizes="(max-width:768px) 112vw, 82rem"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
