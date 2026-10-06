import {
  allHubStops,
  buildTransferStops,
  busClassOptions,
  customerOptions,
  findOption,
  placeLabel,
  type L10n,
  type MapStop,
  type Option,
  type PlaceId,
} from "./quoteWizardConfig"
import { COPY } from "./quoteWizardCopy"
import type { StepId, WizardState } from "./quoteWizardTypes"

export type Tx = (text: L10n) => string
export type MapView = { stops: MapStop[]; context: MapStop[] }
export type SummaryRow = { id: StepId; label: L10n; value: string }

export function computeSteps(isCompany: boolean): StepId[] {
  const list: StepId[] = ["customer"]
  if (isCompany) list.push("service")
  list.push("route", "passengers", "vehicle", "extras", "contact", "review")
  return list
}

export function getTodayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const legPlaces = (state: WizardState): PlaceId[] => {
  const ids: PlaceId[] = []
  state.legs.forEach((leg, i) => {
    if (i === 0 && leg.from) ids.push(leg.from)
    if (leg.to) ids.push(leg.to)
  })
  return ids
}

/** Stops drawn on the map: the chosen places in order, or faint hubs while empty. */
export function getMapView(state: WizardState): MapView {
  const ids = legPlaces(state)
  return {
    stops: buildTransferStops(ids),
    context: ids.length < 2 ? allHubStops().filter((h) => !ids.includes(h.id as PlaceId)) : [],
  }
}

/** Final route for the confirmation map. */
export function getFinalStops(state: WizardState): MapStop[] {
  const ids = legPlaces(state)
  return ids.length > 1 ? buildTransferStops(ids) : []
}

export function getServiceType(state: WizardState, isCompany: boolean): string {
  return isCompany && state.service ? `company_${state.service}` : `route_${state.legs.length}leg`
}

export function getServiceLabel(
  state: WizardState,
  serviceOptions: readonly Option[],
  tx: Tx,
): string {
  const o = findOption(serviceOptions, state.service)
  return o ? tx(o.label) : ""
}

const arrowFor = (loc: string) => (loc === "ar" ? " ← " : " → ")

/** Route text in the language given (English for the sales payload). */
export function getRouteParts(state: WizardState, loc: string) {
  const first = state.legs[0]
  const last = state.legs[state.legs.length - 1]
  const mid = state.legs.slice(0, -1).map((leg) => (leg.to ? placeLabel(leg.to, loc) : ""))
  return {
    pickup: first?.from ? placeLabel(first.from, loc) : "",
    destination: last?.to ? placeLabel(last.to, loc) : "",
    stops: mid.filter(Boolean).join(arrowFor(loc)),
  }
}

export function validateStep(
  id: StepId,
  state: WizardState,
  tx: Tx,
  needsOrg: boolean,
): Record<string, string> {
  const e: Record<string, string> = {}
  switch (id) {
    case "customer":
      if (!state.customer) e.choice = tx(COPY.errors.choose)
      break
    case "service":
      if (!state.service) e.choice = tx(COPY.errors.choose)
      break
    case "route":
      state.legs.forEach((leg, i) => {
        if (!leg.from) e[`from${i}`] = tx(COPY.errors.place)
        if (!leg.to) e[`to${i}`] = tx(COPY.errors.place)
        if (leg.from && leg.from === leg.to) e[`to${i}`] = tx(COPY.errors.samePlace)
        if (!leg.date) e[`date${i}`] = tx(COPY.errors.date)
        if (!leg.time) e[`time${i}`] = tx(COPY.errors.time)
        const prev = state.legs[i - 1]
        if (
          prev?.date &&
          leg.date &&
          `${leg.date}T${leg.time || "00:00"}` < `${prev.date}T${prev.time || "00:00"}`
        ) {
          e[`date${i}`] = tx(COPY.errors.returnBefore)
        }
      })
      break
    case "passengers":
      if (!Number(state.passengers) || Number(state.passengers) < 1) {
        e.passengers = tx(COPY.errors.passengers)
      }
      break
    case "vehicle":
      if (!Number(state.busCount) || Number(state.busCount) < 1) {
        e.busCount = tx(COPY.errors.buses)
      }
      break
    case "contact":
      if (state.name.trim().length < 2) e.name = tx(COPY.errors.name)
      if (needsOrg && !state.organization.trim()) e.organization = tx(COPY.errors.organization)
      if (state.phone.trim().length < 8) e.phone = tx(COPY.errors.phone)
      if (state.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
        e.email = tx(COPY.errors.email)
      }
      break
    case "review":
      if (!state.consent) e.consent = tx(COPY.errors.consent)
      break
    default:
      break
  }
  return e
}

