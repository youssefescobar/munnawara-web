import { AnimeReveal } from "@/components/motion/AnimeReveal"
import { AnimatedSection } from "@/components/motion/AnimatedSection"
import { CtaSpark } from "@/components/motion/CtaSpark"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"

export const CTABand = async () => {
  const t = await getTranslations("home")
  const tCommon = await getTranslations("common")

  return (
    <AnimatedSection className="bg-ink px-4 py-16 text-center text-white sm:py-24 md:py-36">
      <AnimeReveal className="mx-auto max-w-3xl" stagger={0.12}>
        <h2 className="text-3xl font-semibold tracking-tight break-words sm:text-4xl md:text-6xl">
          {t("ctaBandTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/55 sm:mt-5 sm:text-lg">
          {t("ctaBandSubtitle")}
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
          <CtaSpark className="inline-flex w-full sm:w-auto">
            <Link
              href="/contact"
              className="font-label inline-flex w-full items-center justify-center rounded-full bg-orange px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange sm:w-auto"
            >
              {tCommon("requestQuote")}
            </Link>
          </CtaSpark>
          <Link
            href="/fleet"
            className="font-label inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-[15px] font-semibold text-white transition hover:border-orange hover:text-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
          >
            {tCommon("viewFleet")}
          </Link>
        </div>
      </AnimeReveal>
    </AnimatedSection>
  )
}
