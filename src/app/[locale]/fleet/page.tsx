import { FleetCheck } from "@/components/fleet/FleetCheck"
import { FleetHero } from "@/components/fleet/FleetHero"
import { FleetShowroom } from "@/components/fleet/FleetShowroom"
import { getFleet, getFleetPage } from "@/content"
import type { AppLocale } from "@/content/types"
import { Link } from "@/i18n/navigation"
import { buildPageMetadata } from "@/lib/seo"
import { getTranslations, setRequestLocale } from "next-intl/server"

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
  const nameOf = (id: string) => fleet.find((bus) => bus.id === id)?.name ?? ""
  // Left-to-right order of the buses in /fleet/preview.webp.
  const busLabels = [nameOf("city-2025"), nameOf("premium-vip-2026"), nameOf("vip-2026")] as const

  return (
    <div>
      <FleetHero
        title={page.title}
        subtitle={page.subtitle}
        alt={busLabels.join(", ")}
        busLabels={busLabels}
      />

      <section
        id="showroom"
        className="scroll-mt-24 bg-black py-16 text-white md:py-24"
        aria-labelledby="fleet-explore-heading"
      >
        <div className="mx-auto max-w-[80rem] px-4 md:px-10">
          <div className="mb-10 max-w-2xl md:mb-14">
            <h2
              id="fleet-explore-heading"
              className="font-display text-3xl font-semibold tracking-tight md:text-5xl"
            >
              {page.exploreTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/65">{page.intro}</p>
          </div>
          <FleetShowroom categories={fleet} />
        </div>
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
