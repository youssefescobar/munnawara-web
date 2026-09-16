"use client"

import { BusLoader } from "@/components/ui/BusLoader"
import { usePathname } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import {
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from "react"

const MIN_VISIBLE_MS = 1100
const MAX_WAIT_MS = 8000
const FADE_MS = 700

const isInternalNavLink = (anchor: HTMLAnchorElement) => {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false
  if (anchor.getAttribute("href")?.startsWith("#")) return false

  try {
    const url = new URL(anchor.href, window.location.href)
    if (url.origin !== window.location.origin) return false
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}

const waitForPageReady = async () => {
  if (document.fonts?.ready) {
    await Promise.race([
      document.fonts.ready,
      new Promise<void>((resolve) => setTimeout(resolve, 1200)),
    ])
  }

  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>("#main img"),
  )

  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }
          const done = () => resolve()
          img.addEventListener("load", done, { once: true })
          img.addEventListener("error", done, { once: true })
          setTimeout(done, 2500)
        }),
    ),
  )

  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )
}

export const PageLoader = () => {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations("common")
  const [mounted, setMounted] = useState(true)
  const [opaque, setOpaque] = useState(true)
  const shownAtRef = useRef(0)
  const cycleRef = useRef(0)
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearWaitTimer = () => {
    if (waitTimerRef.current) {
      clearTimeout(waitTimerRef.current)
      waitTimerRef.current = null
    }
  }

  const show = () => {
    cycleRef.current += 1
    clearWaitTimer()
    shownAtRef.current = performance.now()
    setMounted(true)
    setOpaque(true)
  }

  const beginFadeOut = (cycle: number) => {
    if (cycleRef.current !== cycle) return
    // Double rAF so the browser commits opacity:1 before we animate to 0.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cycleRef.current !== cycle) return
        setOpaque(false)
      })
    })
  }

  const hideWhenReady = async (cycle: number) => {
    try {
      await Promise.race([
        waitForPageReady(),
        new Promise<void>((resolve) => setTimeout(resolve, MAX_WAIT_MS)),
      ])
    } catch {
      // still dismiss
    }

    if (cycleRef.current !== cycle) return

    const elapsed = performance.now() - shownAtRef.current
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)

    waitTimerRef.current = setTimeout(() => beginFadeOut(cycle), remaining)
  }

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "opacity") return
    if (opaque) return
    setMounted(false)
  }

  useEffect(() => {
    shownAtRef.current = performance.now()

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest?.("a")
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return
      if (!isInternalNavLink(anchor)) return
      show()
    }

    const onPopState = () => show()

    document.addEventListener("click", onClick, true)
    window.addEventListener("popstate", onPopState)

    return () => {
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("popstate", onPopState)
    }
  }, [])

  useEffect(() => {
    const cycle = cycleRef.current
    const frame = requestAnimationFrame(() => {
      void hideWhenReady(cycle)
    })

    return () => {
      cancelAnimationFrame(frame)
      clearWaitTimer()
    }
  }, [pathname, locale])

  // Fallback if transitionend is skipped by the browser.
  useEffect(() => {
    if (opaque || !mounted) return
    const timer = setTimeout(() => setMounted(false), FADE_MS + 80)
    return () => clearTimeout(timer)
  }, [opaque, mounted])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 backdrop-blur-md"
      style={{
        opacity: opaque ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: opaque ? "auto" : "none",
      }}
      aria-busy={opaque}
      aria-live="polite"
      onTransitionEnd={handleTransitionEnd}
    >
      <BusLoader size={80} label={t("loading")} />
    </div>
  )
}
