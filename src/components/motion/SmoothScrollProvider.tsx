"use client"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import { useEffect } from "react"

gsap.registerPlugin(ScrollTrigger)

export const SmoothScrollProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({
      // Lower lerp = more glide / inertia (Airvoir-like)
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
      autoRaf: false,
    })

    lenis.on("scroll", ScrollTrigger.update)

    const handleTick = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(handleTick)
    gsap.ticker.lagSmoothing(0)

    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      gsap.ticker.remove(handleTick)
      lenis.destroy()
    }
  }, [reduced])

  return <>{children}</>
}
