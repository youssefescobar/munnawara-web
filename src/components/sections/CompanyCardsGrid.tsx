"use client"

import GlareHover from "@/components/react-bits/GlareHover"
import { TextLink } from "@/components/ui/TextLink"
import Image from "next/image"

type CompanyCardItem = {
  slug: string
  name: string
  summary: string
  heroImage: string
  learnMore: string
}

type CompanyCardsGridProps = {
  companies: CompanyCardItem[]
}

export const CompanyCardsGrid = ({ companies }: CompanyCardsGridProps) => {
  return (
    <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {companies.map((company) => (
        <GlareHover
          key={company.slug}
          className="rounded-lg border border-border bg-surface-elevated shadow-sm transition hover:shadow-md"
          glareOpacity={0.4}
        >
          <article className="group flex h-full flex-col overflow-hidden">
            <div className="relative aspect-[16/11]">
              <Image
                src={company.heroImage}
                alt=""
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
                sizes="(max-width:768px) 100vw, 25vw"
              />
            </div>
            <div className="flex flex-1 flex-col border-t-2 border-orange px-5 py-6">
              <h3 className="text-lg font-semibold tracking-tight text-ink">
                {company.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                {company.summary}
              </p>
              <div className="mt-4">
                <TextLink href={`/companies/${company.slug}`}>
                  {company.learnMore}
                </TextLink>
              </div>
            </div>
          </article>
        </GlareHover>
      ))}
    </div>
  )
}
