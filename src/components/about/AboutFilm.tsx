"use client"

import type { AboutFilmContent } from "@/content/types"
import { AboutVideo } from "@/components/about/AboutVideo"
import { LogoMark } from "@/components/landing/LogoMark"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { Link } from "@/i18n/navigation"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import { useLayoutEffect, useRef, type CSSProperties } from "react"
import "@/styles/about-film.css"

gsap.registerPlugin(ScrollTrigger)

type AboutFilmProps = {
  film: AboutFilmContent
  pageTitle: string
}

/** Art-directed frames: ratio = intrinsic width / height so buses are never cropped. */
const FLEET_FRAMES = [
  { src: "/photos/exterior/7725.webp", ratio: 16 / 9 },
  { src: "/photos/exterior/0436.webp", ratio: 3 / 2 },
  { src: "/photos/exterior/0417.webp", ratio: 3 / 2 },
] as const

const DETAIL_FRAMES = [
  { src: "/about/placeholders/airport.jpg", ratio: 3 / 2 },
  { src: "/about/placeholders/holy-sites.jpg", ratio: 4 / 5 },
  { src: "/photos/exterior/7727.webp", ratio: 16 / 9 },
  { src: "/about/placeholders/events.jpg", ratio: 3 / 2 },
] as const

const GALLERY_SIZES = "(max-width: 767px) 80vw, 50vw"

const frameStyle = (ratio: number) =>
  ({ "--af-ratio": ratio }) as CSSProperties

