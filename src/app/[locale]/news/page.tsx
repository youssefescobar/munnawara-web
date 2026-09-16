import { PageShell } from "@/components/layout/PageShell"
import { getNews } from "@/content"
import type { AppLocale } from "@/content/types"
import { Link } from "@/i18n/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

type PageProps = {
  params: Promise<{ locale: string }>
}

const NewsPage = async ({ params }: PageProps) => {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("nav")
  const tCommon = await getTranslations("common")
  const posts = getNews(locale as AppLocale)

  return (
    <PageShell title={t("news")}>
      <div className="mx-auto max-w-2xl text-center">
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface-muted px-6 py-12 text-lg text-ink-muted">
            {tCommon("noNews")}
          </p>
        ) : (
          <ul className="space-y-6 text-start">
            {posts.map((post) => (
              <li
                key={post.slug}
                className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-sm transition hover:border-orange/40"
              >
                <Link
                  href={`/news/${post.slug}`}
                  className="text-2xl font-semibold tracking-tight text-ink transition hover:text-orange"
                >
                  {post.title}
                </Link>
                <p className="mt-3 text-ink-muted">{post.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  )
}

export default NewsPage
