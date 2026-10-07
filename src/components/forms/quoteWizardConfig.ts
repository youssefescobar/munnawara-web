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

export type PlaceGroup = "airports" | "holy" | "makkahSites" | "madinahSites"

export const placeGroupLabels: Record<PlaceGroup, L10n> = {
  airports: l("Airports", "المطارات"),
  holy: l("Makkah & Madinah", "مكة والمدينة"),
  makkahSites: l("Holy sites in Makkah", "المزارات في مكة"),
  madinahSites: l("Holy sites in Madinah", "المزارات في المدينة"),
}

// TODO(content): confirm the full From/To list with Abdullah. Airports and holy sites only.
const rawPlaces = [
  { id: "jed_airport", group: "airports", label: l("Jeddah Airport (JED)", "مطار جدة (JED)"), lat: 21.67944, lng: 39.15667 },
  { id: "med_airport", group: "airports", label: l("Madinah Airport (MED)", "مطار المدينة (MED)"), lat: 24.55333, lng: 39.705 },
  { id: "tif_airport", group: "airports", label: l("Taif Airport (TIF)", "مطار الطائف (TIF)"), lat: 21.4833, lng: 40.5443 },
  { id: "ynb_airport", group: "airports", label: l("Yanbu Airport (YNB)", "مطار ينبع (YNB)"), lat: 24.1442, lng: 38.0634 },
  { id: "ula_airport", group: "airports", label: l("AlUla Airport (ULH)", "مطار العلا (ULH)"), lat: 26.4829, lng: 38.1288 },
  { id: "ruh_airport", group: "airports", label: l("Riyadh Airport (RUH)", "مطار الرياض (RUH)"), lat: 24.9576, lng: 46.6988 },
  { id: "dmm_airport", group: "airports", label: l("Dammam Airport (DMM)", "مطار الدمام (DMM)"), lat: 26.4712, lng: 49.7979 },
  { id: "makkah", group: "holy", label: l("Makkah", "مكة المكرمة"), lat: 21.4225, lng: 39.82611 },
  { id: "madinah", group: "holy", label: l("Madinah", "المدينة المنورة"), lat: 24.46833, lng: 39.61083 },
  { id: "makkah_ziyarat", group: "makkahSites", label: l("Makkah Ziyarat tour", "مكة - مزارات"), lat: 21.4225, lng: 39.82611 },
  { id: "hudaybiyah", group: "makkahSites", label: l("Miqat al-Hudaybiyah", "مكة - ميقات الحديبية"), lat: 21.4333, lng: 39.6833 }, // TODO(content): verify coords
  { id: "jiranah", group: "makkahSites", label: l("Miqat al-Ja'ranah", "مكة - ميقات الجعرانة"), lat: 21.5333, lng: 40.0 }, // TODO(content): verify coords
  { id: "aisha", group: "makkahSites", label: l("Miqat al-Tan'im (Masjid Aisha)", "مكة - ميقات التنعيم"), lat: 21.46771, lng: 39.80137 },
  { id: "taif_tour", group: "makkahSites", label: l("Taif tour", "مكة - جولة الطائف"), lat: 21.2703, lng: 40.4158 },
  { id: "hira", group: "makkahSites", label: l("Jabal al-Nour & Cave of Hira", "جبل النور وغار حراء"), lat: 21.45806, lng: 39.86139 },
  { id: "thawr", group: "makkahSites", label: l("Jabal Thawr", "جبل ثور"), lat: 21.377, lng: 39.84987 },
  { id: "mina", group: "makkahSites", label: l("Mina", "منى"), lat: 21.41333, lng: 39.89333 },
  { id: "muzdalifah", group: "makkahSites", label: l("Muzdalifah", "مزدلفة"), lat: 21.3925, lng: 39.93778 },
  { id: "arafat", group: "makkahSites", label: l("Mount Arafat", "جبل عرفات"), lat: 21.35472, lng: 39.98389 },
  { id: "madinah_ziyarat", group: "madinahSites", label: l("Madinah Ziyarat tour", "المدينة - مزارات"), lat: 24.46833, lng: 39.61083 },
  { id: "mushaf", group: "madinahSites", label: l("Mushaf Printing Complex", "المدينة - مطبعة المصحف"), lat: 24.4833, lng: 39.5 }, // TODO(content): verify coords
  { id: "quba", group: "madinahSites", label: l("Quba Mosque", "مسجد قباء"), lat: 24.43917, lng: 39.61722 },
  { id: "qiblatayn", group: "madinahSites", label: l("Masjid al-Qiblatayn", "مسجد القبلتين"), lat: 24.48409, lng: 39.57891 },
  { id: "khandaq", group: "madinahSites", label: l("Seven Mosques (Al-Khandaq)", "المساجد السبعة (الخندق)"), lat: 24.47673, lng: 39.59602 },
  { id: "ghamama", group: "madinahSites", label: l("Masjid al-Ghamama", "مسجد الغمامة"), lat: 24.46581, lng: 39.60696 },
  { id: "baqi", group: "madinahSites", label: l("Al-Baqi Cemetery", "مقبرة البقيع"), lat: 24.4669, lng: 39.6164 },
  { id: "uhud", group: "madinahSites", label: l("Mount Uhud & the Martyrs' Cemetery", "جبل أحد ومقبرة الشهداء"), lat: 24.5, lng: 39.61 },
  { id: "badr", group: "madinahSites", label: l("Badr (full-day trip)", "بدر (رحلة يوم كامل)"), lat: 23.73333, lng: 38.76667 },
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

const CONTEXT_HUBS: readonly PlaceId[] = ["jed_airport", "makkah", "madinah", "med_airport"]

export const allHubStops = (): MapStop[] => CONTEXT_HUBS.map(hubStop)

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
