# Munawwara Web — Agent Rules

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS v4 with CSS variables from `src/lib/theme.ts`
- `next-intl` with default locale `ar` (RTL) and secondary `en` (LTR)
- Local typed content in `src/content/{ar,en}/` via accessor functions in `src/content/index.ts`
- Motion (Framer), GSAP + ScrollTrigger, Lenis, Anime.js for animation
- React Three Fiber + drei for Fleet 3D preview (lazy)
- React Bits components in `src/components/react-bits/`
- shadcn-style primitives in `src/components/ui/` (+ `components.json`)

## Hard rules
- Never hardcode user-facing strings in components — use `messages/*.json` for UI chrome and `content/` for page copy
- Never hardcode hex colors in components — use theme CSS variables / Tailwind tokens (`bg-orange`, `text-wordmark`, etc.)
- Use logical CSS (`ms-`, `me-`, `ps-`, `pe-`, `start`, `end`) — never physical `left`/`right` for layout that must flip
- Never invent company facts (CR numbers, licenses, Tourism services, named clients). Use `TODO(content):` comments and `ContentPlaceholder` instead
- Respect `prefers-reduced-motion` via `useReducedMotion`
- Above-the-fold CTAs must not be gated behind scroll-triggered animation

## Locales
- URL: `/ar/...` and `/en/...`; `/` redirects to `/ar`
- Set `dir` and `lang` on `<html>` from the locale layout
