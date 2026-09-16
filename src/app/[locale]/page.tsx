import { BusPassby } from "@/components/sections/BusPassby"
import { ClientStrip } from "@/components/sections/ClientStrip"
import { CTABand } from "@/components/sections/CTABand"
import { FleetPreview } from "@/components/sections/FleetPreview"
import { HajjHighlight } from "@/components/sections/HajjHighlight"
import { Hero } from "@/components/sections/Hero"
import { HomeQuoteBand } from "@/components/sections/HomeQuoteBand"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { Testimonials } from "@/components/sections/Testimonials"
import { TrustBar } from "@/components/sections/TrustBar"
import { ValueProposition } from "@/components/sections/ValueProposition"
import { FloatingQuoteCta } from "@/components/layout/FloatingQuoteCta"
import { setRequestLocale } from "next-intl/server"

type PageProps = {
  params: Promise<{ locale: string }>
}

const HomePage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <Hero />
      <HomeQuoteBand />
      <TrustBar />
      <BusPassby />
      <ValueProposition />
      <FleetPreview />
      <HowItWorks />
      <HajjHighlight />
      <ClientStrip />
      <Testimonials />
      <CTABand />
      <FloatingQuoteCta />
    </>
  )
}

export default HomePage
