import { AnimatedSection } from "@/components/motion/AnimatedSection"
import { TrustBarClient } from "@/components/sections/TrustBarClient"
import { getFleet, getSiteConfig } from "@/content"
import type { AppLocale } from "@/content/types"
import { getLocale, getTranslations } from "next-intl/server"

export const TrustBar = async () => {
  const t = await getTranslations("home")
  const locale = (await getLocale()) as AppLocale
  const fleetCount = getFleet(locale).length
  const config = getSiteConfig()

  const items = [
    { value: config.brandShort, label: t("trustLicensed") },
    {
      value: String(fleetCount),
      label: t("trustFleet"),
      countTo: fleetCount,
    },
    {
      value: "2026",
      label: t("trustYears"),
      countTo: 2026,
      countFrom: 2018,
    },
    { value: t("trustCareValue"), label: t("trustCare") },
  ]

  return (
    <AnimatedSection className="bg-white">
      <TrustBarClient items={items} />
    </AnimatedSection>
  )
}
