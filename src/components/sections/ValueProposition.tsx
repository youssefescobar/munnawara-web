import { AnimatedSection } from "@/components/motion/AnimatedSection"
import { AnimeReveal } from "@/components/motion/AnimeReveal"
import { ParallaxImage } from "@/components/motion/ParallaxImage"
import { getHome } from "@/content"
import type { AppLocale } from "@/content/types"
import { getLocale } from "next-intl/server"

export const ValueProposition = async () => {
  const locale = (await getLocale()) as AppLocale
  const home = getHome(locale)

  return (
    <AnimatedSection className="bg-surface py-16 md:py-24">
      <div className="mx-auto grid max-w-[80rem] items-center gap-12 px-4 md:grid-cols-12 md:gap-16 md:px-10">
        <AnimeReveal className="md:col-span-5" stagger={0.08}>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-5xl">
            {home.valueTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">
            {home.valueIntro}
          </p>
          <ul className="mt-8 space-y-6">
            {home.valueBullets.map((bullet) => (
              <li key={bullet.id} className="border-s-2 border-orange ps-4">
                <p className="font-label text-sm font-semibold text-ink">
                  {bullet.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {bullet.description}
                </p>
              </li>
            ))}
          </ul>
        </AnimeReveal>

        <div className="md:col-span-7">
          <ParallaxImage
            src={home.valueImage}
            className="aspect-[5/4] rounded-[1.75rem] md:aspect-[4/3]"
          />
        </div>
      </div>
    </AnimatedSection>
  )
}
