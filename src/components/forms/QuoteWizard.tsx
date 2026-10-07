"use client"

import { submitQuoteRequest, updateQuoteRequest } from "@/app/actions/quote"
import { quoteRequestSchema } from "@/components/forms/formSchemas"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/cn"
import { useLocale } from "next-intl"
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react"
import { corporateServices, orgRequired, pick, type L10n, type Option } from "./quoteWizardConfig"
import dynamic from "next/dynamic"
import { GlobeVisual } from "./QuoteVisuals"
import { COPY } from "./quoteWizardCopy"
import {
  buildQuotePayload,
  buildSummaryRows,
  computeSteps,
  getFinalStops,
  getMapView,
  getServiceType,
  getTodayISO,
  validateStep,
  type MapView,
} from "./quoteWizardLogic"
import { initialState, type StepId, type WizardProps, type WizardState } from "./quoteWizardTypes"
import { StepProgress, btnGhost, btnPrimary } from "./quoteWizardUi"
import { StepBody } from "./QuoteWizardSteps"

/** Credentials + answers of the last sent request, so the customer can edit it until the team starts on it. */
const EDIT_KEY = "dmtc:quote-edit"
type SavedEdit = { id: string; token: string; leadId?: string; sla: number; state: WizardState }
const loadEdit = (): SavedEdit | null => {
  try {
    return JSON.parse(sessionStorage.getItem(EDIT_KEY) || "null")
  } catch {
    return null
  }
}
const saveEdit = (v: SavedEdit | null) => {
  try {
    if (v) sessionStorage.setItem(EDIT_KEY, JSON.stringify(v))
    else sessionStorage.removeItem(EDIT_KEY)
  } catch {
    /* storage unavailable: edit link just won't survive */
  }
}

const QuoteMap = dynamic(() => import("./QuoteMap"), {
  ssr: false,
  loading: () => <div className="qmap animate-pulse bg-surface-muted" aria-hidden="true" />,
})

