"use client"

import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/cn"
import { useLocale, useTranslations } from "next-intl"

type LanguageSwitcherProps = {
  className?: string
}

export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()
  const nextLocale = locale === "ar" ? "en" : "ar"

  return (
    <Link
      href={pathname}
      locale={nextLocale}
      className={cn(
        "font-arabic rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange",
        className,
      )}
      aria-label={t("switchLanguage")}
      tabIndex={0}
    >
      {t("switchLanguage")}
    </Link>
  )
}
