"use client"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { motion } from "motion/react"
import { Children, isValidElement, type ReactNode } from "react"

type AnimeRevealProps = {
  children: ReactNode
  className?: string
  /** Stagger delay between children in seconds */
  stagger?: number
}

/**
 * Reliable stagger reveal using Motion (Anime.js scoping was leaving opacity:0).
 * Animates direct children — wrap each item you want staggered.
 */
export const AnimeReveal = ({
  children,
  className,
  stagger = 0.09,
}: AnimeRevealProps) => {
  const reduced = useReducedMotion()
  const items = Children.toArray(children).filter(Boolean)

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={className}>
      {items.map((child, index) => {
        const key =
          isValidElement(child) && child.key != null
            ? child.key
            : `reveal-${index}`

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.65,
              delay: index * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ willChange: "opacity, transform" }}
          >
            {child}
          </motion.div>
        )
      })}
    </div>
  )
}