export const QuoteWizard = ({
  className,
  formId = "quote",
  layout = "stack",
  heading,
  toolbar,
}: WizardProps) => {
  const locale = useLocale()
  const isAr = locale === "ar"
  const tx = (text: L10n) => pick(text, locale)
  const split = layout === "split"
  const reducedMotion = useReducedMotion()

  const [state, setState] = useState<WizardState>(initialState)
  const [stepIndex, setStepIndex] = useState(0)
  const [dir, setDir] = useState<"fwd" | "back">("fwd")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [honeypot, setHoneypot] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle")
  const [result, setResult] = useState<{ leadId?: string; sla: number } | null>(null)
  const [edit, setEdit] = useState<{ id: string; token: string } | null>(null)
  const [editing, setEditing] = useState(false)
  const [locked, setLocked] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  // Restore the confirmation (and its edit action) after a reload.
  useEffect(() => {
    const saved = loadEdit()
    if (!saved) return
    setState(saved.state)
    setEdit({ id: saved.id, token: saved.token })
    setResult({ leadId: saved.leadId, sla: saved.sla })
    setStatus("done")
  }, [])

  const patch = (p: Partial<WizardState>) => {
    setState((s) => ({ ...s, ...p }))
    setErrors({})
  }

  const isCompany = state.customer === "company"
  const needsOrg = state.customer !== "" && orgRequired.includes(state.customer)

  const steps = useMemo<StepId[]>(() => computeSteps(isCompany), [isCompany])

  // Bring the first validation message into view (e.g. consent below the fold on phones).
  useEffect(() => {
    if (!Object.keys(errors).length) return
    topRef.current
      ?.querySelector<HTMLElement>('[role="alert"]')
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [errors])

  const stepIndexSafe = Math.min(stepIndex, steps.length - 1)
  const step = steps[stepIndexSafe]

  const serviceOptions: readonly Option[] = corporateServices

  /* ---- derived trip data ---- */

  const todayISO = getTodayISO()
  const mapView = () => getMapView(state)
  const finalStops = () => getFinalStops(state)
  const serviceType = getServiceType(state, isCompany)
  const summaryRows = () => buildSummaryRows(state, locale, serviceOptions, tx)

  /* ---- navigation ---- */

  const scrollTop = () => {
    topRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }

  const goTo = (index: number, direction: "fwd" | "back") => {
    setDir(direction)
    setErrors({})
    setStepIndex(index)
    scrollTop()
  }

  const goNext = () => {
    const e = validateStep(step, state, tx, needsOrg)
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    if (stepIndexSafe < steps.length - 1) goTo(stepIndexSafe + 1, "fwd")
  }

  const goBack = () => {
    if (stepIndexSafe > 0) goTo(stepIndexSafe - 1, "back")
  }

  const jumpTo = (id: StepId) => {
    const i = steps.indexOf(id)
    if (i >= 0) goTo(i, "back")
  }

  /* ---- submit ---- */

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (step !== "review") {
      goNext()
      return
    }
    const e = validateStep("review", state, tx, needsOrg)
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    setStatus("submitting")
    const parsed = quoteRequestSchema.safeParse(
      buildQuotePayload(state, serviceType, isAr, honeypot),
    )
    if (!parsed.success) {
      setStatus("error")
      return
    }
    if (editing && edit) {
      const res = await updateQuoteRequest(edit.id, edit.token, parsed.data)
      if (res.ok) {
        saveEdit({ ...edit, token: edit.token, leadId: result?.leadId, sla: result?.sla ?? 24, state })
        setEditing(false)
        setStatus("done")
        scrollTop()
      } else {
        if (res.locked) {
          setEdit(null)
          setEditing(false)
          saveEdit(null)
          setLocked(true)
          setStatus("done")
        } else setStatus("error")
      }
      return
    }
    const response = await submitQuoteRequest(parsed.data)
    if (response.ok) {
      const sla = response.quoteSlaHours || 24
      setResult({ leadId: response.leadId, sla })
      if (response.quoteId && response.editToken) {
        setEdit({ id: response.quoteId, token: response.editToken })
        saveEdit({ id: response.quoteId, token: response.editToken, leadId: response.leadId, sla, state })
      }
      setStatus("done")
      scrollTop()
    } else {
      setStatus("error")
    }
  }

  const startEdit = () => {
    setEditing(true)
    setStatus("idle")
    goTo(steps.length - 1, "back")
  }

  const reset = () => {
    saveEdit(null)
    setEdit(null)
    setEditing(false)
    setLocked(false)
    setState(initialState)
    setStepIndex(0)
    setErrors({})
    setResult(null)
    setStatus("idle")
  }

  /* ---- layout bits ---- */

  const shell = (children: ReactNode, mv?: MapView) => {
    if (split) {
      const view = mv ?? mapView()
      return (
        <div
          id={formId}
          ref={topRef}
          dir={isAr ? "rtl" : "ltr"}
          className={cn("qw-split text-start", className)}
        >
          <aside className="qw-split__map" aria-label={isAr ? "الخريطة" : "Route map"}>
            <QuoteMap
              stops={view.stops}
              context={view.context}
              locale={locale}
              still={reducedMotion}
              className="qmap qmap--fill"
            />
            {heading ? (
              <div className="qw-split__chip">
                {heading.eyebrow ? (
                  <p className="font-label hidden text-[0.62rem] font-semibold tracking-[0.18em] text-orange uppercase sm:block">
                    {heading.eyebrow}
                  </p>
                ) : null}
                <h1 className="font-display text-base leading-tight font-semibold text-ink sm:text-xl">
                  {heading.title}
                </h1>
              </div>
            ) : null}
          </aside>
          <section className="qw-split__panel">{children}</section>
        </div>
      )
    }
    return (
      <div
        id={formId}
        ref={topRef}
        dir={isAr ? "rtl" : "ltr"}
        className={cn(
          "rounded-2xl bg-surface-elevated/90 p-4 text-start ring-1 ring-border backdrop-blur-md sm:p-6 md:p-8",
          className,
        )}
      >
        {children}
      </div>
    )
  }

  /* ---- finished ---- */

  if (status === "done" && result) {
    return shell(
      <div data-lenis-prevent className={cn("qw-step qw-step--fwd", split && "min-h-0 flex-1 overflow-y-auto overscroll-contain")} role="status">
        {!split && finalStops().length > 1 ? (
          <QuoteMap stops={finalStops()} locale={locale} className="qmap mb-4" />
        ) : null}
        <p className="font-label text-[0.7rem] font-semibold tracking-[0.14em] text-orange uppercase">
          {tx(COPY.done.eyebrow)}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">
          {tx(COPY.done.title)}
        </h3>
        {result.leadId ? (
          <p className="mt-3 rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink">
            {tx(COPY.done.number)}:{" "}
            <span className="font-mono font-semibold" dir="ltr">
              {result.leadId}
            </span>
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          {tx(COPY.done.eta(result.sla))}
        </p>
        <dl className="mt-4 space-y-1.5 rounded-xl bg-surface-muted/60 px-4 py-3 text-sm">
          {summaryRows().map((row) => (
            <div key={row.id + row.value} className="flex flex-wrap gap-x-2">
              <dt className="text-ink-muted">{tx(row.label)}:</dt>
              <dd className="text-ink/80">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-ink/70">{tx(COPY.done.note)}</p>
        {locked ? (
          <p className="mt-3 text-sm text-ink/70" role="alert">
            {tx(COPY.done.locked)}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {edit ? (
            <button type="button" className={btnPrimary} onClick={startEdit}>
              {tx(COPY.done.edit)}
            </button>
          ) : null}
          <button type="button" className={btnGhost} onClick={reset}>
            {tx(COPY.done.another)}
          </button>
        </div>
      </div>,
      { stops: finalStops(), context: [] },
    )
  }

  /* ---- step bodies ---- */

  const showGlobe = step === "customer" || step === "service"
  const showRoute = step === "route"

  const mapData = showRoute && !split ? mapView() : null

  const body = (
    <StepBody
      step={step}
      state={state}
      errors={errors}
      locale={locale}
      tx={tx}
      patch={patch}
      jumpTo={jumpTo}
      serviceOptions={serviceOptions}
      isCompany={isCompany}
      needsOrg={needsOrg}
      todayISO={todayISO}
      summaryRows={summaryRows}
    />
  )

  const isLast = stepIndexSafe === steps.length - 1
  const isChoiceStep = step === "customer" || step === "service"
  const choiceValue = step === "customer" ? state.customer : step === "service" ? state.service : ""
  const showContinue = !isChoiceStep || Boolean(choiceValue)
  const stepName = tx(COPY.stepNames[step])
  const stepLabel = tx(COPY.stepOf(stepIndexSafe + 1, steps.length, stepName))

  return shell(
    <>
      <div className={split ? "mb-4 shrink-0" : "mb-5"}>
        <StepProgress
          current={stepIndexSafe + 1}
          total={steps.length}
          name={stepName}
          counter={tx(COPY.stepCount(stepIndexSafe + 1, steps.length))}
          label={stepLabel}
          toolbar={toolbar}
        />
        <div className="sr-only" aria-live="polite">
          {stepLabel}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className={split ? "flex min-h-0 flex-1 flex-col gap-3" : "space-y-5"}
      >
        <div data-lenis-prevent className={split ? "qw-scroll @container min-h-0 flex-1 overflow-y-auto overscroll-contain" : "@container space-y-5"}>
        <div key={step} className={cn("qw-step space-y-4", dir === "fwd" ? "qw-step--fwd" : "qw-step--back")}>
          <div className="flex items-center gap-3">
            {showGlobe ? (
              <GlobeVisual className="size-11 shrink-0 sm:size-12" />
            ) : null}
            <h2 className="font-display text-xl leading-snug font-semibold text-balance text-ink sm:text-2xl">
              {tx(COPY.titles[step])}
            </h2>
          </div>

          {mapData ? (
            <QuoteMap
              stops={mapData.stops}
              context={mapData.context}
              locale={locale}
              still={reducedMotion}
              className="qmap"
            />
          ) : null}

          {body}

          {errors.choice ? (
            <p className="text-sm text-red-700 dark:text-red-300" role="alert">
              {errors.choice}
            </p>
          ) : null}
        </div>

        {/* honeypot */}
        <input
          type="text"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />

        {status === "error" ? (
          <div
            className="mt-4 rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-800 ring-1 ring-red-200/80 dark:bg-red-950/60 dark:text-red-200 dark:ring-red-400/30"
            role="alert"
          >
            {tx(COPY.error)}
          </div>
        ) : null}
        </div>

        <div className={split ? "flex shrink-0 flex-wrap items-center gap-2 border-t border-border pt-3" : "flex flex-wrap items-center gap-2 pt-1"}>
          {stepIndexSafe > 0 ? (
            <button type="button" className={btnGhost} onClick={goBack}>
              {tx(COPY.back)}
            </button>
          ) : null}
          {isLast ? (
            <button type="submit" className={cn(btnPrimary, "ms-auto")} disabled={status === "submitting"}>
              {status === "submitting" ? tx(COPY.sending) : tx(editing ? COPY.saveChanges : COPY.submit)}
            </button>
          ) : (
            <button
              type="submit"
              className={cn(btnPrimary, "ms-auto")}
              disabled={!showContinue}
            >
              {tx(COPY.next)}
            </button>
          )}
        </div>
      </form>
    </>,
  )
}
