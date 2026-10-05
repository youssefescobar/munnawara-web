import { LabHome } from "@/components/lab/LabHome"
import { getHome } from "@/content"
import type { AppLocale } from "@/content/types"
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

type PageProps = {
  params: Promise<{ locale: string }>
}

// Experimental route: not linked from the nav, not indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } }

const LabPage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const home = getHome(locale as AppLocale)
  const pick = (id: string) => home.valueBullets.find((b) => b.id === id)
  const points = [pick("fleet"), pick("safety")].flatMap((b) => (b ? [b] : []))

  return (
    <LabHome
      hero={home.landingHero}
      points={points}
      closing={{ title: home.ctaBandTitle, subtitle: home.ctaBandSubtitle }}
    />
  )
}

export default LabPage
