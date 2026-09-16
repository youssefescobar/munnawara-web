import { AnimatedSection } from "@/components/motion/AnimatedSection"
import { ClientLogoLoop } from "@/components/sections/ClientLogoLoop"
import { getClients } from "@/content"
import type { AppLocale } from "@/content/types"
import { getLocale, getTranslations } from "next-intl/server"

export const ClientStrip = async () => {
  const t = await getTranslations("home")
  const locale = (await getLocale()) as AppLocale
  const clients = getClients(locale)

  return (
    <AnimatedSection className="border-y border-border bg-white py-12 md:py-14">
      <div className="mx-auto max-w-[80rem] px-4 md:px-10">
        <p className="font-label text-center text-xs tracking-[0.2em] text-ink-muted uppercase">
          {t("clientsTitle")}
        </p>
        <ClientLogoLoop
          title={t("clientsTitle")}
          labels={clients.map((client) => client.label)}
        />
      </div>
    </AnimatedSection>
  )
}
