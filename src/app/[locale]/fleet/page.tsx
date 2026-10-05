import { FleetShowcase } from "@/components/fleet/FleetShowcase"
import { PageIntro } from "@/components/ui/PageIntro"
import { getFleet, getFleetPage } from "@/content"
import type { AppLocale } from "@/content/types"
import { setRequestLocale } from "next-intl/server"
import { buildPageMetadata } from "@/lib/seo"

type PageProps = {
  params: Promise<{ locale: string }>
}

const FleetPage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const appLocale = locale as AppLocale
  const fleet = getFleet(appLocale)
  const page = getFleetPage(appLocale)

  return (
    <div className="overflow-hidden pt-20">
      <PageIntro title={page.title} subtitle={page.subtitle} align="start">
        <p className="ms-0 me-auto mt-6 max-w-2xl text-base leading-relaxed text-ink/70 md:text-lg">
          {page.intro}
        </p>
      </PageIntro>

      <section
        className="mx-auto mt-12 max-w-[80rem] px-4 md:mt-14 md:px-10"
        aria-labelledby="fleet-types-heading"
      >
        <h2 id="fleet-types-heading" className="sr-only">
          {page.typesEyebrow}
        </h2>
        <p className="font-label mb-4 text-center text-xs font-semibold tracking-[0.18em] text-orange uppercase">
          {page.typesEyebrow}
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {fleet.map((bus) => (
            <li key={bus.id}>
              <span className="font-label inline-flex rounded-full border border-ink/10 bg-surface-muted px-4 py-2 text-sm font-medium text-ink">
                {bus.name}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mx-auto mt-16 max-w-[80rem] px-4 md:mt-20 md:px-10"
        aria-labelledby="fleet-highlights-heading"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="fleet-highlights-heading"
            className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl"
          >
            {page.highlightsTitle}
          </h2>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {page.highlights.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-2xl bg-surface-muted/80 px-4 py-4 text-start text-sm leading-relaxed text-ink/75 sm:text-base"
            >
              <span
                aria-hidden
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-orange"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mt-16 md:mt-24"
        aria-labelledby="fleet-explore-heading"
      >
        <div className="mx-auto max-w-3xl px-4 text-center md:px-10">
          <h2
            id="fleet-explore-heading"
            className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl"
          >
            {page.exploreTitle}
          </h2>
          <p className="mt-4 text-base text-ink/70 sm:text-lg">
            {page.exploreSubtitle}
          </p>
        </div>
        <div className="mt-10 md:mt-12">
          <FleetShowcase categories={fleet} />
        </div>
      </section>

      <section
        className="mx-auto mt-16 max-w-[80rem] px-4 pb-8 md:mt-24 md:px-10"
        aria-labelledby="fleet-clients-heading"
      >
        <div className="rounded-[1.75rem] bg-black px-6 py-12 text-white sm:px-10 sm:py-14 md:px-14">
          <h2
            id="fleet-clients-heading"
            className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {page.clientsTitle}
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {page.clients.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-start text-sm leading-relaxed text-white/70 sm:text-base"
              >
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-orange"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

export const generateMetadata = async ({ params }: PageProps) =>
  buildPageMetadata((await params).locale, "fleet")

export default FleetPage
