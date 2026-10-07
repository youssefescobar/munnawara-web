import type { HomeContent } from "../types"

export const home: HomeContent = {
  landingHero: {
    eyebrow: "درة المنورة للنقل",
    lines: ["رحلة تليق", "بضيوف\u00A0الرحمن"],
    sub: "نقل راقٍ للحج والعمرة والمؤسسات، بعناية تبدأ قبل الانطلاق ولا تنتهي إلا بوصولكم.",
    cta: "اكتشف خدماتنا",
    brandWords: ["درة", "المنورة", "للنقل"],
    backTop: "درة المنورة، العودة للأعلى",
    chatAria: "محادثة مع درة المنورة",
  },
  valueTitle: "نقل يليق بالرحلات المقدسة",
  valueIntro:
    "في مجموعة درة المنورة نجمع أسطولاً حديثاً وتشغيلاً منضبطاً وتواصلاً واضحاً، ليسافر الحجاج والمعتمرون والمؤسسات وهم مطمئنون.",
  valueImage: "/fleet/premium-vip-2026/exterior/pv-out-1.webp",
  valueBullets: [
    {
      id: "safety",
      title: "السلامة أولاً",
      description: "تشغيل منضبط وسائقون مؤهلون في كل مهمة.",
    },
    {
      id: "licensed",
      title: "مجموعة تتحمل مسؤوليتها",
      description: "شركات متكاملة تحت علامة واحدة، ومعيار واحد في الخدمة.",
    },
    {
      id: "fleet",
      title: "أسطول حديث",
      description: "حافلات حديثة بفئات VIP والمجموعات، جاهزة لما تحتاجونه.",
    },
    {
      id: "tracked",
      title: "وضوح الرحلة",
      description: "تنسيق واضح من أول طلب حتى تأكيد الرحلة.",
    },
  ],
  passbyEyebrow: "درة المنورة",
  passbyTitle: "عليكم تحديد الوجهة",
  passbyTitleAfter: "وعلينا أن نوصلكم بأمان",
  howTitle: "كيف نعمل",
  howSubtitle: "ثلاث خطوات بسيطة، من طلبكم إلى تأكيد رحلتكم.",
  howStepPrefix: "الخطوة",
  howSteps: [
    {
      id: "request",
      number: "01",
      title: "عرّفنا برحلتك… والباقي علينا",
      description:
        "أرسل لنا نوع الرحلة والوجهة والتاريخ وعدد الركاب عبر نموذج «اطلب عرض سعر» أو واتساب، وسيتواصل معك فريقنا بالخيار الأنسب.",
      ctaLabel: "اطلب عرض سعر",
      ctaHref: "#quote",
    },
    {
      id: "quote",
      number: "02",
      title: "نجهّز لك الأنسب",
      description:
        "نضع بين يديك خيارات واضحة وخدمات مميزة، وتختار منها ما يناسب رحلتك.",
      ctaLabel: null,
      ctaHref: null,
    },
    {
      id: "confirm",
      number: "03",
      title: "نؤكد رحلتك ونتولى التفاصيل",
      description:
        "بعد اعتماد العرض، نجهّز الحافلة المناسبة وننسّق كل تفصيلة، ليكون كل شيء جاهزاً في موعده.",
      ctaLabel: "تواصل معنا",
      ctaHref: "/contact",
    },
  ],
  aboutEyebrow: "عن المجموعة",
  aboutCta: "تعرّف على قصتنا",
  aboutSecondaryCta: "تواصل معنا",
  aboutSocialCta: "تابعوا @dmtcSA",
  aboutImage: "/hero/landing-sky.jpg",
  aboutHeadlineLines: [
    "رحلات آمنة ومريحة.",
    "أسطول منظّم. معايير واضحة. التزام لا يتغيّر.",
  ],
  quoteEyebrow: "ابدؤوا التخطيط",
  quoteHeadline: "أبشروا. نحن نرتّب الباقي.",
  quoteBody:
    "أخبرونا بنوع الرحلة والمدن والتواريخ وعدد الركاب، ويتواصل معكم فريقنا بخيارات واضحة.",
  testimonialsTitle: "شركاء النجاح",
  testimonialsSubtitle:
    "نقل منظّم لحملات الحج والعمرة والمؤسسات والمهام الرسمية.",
  testimonialsCta: "تواصل معنا",
  // TODO(content): replace once client provides approved testimonials
  testimonialsEmpty: "ستظهر شهادات العملاء هنا بعد اعتمادها للنشر.",
  newsTitle: "من أخبار المجموعة",
  newsSubtitle:
    "مستجدات المواسم وتحديثات الأسطول وإعلانات درة المنورة.",
  newsEmpty: "لا أخبار منشورة حالياً. تابعونا، فالجديد قادم.",
  faqTitle: "الأسئلة الشائعة",
  faqSubtitle: "إجابات عن أكثر ما تسأل عنه المجموعات والمؤسسات.",
  faqCta: "تواصل معنا",
  ctaBandEyebrow: "تجربة نقل منظّمة بمستوى جديد",
  ctaBandTitle: "أبشروا، نحن نرتّب الباقي.",
  ctaBandSubtitle:
    "أرسلوا تفاصيل رحلتكم، ويتواصل معكم فريقنا بخيارات واضحة.",
}
