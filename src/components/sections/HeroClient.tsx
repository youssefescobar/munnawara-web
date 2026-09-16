"use client"

import { HeroLoopVideo } from "@/components/sections/HeroLoopVideo"
import { CtaSpark } from "@/components/motion/CtaSpark"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { Link } from "@/i18n/navigation"
import { motion } from "motion/react"
import Image from "next/image"
import { useEffect, useState } from "react"

type HeroClientProps = {
  siteName: string
  headline: string
  subhead: string
  ctaPrimary: string
  ctaSecondary: string
}

export const HeroClient = ({
  siteName,
  headline,
  subhead,
  ctaPrimary,
  ctaSecondary,
}: HeroClientProps) => {
  const reduced = useReducedMotion()
  const [allowMotionMedia, setAllowMotionMedia] = useState(false)
  const poster = "/hero/cover.png"

  useEffect(() => {
    setAllowMotionMedia(!reduced)
  }, [reduced])

  const ease = [0.16, 1, 0.3, 1] as const

  return (
    <section
      id="hero"
      className="relative isolate min-h-[100dvh] overflow-hidden bg-ink"
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={poster}
          alt=""
          fill
          priority
          className={`object-cover object-[center_38%] ${reduced ? "" : "animate-ken-burns"}`}
          sizes="100vw"
        />
        <HeroLoopVideo enabled={allowMotionMedia} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/35 to-transparent rtl:bg-gradient-to-l" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[80rem] flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 md:px-10 md:pb-24">
        <div className="max-w-3xl">
          <motion.p
            className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            initial={reduced ? false : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
          >
            {siteName}
          </motion.p>

          <motion.h1
            className="mt-5 max-w-2xl text-xl leading-snug font-medium text-white/90 sm:mt-6 sm:text-2xl md:text-3xl"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.32, ease }}
          >
            {headline}
          </motion.h1>

          <motion.p
            className="mt-4 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease }}
          >
            {subhead}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.58, ease }}
          >
            <CtaSpark className="inline-flex w-full sm:w-auto">
              <a
                href="#quote"
                className="font-label inline-flex w-full items-center justify-center rounded-full bg-orange px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
              >
                {ctaPrimary}
              </a>
            </CtaSpark>
            <Link
              href="/fleet"
              className="font-label inline-flex items-center justify-center rounded-full border border-white/35 px-7 py-3.5 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {ctaSecondary}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
