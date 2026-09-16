import { PageShell } from "@/components/layout/PageShell"
import { TextLink } from "@/components/ui/TextLink"
import { AnimeReveal } from "@/components/motion/AnimeReveal"
import { getTranslations, setRequestLocale } from "next-intl/server"

type PageProps = {
  params: Promise<{ locale: string }>
}

const CorporatePage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("nav")
  const tCommon = await getTranslations("common")
  const tCorporate = await getTranslations("corporate")

  const services = [
    tCorporate("staff"),
    tCorporate("school"),
    tCorporate("contracts"),
  ]

  return (
    <PageShell title={t("corporate")} subtitle={tCorporate("intro")}>
      <AnimeReveal className="mx-auto max-w-2xl" stagger={0.1}>
        {services.map((service) => (
          <div
            key={service}
            className="border-b border-border py-6 text-2xl font-medium tracking-tight text-ink"
          >
            {service}
          </div>
        ))}
      </AnimeReveal>
      <div className="mt-12 text-center">
        <TextLink href="/contact">{tCommon("requestQuote")}</TextLink>
      </div>
    </PageShell>
  )
}

export default CorporatePage
