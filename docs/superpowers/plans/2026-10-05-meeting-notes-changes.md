# Meeting Notes Changes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 15 meeting-note changes: quote wizard rework (items 1–7), loader/intro (8–9), fleet content (11–12), about page (13–14), plus items that need humans (10, 13-image, 14, 15, new Coaster photo).

**Architecture:** All work in `munnawara-web` (Next.js 15, next-intl `ar` RTL / `en` LTR, content in `src/content/{ar,en}`, wizard in `src/components/forms/`, loader in `src/components/landing/DamLanding.tsx` + `animations/config.ts`). Wizard collapses to one multi-leg route step modelled on airline multi-city search.

**Tech Stack:** Next 15, TypeScript, Tailwind v4, GSAP, next-intl. No test framework is installed (check `package.json`); verification = `npx tsc --noEmit`, `npm run lint`, `npm run build`, and visual check on `/ar/quote`, `/en/quote`, `/ar`, `/ar/fleet`, `/ar/about` (Chrome DevTools MCP per AGENTS.md).

**Spec:** the 15 meeting notes (pasted by user, 2026-10-05). No separate spec doc.

## Global Constraints

- No hardcoded user-facing strings in components: UI chrome → `src/messages/{ar,en}.json`; wizard copy → `quoteWizardConfig.ts` / `quoteWizardCopy.ts` (existing pattern, `l(en, ar)`).
- No hardcoded hex colors; use theme tokens (`src/lib/theme.ts`).
- Logical CSS only (`ms-`, `me-`, `start`, `end`), never `left/right`, so RTL flips for free.
- Respect `useReducedMotion`.
- Never invent company facts; use `TODO(content):`.
- Every wizard change must work in both locales.

## Review Focus

- Backend `tripType` enum: renaming/removing `individual` / `hajj_mission` in `formSchemas.ts` breaks submit if `dam-backend` still validates the old values (check `dam-backend/src` quote validator first).
- Legs: same `from` and `to` on one leg; leg N `date/time` earlier than leg N-1; zero legs; very many legs (cap at 6).
- RTL: From/To order and the "→" glyph must mirror; the chain arrow in review summary uses `←` in Arabic already.
- Loader: must still exit if assets stall (failsafe) and under `prefers-reduced-motion`.
- Removing Mini Bus / one City Bus: dangling references in `FleetCategoryId`, chat knowledge base, `busClassOptions`, sitemap/JSON-LD.

## Open questions (default chosen, flag to user)

| # | Ambiguity | Default in plan |
|---|-----------|-----------------|
| 1 | "remove personal option in quotes": the `individual` customer type ("Family or personal trip")? | Remove the `individual` option. |
| 2 | Hajj copy outside the quote options (FAQ `hajj-contract`, clients, companies, fleet blurb, about intro) | Only quote options + `hajj_mission` removed now. Rest listed in Task 2 Step 5 for user decision. |
| 3 | Step 3 "wizard only from/to": does it drop customer + service steps too? | Keep `customer`; `service` stays only for company sub-menu. Umrah kind / dawra / maqta' / charter route / ziyarat steps all replaced by one `route` step. |
| 11 | "model" in fleets | Interpreted as the year label (`yearLabel`, e.g. "2026"). |
| 12 | Which City Bus to remove | Keep `city-2025` (55+1), remove `city-2024`. |
| 12 | "coster" | Toyota Coaster-type midi bus. Needs a photo (human). |

---

### Task 1: Remove "individual" customer option (item 1)

**Files:** Modify `src/components/forms/quoteWizardConfig.ts:18-23`, `src/components/forms/formSchemas.ts:9,23`, `src/components/forms/QuoteChoiceIcons.tsx`; check `dam-backend/src` for the tripType validator.

- [ ] **Step 1:** `Grep "individual"` across `munnawara-web/src` and `dam-backend/src`. List every hit.
- [ ] **Step 2:** Delete the `individual` object from `customerOptions`. In `formSchemas.ts` remove `"individual"` from both enum lists (lines ~9 and ~23). Remove its icon case in `QuoteChoiceIcons.tsx`.
- [ ] **Step 3:** Backend: if the quote validator lists tripType values, keep `individual` there (old clients/emails) or confirm with user. Do not break submit.
- [ ] **Step 4:** Run `npx tsc --noEmit` → no errors. Open `/ar/quote`: step 1 shows 5 options.

