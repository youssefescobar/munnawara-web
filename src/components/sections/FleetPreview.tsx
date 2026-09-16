import { AnimatedSection } from "@/components/motion/AnimatedSection"
import { AnimeReveal } from "@/components/motion/AnimeReveal"
import { getFleet } from "@/content"
import type { AppLocale } from "@/content/types"
import { Link } from "@/i18n/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import Image from "next/image"

export const FleetPreview = async () => {
  const t = await getTranslations("home")
  const tCommon = await getTranslations("common")
  const locale = (await getLocale()) as AppLocale
  const fleet = getFleet(locale).slice(0, 3)

  return (
    <AnimatedSection className="bg-ink py-16 text-white md:py-24">
      <div className="mx-auto flex max-w-[80rem] flex-col gap-6 px-4 md:flex-row md:items-end md:justify-between md:px-10">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
            {t("fleetTitle")}
          </h2>
          <p className="mt-3 text-base text-white/55 md:text-lg">
            {t("fleetSubtitle")}
          </p>
        </div>
        <Link
          href="/fleet"
          className="font-label inline-flex w-fit rounded-full bg-orange px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-orange-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {tCommon("viewFleet")}
        </Link>
      </div>

      <AnimeReveal
        className="mx-auto mt-10 grid max-w-[80rem] gap-3 px-4 sm:grid-cols-3 sm:gap-4 md:mt-14 md:px-10"
        stagger={0.1}
      >
        {fleet.map((item) => (
          <Link
            key={item.id}
            href="/fleet"
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
          >
            <Image
              src={item.coverImage}
              alt={item.name}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-lg font-semibold tracking-tight">{item.name}</p>
              <p className="font-label mt-1 text-sm text-orange-soft">
                {tCommon("seats")} {item.seatsLabel}
              </p>
            </div>
          </Link>
        ))}
      </AnimeReveal>
    </AnimatedSection>
  )
}