export const AboutFilm = ({ film, pageTitle }: AboutFilmProps) => {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
          shortViewport: "(max-height: 460px)",
        },
        (context) => {
          const { isDesktop, reduceMotion, shortViewport } = context.conditions ?? {}
          if (reduceMotion || shortViewport) return

          const scrub = isDesktop ? 0.8 : 0.65
          const depth = isDesktop ? 1 : 0.45

          /* —— Scene 01: Journey —— */
          const journey = root.querySelector<HTMLElement>("[data-af-journey]")
          if (journey) {
            const content = journey.querySelector(".about-film__content")
            const sky = journey.querySelector("[data-af-journey-sky]")

            // First viewport stays readable — motion only evolves on scroll.
            gsap.set(content, { y: 0 })
            gsap.set(sky, { scale: 1.08, yPercent: -2 })

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: journey,
                start: "top top",
                end: "bottom bottom",
                scrub,
                invalidateOnRefresh: true,
              },
            })

            tl.to(sky, { scale: 1.02, yPercent: 0, duration: 1 }, 0)
              .to(content, { y: -16 * depth, duration: 0.4 }, 0.45)
          }

          /* —— Scene 02: World —— */
          const world = root.querySelector<HTMLElement>("[data-af-world]")
          if (world) {
            const media = world.querySelector("[data-af-world-media]")
            const copy = world.querySelector("[data-af-world-copy]")
            const title = world.querySelector("[data-af-world-title]")
            const body = world.querySelector("[data-af-world-body]")

            gsap.set(media, { scale: 1.06, opacity: 0.85 })
            gsap.set([title, body].filter(Boolean), { opacity: 0, y: 36 })

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: world,
                start: "top top",
                end: "bottom bottom",
                scrub,
              },
            })

            tl.to(media, { scale: 1, opacity: 1, duration: 0.45 }, 0)
              .to(title, { opacity: 1, y: 0, duration: 0.2 }, 0.18)
              .to(body, { opacity: 1, y: 0, duration: 0.18 }, 0.28)
              // Keep copy centered — no upward drift off the middle.
              .to(copy, { y: 0, duration: 0.35 }, 0.55)
              .to(media, { scale: 1.03, duration: 0.3 }, 0.72)
          }

          /* —— Scene 03: Problem —— */
          const problem = root.querySelector<HTMLElement>("[data-af-problem]")
          if (problem) {
            const head = problem.querySelector("[data-af-problem-head]")
            const lines = gsap.utils.toArray<HTMLElement>("[data-af-problem-line]", problem)

            gsap.set(head, { opacity: 0, y: 24 })
            gsap.set(lines, { opacity: 0, y: 24 })

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: problem,
                start: "top top",
                end: "bottom bottom",
                scrub,
              },
            })

            // Headline, then questions stack in — short hold, then release.
            tl.to(head, { opacity: 1, y: 0, duration: 0.1 }, 0)
              .to(head, { opacity: 0, y: -20, duration: 0.08 }, 0.22)
              .to(
                lines,
                { opacity: 1, y: 0, duration: 0.12, stagger: 0.05 },
                0.28,
              )
              .to({}, { duration: 0.12 })
          }

          /* —— Scene 04: Connection —— */
          const connection = root.querySelector<HTMLElement>("[data-af-connection]")
          if (connection) {
            const nodes = gsap.utils.toArray<HTMLElement>("[data-af-node]", connection)
            const field = connection.querySelector<HTMLElement>(".about-film__nodes")
            const title = connection.querySelector("[data-af-connection-title]")
            const body = connection.querySelector("[data-af-connection-body]")
            const companies = gsap.utils.toArray<HTMLElement>(
              "[data-af-company]",
              connection,
            )

            gsap.set(nodes, { opacity: 0, scale: 0.9 })
            gsap.set([title, body].filter(Boolean), { opacity: 0, y: 28 })
            gsap.set(companies, { opacity: 0, y: 24 })

            const positions = [
              [-0.38, -0.3], [0.34, -0.25], [-0.3, 0.28],
              [0.38, 0.32], [-0.08, -0.4], [0.06, 0.4],
            ]

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: connection,
                start: "top top",
                end: "bottom bottom",
                scrub,
                invalidateOnRefresh: true,
              },
            })

            tl.fromTo(
                nodes,
                {
                  x: (index) => positions[index][0] * (field?.clientWidth ?? 0),
                  y: (index) => positions[index][1] * (field?.clientHeight ?? 0),
                },
                {
                  x: (index) => Math.cos(index * Math.PI / 3) * 32,
                  y: (index) => Math.sin(index * Math.PI / 3) * 32,
                  duration: 0.38,
                  ease: "power2.inOut",
                },
                0.1,
              )
              .to(nodes, { opacity: 1, scale: 1, duration: 0.1, stagger: 0.01 }, 0)
              .to(nodes, { opacity: 0, scale: 0.9, duration: 0.12 }, 0.5)
              .to(title, { opacity: 1, y: 0, duration: 0.14 }, 0.62)
              .to(body, { opacity: 1, y: 0, duration: 0.14 }, 0.68)
              .to(companies, { opacity: 1, y: 0, duration: 0.16, stagger: 0.03 }, 0.74)
          }

          root.querySelectorAll<HTMLElement>("[data-af-gallery]").forEach((scene) => {
            const track = scene.querySelector<HTMLElement>("[data-af-track]")
            if (!track) return
            const direction = getComputedStyle(scene).direction === "rtl" ? 1 : -1

            gsap.timeline({
              scrollTrigger: {
                trigger: scene,
                start: "top top",
                end: "bottom bottom",
                scrub,
                invalidateOnRefresh: true,
              },
            })
              .fromTo(track, { x: 0 }, {
                x: () => direction * Math.max(0, track.scrollWidth - track.clientWidth),
                ease: "none",
                duration: 0.8,
              }, 0.1)
              .to({}, { duration: 0.1 })
          })

          /* —— Scene 08: Human —— */
          const human = root.querySelector<HTMLElement>("[data-af-human]")
          if (human) {
            const line1 = human.querySelector("[data-af-human-1]")
            const line2 = human.querySelector("[data-af-human-2]")
            gsap.set([line1, line2].filter(Boolean), { opacity: 0, y: 20 })

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: human,
                start: "top 70%",
                end: "center center",
                scrub: scrub * 0.8,
              },
            })

            tl.to(line1, { opacity: 1, y: 0, duration: 0.4 }, 0).to(
              line2,
              { opacity: 1, y: 0, duration: 0.35 },
              0.35,
            )
          }

          /* —— Final CTA —— */
          const cta = root.querySelector<HTMLElement>("[data-af-cta]")
          if (cta) {
            const parts = cta.querySelectorAll("[data-af-cta-reveal]")
            gsap.set(parts, { opacity: 0, y: 24 })
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: cta,
                  start: "top 70%",
                  end: "center center",
                  scrub: scrub * 0.7,
                },
              })
              .to(parts, { opacity: 1, y: 0, duration: 0.4, stagger: 0.12 }, 0)
          }
        },
      )

      // Lenis / late layout: refresh so pin distances match the real page.
      const refreshFrame = requestAnimationFrame(() => {
        ScrollTrigger.refresh()
      })

      return () => {
        cancelAnimationFrame(refreshFrame)
        mm.revert()
      }
    }, root)

    return () => ctx.revert()
  }, [reduced, film])

  return (
    <article
      ref={rootRef}
      className="about-film"
      aria-label={pageTitle}
      data-about-film
    >
      {/* 01 — Journey */}
      <section className="about-film__scene about-film__pin" data-af-journey>
        <div className="about-film__sticky">
          <div className="about-film__sky" aria-hidden>
            <Image
              data-af-journey-sky
              src="/hero/landing-sky.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="about-film__veil" aria-hidden />
          <div className="about-film__content">
            <LogoMark
              data-af-journey-logo
              title={film.brandName}
              idPrefix="about-journey"
              className="about-film__logo"
            />
            <h1
              data-af-journey-headline
              className="about-film__display about-film__display--xl"
            >
              {film.brandName.replace(/-/g, "‑")}
            </h1>
            <p className="about-film__lead">{film.journeyHeadline}</p>
            <p data-af-journey-support className="about-film__body">
              {film.journeySupport}
            </p>
            <Link href={film.ctaHref} className="about-film__cta-btn">
              {film.ctaLabel}
              <ArrowUpRight aria-hidden className="about-film__cta-arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 02 — World */}
      <section className="about-film__scene about-film__pin" data-af-world>
        <div className="about-film__sticky about-film__sticky--sky">
          <div className="about-film__sky" aria-hidden>
            <Image
              data-af-world-media
              src="/photos/exterior/0427.webp"
              alt=""
              fill
              sizes="100vw"
              className="about-film__sky-photo object-cover"
            />
          </div>
          <div className="about-film__veil about-film__veil--sky" aria-hidden />
          <div className="about-film__content" data-af-world-copy>
            <h2
              data-af-world-title
              className="about-film__display about-film__display--lg"
            >
              {film.worldHeadline}
            </h2>
            <p data-af-world-body className="about-film__body">
              {film.worldBody}
            </p>
          </div>
        </div>
      </section>

      {/* 03 — Problem */}
      <section
        className="about-film__scene about-film__pin about-film__pin--problem"
        data-af-problem
      >
        <div className="about-film__sticky bg-surface">
          <div className="about-film__stage about-film__stage--problem">
            <h2
              data-af-problem-head
              className="about-film__display about-film__display--lg"
            >
              {film.problemHeadline}
            </h2>
            <div className="about-film__problem-stack">
              {film.problemLines.map((line) => (
                <p
                  key={line}
                  data-af-problem-line
                  className="about-film__problem-line about-film__display"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04 — Connection */}
      <section
        className="about-film__scene about-film__pin about-film__pin--tall"
        data-af-connection
      >
        <div className="about-film__sticky bg-surface-muted">
          <div className="about-film__stage">
            <div className="about-film__nodes" aria-hidden>
              {Array.from({ length: 6 }, (_, index) => (
                <span key={index} data-af-node className="about-film__node" />
              ))}
            </div>
            <div className="about-film__content">
              <h2
                data-af-connection-title
                className="about-film__display about-film__display--lg"
              >
                {film.connectionHeadline}
              </h2>
              <p data-af-connection-body className="about-film__body">
                {film.connectionBody}
              </p>
              <div className="about-film__company-row">
                {film.companies.map((company) => (
                  <div
                    key={company.id}
                    data-af-company
                    className="about-film__company"
                  >
                    <Image
                      src={company.logo}
                      alt=""
                      width={120}
                      height={120}
                      className="rounded-xl"
                    />
                    <span>{company.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 — Fleet */}
      <section
        className="about-film__scene about-film__pin about-film__pin--gallery"
        data-af-fleet
        data-af-gallery
      >
        <div className="about-film__sticky bg-surface">
          <div className="about-film__stage about-film__stage--gallery">
            <div className="about-film__content">
              <h2
                data-af-fleet-title
                className="about-film__display about-film__display--md"
              >
                {film.fleetHeadline}
              </h2>
              <p data-af-fleet-body className="about-film__body">
                {film.fleetBody}
              </p>
            </div>
            <div className="about-film__gallery-window">
              <div data-af-track className="about-film__gallery-track">
                {FLEET_FRAMES.map((frame) => (
                  <figure
                    key={frame.src}
                    className="about-film__gallery-item"
                    style={frameStyle(frame.ratio)}
                  >
                    <div className="about-film__gallery-image">
                      <Image
                        src={frame.src}
                        alt=""
                        fill
                        sizes={GALLERY_SIZES}
                        className="object-cover"
                      />
                    </div>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — Two sides */}
      <section className="about-film__scene about-film__sides-band" data-af-sides>
        <div className="about-film__sides-content">
          <div className="about-film__content">
            <div className="about-film__split">
              <div data-af-side-left className="about-film__side">
                <Image
                  src="/brand/company-umrah.png"
                  alt=""
                  width={140}
                  height={140}
                  className="about-film__side-mark"
                />
                <p className="about-film__side-title">{film.sidesLeft}</p>
              </div>
              <div data-af-side-right className="about-film__side">
                <Image
                  src="/brand/company-group.png"
                  alt=""
                  width={140}
                  height={140}
                  className="about-film__side-mark"
                />
                <p className="about-film__side-title">{film.sidesRight}</p>
              </div>
            </div>
            <p data-af-sides-merge className="about-film__merge about-film__display">
              {film.sidesMerge}
            </p>
          </div>
        </div>
      </section>

      {/* 07 — Details */}
      <section
        className="about-film__scene about-film__pin about-film__pin--gallery"
        data-af-details
        data-af-gallery
      >
        <div className="about-film__sticky bg-surface">
          <div className="about-film__stage about-film__stage--gallery">
            <h2
              data-af-details-head
              className="about-film__display about-film__display--md text-center"
            >
              {film.detailsHeadline}
            </h2>
            <div className="about-film__gallery-window">
              <div data-af-track className="about-film__gallery-track">
                {film.details.map((detail, index) => (
                  <figure
                    key={detail.id}
                    className="about-film__gallery-item"
                    style={frameStyle(DETAIL_FRAMES[index].ratio)}
                  >
                    <div className="about-film__gallery-image">
                      <Image
                        src={DETAIL_FRAMES[index].src}
                        alt=""
                        fill
                        sizes={GALLERY_SIZES}
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="about-film__gallery-caption">{detail.line}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <p className="about-film__image-note">{film.detailsImageNote}</p>
          </div>
        </div>
      </section>

      {/* 08 — Human */}
      <section className="about-film__breath" data-af-human>
        <div className="mx-auto grid max-w-xl gap-6">
          <p
            data-af-human-1
            className="about-film__display about-film__display--md text-ink-muted"
          >
            {film.humanLine1}
          </p>
          <p data-af-human-2 className="about-film__display about-film__display--lg">
            {film.humanLine2}
          </p>
        </div>
      </section>

      <AboutVideo headline={film.videoHeadline} label={film.videoLabel} />

      {/* Final CTA */}
      <section className="about-film__cta" data-af-cta>
        <div className="mx-auto grid max-w-2xl justify-items-center gap-3">
          <LogoMark
            data-af-cta-reveal
            title={film.brandName}
            idPrefix="about-cta"
            className="about-film__logo mb-4"
          />
          <h2
            data-af-cta-reveal
            className="about-film__display about-film__display--lg whitespace-pre-line"
          >
            {film.ctaHeadline}
          </h2>
          <p data-af-cta-reveal className="about-film__body">
            {film.ctaBody}
          </p>
          <Link
            href={film.ctaHref}
            className="about-film__cta-btn"
          >
            {film.ctaLabel}
            <ArrowUpRight aria-hidden className="about-film__cta-arrow" size={18} />
          </Link>
        </div>
      </section>
    </article>
  )
}
