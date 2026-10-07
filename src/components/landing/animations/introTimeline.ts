import gsap from 'gsap'
import { animationConfig as motion } from './config'

export type IntroElements = {
  root: HTMLElement
  stage: HTMLElement
  logo: SVGSVGElement
  petalFlights: SVGSVGElement[]
  target: HTMLElement
  cornerLogo: HTMLElement
  overlay: HTMLElement
  brandName: HTMLElement
  nav: HTMLElement
  navBar: HTMLElement
  navItems: HTMLElement[]
  langSwitch: HTMLElement
  themeToggle: HTMLElement
  heroLines: HTMLElement[]
  videoLayer: HTMLElement
  videoStage: HTMLElement
  heroCard: HTMLElement
  aiChat: HTMLElement
  whatsapp: HTMLElement
  playVideo: () => void
}

type Destination = { x: number; y: number; scale: number }

function destinationFor(logo: SVGSVGElement, target: HTMLElement): Destination {
  const to = target.getBoundingClientRect()
  const flight = logo.parentElement?.getBoundingClientRect()
  const width = logo.clientWidth
  const centerX = flight ? flight.left + flight.width / 2 : window.innerWidth / 2
  const centerY = flight ? flight.top + flight.height / 2 : window.innerHeight / 2

  return {
    x: to.left + to.width / 2 - centerX,
    y: to.top + to.height / 2 - centerY,
    scale: to.width / width,
  }
}

export function setIntroFinalState(
  elements: IntroElements,
  options?: { animateFabs?: boolean },
) {
  gsap.set(elements.logo, { opacity: 0 })
  gsap.set(elements.petalFlights, { opacity: 0 })
  gsap.set(elements.cornerLogo, { opacity: 1, visibility: 'visible' })
  gsap.set(elements.overlay, { opacity: 0, visibility: 'hidden' })
  gsap.set(elements.brandName, { opacity: 0, visibility: 'hidden' })
  gsap.set(elements.nav, { visibility: 'visible' })
  gsap.set(elements.navBar, { scaleX: 1, opacity: 1 })
  gsap.set(elements.navItems, { x: 0, opacity: 1 })
  gsap.set(
    [elements.langSwitch, elements.themeToggle],
    { opacity: 1, visibility: 'visible', y: 0 },
  )
  gsap.set(elements.heroLines, { yPercent: 0, opacity: 1 })
  gsap.set(elements.videoLayer, { opacity: 1 })
  gsap.set(elements.videoStage, {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
    clearProps: 'clipPath',
  })
  gsap.set(elements.heroCard, { opacity: 1, y: 0, scale: 1, rotate: 0 })

  if (options?.animateFabs) {
    hideFabs(elements)
  } else {
    showFabsSettled(elements)
  }
}

function fabFromX() {
  return document.documentElement.dir === 'rtl' ? -28 : 28
}

function hideFabs(elements: Pick<IntroElements, 'aiChat' | 'whatsapp'>) {
  const fromX = fabFromX()
  const rtl = document.documentElement.dir === 'rtl'
  gsap.set([elements.aiChat, elements.whatsapp], {
    opacity: 0,
    scale: 0.35,
    y: 36,
    x: fromX,
    rotate: rtl ? 18 : -18,
    visibility: 'hidden',
    pointerEvents: 'none',
    transformOrigin: 'center center',
  })
}

function showFabsSettled(elements: Pick<IntroElements, 'aiChat' | 'whatsapp'>) {
  gsap.set([elements.aiChat, elements.whatsapp], {
    opacity: 1,
    scale: 1,
    y: 0,
    x: 0,
    rotate: 0,
    visibility: 'visible',
    pointerEvents: 'auto',
  })
  elements.aiChat.classList.add('is-revealed')
  elements.whatsapp.classList.add('is-revealed')
}

