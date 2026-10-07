"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { animationConfig as motion } from "./animations/config"

export type HeroVideoHandle = {
  container: HTMLDivElement | null
  playOnce: () => void
  /** Skip playback and hold the settled end frame (return visits). */
  showFinalFrame: () => void
}

type HeroVideoProps = {
  reducedMotion: boolean
}

const VIDEO_SRC = "/hero/hero-new.mp4"

export const HeroVideo = forwardRef<HeroVideoHandle, HeroVideoProps>(
  function HeroVideo({ reducedMotion }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const startedRef = useRef(false)
    const finishedRef = useRef(false)
    const preferFinalFrameRef = useRef(false)
    const playPendingRef = useRef(false)
    const [ready, setReady] = useState(false)
    const [mobile, setMobile] = useState(false)
    const [rtl, setRtl] = useState(false)

    const freezeAtLastSecond = useCallback(() => {
      const video = videoRef.current
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
        return false
      }

      const holdAt = Math.max(
        0,
        video.duration - motion.video.endFrameOffsetSeconds,
      )
      finishedRef.current = true
      playPendingRef.current = false
      video.pause()

      if (Math.abs(video.currentTime - holdAt) > 0.04) {
        video.currentTime = holdAt
      }
      return true
    }, [])

    const showFinalFrame = useCallback(() => {
      preferFinalFrameRef.current = true
      startedRef.current = true
      finishedRef.current = true
      playPendingRef.current = false

      const video = videoRef.current
      if (!video) return

      const hold = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return

        const holdAt = Math.max(
          0,
          video.duration - motion.video.endFrameOffsetSeconds,
        )
        finishedRef.current = true
        video.pause()

        const reveal = () => setReady(true)
        if (Math.abs(video.currentTime - holdAt) <= 0.04) {
          reveal()
          return
        }

        video.addEventListener("seeked", reveal, { once: true })
        video.currentTime = holdAt
      }

      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        hold()
        return
      }

      video.addEventListener("loadedmetadata", hold, { once: true })
      try {
        video.load()
      } catch {
        // ignore
      }
    }, [])

    const playForward = useCallback(() => {
      const video = videoRef.current
      if (!video || reducedMotion || document.hidden) return
      if (finishedRef.current || preferFinalFrameRef.current) return
      if (!startedRef.current && !playPendingRef.current) return

      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        // Mobile often ignores preload until play is requested — keep trying.
        playPendingRef.current = true
        try {
          video.load()
        } catch {
          // ignore
        }
        return
      }

      if (
        Number.isFinite(video.duration) &&
        video.duration > 0 &&
        video.currentTime >=
          video.duration - motion.video.endFrameOffsetSeconds
      ) {
        freezeAtLastSecond()
        return
      }

      playPendingRef.current = false
      void video.play().then(
        () => {
          setReady(true)
        },
        () => {
          // Autoplay blocked / not buffered yet — retry when more data arrives.
          playPendingRef.current = true
        },
      )
    }, [freezeAtLastSecond, reducedMotion])

    useImperativeHandle(
      ref,
      () => ({
        container: containerRef.current,
        playOnce: () => {
          if (finishedRef.current || preferFinalFrameRef.current) return
          if (startedRef.current) {
            playForward()
            return
          }
          startedRef.current = true
          playPendingRef.current = true
          playForward()
        },
        showFinalFrame,
      }),
      [playForward, showFinalFrame],
    )

    useEffect(() => {
      const video = videoRef.current
      if (!video) return

      // Kick the network early — iOS/Android often won't fetch with preload alone.
      try {
        video.preload = "auto"
        video.load()
      } catch {
        // ignore
      }

      const onLoadedMeta = () => {
        // Poster / first decode available — don't leave a blank plate on mobile.
        setReady(true)
      }

      const onLoadedData = () => {
        setReady(true)
        if (reducedMotion || preferFinalFrameRef.current) {
          freezeAtLastSecond()
          return
        }
        if (
          (startedRef.current || playPendingRef.current) &&
          !finishedRef.current
        ) {
          playForward()
        }
      }

      const onCanPlay = () => {
        setReady(true)
        if (
          (startedRef.current || playPendingRef.current) &&
          !finishedRef.current &&
          !reducedMotion
        ) {
          playForward()
        }
      }

      const onTimeUpdate = () => {
        if (!startedRef.current || finishedRef.current || reducedMotion) return
        if (!Number.isFinite(video.duration) || video.duration <= 0) return

        if (
          video.currentTime >=
          video.duration - motion.video.endFrameOffsetSeconds
        ) {
          freezeAtLastSecond()
        }
      }

      const onEnded = () => {
        freezeAtLastSecond()
      }

      const onVisibilityChange = () => {
        if (document.hidden) {
          video.pause()
          return
        }

        if (finishedRef.current || !startedRef.current) return
        playForward()
      }

      video.addEventListener("loadedmetadata", onLoadedMeta)
      video.addEventListener("loadeddata", onLoadedData)
      video.addEventListener("canplay", onCanPlay)
      video.addEventListener("timeupdate", onTimeUpdate)
      video.addEventListener("ended", onEnded)
      document.addEventListener("visibilitychange", onVisibilityChange)

      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onLoadedMeta()
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onLoadedData()

      return () => {
        video.removeEventListener("loadedmetadata", onLoadedMeta)
        video.removeEventListener("loadeddata", onLoadedData)
        video.removeEventListener("canplay", onCanPlay)
        video.removeEventListener("timeupdate", onTimeUpdate)
        video.removeEventListener("ended", onEnded)
        document.removeEventListener("visibilitychange", onVisibilityChange)
      }
    }, [freezeAtLastSecond, playForward, reducedMotion])

    useEffect(() => {
      const query = window.matchMedia(
        `(max-width: ${motion.video.mobileBreakpoint}px)`,
      )
      const update = () => setMobile(query.matches)
      update()
      query.addEventListener("change", update)
      return () => query.removeEventListener("change", update)
    }, [])

    useEffect(() => {
      const sync = () => setRtl(document.documentElement.dir === "rtl")
      sync()
      const observer = new MutationObserver(sync)
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["dir"],
      })
      return () => observer.disconnect()
    }, [])

    const objectPosition = mobile
      ? motion.video.objectPositionMobile
      : rtl
        ? "30% center"
        : motion.video.objectPositionDesktop

    return (
      <div
        className={`hero-video${ready ? " hero-video--ready" : ""}`}
        ref={containerRef}
        aria-hidden="true"
      >
        <video
          className="hero-video__media"
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          loop={false}
          style={{
            objectPosition,
          }}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      </div>
    )
  },
)