### Task 2: Rename Hajj mission → "Umrah campaigns", drop Hajj options (item 2)

**Files:** Modify `quoteWizardConfig.ts:39-43,54-60`, `formSchemas.ts`, `QuoteChoiceIcons.tsx:52`.

- [ ] **Step 1:** Rename id `hajj_mission` → `umrah_campaigns` everywhere (config, `orgRequired`, schema enums, icon case). `rg hajj_mission` must return 0 hits after.
- [ ] **Step 2:** Label: `l("Umrah campaigns", "حملات عمرة")`. Hint: `l("Umrah campaign operators and offices", "مكاتب وحملات العمرة")`.
- [ ] **Step 3:** Backend: add `umrah_campaigns` to tripType validator; keep `hajj_mission` accepted for old rows (same caveat as Task 1).
- [ ] **Step 4:** `npx tsc --noEmit` → no errors.
- [ ] **Step 5 (user decision, do not auto-edit):** Hajj copy elsewhere: `content/*/faq.ts` (`hajj-contract`), `clients.ts` (`hajj-umrah-operators`), `companies.ts:8,15,55,59`, `fleet.ts` coach summary, `fleetPage.ts`, `about.ts:10`. Present the list; edit only what the user approves.

### Task 3: Route data model: legs (items 3, 5)

**Files:** Modify `quoteWizardTypes.ts`, `quoteWizardConfig.ts` (remove ziyarat + dawra/maktaa/charter exports no longer used), `quoteWizardLogic.ts`.

**Interfaces — Produces:**
```ts
export type Leg = { from: PlaceId | ""; to: PlaceId | ""; date: string; time: string }
export const MAX_LEGS = 6
// WizardState: replace umrahKind, dawraLength, mazarat, direction, from, to, arrival, departure,
// pickup, destination, stops, date, time, returnDate with:  legs: Leg[]   // initial: [emptyLeg()]
export const emptyLeg = (prev?: Leg): Leg => ({ from: prev?.to ?? "", to: "", date: "", time: "" })
// StepId: drop "umrahKind" | "dawraLength" | "dawraRoute" | "maktaaRoute" | "charterRoute" | "when"; add "route"
export function computeSteps(service: string): StepId[]  // customer, [service], route, passengers, vehicle, extras, contact, review
```

- [ ] **Step 1:** In `quoteWizardTypes.ts` add `Leg`, `MAX_LEGS`, `emptyLeg`; replace the listed fields with `legs`; set `initialState.legs = [emptyLeg()]`. Update `StepId`.
- [ ] **Step 2:** In `quoteWizardLogic.ts` rewrite `validateStep("route")`:
```ts
case "route":
  state.legs.forEach((leg, i) => {
    if (!leg.from) e[`from${i}`] = tx(COPY.errors.place)
    if (!leg.to) e[`to${i}`] = tx(COPY.errors.place)
    if (leg.from && leg.from === leg.to) e[`to${i}`] = tx(COPY.errors.samePlace)
    if (!leg.date) e[`date${i}`] = tx(COPY.errors.date)
    if (!leg.time) e[`time${i}`] = tx(COPY.errors.time)
    const prev = state.legs[i - 1]
    if (prev?.date && leg.date && `${leg.date}T${leg.time || "00:00"}` < `${prev.date}T${prev.time || "00:00"}`)
      e[`date${i}`] = tx(COPY.errors.returnBefore)
  })
  break
```
- [ ] **Step 3:** Rewrite `getRouteParts`: pickup = first leg `from`, destination = last leg `to`, stops = intermediate `to` labels joined (`←` in ar, `→` in en). Rewrite `getFinalStops`/`getMapView` to `buildTransferStops([legs[0].from, ...legs.map(l=>l.to)])` (filter empty). Remove `buildDawraStops`, `ziyaratOptions`, `defaultZiyarat`, `getServiceType` dawra/maktaa branches (service type → `route_${legs.length}` or keep `charter`/`company_*`; match what backend accepts).
- [ ] **Step 4:** Rewrite `buildQuotePayload` date/time: `date = legs[0].date`, `departureTime = legs[0].time`, `returnDate = legs.length > 1 ? last.date : ""`, and put the full itinerary in `specialRequirements` prefix (backend has no legs field; confirm with user whether to extend `dam-backend` schema).
- [ ] **Step 5:** `buildSummaryRows`: one "route" row per leg: `from → to · date time`. Drop `when` row.
- [ ] **Step 6:** `npx tsc --noEmit` → expect errors only in `QuoteWizardSteps.tsx` / `QuoteWizard.tsx` (fixed in Tasks 4–6).

