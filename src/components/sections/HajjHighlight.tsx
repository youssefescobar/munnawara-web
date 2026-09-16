import { AnimatedSection } from "@/components/motion/AnimatedSection"
import { AnimeReveal } from "@/components/motion/AnimeReveal"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"

export const HajjHighlight = async () => {
  const t = await getTranslations("home")
  const tCommon = await getTranslations("common")
  const tHajj = await getTranslations("hajj")

  const steps = [
    { title: tHajj("step1"), hint: t("hajjStepHint1") },
    { title: tHajj("step2"), hint: t("hajjStepHint2") },
    { title: tHajj("step3"), hint: t("hajjStepHint3") },
  ]

  return (
    <AnimatedSection className="relative overflow-hidden bg-primary-deep px-4 py-16 text-white md:px-10 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(243_112_33/0.22),transparent_55%)]"
        aria-hidden
      />
      <AnimeReveal className="relative mx-auto max-w-[80rem] text-center" stagger={0.1}>
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
          {t("hajjTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/60 md:text-lg">
          {t("hajjSubtitle")}
        </p>

        <ol className="mx-auto mt-12 grid max-w-4xl gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col items-center">
              <span className="font-label flex size-11 items-center justify-center rounded-full bg-orange text-sm font-semibold text-white">
                {index + 1}
              </span>
              <p className="mt-4 text-base font-semibold md:text-lg">{step.title}</p>
              <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-white/55">
                {step.hint}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          <Link
            href="/hajj-umrah"
            className="font-label inline-flex rounded-full bg-orange px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {tCommon("learnMore")}
          </Link>
        </div>
      </AnimeReveal>
    </AnimatedSection>
  )
}
