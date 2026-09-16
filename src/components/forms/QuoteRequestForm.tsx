"use client"

import { submitQuoteRequest } from "@/app/actions/quote"
import {
  quoteRequestSchema,
  tripTypes,
  type TripType,
} from "@/components/forms/formSchemas"
import { cn } from "@/lib/cn"
import { useTranslations } from "next-intl"
import { useState, type FormEvent } from "react"

type QuoteRequestFormProps = {
  className?: string
  whatsappNumber: string
  whatsappPrefill: string
}

const fieldClass =
  "relative z-10 w-full min-w-0 appearance-auto rounded-2xl border border-ink/8 bg-surface-muted px-3.5 py-3 text-base text-ink outline-none transition placeholder:text-ink-muted/50 focus:border-orange focus:bg-white focus:ring-2 focus:ring-orange/20 sm:text-sm"

export const QuoteRequestForm = ({
  className,
  whatsappNumber,
  whatsappPrefill,
}: QuoteRequestFormProps) => {
  const t = useTranslations("quote")
  const [tripType, setTripType] = useState<TripType>("individual")
  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")
  const [passengers, setPassengers] = useState("1")
  const [phone, setPhone] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  )

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappPrefill)}`

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("submitting")

    const payload = {
      tripType,
      pickup,
      destination,
      date,
      passengers: Number(passengers),
      phone,
      companyWebsite: honeypot,
    }

    const parsed = quoteRequestSchema.safeParse(payload)
    if (!parsed.success) {
      setStatus("error")
      return
    }

    const result = await submitQuoteRequest(parsed.data)
    setStatus(result.ok ? "success" : "error")
  }

  return (
    <div
      id="quote"
      className={cn(
        "relative z-10 overflow-visible rounded-[1.5rem] border border-ink/6 bg-white p-4 text-start shadow-md sm:rounded-[1.75rem] sm:p-5 md:p-7",
        className,
      )}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <label className="block min-w-0">
            <span className="font-label mb-1.5 block text-xs font-medium text-ink sm:mb-2">
              {t("tripType")}
            </span>
            <select
              className={fieldClass}
              value={tripType}
              onChange={(event) => setTripType(event.target.value as TripType)}
              required
              aria-label={t("tripType")}
            >
              {tripTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "individual"
                    ? t("tripIndividual")
                    : type === "group"
                      ? t("tripGroup")
                      : t("tripCorporate")}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="font-label mb-1.5 block text-xs font-medium text-ink sm:mb-2">
              {t("pickup")}
            </span>
            <input
              className={fieldClass}
              value={pickup}
              onChange={(event) => setPickup(event.target.value)}
              required
              autoComplete="address-level2"
              aria-label={t("pickup")}
            />
          </label>

          <label className="block min-w-0">
            <span className="font-label mb-1.5 block text-xs font-medium text-ink sm:mb-2">
              {t("destination")}
            </span>
            <input
              className={fieldClass}
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              required
              aria-label={t("destination")}
            />
          </label>

          <label className="block min-w-0">
            <span className="font-label mb-1.5 block text-xs font-medium text-ink sm:mb-2">
              {t("date")}
            </span>
            <input
              type="date"
              className={fieldClass}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              aria-label={t("date")}
            />
          </label>

          <label className="block min-w-0">
            <span className="font-label mb-1.5 block text-xs font-medium text-ink sm:mb-2">
              {t("passengers")}
            </span>
            <input
              type="number"
              min={1}
              max={500}
              inputMode="numeric"
              className={fieldClass}
              value={passengers}
              onChange={(event) => setPassengers(event.target.value)}
              required
              aria-label={t("passengers")}
            />
          </label>

          <label className="block min-w-0 sm:col-span-1 xl:col-span-2">
            <span className="font-label mb-1.5 block text-xs font-medium text-ink sm:mb-2">
              {t("phone")}
            </span>
            <input
              type="tel"
              className={fieldClass}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              dir="ltr"
              autoComplete="tel"
              inputMode="tel"
              aria-label={t("phone")}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:flex-row sm:flex-wrap">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="font-label inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange disabled:opacity-60 sm:w-auto"
          >
            {status === "submitting" ? t("submitting") : t("submit")}
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-orange hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange sm:w-auto"
            aria-label={t("whatsapp")}
          >
            <span aria-hidden className="size-2 rounded-full bg-whatsapp" />
            {t("whatsapp")}
          </a>
        </div>

        <label className="sr-only" aria-hidden>
          {t("honeypot")}
          <input
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </label>

        {status === "success" ? (
          <p className="mt-4 text-sm text-orange" role="status">
            {t("success")}
          </p>
        ) : null}
        {status === "error" ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {t("error")}
          </p>
        ) : null}
      </form>
    </div>
  )
}
