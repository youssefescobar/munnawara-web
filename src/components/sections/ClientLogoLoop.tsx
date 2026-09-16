"use client"

import LogoLoop from "@/components/react-bits/LogoLoop"
import { brand } from "@/lib/theme"
import { useLocale } from "next-intl"

type ClientLogoLoopProps = {
  labels: string[]
  title: string
}

export const ClientLogoLoop = ({ labels, title }: ClientLogoLoopProps) => {
  const locale = useLocale()
  const logos = labels.map((label) => ({
    node: (
      <span className="font-label inline-flex rounded-full border border-border bg-surface-muted px-4 py-2 text-sm whitespace-nowrap text-ink-muted">
        {label}
      </span>
    ),
    title: label,
    ariaLabel: label,
  }))

  return (
    <LogoLoop
      logos={logos}
      speed={70}
      direction={locale === "ar" ? "right" : "left"}
      gap={12}
      logoHeight={40}
      fadeOut
      fadeOutColor={brand.surface}
      pauseOnHover
      ariaLabel={title}
      className="mt-10"
    />
  )
}
