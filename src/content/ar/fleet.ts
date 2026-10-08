import type { FleetCategory } from "../types"

/**
 * تسميات المقاعد من كتيب المعرض.
 * قاعدة معرفة البوت (س60) تذكر سعات ~49 / 32 VIP / 19 / 45 سيتي / 60 و48 موظفين —
 * لا تُستبدل أرقام الكتيب حتى يعتمد العميل أي مصدر هو المعتمد.
 */
export const fleet: readonly FleetCategory[] = [
  {
    id: "premium-vip-2026",
    name: "باص بريميوم VIP",
    seatsLabel: "18 + 1 + 1",
    summary:
      "اكتشف قمة الراحة والفخامة في حافلاتنا الجديدة، المزودة بمقاعد مساج مع التدفئة والتبريد لتجربة سفر مثالية.",
    amenities: [
      "مقاعد مساج",
      "مقاعد تبريد",
      "مقاعد تسخين",
      "منافذ شحن USB Type-C",
      "شبكة واي فاي",
      "نظام كاميرات مراقبة",
      "نظام الصوت",
      "شاشات عرض",
      "ثلاجة تبريد",
      "إضاءة مميزة",
      "حمام / دورة مياه",
      "ستائر فاخرة",
      "وسائل السلامة",
      "أنظمة فرامل متقدمة ABS",
      "نظام تحديد المواقع GPS",
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
    name: "باص VIP",
    seatsLabel: "28 + 1 + 1",
    summary:
      "مقاعد VIP قابلة للتعديل والتحريك تمنحك حرية اختيار وضعية الجلوس المثالية لرحلة أكثر راحة.",
    amenities: [
      "مقاعد VIP فاخرة",
      "شبكة واي فاي",
      "نظام كاميرات مراقبة",
      "منافذ شحن USB",
      "إضاءة مميزة",
      "ثلاجة تبريد",
      "نظام الصوت",
      "حمام / دورة مياه",
      "شاشات عرض",
      "تكييف مناسب للأجواء",
      "ستائر فاخرة",
      "وسائل السلامة",
      "أنظمة فرامل متقدمة ABS",
      "نظام تحديد المواقع GPS",
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
    name: "كوتش باص",
    seatsLabel: "49 + 1 + 1",
    summary:
      "نخدم الحجاج والمعتمرين بأسطول مجهز وفق أعلى معايير الجودة والسلامة.",
    amenities: [
      "مقاعد جلد فاخرة",
      "شبكة واي فاي",
      "نظام كاميرات مراقبة",
      "منافذ شحن USB",
      "إضاءة مميزة",
      "ثلاجة تبريد",
      "نظام الصوت",
      "حمام / دورة مياه",
      "شاشات عرض",
      "تكييف مناسب للأجواء",
      "ستائر فاخرة",
      "وسائل السلامة",
      "أنظمة فرامل متقدمة ABS",
      "نظام تحديد المواقع GPS",
    ],
    coverImage: "/fleet/coach-2025-2026/cover.webp",
    exteriorImages: ["/fleet/coach-2025-2026/cover.webp"],
    interiorImages: [],
    images: ["/fleet/coach-2025-2026/cover.webp"],
  },
  {
    id: "city-2025",
    name: "سيتي باص",
    seatsLabel: "55 + 1",
    summary:
      "حلول نقل مبتكرة توفر الوقت والجهد وتسهّل التنقل داخل المدينة بأعلى كفاءة.",
    amenities: [
      "نظام كاميرات مراقبة",
      "مقاعد جلد فاخرة",
      "ستائر فاخرة",
      "وسائل السلامة",
      "أنظمة فرامل متقدمة ABS",
      "نظام تحديد المواقع GPS",
      "تكييف مناسب للأجواء",
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
    name: "باص نقل عمال",
    seatsLabel: "66 + 1",
    summary:
      "حلول نقل متطورة تضمن الالتزام بالمواعيد وتجربة سفر سلسة لفريق العمل.",
    amenities: [
      "وسائل السلامة",
      "أنظمة فرامل متقدمة ABS",
      "نظام تحديد المواقع GPS",
      "تكييف مناسب للأجواء",
    ],
    coverImage: "/fleet/labour-2024/cover.webp",
    exteriorImages: ["/fleet/labour-2024/cover.webp"],
    interiorImages: [],
    images: ["/fleet/labour-2024/cover.webp"],
  },
  {
    id: "coaster-2026",
    name: "كوستر",
    seatsLabel: "—", // TODO(content): confirm Coaster seat count with the client
    summary:
      "حافلة متوسطة الحجم للمجموعات الصغيرة، سهلة الحركة في شوارع المدن وطرق المشاعر.",
    amenities: [
      // TODO(content): confirm Coaster amenities with the client
      "وسائل السلامة",
      "أنظمة فرامل متقدمة ABS",
      "أنظمة تتبع GPS",
      "تبريد مريح",
    ],
    coverImage: "/fleet/coaster-2026/cover.webp", // TODO(human): placeholder photo, replace with a real Coaster photo
    exteriorImages: ["/fleet/coaster-2026/cover.webp"],
    interiorImages: [],
    images: ["/fleet/coaster-2026/cover.webp"],
  },
] as const
