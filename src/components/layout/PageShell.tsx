import { PageIntro } from "@/components/ui/PageIntro"
import { AnimatedSection } from "@/components/motion/AnimatedSection"
import { cn } from "@/lib/cn"
import type { ReactNode } from "react"

type PageShellProps = {
  title: string
  subtitle?: string
  eyebrow?: string
  children: ReactNode
  className?: string
  introClassName?: string
  align?: "center" | "start"
  tone?: "dark" | "light"
}

export const PageShell = ({
  title,
  subtitle,
  eyebrow,
  children,
  className,
  introClassName,
  align = "center",
  tone = "dark",
}: PageShellProps) => {
  return (
    <AnimatedSection className={cn("pb-24 pt-20 md:pb-28 md:pt-24", className)}>
      <PageIntro
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        align={align}
        tone={tone}
        className={introClassName}
      />
      <div className="mx-auto mt-12 max-w-[80rem] px-4 md:mt-16 md:px-10">
        {children}
      </div>
    </AnimatedSection>
  )
}
