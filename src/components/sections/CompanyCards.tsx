import { AnimatedSection } from "@/components/motion/AnimatedSection"
import { CompanyCardsGrid } from "@/components/sections/CompanyCardsGrid"
import { getCompanies } from "@/content"
import type { AppLocale } from "@/content/types"
import { getLocale, getTranslations } from "next-intl/server"

export const CompanyCards = async () => {
  const t = await getTranslations("home")
  const tCommon = await getTranslations("common")
  const locale = (await getLocale()) as AppLocale
  const companies = getCompanies(locale)

  return (
    <AnimatedSection className="bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-10">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {t("companiesTitle")}
        </h2>
        <p className="mt-4 text-base text-ink-muted md:text-lg">
          {t("companiesSubtitle")}
        </p>
      </div>
      <div className="mx-auto max-w-[80rem] px-4 md:px-10">
        <CompanyCardsGrid
          companies={companies.map((company) => ({
            slug: company.slug,
            name: company.name,
            summary: company.summary ?? tCommon("contentPending"),
            heroImage: company.heroImage,
            learnMore: tCommon("learnMore"),
          }))}
        />
      </div>
    </AnimatedSection>
  )
}