/** Pop AI + WhatsApp into place after the intro morph settles. */
export function playFabEntrance(
  elements: Pick<IntroElements, 'aiChat' | 'whatsapp'>,
) {
  const fromX = fabFromX()
  const rtl = document.documentElement.dir === 'rtl'

  gsap.killTweensOf([elements.aiChat, elements.whatsapp])
  gsap.set([elements.aiChat, elements.whatsapp], {
    opacity: 0,
    scale: 0.35,
    y: 36,
    x: fromX,
    rotate: rtl ? 18 : -18,
    visibility: 'visible',
    pointerEvents: 'none',
    transformOrigin: 'center center',
  })

  const timeline = gsap.timeline({
    defaults: { ease: 'back.out(2.2)' },
    onComplete: () => {
      elements.aiChat.classList.add('is-revealed')
      elements.whatsapp.classList.add('is-revealed')
    },
  })

  timeline
    .to(elements.aiChat, {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      rotate: 0,
      duration: motion.aiChat.revealDuration,
      pointerEvents: 'auto',
    })
    .to(
      elements.whatsapp,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        rotate: 0,
        duration: motion.whatsapp.revealDuration,
        pointerEvents: 'auto',
      },
      0.1,
    )

  return timeline
}

export function createIntroTimeline(elements: IntroElements) {
  const petals = Array.from(elements.logo.querySelectorAll<SVGGElement>('.petal'))
  const destination = () => destinationFor(elements.logo, elements.target)
  let state: 'start' | 'forward' | 'end' = 'start'

  const rtl = document.documentElement.dir === 'rtl'
  /* Mobile menu sits on the end side; desktop pill grows from the start */
  const isMobileNav = window.matchMedia(`(max-width: ${motion.video.mobileBreakpoint}px)`).matches
  const navOrigin = isMobileNav
    ? rtl
      ? 'left center'
      : 'right center'
    : rtl
      ? 'right center'
      : 'left center'
  const cardOrigin = rtl ? 'right center' : 'left center'
  const stageOrigin = rtl ? '35% 55%' : '65% 55%'
  const navItemFrom = rtl ? 12 : -12

  const flight = elements.logo.parentElement
  if (flight) gsap.set(flight, { autoAlpha: 1 })

  gsap.set(petals, { clearProps: 'transform', opacity: 1 })
  gsap.set(elements.logo, {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
    transformOrigin: 'center center',
  })
  // The loader hands off with these `visibility: hidden`; make them paintable (still opacity 0).
  gsap.set(elements.petalFlights, {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 0,
    visibility: 'visible',
    transformOrigin: 'center center',
  })
  gsap.set(elements.cornerLogo, { opacity: 0, visibility: 'visible' })
  // Freeze the corner mark's idle petal dance at its rest pose until the handoff,
  // so the landing petals match it exactly.
  elements.cornerLogo.classList.add('is-petal-flying')
  gsap.set(elements.nav, { visibility: 'visible' })
  gsap.set(elements.navBar, { scaleX: 0, opacity: 0, transformOrigin: navOrigin })
  gsap.set(elements.navItems, { x: navItemFrom, opacity: 0 })
  gsap.set(
    [elements.langSwitch, elements.themeToggle],
    { opacity: 0, visibility: 'visible', y: -10 },
  )
  gsap.set(elements.heroLines, { yPercent: 115, opacity: 0 })
  gsap.set(elements.videoLayer, { opacity: 0 })
  gsap.set(elements.videoStage, {
    opacity: 0,
    y: 64,
    scale: 0.86,
    rotate: rtl ? 2.5 : -2.5,
    filter: 'blur(14px)',
    transformOrigin: stageOrigin,
    clipPath: 'inset(18% 22% 18% 22% round 28px)',
  })
  gsap.set(elements.heroCard, {
    opacity: 0,
    y: 36,
    scale: 0.94,
    rotate: rtl ? -1.5 : 1.5,
    transformOrigin: cardOrigin,
  })
  hideFabs(elements)
  gsap.set(elements.brandName, { opacity: 1, y: 0, visibility: 'visible' })

  const unlockScroll = () => document.body.classList.remove('is-transitioning')
  let fabEntrance: gsap.core.Timeline | undefined
  const timeline = gsap.timeline({
    paused: true,
    defaults: { ease: motion.ease.inOut },
    onComplete: () => {
      state = 'end'
      unlockScroll()
      // Keep the flight layer dead after handoff so soft returns can't revive it.
      if (flight) gsap.set(flight, { autoAlpha: 0 })
      gsap.set(elements.logo, { opacity: 0, visibility: 'hidden' })
      // FABs land after the morph — not during loading / petal flight
      fabEntrance = playFabEntrance(elements)
    },
  })

  timeline
    .to(
      elements.overlay,
      { opacity: 0, duration: motion.intro.overlayFadeDuration, ease: motion.ease.inOut },
      motion.intro.overlayFadeStart,
    )
    .to(
      elements.brandName,
      { opacity: 0, y: -12, duration: 0.24, ease: motion.ease.soft },
      0,
    )
    .call(elements.playVideo, [], motion.video.introStart)
    .to(
      elements.videoLayer,
      {
        opacity: 1,
        duration: motion.video.fadeDuration,
        ease: motion.ease.inOut,
      },
      motion.video.introStart,
    )
    .to(
      elements.videoStage,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        filter: 'blur(0px)',
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: motion.videoFrame.revealDuration,
        ease: 'power3.out',
      },
      motion.videoFrame.revealStart,
    )
    .set(elements.videoStage, { clearProps: 'clipPath' }, `>`)
    .to(
      elements.heroCard,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        duration: motion.glass.cardRevealDuration,
        ease: motion.ease.soft,
      },
      motion.glass.cardRevealStart,
    )
    .set(elements.logo, { opacity: 0 }, motion.intro.petalStart)
    .set(elements.petalFlights, { opacity: 1 }, motion.intro.petalStart)

  elements.petalFlights.forEach((petal, index) => {
    const start = motion.intro.petalStart + index * motion.intro.petalTravelStagger
    timeline
      .to(
        petal,
        {
          duration: motion.intro.logoTravelDuration,
          x: () => destination().x,
          ease: 'power3.inOut',
        },
        start,
      )
      .to(
        petal,
        {
          duration: motion.intro.logoTravelDuration,
          y: () => destination().y,
          scale: () => destination().scale,
          ease: motion.ease.inOut,
        },
        start,
      )
  })

  timeline
    .to(
      elements.heroLines,
      {
        yPercent: 0,
        opacity: 1,
        duration: motion.intro.heroLineDuration,
        stagger: motion.intro.heroLineStagger,
        ease: motion.ease.soft,
      },
      motion.intro.heroStart,
    )
    // Corner logo (above the flight layer) fades in under the landing petals; the
    // flight layer is hidden only once it is fully opaque, so there is no alpha dip or snap.
    .to(
      elements.cornerLogo,
      { opacity: 1, duration: motion.intro.logoHandoffDuration, ease: 'sine.inOut' },
      motion.intro.logoHandoffStart,
    )
    .call(
      () => {
        gsap.set(elements.petalFlights, { opacity: 0, visibility: 'hidden' })
        elements.cornerLogo.classList.remove('is-petal-flying')
      },
      [],
      motion.intro.logoHandoffStart + motion.intro.logoHandoffDuration,
    )
    .to(
      elements.navBar,
      {
        scaleX: 1,
        opacity: 1,
        duration: motion.intro.navDuration,
        ease: motion.ease.soft,
      },
      motion.intro.navStart,
    )
    .to(
      elements.navItems,
      {
        x: 0,
        opacity: 1,
        duration: motion.intro.navDuration,
        stagger: motion.intro.navItemStagger,
        ease: motion.ease.soft,
      },
      motion.intro.navStart + 0.08,
    )
    .to(
      [elements.langSwitch, elements.themeToggle],
      {
        opacity: 1,
        y: 0,
        duration: motion.intro.navDuration,
        ease: motion.ease.soft,
        stagger: 0.04,
      },
      motion.intro.navStart + 0.12,
    )
    .set(elements.logo, { opacity: 0 }, motion.intro.logoHandoffStart)

  const playForward = () => {
    if (state === 'forward' || state === 'end') return
    state = 'forward'
    document.body.classList.add('is-transitioning')
    timeline.play()
  }

  // Auto-morph after the logo bloom — no scroll / click gate
  const autoPlayId = window.setTimeout(
    playForward,
    motion.intro.autoPlayDelayMs,
  )

  return () => {
    window.clearTimeout(autoPlayId)
    fabEntrance?.kill()
    timeline.kill()
  }
}
