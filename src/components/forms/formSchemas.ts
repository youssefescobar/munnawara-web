import { z } from "zod"

/** Customer types (step 1 of the quote wizard). Mirrors dam-backend Quote.customerType. */
export const tripTypes = [
  "company",
  "government",
  "school",
  "umrah_campaigns",
  "tourism",
] as const

export type TripType = (typeof tripTypes)[number]

export const busClasses = ["standard", "vip", "city", "coach", "employee"] as const

export type BusClass = (typeof busClasses)[number]

export const orgRequiredTypes: readonly TripType[] = [
  "company",
  "government",
  "school",
  "umrah_campaigns",
  "tourism",
]

export const quoteRequestSchema = z
  .object({
    tripType: z.enum(tripTypes),
    /** e.g. route_2leg, company_workers */
    serviceType: z.string().trim().max(80).optional().default(""),
    customerName: z.string().trim().min(2).max(120),
    organization: z.string().trim().max(160).optional().default(""),
    email: z.string().trim().email().optional().or(z.literal("")),
    phone: z.string().trim().min(8).max(40),
    pickup: z.string().trim().min(2).max(120),
    destination: z.string().trim().min(2).max(120),
    stops: z.string().trim().max(300).optional().default(""),
    date: z.string().trim().min(1).max(40),
    departureTime: z.string().trim().max(20).optional().default(""),
    returnDate: z.string().trim().max(40).optional().default(""),
    waitingHours: z.coerce.number().min(0).max(168).optional().nullable(),
    passengers: z.coerce.number().int().min(1).max(500),
    busCount: z.coerce.number().int().min(1).max(50).optional().default(1),
    busClass: z.enum(busClasses).optional().default("standard"),
    accessibilityNeeds: z.string().trim().max(300).optional().default(""),
    luggageNotes: z.string().trim().max(300).optional().default(""),
    specialRequirements: z.string().trim().max(1200).optional().default(""),
    needsSupervisors: z.boolean().optional().default(false),
    needsTracking: z.boolean().optional().default(false),
    needsBranding: z.boolean().optional().default(false),
    needsAirportReception: z.boolean().optional().default(false),
    consent: z.boolean().refine((v) => v === true, { message: "consent required" }),
    language: z.enum(["ar", "en"]).optional().default("en"),
    /** Honeypot — must stay empty */
    companyWebsite: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (
      orgRequiredTypes.includes(data.tripType) &&
      !data.organization.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "organization required",
        path: ["organization"],
      })
    }
  })

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>
