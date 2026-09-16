"use client"

import ClickSpark from "@/components/react-bits/ClickSpark"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { brand } from "@/lib/theme"
import type { ReactNode } from "react"

type CtaSparkProps = {
  children: ReactNode
  className?: string
}

/** Optional spark burst on primary CTAs only (not sitewide). */
export const CtaSpark = ({ children, className }: CtaSparkProps) => {
  const reduced = useReducedMotion()

  if (reduced) return <>{children}</>

  return (
    <ClickSpark
      sparkColor={brand.orange}
      sparkSize={8}
      sparkRadius={14}
      sparkCount={6}
      duration={380}
      className={className}
    >
      {children}
    </ClickSpark>
  )
}
