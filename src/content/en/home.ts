import type { HomeContent } from "../types"

export const home: HomeContent = {
  landingHero: {
    eyebrow: "Durrah Al Munawwara Transportation",
    lines: ["Moving", "you", "forward"],
    sub: "Premium journeys, thoughtfully driven across every mile.",
    cta: "Explore our services",
    brandWords: ["DURRAH", "AL", "MUNAWWARA", "TRANSPORTATION"],
    backTop: "DMTC, back to top",
    chatAria: "Chat with DMTC",
  },
  valueTitle: "Transport built for sacred journeys",
  valueIntro:
    "Durrah Al-Munawwara Group coordinates modern coaches, careful operations, and clear communication so pilgrims and institutions travel with confidence.",
  valueImage: "/fleet/premium-vip-2026/exterior/pv-out-1.webp",
  valueBullets: [
    {
      id: "safety",
      title: "Safety first",
      description: "Disciplined operations and trained drivers for every assignment.",
    },
    {
      id: "licensed",
      title: "Licensed group",
      description: "Organized subsidiaries under one accountable brand.",
    },
    {
      id: "fleet",
      title: "Modern fleet",
      description: "Current-model coaches across VIP and group categories.",
    },
    {
      id: "tracked",
      title: "Journey clarity",
      description: "Clear coordination from quote to confirmed trip.",
    },
  ],
  passbyEyebrow: "Durrah Al-Munawwara",
  passbyTitle: "every journey, carefully arranged",
  passbyTitleAfter: "from quote to confirmed departure",
  howTitle: "How it works",
  howSubtitle: "Three clear steps from request to confirmed transport.",
  howStepPrefix: "Step",
  howSteps: [
    {
      id: "request",
      number: "01",
      title: "Tell us about your trip… we handle the rest",
      description:
        "Share the trip type, destination, date, and number of passengers through the quote form or WhatsApp, and our team will contact you with the best option for your trip.",
      ctaLabel: "Request a quote",
      ctaHref: "#quote",
    },
    {
      id: "quote",
      number: "02",
      title: "We prepare the best option for you",
      description:
        "We offer you different options and outstanding services so you can choose what suits your trip.",
      ctaLabel: null,
      ctaHref: null,
    },
    {
      id: "confirm",
      number: "03",
      title: "We confirm your trip and prepare every detail..",
      description:
        "Once the offer is approved, we prepare the right bus and coordinate the trip details so everything is ready at the scheduled time.",
      ctaLabel: "Contact us",
      ctaHref: "/contact",
    },
  ],
  aboutEyebrow: "About the group",
  aboutCta: "Read our story",
  aboutSecondaryCta: "Contact us",
  aboutSocialCta: "Follow @dmtcSA",
  aboutImage: "/hero/landing-sky.jpg",
  aboutHeadlineLines: [
    "Safe, comfortable journeys.",
    "Organized fleet. Clear standards.",
  ],
  quoteEyebrow: "Plan your trip",
  quoteHeadline: "Sit back. We'll coordinate the rest.",
  quoteBody:
    "Share trip type, cities, dates, and passenger count. Our team follows up with clear options.",
  testimonialsTitle: "Partners we serve",
  testimonialsSubtitle:
    "Organized transport for campaigns, institutions, and formal assignments.",
  testimonialsCta: "Contact us",
  // TODO(content): replace once client provides approved testimonials
  testimonialsEmpty: "Client testimonials will appear here once approved for publication.",
  newsTitle: "Read about the group",
  newsSubtitle:
    "Seasonal notes, fleet updates, and announcements from Durrah Al-Munawwara.",
  newsEmpty: "No news posts yet. Check back soon.",
  faqTitle: "FAQs",
  faqSubtitle: "Answers to questions groups and institutions ask most often.",
  faqCta: "Contact us",
  ctaBandEyebrow: "Experience organized transport like never before",
  ctaBandTitle: "Sit back, we'll coordinate the rest.",
  ctaBandSubtitle:
    "Share your trip details and our team will follow up with clear options.",
}
