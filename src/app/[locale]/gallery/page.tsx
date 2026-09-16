import { PageShell } from "@/components/layout/PageShell"
import { getFleet } from "@/content"
import type { AppLocale } from "@/content/types"
import { getTranslations, setRequestLocale } from "next-intl/server"
import Image from "next/image"

type PageProps = {
  params: Promise<{ locale: string }>
}

const GalleryPage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("nav")
  const fleet = getFleet(locale as AppLocale)

  return (
    <PageShell title={t("gallery")}>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {fleet.map((item, index) => (
          <div
            key={item.id}
            className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm"
          >
            <div
              className={`relative ${index % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/3]"}`}
            >
              <Image
                src={item.coverImage}
                alt={item.name}
                fill
                className="object-cover transition duration-700 hover:scale-[1.03]"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            </div>
            <p className="font-label px-4 py-3 text-sm text-ink-muted">
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  )
}

export default GalleryPage
