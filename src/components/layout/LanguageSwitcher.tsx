"use client"

import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/cn"
import { useLocale, useTranslations } from "next-intl"

type LanguageSwitcherProps = {
  className?: string
  tone?: "light" | "dark"
}

export const LanguageSwitcher = ({
  className,
  tone = "dark",
}: LanguageSwitcherProps) => {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()
  const nextLocale = locale === "ar" ? "en" : "ar"

  return (
    <Link
      href={pathname}
      locale={nextLocale}
      className={cn(
        "font-arabic inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange",
        tone === "light"
          ? "border-white/25 text-white/90 hover:border-white hover:bg-white/10"
          : "border-ink/10 text-ink-muted hover:border-ink/20 hover:bg-surface-muted hover:text-ink",
        className,
      )}
      aria-label={t("switchLanguage")}
    >
      {t("switchLanguage")}
    </Link>
  )
}
