import { FleetCheck } from "@/components/fleet/FleetCheck"
import { FleetShowroom } from "@/components/fleet/FleetShowroom"
import { getFleet, getFleetPage } from "@/content"
import type { AppLocale } from "@/content/types"
import { Link } from "@/i18n/navigation"
import { buildPageMetadata } from "@/lib/seo"
import { getTranslations, setRequestLocale } from "next-intl/server"
import Image from "next/image"

type PageProps = {
  params: Promise<{ locale: string }>
}

const FleetPage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const appLocale = locale as AppLocale
  const fleet = getFleet(appLocale)
  const page = getFleetPage(appLocale)
  const tCommon = await getTranslations("common")
  const lead = fleet[1] ?? fleet[0]

  return (
    <div className="overflow-hidden pt-20">
      <section className="mx-auto grid max-w-[80rem] items-center gap-10 px-4 pt-6 md:px-10 md:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14">
        <div>
          <h1 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] leading-[1.05] font-semibold tracking-tight text-ink">
            {page.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink md:text-xl">{page.subtitle}</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">{page.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="inline-flex rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
            >
              {tCommon("requestQuote")}
            </Link>
            <a
              href="#showroom"
              className="inline-flex rounded-full px-6 py-3 text-sm font-semibold text-ink ring-1 ring-ink/20 transition hover:ring-ink/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
            >
              {page.exploreTitle}
            </a>
          </div>
        </div>
        {lead ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-surface-muted">
            <Image
              src={lead.coverImage}
              alt={lead.name}
              fill
              priority
              sizes="(min-width:1024px) 55vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </section>

      <section
        id="showroom"
        className="mx-auto mt-20 max-w-[80rem] scroll-mt-24 px-4 md:mt-28 md:px-10"
        aria-labelledby="fleet-explore-heading"
      >
        <div className="mb-8 max-w-2xl">
          <h2
            id="fleet-explore-heading"
            className="font-display text-3xl font-semibold tracking-tight text-ink md:text-5xl"
          >
            {page.exploreTitle}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">{page.exploreSubtitle}</p>
        </div>
        <FleetShowroom categories={fleet} />
      </section>

      <section
        className="mx-auto mt-20 grid max-w-[80rem] gap-8 px-4 md:mt-28 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-14"
        aria-labelledby="fleet-highlights-heading"
      >
        <h2
          id="fleet-highlights-heading"
          className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl lg:sticky lg:top-28 lg:self-start"
        >
          {page.highlightsTitle}
        </h2>
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {page.highlights.map((item) => (
            <li
              key={item}
              className="flex gap-3 border-b border-border py-4 text-start text-base leading-snug text-ink/85"
            >
              <FleetCheck />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mx-auto mt-20 max-w-[80rem] px-4 pb-16 md:mt-28 md:px-10 md:pb-24"
        aria-labelledby="fleet-clients-heading"
      >
        <div className="rounded-[2rem] bg-black px-6 py-12 text-white sm:px-10 sm:py-16 md:px-16">
          <h2
            id="fleet-clients-heading"
            className="max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {page.clientsTitle}
          </h2>
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {page.clients.map((item) => (
              <li
                key={item}
                className="rounded-full px-4 py-2 text-sm leading-snug text-white/85 ring-1 ring-white/20"
              >
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/quote"
            className="mt-10 inline-flex rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {tCommon("requestQuote")}
          </Link>
        </div>
      </section>
    </div>
  )
}

export const generateMetadata = async ({ params }: PageProps) =>
  buildPageMetadata((await params).locale, "fleet")

export default FleetPage
