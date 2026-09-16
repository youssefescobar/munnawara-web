import { PageShell } from "@/components/layout/PageShell"
import { getAbout } from "@/content"
import type { AppLocale } from "@/content/types"
import { setRequestLocale } from "next-intl/server"

type PageProps = {
  params: Promise<{ locale: string }>
}

const AboutPage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const about = getAbout(locale as AppLocale)

  return (
    <PageShell title={about.title} subtitle={about.intro} align="start">
      <div className="mx-auto max-w-2xl space-y-14">
        <div className="rounded-2xl border border-border bg-surface-elevated p-8 shadow-sm md:p-10">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {about.historyTitle}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            {about.history}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-mint p-8 md:p-10">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {about.missionTitle}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            {about.mission}
          </p>
        </div>
        {about.licensingNote ? (
          <p className="text-sm text-ink-muted">{about.licensingNote}</p>
        ) : null}
      </div>
    </PageShell>
  )
}

export default AboutPage
