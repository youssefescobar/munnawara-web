import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { WhatsAppButton } from "@/components/layout/WhatsAppButton"
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider"
import { PageLoader } from "@/components/ui/PageLoader"
import { routing } from "@/i18n/routing"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { IBM_Plex_Sans, Noto_Sans, Noto_Serif } from "next/font/google"
import localFont from "next/font/local"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import "../globals.css"

export const metadata: Metadata = {
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
}

const fontArabic = localFont({
  src: "../../fonts/cairo/Cairo-Variable.ttf",
  variable: "--font-arabic",
  display: "swap",
  weight: "200 1000",
})

const fontLatin = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-latin",
  display: "swap",
})

const fontDisplay = Noto_Serif({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
})

const fontLabel = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-label",
  display: "swap",
})

type LocaleLayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }))

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()
  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontArabic.variable} ${fontLatin.variable} ${fontDisplay.variable} ${fontLabel.variable}`}
    >
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <SmoothScrollProvider>
            <PageLoader />
            <Header />
            <main id="main" className="min-h-[60dvh]">{children}</main>
            <Footer />
            <WhatsAppButton />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export default LocaleLayout