export function buildQuotePayload(
  state: WizardState,
  serviceType: string,
  isAr: boolean,
  honeypot: string,
) {
  const route = getRouteParts(state, "en")
  const first = state.legs[0]
  const last = state.legs[state.legs.length - 1]
  /** Only a trip that ends where it started has a return date. */
  const isReturn = state.legs.length > 1 && !!first.from && last.to === first.from
  return {
    tripType: state.customer || undefined,
    serviceType,
    customerName: state.name,
    organization: state.organization,
    email: state.email,
    phone: state.phone,
    pickup: route.pickup,
    destination: route.destination,
    stops: route.stops,
    legs: state.legs.map((leg) => ({
      from: placeLabel(leg.from, "en"),
      to: placeLabel(leg.to, "en"),
      date: leg.date,
      time: leg.time,
    })),
    date: first.date,
    departureTime: first.time,
    returnDate: isReturn ? last.date : "",
    passengers: Number(state.passengers),
    busCount: Number(state.busCount) || 1,
    busClass: state.busClass,
    accessibilityNeeds: state.accessibility,
    luggageNotes: state.luggage,
    specialRequirements: state.notes.trim(),
    consent: state.consent,
    language: isAr ? ("ar" as const) : ("en" as const),
    companyWebsite: honeypot,
  }
}

export function buildSummaryRows(
  state: WizardState,
  locale: string,
  serviceOptions: readonly Option[],
  tx: Tx,
): SummaryRow[] {
  const customer = findOption(customerOptions, state.customer)
  const tag = locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB"
  const fmtDate = (iso: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
    if (!m) return iso
    return new Intl.DateTimeFormat(tag, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  }
  const fmtTime = (hhmm: string) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm)
    if (!m) return hhmm
    return new Intl.DateTimeFormat(tag, { hour: "numeric", minute: "2-digit", hour12: true }).format(
      new Date(2000, 0, 1, Number(m[1]), Number(m[2])),
    )
  }
  const arrow = arrowFor(locale)
  const legRows: SummaryRow[] = state.legs.map((leg, i) => ({
    id: "route",
    label: state.legs.length > 1 ? COPY.summary.leg(i + 1) : COPY.summary.route,
    value: [
      [leg.from && placeLabel(leg.from, locale), leg.to && placeLabel(leg.to, locale)]
        .filter(Boolean)
        .join(arrow),
      [leg.date && fmtDate(leg.date), leg.time && fmtTime(leg.time)].filter(Boolean).join(" · "),
    ]
      .filter(Boolean)
      .join(" · "),
  }))
  const rows: SummaryRow[] = [
    { id: "customer", label: COPY.summary.who, value: customer ? tx(customer.label) : "" },
    { id: "service", label: COPY.summary.service, value: getServiceLabel(state, serviceOptions, tx) },
    ...legRows,
    {
      id: "passengers",
      label: COPY.summary.passengers,
      value: state.passengers,
    },
    {
      id: "vehicle",
      label: COPY.summary.vehicle,
      value: `${state.busCount} × ${tx(findOption(busClassOptions, state.busClass)!.label)}`,
    },
    ...(state.notes.trim()
      ? [{ id: "extras" as StepId, label: COPY.summary.extras, value: state.notes.trim() }]
      : []),
    {
      id: "contact",
      label: COPY.summary.contact,
      value: [state.name, state.organization, state.phone].filter(Boolean).join(" · "),
    },
  ]
  return rows.filter((r) => r.value)
}
