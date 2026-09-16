import { QuoteRequestForm } from "@/components/forms/QuoteRequestForm"
import { AnimatedSection } from "@/components/motion/AnimatedSection"
import { getSiteConfig } from "@/content"
import { getTranslations } from "next-intl/server"

export const HomeQuoteBand = async () => {
  const t = await getTranslations("home")
  const tQuote = await getTranslations("quote")
  const tWhatsapp = await getTranslations()
  const config = getSiteConfig()

  return (
    <AnimatedSection className="relative z-20 -mt-8 bg-transparent pb-6 sm:-mt-10 md:-mt-12">
      <div className="mx-auto max-w-[80rem] px-4 md:px-10">
        <div className="rounded-[1.75rem] border border-border bg-white p-5 shadow-md sm:p-7 md:p-8">
          <div className="mb-5 max-w-2xl md:mb-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              {tQuote("title")}
            </h2>
            <p className="mt-2 text-sm text-ink-muted md:text-base">
              {t("ctaFormHint")}
            </p>
          </div>
          <QuoteRequestForm
            className="border-0 bg-transparent p-0 shadow-none sm:p-0 md:p-0"
            whatsappNumber={config.whatsappNumber}
            whatsappPrefill={tWhatsapp("whatsappPrefill")}
          />
        </div>
      </div>
    </AnimatedSection>
  )
}
