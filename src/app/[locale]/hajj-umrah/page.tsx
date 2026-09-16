import { AnimeReveal } from "@/components/motion/AnimeReveal"
import { AnimatedSection } from "@/components/motion/AnimatedSection"
import { CtaSpark } from "@/components/motion/CtaSpark"
import { Accordion } from "@/components/ui/Accordion"
import { PageIntro } from "@/components/ui/PageIntro"
import { getFaq } from "@/content"
import type { AppLocale } from "@/content/types"
import { Link } from "@/i18n/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import Image from "next/image"

type PageProps = {
  params: Promise<{ locale: string }>
}

const HajjUmrahPage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("nav")
  const tHome = await getTranslations("home")
  const tCommon = await getTranslations("common")
  const tHajj = await getTranslations("hajj")
  const faq = getFaq(locale as AppLocale)
  const steps = [tHajj("step1"), tHajj("step2"), tHajj("step3")]

  return (
    <>
      <section className="relative isolate min-h-[70dvh] overflow-hidden bg-primary-deep">
        <Image
          src="/fleet/premium-vip-2026/exterior/pv-out-2.webp"
          alt=""
          fill
          className="object-cover opacity-55"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/55 to-black/25" />
        <div className="relative z-10 flex min-h-[70dvh] items-center justify-center px-6 py-24">
          <PageIntro
            title={t("hajjUmrah")}
            subtitle={tHome("hajjSubtitle")}
            tone="light"
          >
            <div className="mt-8">
              <CtaSpark className="inline-flex">
                <Link
                  href="/contact"
                  className="font-label inline-flex rounded-lg bg-orange px-5 py-2.5 text-[15px] font-semibold text-white transition hover:bg-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                >
                  {tCommon("requestQuote")}
                </Link>
              </CtaSpark>
            </div>
          </PageIntro>
        </div>
      </section>

      <AnimatedSection className="mx-auto max-w-3xl px-6 py-24">
        <AnimeReveal className="space-y-12" stagger={0.14}>
          {steps.map((step, index) => (
            <div key={step}>
              <p className="font-label text-sm font-semibold tracking-[0.2em] text-orange uppercase">
                0{index + 1}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                {step}
              </p>
            </div>
          ))}
        </AnimeReveal>
        <h2 className="mt-24 mb-4 text-3xl font-semibold tracking-tight text-ink">
          {tHajj("faqTitle")}
        </h2>
        <Accordion
          items={faq.map((item) => ({
            id: item.id,
            title: item.question,
            content: item.answer,
          }))}
        />
      </AnimatedSection>
    </>
  )
}

export default HajjUmrahPage