### Task 4: Route step UI: From/To dropdowns, RTL order, add button (items 3, 4, 5)

**Files:** Modify `QuoteWizardSteps.tsx` (replace cases `umrahKind`, `dawraLength`, `dawraRoute`, `maktaaRoute`, `charterRoute`, `when` with `route`), `quoteWizardUi.tsx` / `QuoteFields.tsx` (existing `PlaceSelect`), `quoteWizardCopy.ts` (add `addLeg`, `removeLeg`, `leg`), `src/messages/*.json` not needed (wizard copy lives in `quoteWizardCopy.ts`).

- [ ] **Step 1:** Extend `places` in `quoteWizardConfig.ts` to a grouped list for the "extensive dropdown": add `group: "airports" | "cities" | "holy"` per place. Candidates already in repo: JED, MED, Makkah, Madinah. Add Yanbu, Taif, Jeddah city, Riyadh etc. only with user-approved list (coordinates: use OSM-verified values as the existing file does).
- [ ] **Step 2:** Make `PlaceSelect` a grouped, keyboard-navigable listbox (native `<select>` with `<optgroup>` is the lazy, accessible, RTL-correct choice; use it unless user wants a searchable combobox). Props: `{ id, value, options, locale, placeholder, error, onChange }` (unchanged signature).
- [ ] **Step 3:** `route` case: map `state.legs` to a row:
```tsx
<div className="grid gap-3.5 @lg:grid-cols-4">  {/* DOM order From, To, Date, Time */}
  <Field label={tx(COPY.fields.from)}><PlaceSelect value={leg.from} .../></Field>
  <Field label={tx(COPY.fields.to)}><PlaceSelect value={leg.to} .../></Field>
  <Field label={tx(COPY.fields.date)}><DatePicker min={i ? state.legs[i-1].date : todayISO} .../></Field>
  <Field label={tx(COPY.fields.time)}><TimePicker .../></Field>
</div>
```
  RTL: because the grid is in DOM order under `dir="rtl"` on `<html>`, From renders on the right, To on the left, and flips in English with no extra code. Do not add `flex-row-reverse`.
- [ ] **Step 4:** Add button under the rows: `disabled` at `MAX_LEGS`. Handler: `patch({ legs: [...state.legs, emptyLeg(state.legs.at(-1))] })` (`emptyLeg` pre-fills `from` = previous `to`). Add a remove (×) button on legs index ≥ 1: `patch({ legs: state.legs.filter((_, j) => j !== i) })`. When a leg's `to` changes, also update the next leg's `from` if it still equals the old `to`.
- [ ] **Step 5:** Reuse existing date/time controls found in the old `when` case (`QuoteFields.tsx` calendar at ~378); do not write new pickers.
- [ ] **Step 6:** `npx tsc --noEmit` → pass. Visual: `/ar/quote` and `/en/quote`, add 3 legs, confirm From right / To left in Arabic, mirrored in English; confirm leg 2 `from` auto-fills.

### Task 5: Map / Mazarat removal (item 6)

**Files:** Modify `QuoteMap.tsx`, `QuoteWizard.tsx`, `quoteWizardLogic.ts`, `quoteWizardCopy.ts`.

