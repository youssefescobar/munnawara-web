"use client"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { motion } from "motion/react"
import type { ReactNode } from "react"
import { cn } from "@/lib/cn"

type AnimatedSectionProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export const AnimatedSection = ({
  children,
  className,
  delay = 0,
}: AnimatedSectionProps) => {
  const reduced = useReducedMotion()

  if (reduced) {
    return <section className={className}>{children}</section>
  }

  return (
    <motion.section
      className={cn(className)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  )
}
