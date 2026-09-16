import { PageShell } from "@/components/layout/PageShell"
import { getCareers } from "@/content"
import type { AppLocale } from "@/content/types"
import { getTranslations, setRequestLocale } from "next-intl/server"

type PageProps = {
  params: Promise<{ locale: string }>
}

const CareersPage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("nav")
  const tCommon = await getTranslations("common")
  const roles = getCareers(locale as AppLocale)

  return (
    <PageShell title={t("careers")}>
      <div className="mx-auto max-w-2xl text-center">
        {roles.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface-muted px-6 py-12 text-lg text-ink-muted">
            {tCommon("noOpenRoles")}
          </p>
        ) : (
          <ul className="space-y-6 text-start">
            {roles.map((role) => (
              <li
                key={role.id}
                className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-sm"
              >
                <h2 className="text-2xl font-semibold tracking-tight text-ink">
                  {role.title}
                </h2>
                <p className="font-label mt-2 text-sm text-ink-muted">
                  {role.location} · {role.type}
                </p>
                <p className="mt-3 text-ink-muted">{role.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}

export default CareersPage