- [ ] **Step 1:** Delete `ziyaratTitle`, mazarat buttons, `pinIcon("ziyarat")` branch, `kind: "ziyarat"` from `MapStop`. `rg -i "ziyarat|mazarat"` in `src` → 0 hits.
- [ ] **Step 2:** `QuoteMap` now draws `getMapView` stops for the legs chain. Verify it still renders with 0 stops (context hubs only).
- [ ] **Step 3:** `npx tsc --noEmit && npm run lint` → pass.

### Task 6: Extras step = free-text only (item 7)

**Files:** Modify `QuoteWizardSteps.tsx:391-423`, `quoteWizardConfig.ts` (`extraOptions`), `quoteWizardTypes.ts` (`extras`), `quoteWizardLogic.ts` (payload spread, summary), `quoteWizardCopy.ts`.

- [ ] **Step 1:** In the `extras` case delete the checkbox grid; keep only the `notes` textarea. Label: `l("Anything else we should know?", "هل هناك أي شيء آخر نحتاج أن نعرفه؟")` (set via `COPY.fields.notes`).
- [ ] **Step 2:** Remove `extraOptions`, `ExtraId`, `state.extras` and the `...state.extras` payload spread. The backend booleans (`needsSupervisors` etc.) default false; confirm in `dam-backend` they are optional.
- [ ] **Step 3:** `npx tsc --noEmit` → pass. Submit one quote end to end against local backend; check it arrives.

### Task 7: Loader: 5 s minimum, bigger Arabic type, DMTC (items 8, 9)

**Files:** Modify `src/components/landing/animations/config.ts:5` , `src/styles/dam-landing.css:1588-1650`, `DamLanding.tsx` (brandWords copy, ~line 988), LogoMark sizing.

- [ ] **Step 1:** `config.ts`: `minimumMs: 2400` → `5000`. The wait is already `max(minimumMs - elapsed)` after `waitForPageAssets`, so slow assets extend it automatically (matches "5 s or more if loading"). Check `ASSET_FAILSAFE_MS` is ≥ 5000 and the `setTimeout(... ASSET_FAILSAFE_MS + minimumMs + 4000)` safety still holds.
- [ ] **Step 2:** "logo and words tighter should last 5 s": extend `breatheDuration` (2.2) / hold so petals + words are visible and settled for the remainder; e.g. raise `assembleDuration` to ~2.2 and let breathe loop `repeat:-1` until exit. Verify by timing in DevTools Performance: overlay visible ≥ 5000 ms.
- [ ] **Step 3:** Arabic sizing: in `dam-landing.css` raise font-size of `.loader-status--ar` and `.loader-brand--ar` (≈ +30–40%, use `clamp()`), and enlarge the loader `LogoMark` in the `locale === "ar"` branch. Check 360 px and 1440 px widths.
- [ ] **Step 4:** DMTC: add `"DMTC"` to `copy.brandWords` for both locales (find `brandWords` definition in `DamLanding.tsx`, or `messages/*.json`; `siteNameEn` is already `DMTC`). Render as latin text in the Arabic loader (`lang="en" dir="ltr"` span).
- [ ] **Step 5:** Reduced-motion: run with `prefers-reduced-motion: reduce` emulation → loader still exits.
- [ ] **Step 6:** `npm run build` → pass.

### Task 8: Fleet: remove year/model everywhere (item 11)

**Files:** Modify `content/types.ts:32`, `content/{ar,en}/fleet.ts`, `components/fleet/FleetBusFlipCard.tsx:87,108`, `FleetShowcase.tsx:34`, `app/[locale]/fleet/page.tsx:42`; grep chat KB + `lib/schema.ts` for `yearLabel`.

- [ ] **Step 1:** Remove `yearLabel` from `FleetCategory`, both content files, and the four render sites. Subtitle becomes `${tCommon("seats")}: ${bus.seatsLabel}`; names stay.
- [ ] **Step 2:** `rg yearLabel` → 0 hits. Names like "City Bus" now duplicate if two remain, which Task 9 fixes.
- [ ] **Step 3:** `npx tsc --noEmit` → pass.

