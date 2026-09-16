"use client"

import { cn } from "@/lib/cn"
import {
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react"

type GlareHoverProps = {
  children?: ReactNode
  glareColor?: string
  glareOpacity?: number
  glareAngle?: number
  glareSize?: number
  transitionDuration?: number
  playOnce?: boolean
  className?: string
  style?: CSSProperties
}

const GlareHover = ({
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.35,
  glareAngle = -45,
  glareSize = 220,
  transitionDuration = 650,
  playOnce = false,
  className = "",
  style = {},
}: GlareHoverProps) => {
  const hex = glareColor.replace("#", "")
  let rgba = glareColor
  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`
  }

  const overlayRef = useRef<HTMLDivElement>(null)

  const animateIn = () => {
    const el = overlayRef.current
    if (!el) return
    el.style.transition = "none"
    el.style.backgroundPosition = "-100% -100%, 0 0"
    // force reflow
    void el.offsetWidth
    el.style.transition = `${transitionDuration}ms ease`
    el.style.backgroundPosition = "100% 100%, 0 0"
  }

  const animateOut = () => {
    const el = overlayRef.current
    if (!el) return
    if (playOnce) {
      el.style.transition = "none"
      el.style.backgroundPosition = "-100% -100%, 0 0"
    } else {
      el.style.transition = `${transitionDuration}ms ease`
      el.style.backgroundPosition = "-100% -100%, 0 0"
    }
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={style}
      onMouseEnter={animateIn}
      onMouseLeave={animateOut}
    >
      <div
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: `linear-gradient(${glareAngle}deg,
            hsla(0,0%,0%,0) 60%,
            ${rgba} 70%,
            hsla(0,0%,0%,0) 100%)`,
          backgroundSize: `${glareSize}% ${glareSize}%, 100% 100%`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "-100% -100%, 0 0",
        }}
      />
      <div className="relative z-0">{children}</div>
    </div>
  )
}

export default GlareHover
