"use client"

import dynamic from "next/dynamic"

export const FleetSceneLazy = dynamic(
  () =>
    import("@/components/fleet/FleetScene").then((mod) => mod.FleetScene),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[16/10] animate-pulse rounded-2xl border border-border bg-surface-muted" />
    ),
  },
)
