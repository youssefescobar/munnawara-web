"use client"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import { useEffect, useState } from "react"

type TestimonialItem = {
  id: string
  quote: string
  name: string
  role: string
  avatar: string | null
}

type TestimonialsClientProps = {
  title: string
  emptyMessage: string
  items: readonly TestimonialItem[]
  previousLabel: string
  nextLabel: string
}

export const TestimonialsClient = ({
  title,
  emptyMessage,
  items,
  previousLabel,
  nextLabel,
}: TestimonialsClientProps) => {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduced || items.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [items.length, reduced])

  const handlePrevious = () => {
    setIndex((current) => (current - 1 + items.length) % items.length)
  }

  const handleNext = () => {
    setIndex((current) => (current + 1) % items.length)
  }

  return (
    <section className="bg-surface px-4 py-16 sm:py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-5xl">
          {title}
        </h2>

        {items.length === 0 ? (
          <p className="mt-10 text-base text-ink-muted">{emptyMessage}</p>
        ) : (
          <div className="relative mt-12 md:mt-16">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={items[index]?.id}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-display text-2xl leading-snug font-medium text-ink md:text-4xl md:leading-snug">
                  “{items[index]?.quote}”
                </p>
                <footer className="mt-10 flex items-center justify-center gap-3">
                  {items[index]?.avatar ? (
                    <Image
                      src={items[index]!.avatar!}
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex size-11 items-center justify-center rounded-full bg-orange/10 text-sm font-semibold text-orange"
                    >
                      {items[index]?.name.slice(0, 1)}
                    </span>
                  )}
                  <div className="text-start">
                    <p className="font-label text-sm font-semibold text-ink">
                      {items[index]?.name}
                    </p>
                    <p className="text-xs text-ink-muted">{items[index]?.role}</p>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>

            {items.length > 1 ? (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm text-ink transition hover:border-orange hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                  aria-label={previousLabel}
                >
                  ‹
                </button>
                <div className="flex gap-1.5" aria-hidden>
                  {items.map((item, i) => (
                    <span
                      key={item.id}
                      className={`h-1.5 rounded-full transition-all ${
                        i === index ? "w-6 bg-orange" : "w-1.5 bg-ink/15"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm text-ink transition hover:border-orange hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                  aria-label={nextLabel}
                >
                  ›
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