### Task 9: Fleet categories (item 12)

**Files:** Modify `content/types.ts` (`FleetCategoryId`), `content/{ar,en}/fleet.ts`, `public/fleet/…`, `quoteWizardConfig.ts:267-277` (`busClassOptions`).

- [ ] **Step 1:** Delete the `mini-2025-2026` entry (both locales), its id from `FleetCategoryId`, and `public/fleet/mini-2025-2026/`. Delete the TODO note about سيتي باص.
- [ ] **Step 2:** Delete `city-2024` entry + id + folder (keep `city-2025`; see open question).
- [ ] **Step 3:** Rename `labour-2024`: EN name "Bus Nakl Amal" is transliteration; use display `Workers Transport Bus` / AR `حافلة نقل عمال` (confirm with user which EN wording). Update `busClassOptions` `employee` label to match.
- [ ] **Step 4:** Add `coaster` entry (EN "Coaster", AR "كوستر"): id `coaster-2026`, `seatsLabel` TODO(content) (do not invent), amenities from client, `coverImage: "/fleet/coaster/cover.webp"`. Add to `FleetCategoryId`, optionally `busClassOptions`. Until a photo exists use a clearly temporary placeholder and mark HUMAN TODO below.
- [ ] **Step 5:** `rg -i "mini|labour|city-2024"` across `src` and `dam-backend` KB; fix dangling refs. `npm run build` → pass; `/ar/fleet` carousel shows 5 buses.

### Task 10: About page images (item 13, code part)

**Files:** Modify `components/about/AboutFilm.tsx:22-36` (`FLEET_FRAMES`, `DETAIL_FRAMES`), `content/*/about.ts` details.

- [ ] **Step 1:** Remove the extra diesel-truck and truck frames (they are the `/photos/exterior/…` frames the user identifies on screen; confirm which on `/ar/about`). Keep the workshop and small-bus frames.
- [ ] **Step 2:** Add the new big hero picture path (e.g. `/about/hero-ai.webp`) to the top frame once the human delivers it. Until then, leave current image and do not ship a broken `src`.
- [ ] **Step 3:** Check no layout gaps (`--af-ratio` frames) at 360 / 768 / 1440 px.

---

## TODO BY HUMAN (out of scope for code)

- [ ] **Item 10 — Hero:** new hero direction (Abdullah dislikes the white). User said they will do it later as last step. Needs a design decision (color/background) before code. Touchpoints when ready: `src/styles/dam-landing.css` (`--landing-elevated`, `.hero-video`, line ~93/420), `public/hero/backvid.mp4`, `public/hero/cover.png`, `public/brand/landing-sky.jpg`.
- [ ] **Item 13 — AI images:** produce the big About picture and the AI remake of the workshop + small bus. Drop final files in `public/about/` and tell me the filenames.
- [ ] **Item 14 — About video:** "perfect the video" is editing/color/cut work on `public/about/film.mp4` + `film-poster.jpg`. Human edits; I can then swap files and tune `AboutVideo.tsx` (poster, aspect) if needed.
- [ ] **Item 15 — Fleet images:** re-edit all fleet photos as a set (consistent crop, background, lighting). Deliver webp per `public/fleet/<id>/cover.webp` (+ exterior/interior for premium VIP).
- [ ] **Item 12 — Coaster photo + specs:** photo, seat count, amenities.
- [ ] **Decisions:** answers to the Open Questions table above; approved list of From/To locations for the dropdown (Task 4 Step 1); whether backend schema may change for multi-leg trips.

## Self-Review

- Spec coverage: 1→T1, 2→T2, 3→T3/4, 4→T4, 5→T3/4, 6→T5, 7→T6, 8–9→T7, 10→human, 11→T8, 12→T9, 13→T10+human, 14→human, 15→human.
- No test framework in repo: steps use tsc / lint / build / visual checks instead of unit tests; if user wants tests for `validateStep("route")` and `emptyLeg`, add vitest in a separate task.
- Types consistent: `Leg`, `emptyLeg`, `MAX_LEGS`, step id `"route"` used identically in Tasks 3–6.
