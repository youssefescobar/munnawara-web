import type { FleetCategory } from "../types"

/**
 * Brochure seat labels (exhibition catalog).
 * Bot/KB catalog (info.md Q60) lists ~49 / 32 VIP / 19 / 45 city / 60+48 employee —
 * do not silently overwrite brochure figures until the client confirms which set wins.
 */
export const fleet: readonly FleetCategory[] = [
  {
    id: "premium-vip-2026",
    name: "Premium VIP Bus",
    seatsLabel: "18 + 1 + 1",
    summary:
      "Discover the pinnacle of comfort and luxury in our new buses, equipped with massage seats featuring heating and cooling for the ultimate travel experience.",
    amenities: [
      "Massage seats",
      "Cooling seats",
      "Heating seats",
      "USB Type-C charging ports",
      "Wi‑Fi",
      "CCTV system",
      "Sound system",
      "Display screens",
      "Refrigerator",
      "Premium lighting",
      "WC",
      "Luxury curtains",
      "Safety features",
      "ABS systems",
      "GPS systems",
    ],
    coverImage: "/fleet/premium-vip-2026/studio/1.webp",
    exteriorImages: [
      "/fleet/premium-vip-2026/studio/1.webp",
      "/fleet/premium-vip-2026/studio/2.webp",
      "/fleet/premium-vip-2026/studio/3.webp",
      "/fleet/premium-vip-2026/studio/4.webp",
      "/fleet/premium-vip-2026/exterior/pv-out-1.webp",
      "/fleet/premium-vip-2026/exterior/pv-out-2.webp",
      "/fleet/premium-vip-2026/exterior/pv-out-3.webp",
      "/fleet/premium-vip-2026/exterior/pv-out-4.webp",
      "/fleet/premium-vip-2026/exterior/pv-out-5.webp",
      "/fleet/premium-vip-2026/exterior/pv-out-6.webp",
    ],
    interiorImages: [
      "/fleet/premium-vip-2026/interior/pv-in-1.webp",
      "/fleet/premium-vip-2026/interior/pv-in-2.webp",
      "/fleet/premium-vip-2026/interior/pv-in-3.webp",
      "/fleet/premium-vip-2026/interior/pv-in-4.webp",
    ],
    images: ["/fleet/premium-vip-2026/studio/1.webp"],
    interactive: true,
  },
  {
    id: "vip-2026",
    name: "VIP Bus",
    seatsLabel: "28 + 1 + 1",
    summary:
      "Experience ultimate comfort with our adjustable and movable VIP seats, allowing you to choose the perfect seating position for a truly relaxing journey.",
    amenities: [
      "Luxury VIP seats",
      "Wi‑Fi",
      "CCTV system",
      "USB charging ports",
      "Premium lighting",
      "Refrigerator",
      "Sound system",
      "WC",
      "Display screens",
      "Cooling bus comfort",
      "Luxury curtains",
      "Safety features",
      "ABS systems",
      "GPS systems",
    ],
    coverImage: "/fleet/vip-2026/studio/1.webp",
    exteriorImages: [
      "/fleet/vip-2026/studio/1.webp",
      "/fleet/vip-2026/studio/2.webp",
      "/fleet/vip-2026/studio/3.webp",
      "/fleet/vip-2026/studio/4.webp",
      "/fleet/vip-2026/studio/5.webp",
    ],
    interiorImages: [],
    images: ["/fleet/vip-2026/studio/1.webp"],
  },
  {
    id: "coach-2025-2026",
    name: "Coach Bus",
    seatsLabel: "49 + 1 + 1",
    summary:
      "We serve Hajj and Umrah pilgrims with a fleet equipped to the highest standards of quality and safety.",
    amenities: [
      "Luxury leather seats",
      "Wi‑Fi",
      "CCTV system",
      "USB charging ports",
      "Premium lighting",
      "Refrigerator",
      "Sound system",
      "WC",
      "Display screens",
      "Cooling bus comfort",
      "Luxury curtains",
      "Safety features",
      "ABS systems",
      "GPS systems",
    ],
    coverImage: "/fleet/coach-2025-2026/cover.webp",
    exteriorImages: ["/fleet/coach-2025-2026/cover.webp"],
    interiorImages: [],
    images: ["/fleet/coach-2025-2026/cover.webp"],
  },
  {
    id: "city-2025",
    name: "City Bus",
    seatsLabel: "55 + 1",
    summary:
      "Innovative transport solutions that save time and effort, making urban mobility highly efficient.",
    amenities: [
      "CCTV system",
      "Luxury leather seats",
      "Luxury curtains",
      "Safety features",
      "ABS systems",
      "GPS systems",
      "Cooling bus comfort",
    ],
    coverImage: "/fleet/city-2025/studio/1.webp",
    exteriorImages: [
      "/fleet/city-2025/studio/1.webp",
      "/fleet/city-2025/studio/2.webp",
      "/fleet/city-2025/studio/3.webp",
      "/fleet/city-2025/studio/4.webp",
    ],
    interiorImages: [],
    images: ["/fleet/city-2025/studio/1.webp"],
  },
  {
    id: "labour-2024",
    name: "Workers Transport Bus",
    seatsLabel: "66 + 1",
    summary:
      "Advanced transport solutions ensuring punctuality and a seamless travel experience for the workforce.",
    amenities: [
      "Safety features",
      "ABS systems",
      "GPS systems",
      "Cooling bus comfort",
    ],
    coverImage: "/fleet/labour-2024/cover.webp",
    exteriorImages: ["/fleet/labour-2024/cover.webp"],
    interiorImages: [],
    images: ["/fleet/labour-2024/cover.webp"],
  },
  {
    id: "coaster-2026",
    name: "Coaster",
    seatsLabel: "—", // TODO(content): confirm Coaster seat count with the client
    summary:
      "A compact coach for smaller groups, easy to move through city streets and holy-site roads.",
    amenities: [
      // TODO(content): confirm Coaster amenities with the client
      "Safety features",
      "ABS systems",
      "GPS systems",
      "Cooling bus comfort",
    ],
    coverImage: "/fleet/coaster-2026/cover.webp", // TODO(human): placeholder photo, replace with a real Coaster photo
    exteriorImages: ["/fleet/coaster-2026/cover.webp"],
    interiorImages: [],
    images: ["/fleet/coaster-2026/cover.webp"],
  },
] as const
