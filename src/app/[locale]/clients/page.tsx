import { ClientLogoLoop } from "@/components/sections/ClientLogoLoop"
import { PageShell } from "@/components/layout/PageShell"
import { getClients } from "@/content"
import type { AppLocale } from "@/content/types"
import { getTranslations, setRequestLocale } from "next-intl/server"

type PageProps = {
  params: Promise<{ locale: string }>
}

const ClientsPage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("nav")
  const tHome = await getTranslations("home")
  const clients = getClients(locale as AppLocale)

  return (
    <PageShell title={t("clients")} subtitle={tHome("clientsTitle")}>
      <ClientLogoLoop
        title={tHome("clientsTitle")}
        labels={clients.map((client) => client.label)}
      />
      <div className="mx-auto mt-14 max-w-2xl space-y-0">
        {clients.map((client) => (
          <article
            key={client.id}
            className="border-b border-border py-8 first:pt-0"
          >
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {client.label}
            </h2>
            <p className="mt-3 text-lg text-ink-muted">{client.description}</p>
          </article>
        ))}
      </div>
    </PageShell>
  )
}

export default ClientsPage
