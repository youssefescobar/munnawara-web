import type { BusClass, TripType } from "@/components/forms/formSchemas"
import { cn } from "@/lib/cn"
import {
  busClassOptions,
  customerOptions,
  placeGroupLabels,
  places,
  type Option,
} from "./quoteWizardConfig"
import { DatePicker, NumberStepper, TimePicker } from "./QuoteFields"
import { COPY } from "./quoteWizardCopy"
import type { SummaryRow, Tx } from "./quoteWizardLogic"
import { MAX_LEGS, emptyLeg, type Leg, type StepId, type WizardState } from "./quoteWizardTypes"
import { Choices, Field, PlaceSelect, fieldClass, fieldErrorRing } from "./quoteWizardUi"

export type StepBodyProps = {
  step: StepId
  state: WizardState
  errors: Record<string, string>
  locale: string
  tx: Tx
  patch: (p: Partial<WizardState>) => void
  jumpTo: (id: StepId) => void
  serviceOptions: readonly Option[]
  isCompany: boolean
  needsOrg: boolean
  todayISO: string
  summaryRows: () => SummaryRow[]
}

export function StepBody({
  step,
  state,
  errors,
  locale,
  tx,
  patch,
  jumpTo,
  serviceOptions,
  isCompany,
  needsOrg,
  todayISO,
  summaryRows,
}: StepBodyProps) {
  const inputErr = (key: string) => (errors[key] ? fieldErrorRing : "")

  switch (step) {
    case "customer":
      return (
        <Choices
          options={customerOptions}
          value={state.customer}
          locale={locale}
          onPick={(id) => {
            const next = id as TripType
            patch({
              customer: next,
              service:
                (next === "company") === isCompany || !state.service ? state.service : "",
            })
          }}
        />
      )
    case "service":
      return (
        <Choices
          options={serviceOptions}
          value={state.service}
          locale={locale}
          onPick={(id) => patch({ service: id })}
        />
      )
    case "route": {
      const placeOptions = places.map((p) => ({
        ...p,
        group: tx(placeGroupLabels[p.group]),
      }))
      const setLeg = (i: number, change: Partial<Leg>) => {
        const legs = state.legs.map((leg, j) => (j === i ? { ...leg, ...change } : leg))
        // Keep the chain: the next leg starts where this one ends (unless the user changed it).
        const next = legs[i + 1]
        if (change.to !== undefined && next && (!next.from || next.from === state.legs[i].to)) {
          legs[i + 1] = { ...next, from: change.to }
        }
        patch({ legs })
      }
      return (
        <div className="space-y-5">
          {state.legs.map((leg, i) => (
            <div key={i} className="space-y-3 rounded-2xl bg-surface-muted/50 p-3.5">
              {state.legs.length > 1 ? (
                <div className="flex items-center justify-between gap-2">
                  <p className="font-label text-[0.7rem] font-semibold tracking-[0.14em] text-orange uppercase rtl:tracking-normal">
                    {tx(COPY.legTitle(i + 1))}
                  </p>
                  {i > 0 ? (
                    <button
                      type="button"
                      className="rounded-md px-2 py-1 text-xs font-semibold text-ink-muted hover:text-ink hover:underline"
                      onClick={() => patch({ legs: state.legs.filter((_, j) => j !== i) })}
                    >
                      {tx(COPY.removeLeg)}
                    </button>
                  ) : null}
                </div>
              ) : null}
              {/* DOM order From, To, Date, Time: the page direction puts From on the right in Arabic. */}
              <div className="grid grid-cols-1 gap-3.5 @lg:grid-cols-2">
                <Field label={tx(COPY.fields.from)} htmlFor={`qw-from-${i}`} error={errors[`from${i}`]}>
                  <PlaceSelect
                    id={`qw-from-${i}`}
                    value={leg.from}
                    options={placeOptions}
                    locale={locale}
                    placeholder={tx(COPY.pickPlace)}
                    error={errors[`from${i}`]}
                    onChange={(v) => setLeg(i, { from: v })}
                  />
                </Field>
                <Field label={tx(COPY.fields.to)} htmlFor={`qw-to-${i}`} error={errors[`to${i}`]}>
                  <PlaceSelect
                    id={`qw-to-${i}`}
                    value={leg.to}
                    options={placeOptions}
                    locale={locale}
                    placeholder={tx(COPY.pickPlace)}
                    error={errors[`to${i}`]}
                    onChange={(v) => setLeg(i, { to: v })}
                  />
                </Field>
                <Field label={tx(COPY.fields.date)} htmlFor={`qw-date-${i}`} error={errors[`date${i}`]}>
                  <DatePicker
                    id={`qw-date-${i}`}
                    locale={locale}
                    value={leg.date}
                    min={state.legs[i - 1]?.date || todayISO}
                    placeholder={tx(COPY.pickDate)}
                    error={errors[`date${i}`]}
                    onChange={(v) => setLeg(i, { date: v })}
                  />
                </Field>
                <Field label={tx(COPY.fields.time)} htmlFor={`qw-time-${i}`} error={errors[`time${i}`]}>
                  <TimePicker
                    id={`qw-time-${i}`}
                    locale={locale}
                    value={leg.time}
                    placeholder={tx(COPY.pickTime)}
                    error={errors[`time${i}`]}
                    onChange={(v) => setLeg(i, { time: v })}
                  />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={state.legs.length >= MAX_LEGS}
            className="font-label inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-orange ring-1 ring-orange/40 transition hover:bg-orange/10 disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => patch({ legs: [...state.legs, emptyLeg(state.legs[state.legs.length - 1])] })}
          >
            <span aria-hidden="true">+</span>
            {tx(COPY.addLeg)}
          </button>
        </div>
      )
    }
    case "passengers":
      return (
        <div className="grid grid-cols-1 gap-3.5 @lg:grid-cols-2">
          <Field
            label={tx(COPY.fields.passengers)}
            htmlFor="qw-pax"
            error={errors.passengers}
          >
            <NumberStepper
              id="qw-pax"
              locale={locale}
              min={1}
              max={500}
              step={1}
              error={errors.passengers}
              value={state.passengers}
              onChange={(v) => patch({ passengers: v })}
            />
          </Field>
          <Field label={tx(COPY.fields.luggage)} htmlFor="qw-luggage">
            <input
              id="qw-luggage"
              name="luggage"
              className={fieldClass}
              value={state.luggage}
              onChange={(e) => patch({ luggage: e.target.value })}
            />
          </Field>
          <Field
            label={tx(COPY.fields.accessibility)}
            htmlFor="qw-access"
            className="@lg:col-span-2"
          >
            <input
              id="qw-access"
              name="access"
              className={fieldClass}
              value={state.accessibility}
              onChange={(e) => patch({ accessibility: e.target.value })}
            />
          </Field>
        </div>
      )
    case "vehicle":
      return (
        <div className="space-y-4">
          <Field
            label={tx(COPY.fields.busCount)}
            htmlFor="qw-buses"
            error={errors.busCount}
          >
            <NumberStepper
              id="qw-buses"
              locale={locale}
              min={1}
              max={50}
              error={errors.busCount}
              value={state.busCount}
              onChange={(v) => patch({ busCount: v })}
            />
          </Field>
          <Choices
            options={busClassOptions}
            value={state.busClass}
            locale={locale}
            onPick={(id) => patch({ busClass: id as BusClass })}
          />
        </div>
      )
    case "extras":
      return (
        <div className="space-y-4">
          <Field label={tx(COPY.fields.notes)} htmlFor="qw-notes">
            <textarea
              id="qw-notes"
              name="notes"
              className={cn(fieldClass, "min-h-[5.5rem] resize-none")}
              value={state.notes}
              onChange={(e) => patch({ notes: e.target.value })}
            />
          </Field>
        </div>
      )
    case "contact":
      return (
        <div className="grid grid-cols-1 gap-3.5 @lg:grid-cols-2">
          <Field
            label={tx(COPY.fields.name)}
            htmlFor="qw-name"
            error={errors.name}
            className="@lg:col-span-2"
          >
            <input
              id="qw-name"
              name="name"
              className={cn(fieldClass, inputErr("name"))}
              value={state.name}
              autoComplete="name"
              onChange={(e) => patch({ name: e.target.value })}
            />
          </Field>
          {needsOrg ? (
            <Field
              label={tx(COPY.fields.organization)}
              htmlFor="qw-org"
              error={errors.organization}
              className="@lg:col-span-2"
            >
              <input
                id="qw-org"
                name="org"
                className={cn(fieldClass, inputErr("organization"))}
                value={state.organization}
                autoComplete="organization"
                onChange={(e) => patch({ organization: e.target.value })}
              />
            </Field>
          ) : null}
          <Field label={tx(COPY.fields.phone)} htmlFor="qw-phone" error={errors.phone}>
            <input
              id="qw-phone"
              name="phone"
              type="tel"
              dir="ltr"
              className={cn(fieldClass, inputErr("phone"))}
              value={state.phone}
              autoComplete="tel"
              onChange={(e) => patch({ phone: e.target.value })}
            />
          </Field>
          <Field label={tx(COPY.fields.email)} htmlFor="qw-email" error={errors.email}>
            <input
              id="qw-email"
              name="email"
              type="email"
              dir="ltr"
              className={cn(fieldClass, inputErr("email"))}
              value={state.email}
              autoComplete="email"
              onChange={(e) => patch({ email: e.target.value })}
            />
          </Field>
        </div>
      )
    case "review":
      return (
        <div className="space-y-4">
          <dl className="divide-y divide-border rounded-xl bg-surface-muted/60 text-sm">
            {summaryRows().map((row) => (
              <div
                key={row.id + row.value}
                className="flex items-start justify-between gap-3 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <dt className="text-xs text-ink-muted">{tx(row.label)}</dt>
                  <dd className="text-ink/85">{row.value}</dd>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-xs font-semibold text-orange hover:underline"
                  onClick={() => jumpTo(row.id)}
                >
                  {tx(COPY.edit)}
                </button>
              </div>
            ))}
          </dl>
          <label
            className={cn(
              "flex items-start gap-3 rounded-xl px-3.5 py-3 text-sm text-ink/70",
              errors.consent ? "bg-red-50 ring-2 ring-red-400/40 dark:bg-red-950/40" : "bg-surface-muted/60",
            )}
          >
            <input
              type="checkbox"
              name="consent"
              className="qw-check mt-0.5"
              checked={state.consent}
              onChange={(e) => patch({ consent: e.target.checked })}
            />
            <span>{tx(COPY.consent)}</span>
          </label>
          {errors.consent ? (
            <p className="px-1 text-sm text-red-700 dark:text-red-300" role="alert">
              {errors.consent}
            </p>
          ) : null}
        </div>
      )
    default:
      return null
  }
}
