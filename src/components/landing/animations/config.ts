export const animationConfig = {
  loader: {
    /** Brand beat holds at least this long; slow assets extend it (see waitForPageAssets). */
    minimumMs: 5000,
    /** Empty dark beat before petals enter from off-screen. */
    assembleDelay: 0.4,
    /** Petals fly in from outside the viewport and lock in the center. */
    assembleDuration: 1.7,
    assembleStagger: 0.14,
    assembleScaleFrom: 0.94,
    loadingPulseDuration: 0.5,
    companyRevealDuration: 0.45,
    companyWordStagger: 0.055,
    breatheDuration: 2.2,
    breatheScale: 1.025,
    hintDuration: 0.4,
  },
  intro: {
    petalStart: 0.05,
    petalTravelStagger: 0.1,
    logoTravelDuration: 1.1,
    logoHandoffDuration: 0.06,
    logoHandoffStart: 1.55,
    overlayFadeStart: 0.06,
    overlayFadeDuration: 0.55,
    navStart: 1.62,
    navDuration: 0.38,
    navItemStagger: 0.05,
    heroStart: 0.85,
    heroLineDuration: 0.24,
    heroLineStagger: 0.055,
    /** Beat after brand reveal before auto-morph to toolbar/hero */
    autoPlayDelayMs: 320,
  },
  smoothScroll: {
    duration: 1.15,
  },
  ambient: {
    blobDurationSeconds: 18,
  },
  video: {
    introStart: 0.95,
    fadeDuration: 0.85,
    loop: false,
    objectPositionDesktop: "70% center",
    objectPositionMobile: "center center",
    mobileBreakpoint: 980,
    /** Freeze playback this many seconds before the true end */
    endFrameOffsetSeconds: 1,
    intersectionThreshold: 0.08,
  },
  glass: {
    cardRevealStart: 0.62,
    cardRevealDuration: 0.52,
    cardRadius: 28,
    buttonRadius: 999,
  },
  videoFrame: {
    radius: 28,
    revealStart: 0.8,
    revealDuration: 0.82,
  },
  aiChat: {
    revealDuration: 0.55,
  },
  whatsapp: {
    revealDuration: 0.5,
  },
  videoBleed: {
    left: "4rem",
    right: "0rem",
    top: "0rem",
    bottom: "0rem",
    strength: 0.45,
    divCount: 4,
  },
  ease: {
    soft: "power3.out",
    inOut: "power2.inOut",
    linear: "none",
  },
} as const
