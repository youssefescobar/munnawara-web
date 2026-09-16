import type { AppLocale } from "@/content/types"

export const primaryNav = [
  { href: "/fleet", key: "fleet" as const },
  { href: "/hajj-umrah", key: "hajjUmrah" as const },
  { href: "/companies", key: "companies" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
] as const

export const secondaryNav = [
  { href: "/corporate", key: "corporate" as const },
  { href: "/clients", key: "clients" as const },
  { href: "/gallery", key: "gallery" as const },
  { href: "/news", key: "news" as const },
  { href: "/careers", key: "careers" as const },
] as const

export const footerExplore = [
  { href: "/", key: "home" as const },
  { href: "/fleet", key: "fleet" as const },
  { href: "/hajj-umrah", key: "hajjUmrah" as const },
  { href: "/corporate", key: "corporate" as const },
  { href: "/gallery", key: "gallery" as const },
  { href: "/news", key: "news" as const },
] as const

export const footerCompany = [
  { href: "/about", key: "about" as const },
  { href: "/companies", key: "companies" as const },
  { href: "/clients", key: "clients" as const },
  { href: "/careers", key: "careers" as const },
  { href: "/contact", key: "contact" as const },
] as const

export type NavKey =
  | (typeof primaryNav)[number]["key"]
  | (typeof secondaryNav)[number]["key"]
  | "home"

export type LocaleDir = AppLocale
