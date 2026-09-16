"use client"

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Key,
  type ReactNode,
} from "react"

export type LogoItem =
  | {
      node: ReactNode
      href?: string
      title?: string
      ariaLabel?: string
    }
  | {
      src: string
      alt?: string
      href?: string
      title?: string
      width?: number
      height?: number
    }

type LogoLoopProps = {
  logos: LogoItem[]
  speed?: number
  direction?: "left" | "right"
  width?: number | string
  logoHeight?: number
  gap?: number
  pauseOnHover?: boolean
  fadeOut?: boolean
  fadeOutColor?: string
  ariaLabel?: string
  className?: string
  style?: CSSProperties
}

const MIN_COPIES = 2
const COPY_HEADROOM = 2

const toCssLength = (value?: number | string) =>
  typeof value === "number" ? `${value}px` : value

const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 80,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 16,
  pauseOnHover = true,
  fadeOut = true,
  fadeOutColor = "#faf7f4",
  ariaLabel = "Partner logos",
  className = "",
  style,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const seqRef = useRef<HTMLUListElement>(null)
  const [seqWidth, setSeqWidth] = useState(0)
  const [copyCount, setCopyCount] = useState(MIN_COPIES)
  const [isHovered, setIsHovered] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTimestampRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
  const velocityRef = useRef(0)

  const targetVelocity = useMemo(() => {
    const magnitude = Math.abs(speed)
    const directionMultiplier = direction === "left" ? 1 : -1
    return magnitude * directionMultiplier
  }, [speed, direction])

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0
    const sequenceWidth = seqRef.current?.getBoundingClientRect().width ?? 0
    if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth))
      const copiesNeeded =
        Math.ceil(containerWidth / sequenceWidth) + COPY_HEADROOM
      setCopyCount(Math.max(MIN_COPIES, copiesNeeded))
    }
  }, [])

  useEffect(() => {
    updateDimensions()
    if (!window.ResizeObserver) {
      window.addEventListener("resize", updateDimensions)
      return () => window.removeEventListener("resize", updateDimensions)
    }
    const observer = new ResizeObserver(updateDimensions)
    if (containerRef.current) observer.observe(containerRef.current)
    if (seqRef.current) observer.observe(seqRef.current)
    return () => observer.disconnect()
  }, [updateDimensions, logos, gap, logoHeight])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (prefersReduced || seqWidth <= 0) {
      track.style.transform = "translate3d(0, 0, 0)"
      return
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp
      }
      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000
      lastTimestampRef.current = timestamp

      const target = isHovered && pauseOnHover ? 0 : targetVelocity
      const easingFactor = 1 - Math.exp(-deltaTime / 0.25)
      velocityRef.current += (target - velocityRef.current) * easingFactor

      let nextOffset = offsetRef.current + velocityRef.current * deltaTime
      nextOffset = ((nextOffset % seqWidth) + seqWidth) % seqWidth
      offsetRef.current = nextOffset
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      lastTimestampRef.current = null
    }
  }, [targetVelocity, seqWidth, isHovered, pauseOnHover])

  const renderLogoItem = useCallback((item: LogoItem, key: Key) => {
    const isNodeItem = "node" in item
    const content = isNodeItem ? (
      <span className="inline-flex items-center">{item.node}</span>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="block h-[var(--logoloop-logoHeight)] w-auto object-contain"
        src={item.src}
        width={item.width}
        height={item.height}
        alt={item.alt ?? ""}
        title={item.title}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    )

    const itemAriaLabel = isNodeItem
      ? (item.ariaLabel ?? item.title)
      : (item.alt ?? item.title)

    const inner = item.href ? (
      <a
        className="inline-flex items-center rounded no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-offset-2"
        href={item.href}
        aria-label={itemAriaLabel || "logo link"}
        target="_blank"
        rel="noreferrer noopener"
      >
        {content}
      </a>
    ) : (
      content
    )

    return (
      <li
        className="mr-[var(--logoloop-gap)] flex-none leading-none"
        key={key}
        role="listitem"
      >
        {inner}
      </li>
    )
  }, [])

  const logoLists = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIndex) => (
        <ul
          className="flex items-center"
          key={`copy-${copyIndex}`}
          role="list"
          aria-hidden={copyIndex > 0}
          ref={copyIndex === 0 ? seqRef : undefined}
        >
          {logos.map((item, itemIndex) =>
            renderLogoItem(item, `${copyIndex}-${itemIndex}`),
          )}
        </ul>
      )),
    [copyCount, logos, renderLogoItem],
  )

  return (
    <div
      ref={containerRef}
      className={`relative overflow-x-hidden ${className}`}
      style={
        {
          width: toCssLength(width) ?? "100%",
          "--logoloop-gap": `${gap}px`,
          "--logoloop-logoHeight": `${logoHeight}px`,
          ...style,
        } as CSSProperties
      }
      role="region"
      aria-label={ariaLabel}
    >
      {fadeOut ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[clamp(24px,8%,120px)]"
            style={{
              background: `linear-gradient(to right, ${fadeOutColor} 0%, transparent 100%)`,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[clamp(24px,8%,120px)]"
            style={{
              background: `linear-gradient(to left, ${fadeOutColor} 0%, transparent 100%)`,
            }}
          />
        </>
      ) : null}

      <div
        className="relative z-0 flex w-max will-change-transform select-none"
        ref={trackRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {logoLists}
      </div>
    </div>
  )
})

LogoLoop.displayName = "LogoLoop"

export default LogoLoop
