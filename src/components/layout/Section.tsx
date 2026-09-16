import { cn } from "@/lib/cn"
import type { ReactNode } from "react"

type SectionProps = {
  children: ReactNode
  className?: string
  id?: string
  as?: "section" | "div"
  container?: boolean
}

export const Section = ({
  children,
  className,
  id,
  as: Tag = "section",
  container = false,
}: SectionProps) => {
  return (
    <Tag id={id} className={cn(className)}>
      {container ? (
        <div className="mx-auto max-w-[80rem] px-4 md:px-10">{children}</div>
      ) : (
        children
      )}
    </Tag>
  )
}
