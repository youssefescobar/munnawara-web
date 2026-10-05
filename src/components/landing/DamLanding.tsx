"use client"

import type { LandingHeroContent } from "@/content/types"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLocale, useTranslations } from "next-intl"
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react"
import { ChatWidget } from "@/components/chat/ChatWidget"
import { animationConfig as motion } from "./animations/config"
import {
  createIntroTimeline,
  playFabEntrance,
  setIntroFinalState,
  type IntroElements,
} from "./animations/introTimeline"
import { ExploreButton } from "./ExploreButton"
import { HeroVideo, type HeroVideoHandle } from "./HeroVideo"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { LandingLanguageSwitcher } from "./LandingLanguageSwitcher"
import { LandingSiteNav } from "./LandingSiteNav"
import { LogoMark } from "./LogoMark"
import { WhatsAppButton } from "@/components/layout/WhatsAppButton"
import { LOGO_INTRO_SEEN_KEY } from "./LogoRouteTransition"

gsap.registerPlugin(ScrollTrigger)

/**
 * PerformanceNavigationTiming.type is the *document* load type for the whole
 * session tab — it stays "reload" after a hard refresh even during later
 * client navigations. Only clear the intro flag when this document itself
 * was a hard reload of home — never when soft-navigating home after reloading
 * /fleet (or any other route).
 */
let didHandleDocumentNavType = false
const clearIntroSeenOnHardReload = () => {
  if (didHandleDocumentNavType) return
  didHandleDocumentNavType = true
  try {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined
    if (nav?.type !== "reload") return
    const loadedUrl = new URL(nav.name || window.location.href, window.location.origin)
    const loadedPath = loadedUrl.pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/"
    if (loadedPath === "/") {
      sessionStorage.removeItem(LOGO_INTRO_SEEN_KEY)
    }
  } catch {
    // ignore
  }
}

type LenisLike = {
  stop: () => void
  start: () => void
  scrollTo: (
    target: string | number | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean },
  ) => void
}

const getLenis = () =>
  (window as Window & { __lenis?: LenisLike }).__lenis

/** Pin the page to the hero before / during the intro so a refresh mid-scroll stays clean. */
const forceHomeTop = () => {
  try {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }
  } catch {
    // ignore
  }

  if (window.location.hash) {
    try {
      history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      )
    } catch {
      // ignore
    }
  }

  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  const lenis = getLenis()
  lenis?.stop()
  try {
    lenis?.scrollTo(0, { immediate: true })
  } catch {
    try {
      lenis?.scrollTo(0, { offset: 0, duration: 0 })
    } catch {
      // ignore
    }
  }
}

const ASSET_FAILSAFE_MS = 9000

/** First-scroll assets that sit outside the intro root but cause jank if cold. */
const CRITICAL_PRELOAD_URLS = [
  "/motion/bus-top.png",
  "/hero/landing-sky.jpg",
] as const

const waitForEvent = (
  target: EventTarget,
  success: string,
  failure?: string,
) =>
  new Promise<void>((resolve) => {
    const done = () => {
      target.removeEventListener(success, done)
      if (failure) target.removeEventListener(failure, done)
      resolve()
    }
    target.addEventListener(success, done, { once: true })
    if (failure) target.addEventListener(failure, done, { once: true })
  })

const waitForVideoReady = (video: HTMLVideoElement) => {
  // Soft floor: metadata is enough to reveal the plate; full buffer can finish later.
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve()
  }

  try {
    video.muted = true
    video.playsInline = true
    video.preload = "auto"
    if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) video.load()
    else if (video.readyState < HTMLMediaElement.HAVE_METADATA) video.load()
  } catch {
    // ignore
  }

  return new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      video.removeEventListener("canplaythrough", onReady)
      video.removeEventListener("canplay", onReady)
      video.removeEventListener("loadeddata", onSoftReady)
      video.removeEventListener("loadedmetadata", onMeta)
      video.removeEventListener("error", onReady)
      window.clearTimeout(softTimer)
      window.clearTimeout(hardTimer)
      resolve()
    }

    const onReady = () => finish()
    let softTimer = 0
    const onSoftReady = () => {
      // First frame is in — brief beat then proceed so mobile intro isn't starved
      softTimer = window.setTimeout(finish, 280)
    }
    const onMeta = () => {
      // Metadata alone is enough to continue — playback can catch up on mobile.
      softTimer = window.setTimeout(finish, 120)
    }

    video.addEventListener("canplaythrough", onReady)
    video.addEventListener("canplay", onReady)
    video.addEventListener("loadeddata", onSoftReady)
    video.addEventListener("loadedmetadata", onMeta)
    video.addEventListener("error", onReady)

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMeta()
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onSoftReady()

    // Mobile networks stall often — don't hold the whole intro hostage
    const hardTimer = window.setTimeout(finish, 3500)
  })
}

