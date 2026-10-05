/**
 * Quote wizard content — everything Abdullah may want to change lives here.
 * Draft options come from the product notes; confirm exact lists with Abdullah.
 */

export type L10n = { en: string; ar: string }

export type Option<T extends string = string> = {
  id: T
  label: L10n
  hint?: L10n
}

export const l = (en: string, ar: string): L10n => ({ en, ar })

/* ---------- Step 1: who is asking ---------- */

export const customerOptions = [
  {
    id: "company",
    label: l("Company / Corporate", "شركة / مؤسسة"),
    hint: l("Staff, events, and contracts", "نقل موظفين وفعاليات وعقود"),
  },
  {
    id: "government",
    label: l("Government entity", "جهة حكومية"),
    hint: l("Institutional and official transport", "نقل رسمي ومؤسسي"),
  },
  {
    id: "school",
    label: l("School / University", "مدرسة / جامعة"),
    hint: l("Student routes and trips", "مسارات ورحلات الطلاب"),
  },
  {
    id: "umrah_campaigns",
    label: l("Umrah campaigns", "حملات عمرة"),
    hint: l("Umrah campaign operators and offices", "مكاتب وحملات العمرة"),
  },
  {
    id: "tourism",
    label: l("Tourism company", "شركة سياحة"),
    hint: l("Tour groups and packages", "مجموعات وبرامج سياحية"),
  },
] as const satisfies readonly Option[]

export type CustomerId = (typeof customerOptions)[number]["id"]

/** Customer types that must give an organization name. */
export const orgRequired: readonly CustomerId[] = [
  "company",
  "government",
  "school",
  "umrah_campaigns",
  "tourism",
]

/* ---------- Step 2: service ---------- */

/** Company sub-menu (draft — workers confirmed, rest from the KB; confirm with Abdullah). */
export const corporateServices: readonly Option[] = [
  {
    id: "workers",
    label: l("Workers / staff transport", "نقل العمال والموظفين"),
    hint: l("Daily or contract shuttles", "نقل يومي أو بعقد"),
  },
  {
    id: "education",
    label: l("School / university transport", "نقل مدارس وجامعات"),
  },
  {
    id: "tourism_group",
    label: l("Tourism groups", "مجموعات سياحية"),
  },
  {
    id: "events",
    label: l("Events & conferences", "فعاليات ومؤتمرات"),
  },
  {
    id: "vip_airport",
    label: l("VIP airport transfer", "استقبال كبار الزوار من المطار"),
  },
  {
    id: "international",
    label: l("International routes", "رحلات دولية"),
  },
  {
    id: "other",
    label: l("Something else", "طلب آخر"),
  },
]

/*
 * ---------- Locations (WGS84, verified against Wikipedia / OpenStreetMap) ----------
 * Jeddah: King Abdulaziz Int'l Airport · Makkah: Masjid al-Haram ·
 * Madinah: Prophet's Mosque · MED: Prince Mohammad bin Abdulaziz Int'l Airport.
 */

export type PlaceGroup = "airports" | "holy" | "cities"

export const placeGroupLabels: Record<PlaceGroup, L10n> = {
  airports: l("Airports", "المطارات"),
  holy: l("Makkah & Madinah", "مكة والمدينة"),
  cities: l("Other cities", "مدن أخرى"),
}

// TODO(content): confirm the full From/To list with Abdullah. Coordinates are city centres.
const rawPlaces = [
  { id: "jed_airport", group: "airports", label: l("Jeddah Airport (JED)", "مطار جدة (JED)"), lat: 21.67944, lng: 39.15667 },
  { id: "med_airport", group: "airports", label: l("Madinah Airport (MED)", "مطار المدينة (MED)"), lat: 24.55333, lng: 39.705 },
  { id: "makkah", group: "holy", label: l("Makkah", "مكة المكرمة"), lat: 21.4225, lng: 39.82611 },
  { id: "madinah", group: "holy", label: l("Madinah", "المدينة المنورة"), lat: 24.46833, lng: 39.61083 },
  { id: "jeddah", group: "cities", label: l("Jeddah", "جدة"), lat: 21.4858, lng: 39.1925 },
  { id: "taif", group: "cities", label: l("Taif", "الطائف"), lat: 21.2703, lng: 40.4158 },
  { id: "yanbu", group: "cities", label: l("Yanbu", "ينبع"), lat: 24.0895, lng: 38.0618 },
  { id: "alula", group: "cities", label: l("AlUla", "العلا"), lat: 26.6084, lng: 37.9232 },
  { id: "riyadh", group: "cities", label: l("Riyadh", "الرياض"), lat: 24.7136, lng: 46.6753 },
  { id: "dammam", group: "cities", label: l("Dammam", "الدمام"), lat: 26.4207, lng: 50.0888 },
] as const satisfies readonly (Option & { group: PlaceGroup; lat: number; lng: number })[]

export type PlaceId = (typeof rawPlaces)[number]["id"]

export type Place = Option<PlaceId> & { lat: number; lng: number; group: PlaceGroup }

export const places: readonly Place[] = rawPlaces

/* A stop on the map, in visiting order. */
export type MapStop = {
  id: string
  lat: number
  lng: number
  label: L10n
  kind: "hub"
}

const hubStop = (id: PlaceId): MapStop => {
  const p = places.find((x) => x.id === id)!
  return { id: p.id, lat: p.lat, lng: p.lng, label: p.label, kind: "hub" }
}

export const buildTransferStops = (ids: readonly PlaceId[]): MapStop[] => ids.map(hubStop)

export const allHubStops = (): MapStop[] =>
  places.filter((p) => p.group !== "cities").map((p) => hubStop(p.id))

/* ---------- Fleet ---------- */

export const busClassOptions = [
  { id: "vip", label: l("VIP", "في آي بي"), hint: l("32 seats", "٣٢ مقعد") },
  { id: "standard", label: l("Standard", "عادية"), hint: l("49 seats", "٤٩ مقعد") },
  { id: "coach", label: l("Coach", "حافلة ٤٥"), hint: l("45 seats", "٤٥ مقعد") },
  { id: "city", label: l("City bus", "حافلة مدينة"), hint: l("19 seats", "١٩ مقعد") },
  {
    id: "employee",
    label: l("Staff transport", "نقل موظفين"),
    hint: l("48 & 60 seats", "٤٨ و٦٠ مقعد"),
  },
] as const satisfies readonly Option[]

export type BusClassId = (typeof busClassOptions)[number]["id"]

/* ---------- Helpers ---------- */

export const pick = (text: L10n, locale: string) => (locale === "ar" ? text.ar : text.en)

export const findOption = <T extends Option>(list: readonly T[], id: string) =>
  list.find((o) => o.id === id)

export const placeLabel = (id: string, locale: string) => {
  const p = places.find((x) => x.id === id)
  return p ? pick(p.label, locale) : id
}
