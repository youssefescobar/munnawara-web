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
  valueTitle: "Transport worthy of sacred journeys",
  valueIntro:
    "Durrah Al-Munawwara Group brings together a modern fleet, disciplined operations and clear communication, so pilgrims, Umrah groups and institutions travel with peace of mind.",
  valueImage: "/fleet/premium-vip-2026/exterior/pv-out-1.webp",
  valueBullets: [
    {
      id: "safety",
      title: "Safety first",
      description: "Disciplined operations and qualified drivers on every assignment.",
    },
    {
      id: "licensed",
      title: "One accountable group",
      description: "Integrated companies under one brand, with one standard of service.",
    },
    {
      id: "fleet",
      title: "Modern fleet",
      description: "Current-model coaches in VIP and group classes, ready for what you need.",
    },
    {
      id: "tracked",
      title: "Journey clarity",
      description: "Clear coordination from first request to confirmed trip.",
    },
  ],
  passbyEyebrow: "Durrah Al-Munawwara",
  passbyTitle: "You name the destination",
  passbyTitleAfter: "we'll get you there",
  howTitle: "How it works",
  howSubtitle: "Three simple steps, from your request to a confirmed trip.",
  howStepPrefix: "Step",
  howSteps: [
    {
      id: "request",
      number: "01",
      title: "Tell us about your trip… we take it from there",
      description:
        "Send us the trip type, destination, date and passenger count through the quote form or WhatsApp, and our team will come back with the best-fit option.",
      ctaLabel: "Request a quote",
      ctaHref: "#quote",
    },
    {
      id: "quote",
      number: "02",
      title: "We prepare the right fit",
      description:
        "We put clear options and first-class services in front of you, and you choose what suits your trip.",
      ctaLabel: null,
      ctaHref: null,
    },
    {
      id: "confirm",
      number: "03",
      title: "We confirm your trip and handle every detail",
      description:
        "Once you approve the offer, we assign the right coach and coordinate every detail, so everything is ready on time.",
      ctaLabel: "Contact us",
      ctaHref: "/contact",
    },
  ],
  aboutEyebrow: "About the group",
  aboutCta: "Discover our story",
  aboutSecondaryCta: "Contact us",
  aboutSocialCta: "Follow @dmtcSA",
  aboutImage: "/hero/landing-sky.jpg",
  aboutHeadlineLines: [
    "Safe, comfortable journeys.",
    "Organized fleet. Clear standards. A commitment that stays the same.",
  ],
  quoteEyebrow: "Start planning",
  quoteHeadline: "Leave it with us. We'll arrange the rest.",
  quoteBody:
    "Tell us the trip type, cities, dates and passenger count, and our team will follow up with clear options.",
  testimonialsTitle: "Partners in every journey",
  testimonialsSubtitle:
    "Organized transport for Hajj and Umrah campaigns, institutions and formal assignments.",
  testimonialsCta: "Contact us",
  // TODO(content): replace once client provides approved testimonials
  testimonialsEmpty: "Client testimonials will appear here once approved for publication.",
  newsTitle: "News from the group",
  newsSubtitle:
    "Season updates, fleet news and announcements from Durrah Al-Munawwara.",
  newsEmpty: "No news yet. Check back soon, more is on the way.",
  faqTitle: "FAQs",
  faqSubtitle: "Answers to questions groups and institutions ask most often.",
  faqCta: "Contact us",
  ctaBandEyebrow: "Organized transport, at a new standard",
  ctaBandTitle: "Leave it with us, we'll arrange the rest.",
  ctaBandSubtitle:
    "Send us your trip details and our team will follow up with clear options.",
}
