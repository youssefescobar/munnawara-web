"use client"

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher"
import { primaryNav, secondaryNav } from "@/components/layout/navConfig"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/cn"
import { AnimatePresence, motion } from "motion/react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { useEffect, useId, useState } from "react"

export const Header = () => {
  const t = useTranslations("nav")
  const tCommon = useTranslations("common")
  const tMeta = useTranslations("meta")
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuId = useId()
  const isHome = pathname === "/"
  const solid = !isHome || scrolled || open
  const tone = solid ? "dark" : "light"

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", handleKey)
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          "z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
          isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
          solid
            ? "border-b border-ink/8 bg-white/90 shadow-[0_8px_30px_rgb(26_18_16/0.06)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-[80rem] items-center justify-between gap-4 px-4 md:h-[4.75rem] md:px-10">
          <Link
            href="/"
            className="relative z-10 flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
            aria-label={tMeta("siteName")}
          >
            <Image
              src="/logo.png"
              alt=""
              width={605}
              height={491}
              className={cn(
                "h-10 w-auto object-contain transition md:h-11",
                !solid && "brightness-0 invert",
              )}
              priority
            />
          </Link>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 xl:flex"
            aria-label="Primary"
          >
            {primaryNav.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-label relative rounded-full px-3.5 py-2 text-[13px] font-medium tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange",
                    tone === "light"
                      ? active
                        ? "text-white"
                        : "text-white/70 hover:text-white"
                      : active
                        ? "text-orange"
                        : "text-ink/60 hover:text-ink",
                  )}
                >
                  {t(item.key)}
                  {active ? (
                    <span
                      className={cn(
                        "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full",
                        tone === "light" ? "bg-orange" : "bg-orange",
                      )}
                      aria-hidden
                    />
                  ) : null}
                </Link>
              )
            })}
          </nav>

          <div className="relative z-10 flex items-center gap-2 sm:gap-2.5">
            <LanguageSwitcher tone={tone} />
            <Link
              href="/contact"
              className={cn(
                "font-label hidden items-center justify-center rounded-full px-4 py-2 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange sm:inline-flex",
                tone === "light"
                  ? "bg-orange text-white hover:bg-orange-soft"
                  : "bg-ink text-white hover:bg-orange",
              )}
            >
              {tCommon("requestQuote")}
            </Link>
            <button
              type="button"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange xl:hidden",
                tone === "light"
                  ? "text-white hover:bg-white/10"
                  : "text-ink hover:bg-surface-muted",
              )}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? t("closeMenu") : t("openMenu")}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            key="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm xl:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.nav
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 top-[4.25rem] max-h-[calc(100dvh-4.25rem)] overflow-y-auto border-b border-ink/8 bg-white shadow-xl md:top-[4.75rem]"
              aria-label="Mobile"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto max-w-[80rem] px-4 py-6 md:px-10">
                <p className="font-label text-[11px] font-semibold tracking-[0.2em] text-ink-muted uppercase">
                  {t("menuPrimary")}
                </p>
                <ul className="mt-3 space-y-1">
                  {primaryNav.map((item, index) => {
                    const active = pathname.startsWith(item.href)
                    return (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * index, duration: 0.3 }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "font-display flex items-center justify-between rounded-2xl px-3 py-3.5 text-2xl font-semibold tracking-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange",
                            active
                              ? "bg-orange/8 text-orange"
                              : "text-ink hover:bg-surface-muted",
                          )}
                        >
                          {t(item.key)}
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              active ? "bg-orange" : "bg-transparent",
                            )}
                            aria-hidden
                          />
                        </Link>
                      </motion.li>
                    )
                  })}
                </ul>

                <p className="font-label mt-8 text-[11px] font-semibold tracking-[0.2em] text-ink-muted uppercase">
                  {t("menuMore")}
                </p>
                <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                  {secondaryNav.map((item) => {
                    const active = pathname.startsWith(item.href)
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "font-label flex rounded-xl px-3 py-3 text-[15px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange",
                            active
                              ? "text-orange"
                              : "text-ink/70 hover:bg-surface-muted hover:text-ink",
                          )}
                        >
                          {t(item.key)}
                        </Link>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-8 border-t border-ink/8 pt-6">
                  <Link
                    href="/contact"
                    className="font-label inline-flex w-full items-center justify-center rounded-full bg-orange px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                  >
                    {tCommon("requestQuote")}
                  </Link>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
