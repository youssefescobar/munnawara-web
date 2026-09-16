"use client"

import busLoaderAnimation from "@/assets/lottie/bus-loader.json"
import ShinyText from "@/components/react-bits/ShinyText"
import { cn } from "@/lib/cn"
import lottie, { type AnimationItem } from "lottie-web"
import { useEffect, useRef } from "react"

type BusLoaderProps = {
  className?: string
  size?: number
  label?: string
}

export const BusLoader = ({
  className,
  size = 168,
  label = "Loading",
}: BusLoaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const animation: AnimationItem = lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: structuredClone(busLoaderAnimation),
      rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: true,
      },
    })

    animation.setSpeed(1)
    animation.play()

    return () => {
      animation.destroy()
    }
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("flex flex-col items-center justify-center gap-1", className)}
    >
      <div
        ref={containerRef}
        className="shrink-0"
        style={{ width: size, height: size }}
        aria-hidden
      />
      <ShinyText
        text={label}
        speed={2.4}
        delay={0.35}
        yoyo
        color="#d4d0d8"
        shineColor="#ffffff"
        className="font-label text-sm font-semibold tracking-wide"
      />
    </div>
  )
}
