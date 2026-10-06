"use server"

import {
  quoteRequestSchema,
  type QuoteRequestInput,
} from "@/components/forms/formSchemas"

export type QuoteActionState = {
  ok: boolean
  messageKey: "success" | "error"
  leadId?: string
  quoteSlaHours?: number
}

const BACKEND_TIMEOUT_MS = 15_000
const EMAIL_TIMEOUT_MS = 10_000
const DEFAULT_EMAIL_FROM = "DMTC Website <onboarding@resend.dev>"

/** Collapse CR/LF so user text cannot inject headers into an email subject. */
const singleLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim()

function backendBaseUrl() {
  return (
    process.env.CHAT_API_URL ||
    process.env.NEXT_PUBLIC_CHAT_API_URL ||
    process.env.QUOTE_API_URL ||
    ""
  ).replace(/\/$/, "")
}

export const submitQuoteRequest = async (
  raw: QuoteRequestInput,
): Promise<QuoteActionState> => {
  const parsed = quoteRequestSchema.safeParse(raw)

  if (!parsed.success) {
    return { ok: false, messageKey: "error" }
  }

  if (parsed.data.companyWebsite) {
    return { ok: true, messageKey: "success", leadId: "DM-PREVIEW" }
  }

  const data = parsed.data
  const base = backendBaseUrl()
  let leadId: string | undefined
  let quoteSlaHours = 24

  const extras = [
    data.needsSupervisors ? "Supervisors" : "",
    data.needsTracking ? "Tracking" : "",
    data.needsBranding ? "Bus branding" : "",
    data.needsAirportReception ? "Airport reception" : "",
    data.specialRequirements,
  ]
    .filter(Boolean)
    .join("; ")

  if (base) {
    try {
      const response = await fetch(`${base}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
        body: JSON.stringify({
          customerName: data.customerName,
          customerContact: data.phone,
          customerPhone: data.phone,
          customerEmail: data.email || undefined,
          email: data.email || undefined,
          pickup: data.pickup,
          dropoff: data.destination,
          date: data.date,
          returnDatetime: data.returnDate || undefined,
          vehicleType: data.busClass || "standard",
          busClass: data.busClass || "standard",
          passengers: data.passengers,
          busCount: data.busCount || 1,
          channel: "web",
          language: data.language,
          customerType: data.tripType,
          tripType: data.serviceType || data.tripType,
          organization: data.organization || undefined,
          serviceType: data.serviceType || data.tripType,
          originCity: data.pickup,
          destinationCity: data.destination,
          stops: data.stops || undefined,
          legs: data.legs.length ? data.legs : undefined,
          departureTime: data.departureTime || undefined,
          waitingHours: data.waitingHours ?? undefined,
          accessibilityNeeds: data.accessibilityNeeds || undefined,
          luggageNotes: data.luggageNotes || undefined,
          specialRequirements: extras || undefined,
          needsSupervisors: data.needsSupervisors,
          needsTracking: data.needsTracking,
          needsBranding: data.needsBranding,
          needsAirportReception: data.needsAirportReception,
          preferredContactChannel: "whatsapp",
          consent: data.consent,
          notes: [
            data.serviceType ? `Service: ${data.serviceType}` : "",
            data.stops ? `Stops: ${data.stops}` : "",
            data.departureTime ? `Time: ${data.departureTime}` : "",
            data.waitingHours != null
              ? `Waiting hours: ${data.waitingHours}`
              : "",
            extras ? `Requirements: ${extras}` : "",
            data.accessibilityNeeds
              ? `Accessibility: ${data.accessibilityNeeds}`
              : "",
            data.luggageNotes ? `Luggage: ${data.luggageNotes}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      })

      if (!response.ok) {
        console.error("[quote] backend failed", await response.text())
        return { ok: false, messageKey: "error" }
      }

      const body = (await response.json()) as {
        leadId?: string
        quoteSlaHours?: number
        quote?: { _id?: string; leadId?: string }
      }
      leadId = body.leadId || body.quote?.leadId
      if (body.quoteSlaHours) quoteSlaHours = body.quoteSlaHours
    } catch (error) {
      console.error("[quote] backend submit failed", error)
      return { ok: false, messageKey: "error" }
    }
  } else {
    leadId = `DM-LOCAL-${Date.now().toString(36).toUpperCase()}`
    console.info("[quote] preview submission (no CHAT_API_URL)", {
      leadId,
      tripType: data.tripType,
      pickup: data.pickup,
      destination: data.destination,
    })
  }

  const apiKey = process.env.RESEND_API_KEY
  const inbox = process.env.CONTACT_INBOX_EMAIL
  if (apiKey && inbox) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || DEFAULT_EMAIL_FROM,
          to: [inbox],
          subject: singleLine(
            `[Quote ${leadId || ""}] ${data.tripType}: ${data.pickup} → ${data.destination}`,
          ),
          text: [
            `Lead: ${leadId || "-"}`,
            `Name: ${data.customerName}`,
            `Org: ${data.organization || "-"}`,
            `Type: ${data.tripType}`,
            `Pickup: ${data.pickup}`,
            `Destination: ${data.destination}`,
            `Stops: ${data.stops || "-"}`,
            `Date: ${data.date} ${data.departureTime || ""}`,
            `Return: ${data.returnDate || "-"}`,
            ...(data.legs.length > 1
              ? [
                  "Itinerary:",
                  ...data.legs.map(
                    (leg, i) =>
                      `  ${i + 1}) ${leg.from} → ${leg.to} ${leg.date} ${leg.time}`.trimEnd(),
                  ),
                ]
              : []),
            `Passengers: ${data.passengers}`,
            `Buses: ${data.busCount} × ${data.busClass}`,
            `Phone: ${data.phone}`,
            `Requirements: ${extras || "-"}`,
          ].join("\n"),
        }),
      })
    } catch (error) {
      console.error("[quote] Resend side-channel failed", error)
    }
  }

  return {
    ok: true,
    messageKey: "success",
    leadId,
    quoteSlaHours,
  }
}
