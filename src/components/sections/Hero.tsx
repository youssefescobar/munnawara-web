import { HeroClient } from "@/components/sections/HeroClient"
import { getTranslations } from "next-intl/server"

export const Hero = async () => {
  const t = await getTranslations("home")
  const tMeta = await getTranslations("meta")

  return (
    <HeroClient
      siteName={tMeta("siteName")}
      headline={t("headline")}
      subhead={t("subhead")}
      ctaPrimary={t("ctaPrimary")}
      ctaSecondary={t("ctaSecondary")}
    />
  )
}
