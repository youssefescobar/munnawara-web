"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"
import { pick, type MapStop } from "./quoteWizardConfig"

type QuoteMapProps = {
  /** Stops in visiting order. Two or more draw a route with a driving bus. */
  stops: readonly MapStop[]
  /** Extra faint markers (e.g. all hubs before a route exists). */
  context?: readonly MapStop[]
  locale: string
  className?: string
  /** Disable the bus animation (reduced motion). */
  still?: boolean
}

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving"

type LatLng = [number, number]

/** Road geometry cache so stepping back and forth doesn't refetch. */
const roadCache = new Map<string, LatLng[]>()

async function fetchRoad(stops: readonly MapStop[], signal: AbortSignal): Promise<LatLng[] | null> {
  const key = stops.map((s) => `${s.lat},${s.lng}`).join(";")
  const cached = roadCache.get(key)
  if (cached) return cached
  try {
    const coords = stops.map((s) => `${s.lng},${s.lat}`).join(";")
    const res = await fetch(`${OSRM_URL}/${coords}?overview=full&geometries=geojson`, { signal })
    if (!res.ok) return null
    const data = (await res.json()) as {
      routes?: { geometry?: { coordinates?: [number, number][] } }[]
    }
    const line = data.routes?.[0]?.geometry?.coordinates
    if (!line?.length) return null
    const path = line.map(([lng, lat]) => [lat, lng] as LatLng)
    roadCache.set(key, path)
    return path
  } catch {
    return null
  }
}

const pinIcon = (kind: "hub" | "ziyarat", index?: number) =>
  L.divIcon({
    className: "qmap-pin-wrap",
    html: `<span class="qmap-pin qmap-pin--${kind}">${index ?? ""}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })

const busIcon = L.divIcon({
  className: "qmap-bus-wrap",
  html: '<span class="qmap-bus" aria-hidden="true">🚌</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

/** Cumulative-distance helper so the bus moves at a steady speed along the path. */
function buildTrack(path: readonly LatLng[]) {
  const dist: number[] = [0]
  for (let i = 1; i < path.length; i += 1) {
    const dLat = path[i][0] - path[i - 1][0]
    const dLng = path[i][1] - path[i - 1][1]
    dist.push(dist[i - 1] + Math.hypot(dLat, dLng))
  }
  const total = dist[dist.length - 1] || 1
  const at = (t: number): LatLng => {
    const target = t * total
    let lo = 0
    let hi = dist.length - 1
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1
      if (dist[mid] <= target) lo = mid
      else hi = mid
    }
    const span = dist[hi] - dist[lo] || 1
    const f = (target - dist[lo]) / span
    return [
      path[lo][0] + (path[hi][0] - path[lo][0]) * f,
      path[lo][1] + (path[hi][1] - path[lo][1]) * f,
    ]
  }
  return { at }
}

export default function QuoteMap({ stops, context = [], locale, className, still }: QuoteMapProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const frameRef = useRef<number>(0)
  const boundsRef = useRef<L.LatLngBounds | null>(null)

  // Create the map once.
  useEffect(() => {
    if (!hostRef.current || mapRef.current) return
    const map = L.map(hostRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      worldCopyJump: false,
    }).setView([23.0, 39.6], 6)
    L.tileLayer(TILE_URL, {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)
    L.control.zoom({ position: "bottomright" }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    // Re-fit when the container changes size (split layout, rotation, resize).
    let raf = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        map.invalidateSize()
        if (boundsRef.current) map.fitBounds(boundsRef.current, { padding: [36, 36], maxZoom: 12 })
      })
    })
    ro.observe(hostRef.current)
    const resize = window.setTimeout(() => map.invalidateSize(), 120)
    return () => {
      window.clearTimeout(resize)
      ro.disconnect()
      cancelAnimationFrame(raf)
      cancelAnimationFrame(frameRef.current)
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  // Parents pass fresh arrays each render; key the effect on their content instead.
  const stopsRef = useRef(stops)
  const contextRef = useRef(context)
  stopsRef.current = stops
  contextRef.current = context
  const stopsKey = stops.map((s) => s.id).join("|")
  const contextKey = context.map((s) => s.id).join("|")

  // Redraw markers / route whenever the stops change.
  useEffect(() => {
    const stops = stopsRef.current
    const context = contextRef.current
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return

    const controller = new AbortController()
    cancelAnimationFrame(frameRef.current)
    layer.clearLayers()

    // Hubs sit close together (Jeddah/Makkah), so fan their labels out.
    const hubDir: Record<string, L.Direction> = {
      jed_airport: "left",
      makkah: "right",
      madinah: "left",
      med_airport: "right",
    }
    const tooltipDir: L.Direction = "top"

    context.forEach((s) => {
      L.marker([s.lat, s.lng], { icon: pinIcon("ziyarat"), interactive: false, keyboard: false, opacity: 0.55 })
        .bindTooltip(pick(s.label, locale), { direction: tooltipDir, className: "qmap-tip" })
        .addTo(layer)
    })

    stops.forEach((s, i) => {
      L.marker([s.lat, s.lng], { icon: pinIcon(s.kind, stops.length > 1 ? i + 1 : undefined), keyboard: false })
        .bindTooltip(pick(s.label, locale), {
          permanent: s.kind === "hub",
          direction: hubDir[s.id] ?? tooltipDir,
          offset: (hubDir[s.id] ?? tooltipDir) === "left" ? [-16, 0] : (hubDir[s.id] ?? tooltipDir) === "right" ? [16, 0] : [0, -16],
          className: "qmap-tip",
        })
        .addTo(layer)
    })

    const all = [...stops, ...context]
    if (all.length) {
      boundsRef.current = L.latLngBounds(all.map((s) => [s.lat, s.lng] as LatLng))
      // Animated: zoom slowly onto one point, pull back to frame several.
      const opts = { padding: [36, 36] as [number, number], maxZoom: stops.length < 2 ? 11 : 12 }
      if (still) map.fitBounds(boundsRef.current, opts)
      else map.flyToBounds(boundsRef.current, { ...opts, duration: 1.8 })
    }

    if (stops.length < 2) return () => controller.abort()

    const straight: LatLng[] = stops.map((s) => [s.lat, s.lng])
    let line = L.polyline(straight, {
      color: "#e8702a",
      weight: 4,
      opacity: 0.85,
      dashArray: "8 8",
    }).addTo(layer)
    let bus: L.Marker | null = null

    const startBus = (path: LatLng[]) => {
      if (still) return
      const track = buildTrack(path)
      bus = L.marker(path[0], { icon: busIcon, interactive: false, zIndexOffset: 1000 }).addTo(layer)
      const started = performance.now()
      const duration = 14000
      const tick = (now: number) => {
        const t = ((now - started) % duration) / duration
        bus?.setLatLng(track.at(t))
        frameRef.current = requestAnimationFrame(tick)
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    startBus(straight)

    void fetchRoad(stops, controller.signal).then((road) => {
      if (!road || controller.signal.aborted) return
      cancelAnimationFrame(frameRef.current)
      if (bus) layer.removeLayer(bus)
      layer.removeLayer(line)
      line = L.polyline(road, { color: "#e8702a", weight: 4, opacity: 0.9 }).addTo(layer)
      startBus(road)
    })

    return () => {
      controller.abort()
      cancelAnimationFrame(frameRef.current)
    }
  }, [stopsKey, contextKey, locale, still])

  return <div ref={hostRef} className={className} role="img" aria-label="Route map" />
}
