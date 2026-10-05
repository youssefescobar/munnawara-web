import type { ReactNode } from "react"
import type { BusClass, TripType } from "@/components/forms/formSchemas"
import type { PlaceId } from "./quoteWizardConfig"

export type WizardProps = {
  className?: string
  formId?: string
  /** "split" = map pane + form panel that fits the viewport (used by /quote). */
  layout?: "stack" | "split"
  /** Title chip drawn over the map in split layout. */
  heading?: { eyebrow?: string; title: string }
  /** Optional chrome above the step progress (e.g. back link). */
  toolbar?: ReactNode
}

export type StepId =
  | "customer"
  | "service"
  | "route"
  | "passengers"
  | "vehicle"
  | "extras"
  | "contact"
  | "review"

/** One hop of the trip. Leg N+1 starts where leg N ends (like a multi-city flight search). */
export type Leg = { from: PlaceId | ""; to: PlaceId | ""; date: string; time: string }

export const MAX_LEGS = 6

export const emptyLeg = (prev?: Leg): Leg => ({ from: prev?.to ?? "", to: "", date: "", time: "" })

export type WizardState = {
  customer: TripType | ""
  service: string
  legs: Leg[]
  passengers: string
  luggage: string
  accessibility: string
  busCount: string
  busClass: BusClass
  notes: string
  name: string
  organization: string
  phone: string
  email: string
  consent: boolean
}

export const initialState: WizardState = {
  customer: "",
  service: "",
  legs: [emptyLeg()],
  passengers: "1",
  luggage: "",
  accessibility: "",
  busCount: "1",
  busClass: "standard",
  notes: "",
  name: "",
  organization: "",
  phone: "",
  email: "",
  consent: false,
}
