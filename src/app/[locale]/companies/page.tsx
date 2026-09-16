import { CompanyCardsGrid } from "@/components/sections/CompanyCardsGrid"
import { PageShell } from "@/components/layout/PageShell"
import { getCompanies } from "@/content"
import type { AppLocale } from "@/content/types"
import { getTranslations, setRequestLocale } from "next-intl/server"

type PageProps = {
  params: Promise<{ locale: string }>
}

const CompaniesPage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("nav")
  const tHome = await getTranslations("home")
  const tCommon = await getTranslations("common")
  const companies = getCompanies(locale as AppLocale)

  return (
    <PageShell title={t("companies")} subtitle={tHome("companiesSubtitle")}>
      <CompanyCardsGrid
        companies={companies.map((company) => ({
          slug: company.slug,
          name: company.name,
          summary: company.summary ?? tCommon("contentPending"),
          heroImage: company.heroImage,
          learnMore: tCommon("learnMore"),
        }))}
      />
    </PageShell>
  )
}

export default CompaniesPage
