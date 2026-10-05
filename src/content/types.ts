export type AppLocale = "ar" | "en"

export type CompanySlug =
  | "transport"
  | "umrah-services"
  | "tourism"
  | "hospitality-catering"

export type Company = {
  slug: CompanySlug
  name: string
  summary: string | null
  services: readonly string[]
  /** Subsidiary brand lockup on dark background */
  logo: string
  heroImage: string
  contentReady: boolean
}

export type FleetCategoryId =
  | "premium-vip-2026"
  | "vip-2026"
  | "coach-2025-2026"
  | "city-2025"
  | "labour-2024"
  | "coaster-2026"

export type FleetCategory = {
  id: FleetCategoryId
  name: string
  seatsLabel: string
  summary: string
  amenities: readonly string[]
  coverImage: string
  exteriorImages: readonly string[]
  interiorImages: readonly string[]
  images: readonly string[]
  interactive?: boolean
}

export type FleetPageContent = {
  title: string
  subtitle: string
  intro: string
  typesEyebrow: string
  highlightsTitle: string
  highlights: readonly string[]
  clientsTitle: string
  clients: readonly string[]
  exploreTitle: string
  exploreSubtitle: string
}

export type ClientCategory = {
  id: string
  label: string
  description: string
}

export type FaqItem = {
  id: string
  question: string
  answer: string
}

export type NewsPost = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  body: string
  /** Optional cover; null until editorial assets are provided */
  coverImage: string | null
}

export type CareerRole = {
  id: string
  title: string
  location: string
  type: string
  summary: string
}

export type AboutFilmFeature = {
  id: string
  line: string
}

export type AboutFilmCompanyBeat = {
  id: string
  name: string
  logo: string
}

export type AboutFilmContent = {
  brandName: string
  journeyHeadline: string
  journeySupport: string
  worldHeadline: string
  worldBody: string
  problemHeadline: string
  problemLines: readonly string[]
  connectionHeadline: string
  connectionBody: string
  fleetHeadline: string
  fleetBody: string
  sidesLeft: string
  sidesRight: string
  sidesMerge: string
  detailsHeadline: string
  detailsImageNote: string
  details: readonly AboutFilmFeature[]
  humanLine1: string
  humanLine2: string
  videoHeadline: string
  videoLabel: string
  ctaHeadline: string
  ctaBody: string
  ctaLabel: string
  ctaHref: string
  companies: readonly AboutFilmCompanyBeat[]
}

export type AboutContent = {
  title: string
  intro: string
  historyTitle: string
  history: string
  missionTitle: string
  mission: string
  /** Omit fabricated CR — null until client provides */
  licensingNote: string | null
  /** Cinematic About film narrative */
  film: AboutFilmContent
}

export type Testimonial = {
  id: string
  quote: string
  name: string
  role: string
  /** Optional avatar path; null uses placeholder */
  avatar: string | null
}

export type HomeValueBullet = {
  id: string
  title: string
  description: string
}

export type HomeHowStep = {
  id: string
  number: string
  title: string
  description: string
  ctaLabel: string | null
  ctaHref: string | null
}

export type LandingHeroContent = {
  eyebrow: string
  /** Headline rows; the last row uses the brand blue accent. */
  lines: readonly string[]
  sub: string
  cta: string
  /** Words of the intro brand line; first is orange, last is blue. Arabic uses 3 (درة المنورة للنقل). */
  brandWords: readonly string[]
  backTop: string
  chatAria: string
}

export type HomeContent = {
  landingHero: LandingHeroContent
  valueTitle: string
  valueIntro: string
  valueImage: string
  valueBullets: readonly HomeValueBullet[]
  passbyEyebrow: string
  passbyTitle: string
  passbyTitleAfter: string
  howTitle: string
  howSubtitle: string
  howStepPrefix: string
  howSteps: readonly HomeHowStep[]
  aboutEyebrow: string
  aboutCta: string
  aboutImage: string
  aboutHeadlineLines: readonly [string, string]
  aboutSecondaryCta: string
  aboutSocialCta: string
  quoteEyebrow: string
  quoteHeadline: string
  quoteBody: string
  testimonialsTitle: string
  testimonialsSubtitle: string
  testimonialsCta: string
  testimonialsEmpty: string
  newsTitle: string
  newsSubtitle: string
  newsEmpty: string
  faqTitle: string
  faqSubtitle: string
  faqCta: string
  ctaBandEyebrow: string
  ctaBandTitle: string
  ctaBandSubtitle: string
}

export type CareRevealBenefitIcon = "group" | "signal" | "shield" | "route"

export type CareRevealBenefit = {
  id: string
  icon: CareRevealBenefitIcon
  label: string
}

export type CareRevealContent = {
  eyebrow: string
  headingLines: readonly [string, string]
  body: string
  benefits: readonly CareRevealBenefit[]
}

export type ContactContent = {
  headline: string
  intro: string
  heroImageAlt: string
  whatsappCta: string
  channelsTitle: string
  whatsappNote: string
  phoneLabel: string
  emailNote: string
  officeTitle: string
  mapTitle: string
  mapsLink: string
  quoteTitle: string
  quoteBody: string
  quoteHref: string
}

export type SiteConfig = {
  brandNameAr: string
  brandNameEn: string
  brandShort: string
  email: string
  phones: readonly string[]
  whatsappNumber: string
  address: {
    ar: string
    en: string
  }
  workingHours: {
    ar: string
    en: string
  }
  social: {
    handle: string
    twitter?: string
    facebook?: string
    instagram?: string
    snapchat?: string
  }
  siteUrl: string
}