const waitForImageReady = (image: HTMLImageElement) => {
  if (image.complete && image.naturalWidth > 0) {
    return image.decode?.().catch(() => undefined) ?? Promise.resolve()
  }
  return waitForEvent(image, "load", "error").then(
    () => image.decode?.().catch(() => undefined) ?? Promise.resolve(),
  )
}

const preloadUrl = (src: string) =>
  new Promise<void>((resolve) => {
    const image = new Image()
    image.decoding = "async"
    const finish = () => resolve()
    image.addEventListener("load", finish, { once: true })
    image.addEventListener("error", finish, { once: true })
    image.src = src
    if (image.complete) finish()
  })

/**
 * Real warm-up for the home experience: fonts, hero media in the intro,
 * plus the next critical images users hit on first scroll.
 * Caps with a failsafe so a stalled asset never traps the loader.
 */
const waitForPageAssets = (root: HTMLElement) => {
  const fonts = document.fonts?.ready ?? Promise.resolve()
  const images = Array.from(root.querySelectorAll("img")).map(waitForImageReady)
  const videos = Array.from(root.querySelectorAll("video")).map(waitForVideoReady)
  const preloads = CRITICAL_PRELOAD_URLS.map(preloadUrl)

  const assets = Promise.allSettled([
    fonts,
    ...images,
    ...videos,
    ...preloads,
  ]).then(() => undefined)

  const failsafe = new Promise<void>((resolve) => {
    window.setTimeout(resolve, ASSET_FAILSAFE_MS)
  })

  // Wait for real readiness — only the hard failsafe can cut it short
  return Promise.race([assets, failsafe])
}

const scrollToTarget = (
  target: string,
  options?: { offset?: number },
) => {
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(target, {
      offset: options?.offset ?? -88,
      duration: 1.15,
    })
    return
  }
  document.querySelector(target)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

type DamLandingProps = {
  copy: LandingHeroContent
}

