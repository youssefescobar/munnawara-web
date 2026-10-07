"use client"

import { cn } from "@/lib/cn"
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react"
import { createPortal } from "react-dom"

/* -------------------------------------------------------------------------- */
/* Shared look                                                                 */
/* -------------------------------------------------------------------------- */

export const triggerClass =
  "flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted px-3 py-1.5 text-start text-base text-ink sm:px-4 sm:py-3 outline-none transition hover:border-orange/30 focus-visible:border-orange/50 focus-visible:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-orange/25 sm:text-[0.9375rem]"

const errorRing = "ring-2 ring-red-400/50 bg-red-50/60 dark:bg-red-950/40"

const panelClass =
  "qw-pop fixed z-[1000] overflow-y-auto rounded-2xl border border-border bg-surface-elevated p-1.5 text-ink shadow-[0_18px_50px_-12px_rgb(0_0_0/0.45)] ring-1 ring-black/5"

const UI = {
  today: { en: "Today", ar: "اليوم" },
  clear: { en: "Clear", ar: "مسح" },
  done: { en: "Done", ar: "تم" },
  am: { en: "AM", ar: "ص" },
  pm: { en: "PM", ar: "م" },
  prevMonth: { en: "Previous month", ar: "الشهر السابق" },
  nextMonth: { en: "Next month", ar: "الشهر التالي" },
  hour: { en: "Hour", ar: "الساعة" },
  minute: { en: "Minute", ar: "الدقيقة" },
  none: { en: "No options", ar: "لا توجد خيارات" },
  dec: { en: "Decrease", ar: "إنقاص" },
  inc: { en: "Increase", ar: "زيادة" },
} as const

const t = (key: keyof typeof UI, locale: string) => (locale === "ar" ? UI[key].ar : UI[key].en)

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={cn("size-4 shrink-0 text-ink-muted transition-transform", open && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* Anchored popover (portal, flips above when there is no room below)          */
/* -------------------------------------------------------------------------- */

type Pos = { top: number; left: number; minWidth: number; maxHeight: number }

function usePopover(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const [pos, setPos] = useState<Pos | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return
    }
    const update = () => {
      const trigger = triggerRef.current
      const panel = panelRef.current
      if (!trigger) return
      const r = trigger.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const below = vh - r.bottom - 12
      const above = r.top - 12
      const natural = panel?.scrollHeight ?? 280
      const placeAbove = below < Math.min(natural, 300) && above > below
      const maxHeight = Math.max(160, placeAbove ? above : below)
      const height = Math.min(natural, maxHeight)
      const width = Math.max(panel?.offsetWidth ?? 0, r.width)
      const top = placeAbove ? r.top - height - 6 : r.bottom + 6
      const left = Math.min(Math.max(8, r.left), Math.max(8, vw - 8 - width))
      setPos({ top, left, minWidth: r.width, maxHeight })
    }
    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [open, triggerRef, panelRef])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      onClose()
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [open, triggerRef, panelRef, onClose])

  return pos
}

function Popover({
  open,
  pos,
  panelRef,
  dir,
  children,
  className,
  ...aria
}: {
  open: boolean
  pos: Pos | null
  panelRef: RefObject<HTMLDivElement | null>
  dir: "ltr" | "rtl"
  children: ReactNode
  className?: string
  id?: string
  role?: string
  "aria-label"?: string
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void
}) {
  if (!open || typeof document === "undefined") return null
  return createPortal(
    <div
      ref={panelRef}
      dir={dir}
      data-lenis-prevent
      className={cn(panelClass, className)}
      style={{
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        minWidth: pos?.minWidth,
        maxHeight: pos?.maxHeight,
        visibility: pos ? "visible" : "hidden",
      }}
      {...aria}
    >
      {children}
    </div>,
    document.body,
  )
}

/* -------------------------------------------------------------------------- */
/* Dropdown                                                                    */
/* -------------------------------------------------------------------------- */

