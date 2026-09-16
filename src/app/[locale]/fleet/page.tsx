import { FleetSceneLazy } from "@/components/fleet/FleetSceneLazy"
import { FleetShowcase } from "@/components/fleet/FleetShowcase"
import { PageShell } from "@/components/layout/PageShell"
import { getFleet } from "@/content"
import type { AppLocale } from "@/content/types"
import { getTranslations, setRequestLocale } from "next-intl/server"

type PageProps = {
  params: Promise<{ locale: string }>
}

const FleetPage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("nav")
  const tHome = await getTranslations("home")
  const fleet = getFleet(locale as AppLocale)

  return (
    <PageShell title={t("fleet")} subtitle={tHome("fleetSubtitle")}>
      <div className="mb-12 md:mb-16">
        <FleetSceneLazy />
        <p className="font-label mt-3 text-center text-xs text-ink-muted">
          {tHome("fleetSubtitle")}
        </p>
      </div>
      <FleetShowcase categories={fleet} />
    </PageShell>
  )
}

export default FleetPage