export const DamLanding = ({ copy }: DamLandingProps) => {
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const loadingLabel = tCommon("loading")
  const loadingChars =
    locale === "ar" ? [loadingLabel] : loadingLabel.toUpperCase().split("")
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  const [loaded, setLoaded] = useState(prefersReducedMotion)
  const [skipIntroMorph, setSkipIntroMorph] = useState(false)

  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<SVGSVGElement>(null)
  const petalFlightRefs = useRef<SVGSVGElement[]>([])
  const targetRef = useRef<HTMLDivElement>(null)
  const cornerLogoRef = useRef<HTMLButtonElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const loaderStatusRef = useRef<HTMLDivElement>(null)
  const loaderLettersRef = useRef<HTMLSpanElement[]>([])
  const brandNameRef = useRef<HTMLDivElement>(null)
  const brandWordsRef = useRef<HTMLSpanElement[]>([])
  const navRef = useRef<HTMLElement>(null)
  const navBarRef = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<HTMLElement[]>([])
  const langSwitchRef = useRef<HTMLAnchorElement>(null)
  const themeToggleRef = useRef<HTMLButtonElement>(null)
  const heroLinesRef = useRef<HTMLElement[]>([])
  const heroVideoRef = useRef<HeroVideoHandle>(null)
  const heroCardRef = useRef<HTMLDivElement>(null)
  const videoStageRef = useRef<HTMLDivElement>(null)
  const aiChatRef = useRef<HTMLButtonElement>(null)
  const whatsappRef = useRef<HTMLDivElement>(null)

  const collectNavItem = (element: HTMLElement | null) => {
    if (element && !navItemsRef.current.includes(element))
      navItemsRef.current.push(element)
  }
  const collectHeroLine = (element: HTMLElement | null) => {
    if (element && !heroLinesRef.current.includes(element))
      heroLinesRef.current.push(element)
  }

  const getElements = (): IntroElements | null => {
    if (
      !rootRef.current ||
      !stageRef.current ||
      !logoRef.current ||
      petalFlightRefs.current.length !== 5 ||
      !targetRef.current ||
      !cornerLogoRef.current ||
      !overlayRef.current ||
      !brandNameRef.current ||
      !navRef.current ||
      !navBarRef.current ||
      !langSwitchRef.current ||
      !themeToggleRef.current ||
      !heroVideoRef.current?.container ||
      !heroCardRef.current ||
      !videoStageRef.current ||
      !aiChatRef.current ||
      !whatsappRef.current
    ) {
      return null
    }

    return {
      root: rootRef.current,
      stage: stageRef.current,
      logo: logoRef.current,
      petalFlights: petalFlightRefs.current,
      target: targetRef.current,
      cornerLogo: cornerLogoRef.current,
      overlay: overlayRef.current,
      brandName: brandNameRef.current,
      nav: navRef.current,
      navBar: navBarRef.current,
      navItems: navItemsRef.current,
      langSwitch: langSwitchRef.current,
      themeToggle: themeToggleRef.current,
      heroLines: heroLinesRef.current,
      videoLayer: heroVideoRef.current.container,
      videoStage: videoStageRef.current,
      heroCard: heroCardRef.current,
      aiChat: aiChatRef.current,
      whatsapp: whatsappRef.current,
      playVideo: () => heroVideoRef.current?.playOnce(),
    }
  }

  useLayoutEffect(() => {
    const lenis = getLenis()
    if (!loaded) lenis?.stop()
    else lenis?.start()
  }, [loaded])

  // Before paint: never let a restored scroll offset sit under the intro.
  // Soft returns already skip the bloom — don't yank scroll on those.
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(LOGO_INTRO_SEEN_KEY) === "1") return
    } catch {
      // ignore
    }
    forceHomeTop()
  }, [])

  useLayoutEffect(() => {
    let cancelled = false
    let introFinished = false
    let introStarted = false
    let fabEntrance: gsap.core.Timeline | undefined
    let retryId = 0
    let failsafeId = 0
    let topWatchId = 0
    let assemble: gsap.core.Timeline | undefined
    let breathing: gsap.core.Tween | undefined
    let loadingPulse: gsap.core.Timeline | undefined
    let reveal: gsap.core.Timeline | undefined
    let resolveAssemble: (() => void) | undefined
    let keepTop: (() => void) | undefined

    const hideFlightLogo = () => {
      const flight = document.querySelector<HTMLElement>(".logo-flight")
      const marks = document.querySelectorAll<HTMLElement>(
        ".logo-flight__mark, .logo-flight__petal-mark",
      )
      if (flight) gsap.set(flight, { autoAlpha: 0 })
      if (marks.length) gsap.set(marks, { opacity: 0, visibility: "hidden" })
    }

    const settleAsSeen = (elements: IntroElements, animateFabs: boolean) => {
      if (cancelled || introFinished) return
      introFinished = true
      setIntroFinalState(elements, { animateFabs })
      hideFlightLogo()
      heroVideoRef.current?.showFinalFrame()
      setSkipIntroMorph(true)
      setLoaded(true)
      document.body.classList.remove("is-loading")
      try {
        sessionStorage.setItem(LOGO_INTRO_SEEN_KEY, "1")
      } catch {
        // ignore
      }
      if (animateFabs) {
        fabEntrance = playFabEntrance(elements)
      }
    }

    const shouldSkipLongIntro = () => {
      // Soft route bloom already covering this navigation — never stack LOADING on it.
      if (document.body.classList.contains("is-page-transitioning")) return true
      try {
        return sessionStorage.getItem(LOGO_INTRO_SEEN_KEY) === "1"
      } catch {
        return false
      }
    }

    const releaseScrollPin = () => {
      if (keepTop) window.removeEventListener("scroll", keepTop)
      window.clearInterval(topWatchId)
      window.clearTimeout(failsafeId)
    }

    const completeIntroLoad = () => {
      if (cancelled || introFinished) return
      introFinished = true
      releaseScrollPin()
      document.body.classList.remove("is-loading")
      try {
        sessionStorage.setItem(LOGO_INTRO_SEEN_KEY, "1")
      } catch {
        // ignore
      }
      setLoaded(true)
    }

    const runLongIntro = (elements: IntroElements) => {
      const petalFlights = elements.petalFlights.filter(Boolean)
      const startedAt = performance.now()
      const markSize = Math.min(window.innerWidth * 0.4, window.innerHeight * 0.4)
      const clearX = window.innerWidth * 0.5 + markSize * 0.75
      const clearY = window.innerHeight * 0.5 + markSize * 0.75
      const flightOrigins = [
        { x: -clearX, y: clearY * 0.92, rotation: -16 },
        { x: -clearX, y: -clearY * 0.28, rotation: -22 },
        { x: 0, y: -clearY, rotation: -6 },
        { x: clearX, y: -clearY * 0.28, rotation: 22 },
        { x: clearX, y: clearY * 0.92, rotation: 16 },
      ]
      const loaderStatus = loaderStatusRef.current
      const loaderLetters = loaderLettersRef.current
      const brandWords = brandWordsRef.current

      forceHomeTop()
      document.body.classList.add("is-loading")
      keepTop = () => {
        if (cancelled || introFinished) return
        if (!document.body.classList.contains("is-loading")) return
        if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0) {
          forceHomeTop()
        }
      }
      keepTop()
      window.addEventListener("scroll", keepTop, { passive: true })
      topWatchId = window.setInterval(keepTop, 100)

      const flight = document.querySelector<HTMLElement>(".logo-flight")
      if (flight) gsap.set(flight, { autoAlpha: 1 })

      gsap.set(elements.logo, {
        opacity: 0,
        scale: 1,
        rotation: 0,
        x: 0,
        y: 0,
        transformOrigin: "center center",
      })
      gsap.set(petalFlights, {
        visibility: "visible",
        opacity: 0,
        scale: motion.loader.assembleScaleFrom,
        x: (index) => flightOrigins[index]?.x ?? 0,
        y: (index) => flightOrigins[index]?.y ?? 0,
        rotation: (index) => flightOrigins[index]?.rotation ?? 0,
        transformOrigin: "center center",
      })
      gsap.set(loaderStatus, { opacity: 0, visibility: "hidden" })
      gsap.set(loaderLetters, { opacity: 1, y: 0 })
      gsap.set(elements.brandName, { opacity: 0, visibility: "visible" })
      gsap.set(brandWords, { opacity: 0, y: 18 })

      const handoffAssemble = () => {
        gsap.set(elements.logo, { opacity: 1 })
        gsap.set(petalFlights, {
          opacity: 0,
          visibility: "hidden",
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
        })
      }

      const assembleDone = new Promise<void>((resolve) => {
        resolveAssemble = resolve
      })

      assemble = gsap
        .timeline({
          onComplete: () => {
            handoffAssemble()
            resolveAssemble?.()
          },
        })
        .to(
          petalFlights,
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: motion.loader.assembleDuration,
            stagger: motion.loader.assembleStagger,
            ease: "power3.out",
          },
          motion.loader.assembleDelay,
        )
        .to(
          loaderStatus,
          {
            opacity: 1,
            visibility: "visible",
            duration: 0.35,
            ease: motion.ease.soft,
          },
          motion.loader.assembleDelay + motion.loader.assembleDuration * 0.45,
        )

      const assembleSettleAt =
        motion.loader.assembleDelay +
        motion.loader.assembleDuration +
        motion.loader.assembleStagger * Math.max(0, petalFlights.length - 1)

      breathing = gsap.to(elements.logo, {
        scale: motion.loader.breatheScale,
        duration: motion.loader.breatheDuration,
        delay: assembleSettleAt,
        repeat: -1,
        yoyo: true,
        ease: motion.ease.inOut,
      })

      loadingPulse = gsap
        .timeline({
          repeat: -1,
          yoyo: true,
          delay:
            motion.loader.assembleDelay + motion.loader.assembleDuration * 0.45,
        })
        .to(loaderLetters, {
          opacity: 0.28,
          y: -2,
          duration: motion.loader.loadingPulseDuration,
          stagger: 0.07,
          ease: "sine.inOut",
        })

      const finishLoading = async () => {
        await waitForPageAssets(elements.root)
        const remaining = Math.max(
          0,
          motion.loader.minimumMs - (performance.now() - startedAt),
        )
        await new Promise((resolve) => window.setTimeout(resolve, remaining))
        if (cancelled) return

        await assembleDone
        if (cancelled) return

        assemble?.kill()
        breathing?.kill()
        loadingPulse?.kill()
        handoffAssemble()
        gsap.set(elements.logo, {
          opacity: 1,
          scale: 1,
          rotation: 0,
          x: 0,
          y: 0,
        })
        reveal = gsap
          .timeline({
            onComplete: completeIntroLoad,
          })
          .to(loaderLetters, {
            opacity: 0,
            y: -8,
            duration: 0.22,
            stagger: 0.025,
            ease: motion.ease.soft,
          })
          .set(loaderStatus, { visibility: "hidden" })
          .to(elements.brandName, { opacity: 1, duration: 0.2 }, "-=0.05")
          .to(
            brandWords,
            {
              opacity: 1,
              y: 0,
              duration: motion.loader.companyRevealDuration,
              stagger: motion.loader.companyWordStagger,
              ease: motion.ease.soft,
            },
            "<",
          )
      }

      void finishLoading()

      failsafeId = window.setTimeout(() => {
        if (cancelled || introFinished) return
        if (!document.body.classList.contains("is-loading")) return
        forceHomeTop()
        completeIntroLoad()
      }, ASSET_FAILSAFE_MS + motion.loader.minimumMs + 4000)
    }

    const start = () => {
      if (cancelled) return
      const elements = getElements()
      if (!elements) {
        retryId = window.setTimeout(start, 32)
        return
      }

      if (prefersReducedMotion) {
        settleAsSeen(elements, false)
        return
      }

      clearIntroSeenOnHardReload()
      if (shouldSkipLongIntro()) {
        settleAsSeen(elements, true)
        return
      }

      introStarted = true
      runLongIntro(elements)
    }

    start()

    // If refs never arrive, still clear the veil instead of hanging forever.
    const bootFailsafeId = window.setTimeout(() => {
      // Long intro owns its own failsafe — never cut it short.
      if (cancelled || introFinished || introStarted) return
      const elements = getElements()
      if (elements) settleAsSeen(elements, true)
      else {
        introFinished = true
        setLoaded(true)
        document.body.classList.remove("is-loading")
      }
    }, 2500)

    return () => {
      cancelled = true
      window.clearTimeout(retryId)
      window.clearTimeout(bootFailsafeId)
      resolveAssemble?.()
      releaseScrollPin()
      assemble?.kill()
      breathing?.kill()
      loadingPulse?.kill()
      reveal?.kill()
      fabEntrance?.kill()
      document.body.classList.remove("is-loading")
    }
  }, [prefersReducedMotion])

  useLayoutEffect(() => {
    if (!loaded || prefersReducedMotion || skipIntroMorph) return
    const elements = getElements()
    if (!elements) return
    return createIntroTimeline(elements)
  }, [loaded, prefersReducedMotion, skipIntroMorph])

  // After the hero leaves view, peel the corner mark petal-by-petal toward
  // the start edge, then settle it there. Reverse when scrolling back.
  useLayoutEffect(() => {
    if (!loaded || prefersReducedMotion) return
    const logo = cornerLogoRef.current
    const hero = document.getElementById("home")
    if (!logo || !hero) return

    const petalOrder = [4, 2, 1, 3, 5]
    const petals = petalOrder
      .map((n) => logo.querySelector<SVGGElement>(`#corner-petal-${n}`))
      .filter((petal): petal is SVGGElement => petal !== null)
    if (petals.length !== 5) return

    const rtl = document.documentElement.dir === "rtl"
    const towardStart = rtl ? 1 : -1
    let run: gsap.core.Timeline | null = null

    const killRun = () => {
      run?.kill()
      run = null
      logo.classList.remove("is-petal-flying")
    }

    const settlePastHero = () => {
      killRun()
      logo.classList.add("is-past-hero")
      gsap.set(logo, { x: towardStart * 10, scale: 0.9, transformOrigin: "center center" })
      gsap.set(petals, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        transformOrigin: "427.5px 427.5px",
      })
    }

    const settleInHero = () => {
      killRun()
      logo.classList.remove("is-past-hero", "is-petal-flying")
      gsap.set(logo, { x: 0, scale: 1, clearProps: "transform" })
      gsap.set(petals, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        clearProps: "transform",
      })
    }

    const flyPetalsToLeft = () => {
      if (logo.classList.contains("is-past-hero") && !run) return
      killRun()
      logo.classList.add("is-past-hero", "is-petal-flying")

      run = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          logo.classList.remove("is-petal-flying")
          run = null
        },
      })

      run.to(
        logo,
        { x: towardStart * 10, scale: 0.9, duration: 0.7, ease: "power2.out" },
        0,
      )

      petals.forEach((petal, index) => {
        const peel = (index % 2 === 0 ? 1 : -1) * 16
        run!.fromTo(
          petal,
          { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 },
          {
            keyframes: [
              {
                x: towardStart * (8 + index * 4),
                y: peel,
                rotation: peel * 1.2,
                scale: 1.12,
                duration: 0.22,
                ease: "power2.out",
              },
              {
                x: towardStart * (48 + index * 16),
                y: peel * 0.35,
                rotation: peel * 2.4,
                scale: 0.72,
                opacity: 0.15,
                duration: 0.38,
                ease: "power2.in",
              },
              {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
                duration: 0.34,
                ease: "back.out(1.6)",
              },
            ],
          },
          0.04 + index * 0.07,
        )
      })
    }

    const flyPetalsHome = () => {
      if (!logo.classList.contains("is-past-hero") && !run) return
      killRun()
      logo.classList.add("is-petal-flying")

      run = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          logo.classList.remove("is-petal-flying")
          settleInHero()
        },
      })

      petals.forEach((petal, index) => {
        const peel = (index % 2 === 0 ? 1 : -1) * 12
        run!.fromTo(
          petal,
          { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 },
          {
            keyframes: [
              {
                x: towardStart * (36 + index * 12),
                y: peel,
                rotation: peel * 2,
                scale: 0.8,
                opacity: 0.35,
                duration: 0.28,
                ease: "power2.in",
              },
              {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: "back.out(1.7)",
              },
            ],
          },
          index * 0.06,
        )
      })

      run.to(
        logo,
        { x: 0, scale: 1, duration: 0.55, ease: "power2.out" },
        0.1,
      )
    }

    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: "bottom top+=56",
      invalidateOnRefresh: true,
      onEnter: flyPetalsToLeft,
      onLeaveBack: flyPetalsHome,
      onRefresh: (self) => {
        if (self.progress > 0) settlePastHero()
        else settleInHero()
      },
    })

    return () => {
      killRun()
      trigger.kill()
      settleInHero()
    }
  }, [loaded, prefersReducedMotion])

  const handleExplore = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    scrollToTarget("#how-it-works", { offset: -88 })
  }

  const handleGoTop = () => {
    scrollToTarget("#home", { offset: 0 })
  }

  return (
    <div className="dam-landing">
      <section className="intro" ref={rootRef}>
        <div
          className="intro__stage"
          ref={stageRef}
          style={
            {
              "--blob-duration": `${motion.ambient.blobDurationSeconds}s`,
            } as CSSProperties
          }
        >
          <div className="hero" id="home" aria-labelledby="hero-title">
            <div className="hero__ambient" aria-hidden="true">
              <span className="hero__blob hero__blob--one" />
              <span className="hero__blob hero__blob--two" />
            </div>

            <div className="hero__layout">
              <div className="hero__blend">
                <div className="hero__glass" ref={heroCardRef}>
                  <div className="hero__content">
                    <p className="hero__eyebrow line-mask">
                      <span ref={collectHeroLine}>{copy.eyebrow}</span>
                    </p>
                    <h1 id="hero-title">
                      {copy.lines.map((line) => (
                        <span className="line-mask" key={line}>
                          <span ref={collectHeroLine}>{line}</span>
                        </span>
                      ))}
                    </h1>
                    <p className="hero__sub line-mask">
                      <span ref={collectHeroLine}>{copy.sub}</span>
                    </p>
                    <div className="line-mask line-mask--cta">
                      <ExploreButton
                        className="hero__cta"
                        href="#how-it-works"
                        ref={collectHeroLine}
                        onClick={handleExplore}
                      >
                        {copy.cta}
                      </ExploreButton>
                    </div>
                  </div>
                </div>

                <div className="hero__stage-wrap" ref={videoStageRef}>
                  <div className="hero__stage">
                    <HeroVideo
                      ref={heroVideoRef}
                      reducedMotion={prefersReducedMotion}
                    />
                    <div className="hero__stage-fade" aria-hidden="true" />
                    <div className="hero__stage-seam" aria-hidden="true" />
                  </div>
                </div>

                <div className="hero__blend-edge" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="loader-surface" ref={overlayRef} aria-hidden="true" />
        </div>

        <div className="logo-flight" aria-hidden="true">
          <LogoMark
            className="logo-flight__mark logo-flight__mark--main"
            ref={logoRef}
          />
          {([4, 2, 1, 3, 5] as const).map((petal, index) => (
            <LogoMark
              className="logo-flight__mark logo-flight__petal-mark"
              idPrefix={`flight-${petal}`}
              key={petal}
              visiblePetal={petal}
              ref={(element) => {
                if (element) petalFlightRefs.current[index] = element
              }}
            />
          ))}
        </div>
        <div
          className={`loader-status${locale === "ar" ? " loader-status--ar" : ""}`}
          ref={loaderStatusRef}
          aria-label={loadingLabel}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          {loadingChars.map((letter, index) => (
            <span
              aria-hidden="true"
              key={`${letter}-${index}`}
              ref={(element) => {
                if (element) loaderLettersRef.current[index] = element
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        <div
          className={`loader-brand${locale === "ar" ? " loader-brand--ar" : ""}`}
          ref={brandNameRef}
          aria-hidden="true"
          lang={locale}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <span
            className="loader-brand__acronym"
            lang="en"
            dir="ltr"
            ref={(element) => {
              if (element) brandWordsRef.current.push(element)
            }}
          >
            DMTC
          </span>
          {copy.brandWords.map((word) => (
            <span
              key={word}
              ref={(element) => {
                if (element) brandWordsRef.current.push(element)
              }}
            >
              {word}
            </span>
          ))}
        </div>
        <div className="corner-target" ref={targetRef} aria-hidden="true" />
        <button
          className="corner-logo"
          ref={cornerLogoRef}
          type="button"
          aria-label={copy.backTop}
          onClick={handleGoTop}
        >
          <LogoMark className="logo-mark logo-mark--live" idPrefix="corner" />
        </button>

        <LandingSiteNav
          navRef={navRef}
          navBarRef={navBarRef}
          collectNavItem={collectNavItem}
          scrollTo={scrollToTarget}
        />
        <ThemeToggle ref={themeToggleRef} />
        <LandingLanguageSwitcher ref={langSwitchRef} />

        <div className="landing-fab-row">
          <ChatWidget ref={aiChatRef} revealed={false} />
          <div className="landing-whatsapp-btn" ref={whatsappRef}>
            <WhatsAppButton />
          </div>
        </div>
      </section>
    </div>
  )
}
