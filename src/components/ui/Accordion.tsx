"use client"

import { cn } from "@/lib/cn"
import { AnimatePresence, motion } from "motion/react"
import { useId, useState } from "react"

type AccordionItem = {
  id: string
  title: string
  content: string
}

type AccordionProps = {
  items: readonly AccordionItem[]
  className?: string
}

export const Accordion = ({ items, className }: AccordionProps) => {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)
  const baseId = useId()

  const handleToggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <div className={cn("divide-y divide-border", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id
        const panelId = `${baseId}-${item.id}-panel`
        const buttonId = `${baseId}-${item.id}-button`

        return (
          <div key={item.id} className="py-1">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 py-4 text-start text-base font-medium break-words text-ink transition hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange sm:py-5 sm:text-lg"
                onClick={() => handleToggle(item.id)}
              >
                <span>{item.title}</span>
                <motion.span
                  aria-hidden
                  className="font-label inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-lg text-ink-muted"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  +
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-base leading-relaxed text-ink-muted">
                    {item.content}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