export type DropdownOption = { id: string; label: string; hint?: string; group?: string }

export function Dropdown({
  id,
  value,
  options,
  onChange,
  placeholder = "-",
  error,
  locale,
}: {
  id: string
  value: string
  options: readonly DropdownOption[]
  onChange: (id: string) => void
  placeholder?: string
  error?: string
  locale: string
}) {
  const dir = locale === "ar" ? "rtl" : "ltr"
  const listId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selectedIndex = options.findIndex((o) => o.id === value)
  const [active, setActive] = useState(Math.max(0, selectedIndex))

  const close = useCallback(() => setOpen(false), [])
  const pos = usePopover(open, triggerRef, panelRef, close)

  useEffect(() => {
    if (!open) return
    panelRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [active, open, pos])

  const openList = () => {
    setActive(Math.max(0, selectedIndex))
    setOpen(true)
  }

  const choose = (index: number) => {
    const opt = options[index]
    if (opt) onChange(opt.id)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActive((i) => Math.min(options.length - 1, i + 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setActive((i) => Math.max(0, i - 1))
        break
      case "Home":
        e.preventDefault()
        setActive(0)
        break
      case "End":
        e.preventDefault()
        setActive(options.length - 1)
        break
      case "Enter":
      case " ":
        e.preventDefault()
        choose(active)
        break
      case "Escape":
        e.preventDefault()
        setOpen(false)
        break
      case "Tab":
        setOpen(false)
        break
      default: {
        const ch = e.key.toLowerCase()
        if (ch.length === 1) {
          const from = options.findIndex(
            (o, i) => i > active && o.label.toLowerCase().startsWith(ch),
          )
          const idx = from >= 0 ? from : options.findIndex((o) => o.label.toLowerCase().startsWith(ch))
          if (idx >= 0) setActive(idx)
        }
      }
    }
  }

  const current = options[selectedIndex]

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(triggerClass, error && errorRing)}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={cn("truncate", !current && "text-ink-muted")}>
          {current ? current.label : placeholder}
        </span>
        <Chevron open={open} />
      </button>
      <Popover open={open} pos={pos} panelRef={panelRef} dir={dir} id={listId} role="listbox">
        {options.length === 0 ? (
          <p className="px-3 py-2 text-sm text-ink-muted">{t("none", locale)}</p>
        ) : (
          options.map((o, i) => {
            const selected = o.id === value
            const header = o.group && o.group !== options[i - 1]?.group ? o.group : null
            return (
              <Fragment key={o.id}>
              {header ? (
                <p
                  role="presentation"
                  className="font-label px-3 pt-2.5 pb-1 text-[0.65rem] font-semibold tracking-[0.14em] text-ink-muted uppercase rtl:tracking-normal"
                >
                  {header}
                </p>
              ) : null}
              <div
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                data-index={i}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  i === active && "bg-surface-muted",
                  selected && "font-semibold text-orange",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate">{o.label}</span>
                  {o.hint ? (
                    <span className="block truncate text-xs font-normal text-ink-muted">{o.hint}</span>
                  ) : null}
                </span>
                {selected ? (
                  <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
                  </svg>
                ) : null}
              </div>
              </Fragment>
            )
          })
        )}
      </Popover>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Date picker                                                                 */
/* -------------------------------------------------------------------------- */

const pad = (n: number) => String(n).padStart(2, "0")
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromISO = (s: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null
}
const localeTag = (locale: string) => (locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB")

export function DatePicker({
  id,
  value,
  onChange,
  min,
  placeholder = "-",
  error,
  locale,
}: {
  id: string
  value: string
  onChange: (iso: string) => void
  /** Earliest selectable day (ISO). Defaults to no limit. */
  min?: string
  placeholder?: string
  error?: string
  locale: string
}) {
  const dir = locale === "ar" ? "rtl" : "ltr"
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selected = fromISO(value)
  const minDate = min ? fromISO(min) : null
  const [view, setView] = useState(() => {
    const base = selected ?? minDate ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const close = useCallback(() => setOpen(false), [])
  const pos = usePopover(open, triggerRef, panelRef, close)

  const tag = localeTag(locale)
  const monthTitle = new Intl.DateTimeFormat(tag, { month: "long", year: "numeric" }).format(view)
  const display = selected
    ? new Intl.DateTimeFormat(tag, { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(selected)
    : ""

  // Sunday-first weeks (Saudi calendar convention).
  const weekdays = useMemo(() => {
    const base = new Date(2023, 0, 1) // a Sunday
    return Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(tag, { weekday: "short" }).format(new Date(base.getFullYear(), 0, 1 + i)),
    )
  }, [tag])

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1)
    const lead = first.getDay()
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
    const list: (Date | null)[] = Array.from({ length: lead }, () => null)
    for (let d = 1; d <= days; d += 1) list.push(new Date(view.getFullYear(), view.getMonth(), d))
    while (list.length % 7) list.push(null)
    return list
  }, [view])

  const openPicker = () => {
    const base = selected ?? minDate ?? new Date()
    setView(new Date(base.getFullYear(), base.getMonth(), 1))
    setOpen(true)
  }

  // Move focus into the panel so keyboard users can reach the days.
  // Depend on a boolean (not the position object) so it runs once per open, not on every reposition.
  const positioned = pos !== null
  useEffect(() => {
    if (!open || !positioned) return
    const target =
      panelRef.current?.querySelector<HTMLElement>("[data-selected=true]") ??
      panelRef.current?.querySelector<HTMLElement>("[data-day]:not([disabled])")
    target?.focus({ preventScroll: true })
  }, [open, positioned])

  const todayISO = toISO(new Date())
  const isDisabled = (d: Date) => Boolean(minDate && d < minDate)
  const prevDisabled =
    Boolean(minDate) && new Date(view.getFullYear(), view.getMonth(), 0) < (minDate as Date)

  const pick = (d: Date) => {
    onChange(toISO(d))
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onPanelKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    const el = document.activeElement as HTMLElement | null
    if (!el?.dataset.day) return
    const step: Record<string, number> = {
      ArrowLeft: dir === "rtl" ? 1 : -1,
      ArrowRight: dir === "rtl" ? -1 : 1,
      ArrowUp: -7,
      ArrowDown: 7,
    }
    if (!(e.key in step)) return
    e.preventDefault()
    const cur = fromISO(el.dataset.day)
    if (!cur) return
    const next = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + step[e.key])
    if (isDisabled(next)) return
    if (next.getMonth() !== view.getMonth() || next.getFullYear() !== view.getFullYear()) {
      setView(new Date(next.getFullYear(), next.getMonth(), 1))
    }
    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(`[data-day="${toISO(next)}"]`)?.focus()
    })
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(triggerClass, error && errorRing)}
        onClick={() => (open ? setOpen(false) : openPicker())}
      >
        <span className={cn("truncate", !display && "text-ink-muted")}>{display || placeholder}</span>
        <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" />
          <path d="M3 8.5h14M7 3v3M13 3v3" />
        </svg>
      </button>
      <Popover
        open={open}
        pos={pos}
        panelRef={panelRef}
        dir={dir}
        role="dialog"
        aria-label={monthTitle}
        className="w-[19.5rem] max-w-[calc(100vw-1rem)] p-3"
        onKeyDown={onPanelKey}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label={t("prevMonth", locale)}
            disabled={prevDisabled}
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
            className="grid size-9 place-items-center rounded-full text-ink transition hover:bg-surface-muted disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <svg viewBox="0 0 20 20" className={cn("size-4", dir === "rtl" && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 5-5 5 5 5" />
            </svg>
          </button>
          <p className="text-sm font-semibold capitalize" aria-live="polite">{monthTitle}</p>
          <button
            type="button"
            aria-label={t("nextMonth", locale)}
            onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
            className="grid size-9 place-items-center rounded-full text-ink transition hover:bg-surface-muted"
          >
            <svg viewBox="0 0 20 20" className={cn("size-4", dir === "rtl" && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m8 5 5 5-5 5" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-[0.68rem] font-semibold tracking-wide text-ink-muted uppercase">
          {weekdays.map((w, i) => (
            <span key={i} className="py-1.5">{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5 text-center">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />
            const iso = toISO(d)
            const isSel = iso === value
            const disabled = isDisabled(d)
            return (
              <button
                key={i}
                type="button"
                data-day={iso}
                data-selected={isSel}
                disabled={disabled}
                onClick={() => pick(d)}
                className={cn(
                  "mx-auto grid size-9 place-items-center rounded-full text-sm transition",
                  isSel
                    ? "bg-orange font-semibold text-white shadow-sm"
                    : "hover:bg-surface-muted",
                  iso === todayISO && !isSel && "ring-1 ring-orange/60",
                  disabled && "cursor-not-allowed opacity-30 hover:bg-transparent",
                )}
              >
                {d.getDate()}
              </button>
            )
          })}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs font-semibold text-orange">
          <button
            type="button"
            className="rounded-md px-2 py-1 hover:underline"
            onClick={() => {
              const now = new Date()
              if (!isDisabled(now)) pick(now)
            }}
          >
            {t("today", locale)}
          </button>
          {value ? (
            <button
              type="button"
              className="rounded-md px-2 py-1 hover:underline"
              onClick={() => {
                onChange("")
                setOpen(false)
              }}
            >
              {t("clear", locale)}
            </button>
          ) : null}
        </div>
      </Popover>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Time picker                                                                 */
/* -------------------------------------------------------------------------- */

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)

const parseTime = (s: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s)
  if (!m) return null
  const h24 = Number(m[1])
  return { h12: h24 % 12 === 0 ? 12 : h24 % 12, minute: Number(m[2]), pm: h24 >= 12 }
}
const buildTime = (h12: number, minute: number, pm: boolean) => {
  const h24 = (h12 % 12) + (pm ? 12 : 0)
  return `${pad(h24)}:${pad(minute)}`
}

export function TimePicker({
  id,
  value,
  onChange,
  placeholder = "-",
  error,
  locale,
}: {
  id: string
  value: string
  onChange: (hhmm: string) => void
  placeholder?: string
  error?: string
  locale: string
}) {
  const dir = locale === "ar" ? "rtl" : "ltr"
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const parsed = parseTime(value)
  const close = useCallback(() => setOpen(false), [])
  const pos = usePopover(open, triggerRef, panelRef, close)

  const display = parsed
    ? `${parsed.h12}:${pad(parsed.minute)} ${parsed.pm ? t("pm", locale) : t("am", locale)}`
    : ""

  const set = (patch: Partial<{ h12: number; minute: number; pm: boolean }>) => {
    const base = parsed ?? { h12: 9, minute: 0, pm: false }
    const next = { ...base, ...patch }
    onChange(buildTime(next.h12, next.minute, next.pm))
  }

  // Scroll the selected hour / minute into view when opening.
  const positioned = pos !== null
  useEffect(() => {
    if (!open || !positioned) return
    panelRef.current?.querySelectorAll<HTMLElement>("[data-on=true]").forEach((el) => {
      el.scrollIntoView({ block: "center" })
    })
  }, [open, positioned])

  const col = "flex max-h-56 flex-1 flex-col gap-0.5 overflow-y-auto px-0.5"
  const item = (on: boolean) =>
    cn(
      "rounded-xl px-3 py-2 text-center text-sm tabular-nums transition",
      on ? "bg-orange font-semibold text-white" : "hover:bg-surface-muted",
    )

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(triggerClass, error && errorRing)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
        }}
      >
        <span className={cn("truncate tabular-nums", !display && "text-ink-muted")}>
          {display || placeholder}
        </span>
        <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="10" cy="10" r="7.25" />
          <path d="M10 5.5V10l3 2" />
        </svg>
      </button>
      <Popover
        open={open}
        pos={pos}
        panelRef={panelRef}
        dir={dir}
        role="dialog"
        aria-label={t("hour", locale)}
        className="w-[16.5rem] max-w-[calc(100vw-1rem)] p-2.5"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false)
            triggerRef.current?.focus()
          }
        }}
      >
        <div className="flex gap-1" dir="ltr">
          <div data-lenis-prevent className={col} role="listbox" aria-label={t("hour", locale)}>
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                role="option"
                aria-selected={parsed?.h12 === h}
                data-on={parsed?.h12 === h}
                className={item(parsed?.h12 === h)}
                onClick={() => set({ h12: h })}
              >
                {h}
              </button>
            ))}
          </div>
          <div data-lenis-prevent className={col} role="listbox" aria-label={t("minute", locale)}>
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                role="option"
                aria-selected={parsed?.minute === m}
                data-on={parsed?.minute === m}
                className={item(parsed?.minute === m)}
                onClick={() => set({ minute: m })}
              >
                {pad(m)}
              </button>
            ))}
          </div>
          <div className="flex w-16 flex-col gap-0.5">
            {([false, true] as const).map((pm) => {
              const on = Boolean(parsed) && parsed?.pm === pm
              return (
                <button
                  key={String(pm)}
                  type="button"
                  aria-pressed={on}
                  className={item(on)}
                  onClick={() => set({ pm })}
                >
                  {pm ? t("pm", locale) : t("am", locale)}
                </button>
              )
            })}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs font-semibold text-orange">
          {value ? (
            <button
              type="button"
              className="rounded-md px-2 py-1 hover:underline"
              onClick={() => onChange("")}
            >
              {t("clear", locale)}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="rounded-md px-2 py-1 hover:underline"
            onClick={() => {
              setOpen(false)
              triggerRef.current?.focus()
            }}
          >
            {t("done", locale)}
          </button>
        </div>
      </Popover>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Number stepper                                                              */
/* -------------------------------------------------------------------------- */

export function NumberStepper({
  id,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  error,
  locale,
  placeholder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  min?: number
  max?: number
  step?: number
  error?: string
  locale: string
  placeholder?: string
}) {
  const n = Number(value)
  const has = value !== "" && Number.isFinite(n)
  const clamp = (x: number) => Math.min(max, Math.max(min, x))
  const bump = (delta: number) => onChange(String(clamp((has ? n : min) + delta)))

  const btn =
    "grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-surface-muted text-lg text-ink transition hover:border-orange/40 hover:bg-surface-container active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 sm:size-[2.9rem]"

  return (
    <div className="flex items-stretch gap-2" dir="ltr">
      <button
        type="button"
        className={btn}
        aria-label={t("dec", locale)}
        disabled={has && n <= min}
        onClick={() => bump(-step)}
      >
        −
      </button>
      <input
        id={id}
        name={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-w-0 flex-1 rounded-xl border border-border bg-surface-muted px-3 py-1.5 text-center text-base font-semibold sm:py-3 tabular-nums text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted focus:border-orange/50 focus:bg-surface-elevated focus:ring-2 focus:ring-orange/25",
          error && errorRing,
        )}
        value={value}
        onChange={(e) => {
          const digits = e.target.value
            .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
            .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
            .replace(/[^\d]/g, "")
          onChange(digits === "" ? "" : String(Math.min(max, Number(digits))))
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault()
            bump(step)
          }
          if (e.key === "ArrowDown") {
            e.preventDefault()
            bump(-step)
          }
        }}
      />
      <button
        type="button"
        className={btn}
        aria-label={t("inc", locale)}
        disabled={has && n >= max}
        onClick={() => bump(step)}
      >
        +
      </button>
    </div>
  )
}
