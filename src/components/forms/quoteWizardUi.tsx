import { cn } from "@/lib/cn"
import type { CSSProperties, ReactNode } from "react"
import { pick, type Option, type PlaceId } from "./quoteWizardConfig"
import { Dropdown } from "./QuoteFields"
import { CheckBadge, choiceIcon } from "./QuoteChoiceIcons"

export const fieldClass =
  "w-full min-w-0 rounded-xl border border-border bg-surface-muted px-3 py-1.5 text-base text-ink outline-none transition sm:px-4 sm:py-3 placeholder:text-ink-muted focus:border-orange/40 focus:bg-surface-elevated focus:ring-2 focus:ring-orange/25 sm:text-[0.9375rem]"
export const fieldErrorRing = "ring-2 ring-red-400/50 focus:ring-red-400/60 bg-red-50/60 dark:bg-red-950/40"
export const btnPrimary =
  "font-label inline-flex min-w-[8rem] items-center justify-center rounded-full bg-gradient-to-b from-orange-soft to-orange px-6 py-2.5 text-sm sm:min-w-[9.5rem] sm:px-8 sm:py-3 font-semibold text-white shadow-[0_12px_28px_-10px_rgb(243,112,33,0.9)] transition-[transform,filter,box-shadow] duration-100 ease-out hover:brightness-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:brightness-100 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100"
export const btnGhost =
  "font-label inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-ink-muted sm:px-5 sm:py-3 transition-[transform,background-color,color] duration-100 ease-out hover:bg-surface-muted hover:text-ink active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"

export function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("block min-w-0", className)}>
      <label
        htmlFor={htmlFor}
        className="font-label mb-1 block text-[0.7rem] font-semibold tracking-[0.14em] text-ink-muted uppercase"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm leading-snug text-red-700 dark:text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function Choices({
  options,
  value,
  onPick,
  locale,
  columns = 2,
}: {
  options: readonly Option[]
  value: string
  onPick: (id: string) => void
  locale: string
  columns?: 1 | 2
}) {
  return (
    <div
      className={cn(
        columns === 2
          ? "grid grid-cols-1 lg:flex lg:flex-wrap lg:gap-3"
          : "grid",
      )}
      role="radiogroup"
      style={{ "--cols": options.length < 5 ? options.length : Math.ceil(options.length / 2) } as CSSProperties}
    >
      {options.map((o) => {
        const selected = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onPick(o.id)}
            className={cn(
              "relative flex items-center gap-3.5 border-b border-border px-2 py-2 text-start transition-[transform,border-color,background-color,box-shadow] duration-100 ease-out motion-reduce:transition-none sm:py-3.5 lg:min-h-[clamp(4.5rem,13vh,12rem)] lg:grow lg:basis-[calc((100%-(var(--cols)-1)*0.75rem)/var(--cols))] lg:rounded-2xl lg:border lg:px-5 lg:py-4 lg:active:scale-[0.98]",
              selected
                ? "border-b-orange bg-orange/8 lg:border-orange lg:bg-orange/5 lg:shadow-[0_0_0_3px_rgb(243,112,33,0.14)]"
                : "text-ink hover:bg-surface-muted lg:border-transparent lg:bg-surface-muted lg:hover:border-border lg:hover:bg-surface-container",
            )}
          >
            {selected ? <CheckBadge /> : null}
            <span
              className={cn(
                "inline-flex size-9 shrink-0 sm:size-10 items-center justify-center rounded-full",
                selected
                  ? "bg-orange/15 text-orange"
                  : "bg-surface-elevated text-ink-muted ring-1 ring-border",
              )}
            >
              {choiceIcon(o.id)}
            </span>
            <span className="min-w-0 pe-5">
              <span className="block text-base font-semibold text-ink lg:text-lg">
                {pick(o.label, locale)}
              </span>
              {o.hint ? (
                <span className={cn("block text-sm leading-snug text-ink-muted", options.length > 5 && "hidden sm:block")}>
                  {pick(o.hint, locale)}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function StepProgress({
  current,
  total,
  name,
  counter,
  label,
  toolbar,
}: {
  current: number
  total: number
  name: string
  counter: string
  label: string
  toolbar?: ReactNode
}) {
  return (
    <div className="space-y-1.5 sm:space-y-2.5">
      <div className="flex min-h-8 items-center justify-between gap-3 sm:min-h-11">
        {toolbar ?? <span />}
        <p className="font-label shrink-0 text-xs font-semibold text-ink-muted tabular-nums">
          {counter}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <p className="font-label shrink-0 text-[0.7rem] font-semibold tracking-[0.12em] text-orange uppercase rtl:tracking-normal">
          {name}
        </p>
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-surface-muted"
          role="progressbar"
          aria-label={label}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={current}
        >
          <div
            className="h-full rounded-full bg-orange transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function PlaceSelect({
  id,
  value,
  onChange,
  options,
  locale,
  placeholder,
  error,
}: {
  id: string
  value: string
  onChange: (v: PlaceId | "") => void
  options: readonly (Option<PlaceId> & { group?: string })[]
  locale: string
  placeholder: string
  error?: string
}) {
  return (
    <Dropdown
      id={id}
      value={value}
      locale={locale}
      placeholder={placeholder}
      error={error}
      options={options.map((o) => ({ id: o.id, label: pick(o.label, locale), group: o.group }))}
      onChange={(v) => onChange(v as PlaceId | "")}
    />
  )
}
