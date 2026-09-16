"use client"

import CountUp from "@/components/react-bits/CountUp"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { AnimeReveal } from "@/components/motion/AnimeReveal"

type TrustItem = {
  label: string
  value: string
  countTo?: number
  countFrom?: number
}

type TrustBarClientProps = {
  items: TrustItem[]
}

export const TrustBarClient = ({ items }: TrustBarClientProps) => {
  const reduced = useReducedMotion()

  return (
    <div className="mx-auto max-w-[80rem] px-4 py-10 md:px-10 md:py-12">
      <AnimeReveal
        className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-border py-8 md:grid-cols-4 md:gap-8 md:py-10"
        stagger={0.08}
      >
        {items.map((item) => (
          <div key={item.label} className="text-center md:text-start">
            <p className="font-display text-3xl font-semibold tracking-tight text-orange md:text-4xl">
              {typeof item.countTo === "number" && !reduced ? (
                <CountUp
                  to={item.countTo}
                  from={item.countFrom ?? 0}
                  duration={1.5}
                  className="font-display text-3xl font-semibold tracking-tight text-orange md:text-4xl"
                />
              ) : (
                item.value
              )}
            </p>
            <p className="font-label mt-2 text-xs tracking-wide text-ink-muted md:text-sm">
              {item.label}
            </p>
          </div>
        ))}
      </AnimeReveal>
    </div>
  )
}
