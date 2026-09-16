import { footerCompany, footerExplore } from "@/components/layout/navConfig"
import { getCompanies, getSiteConfig } from "@/content"
import type { AppLocale } from "@/content/types"
import { Link } from "@/i18n/navigation"
import { Mail, MapPin, Phone } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import Image from "next/image"

const SocialX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const SocialFacebook = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.78 8.44-4.93 8.44-9.94z" />
  </svg>
)

const SocialInstagram = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11 1.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7.5A4.5 4.5 0 1 1 12 16.5 4.5 4.5 0 0 1 12 7.5zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
  </svg>
)

export const Footer = async () => {
  const t = await getTranslations("footer")
  const tNav = await getTranslations("nav")
  const tCommon = await getTranslations("common")
  const tMeta = await getTranslations("meta")
  const locale = (await getLocale()) as AppLocale
  const companies = getCompanies(locale).filter((c) => c.contentReady)
  const config = getSiteConfig()
  const year = new Date().getFullYear()
  const address = locale === "ar" ? config.address.ar : config.address.en
  const hours =
    locale === "ar" ? config.workingHours.ar : config.workingHours.en

  const socials = [
    { href: config.social.twitter, label: "X", Icon: SocialX },
    { href: config.social.facebook, label: "Facebook", Icon: SocialFacebook },
    { href: config.social.instagram, label: "Instagram", Icon: SocialInstagram },
  ] as const

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(243_112_33/0.18),transparent_45%)]"
        aria-hidden
      />

      <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-[80rem] flex-col gap-6 px-4 py-12 md:flex-row md:items-end md:justify-between md:px-10 md:py-14">
          <div className="max-w-xl">
            <p className="font-label text-[11px] font-semibold tracking-[0.22em] text-orange uppercase">
              {t("ctaEyebrow")}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55 md:text-base">
              {t("ctaSubtitle")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="font-label inline-flex items-center justify-center rounded-full bg-orange px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {tCommon("requestQuote")}
            </Link>
            <a
              href={`https://wa.me/${config.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {tCommon("whatsapp")}
            </a>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-[80rem] gap-12 px-4 py-14 md:grid-cols-12 md:gap-10 md:px-10 md:py-16">
        <div className="md:col-span-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            aria-label={tMeta("siteName")}
          >
            <Image
              src="/logo.png"
              alt=""
              width={605}
              height={491}
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
            {t("tagline")}
          </p>
          <div className="mt-6 flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-orange hover:bg-orange hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="font-label text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">
            {t("explore")}
          </p>
          <ul className="mt-4 space-y-2.5">
            {footerExplore.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/70 transition hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                >
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="font-label text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">
            {t("company")}
          </p>
          <ul className="mt-4 space-y-2.5">
            {footerCompany.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/70 transition hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                >
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
            {companies.slice(0, 3).map((company) => (
              <li key={company.slug}>
                <Link
                  href={`/companies/${company.slug}`}
                  className="text-sm text-white/70 transition hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                >
                  {company.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="font-label text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">
            {t("contact")}
          </p>
          <ul className="mt-4 space-y-4 text-sm text-white/70">
            <li className="flex gap-3">
              <MapPin
                size={16}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0 text-orange"
              />
              <span className="leading-relaxed">{address}</span>
            </li>
            <li className="flex gap-3">
              <Phone
                size={16}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0 text-orange"
              />
              <div className="space-y-1" dir="ltr">
                {config.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone}`}
                    className="block transition hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                  >
                    {phone}
                  </a>
                ))}
              </div>
            </li>
            <li className="flex gap-3">
              <Mail
                size={16}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0 text-orange"
              />
              <a
                href={`mailto:${config.email}`}
                className="transition hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
              >
                {config.email}
              </a>
            </li>
          </ul>
          <p className="mt-5 text-xs text-white/40">{hours}</p>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-[80rem] flex-col gap-3 px-4 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <p>
            © {year} {config.brandShort}. {t("rights")}
          </p>
          <p className="font-label tracking-wide">
            {tMeta("siteName")} · {tMeta("siteNameEn")}
          </p>
        </div>
      </div>
    </footer>
  )
}
