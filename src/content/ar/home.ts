import type { HomeContent } from "../types"

export const home: HomeContent = {
  landingHero: {
    eyebrow: "درة المنورة للنقل",
    lines: ["ننقلك", "إلى\u00A0الأمام"],
    sub: "رحلات راقية، تُقاد بعناية في كل ميل.",
    cta: "استكشف خدماتنا",
    brandWords: ["درة", "المنورة", "للنقل"],
    backTop: "درة المنورة، العودة للأعلى",
    chatAria: "محادثة مع درة المنورة",
  },
  valueTitle: "نقل مصمم للرحلات المقدسة",
  valueIntro:
    "تنسّق مجموعة درة المنورة أسطولاً حديثاً وتشغيلاً دقيقاً وتواصلاً واضحاً ليشعر الحجاج والمؤسسات بالثقة في كل رحلة.",
  valueImage: "/fleet/premium-vip-2026/exterior/pv-out-1.webp",
  valueBullets: [
    {
      id: "safety",
      title: "السلامة أولاً",
      description: "تشغيل منضبط وسائقون مدربون لكل مهمة.",
    },
    {
      id: "licensed",
      title: "مجموعة منظمة",
      description: "شركات تابعة تحت مظلة علامة واحدة مسؤولة.",
    },
    {
      id: "fleet",
      title: "أسطول حديث",
      description: "حافلات حديثة عبر فئات VIP والمجموعات.",
    },
    {
      id: "tracked",
      title: "وضوح الرحلة",
      description: "تنسيق واضح من طلب العرض حتى تأكيد الرحلة.",
    },
  ],
  passbyEyebrow: "درة المنورة",
  passbyTitle: "كل رحلة… بترتيب وعناية",
  passbyTitleAfter: "من العرض إلى تأكيد المغادرة",
  howTitle: "كيف نعمل",
  howSubtitle: "ثلاث خطوات واضحة من الطلب إلى تأكيد النقل.",
  howStepPrefix: "الخطوة",
  howSteps: [
    {
      id: "request",
      number: "01",
      title: "أخبرنا عن رحلتك… والباقي علينا",
      description:
        "شاركنا نوع الرحلة، الوجهة، التاريخ وعدد الركاب عبر نموذج (اطلب عرض سعر) أو عن طريق واتساب، وسيتواصل معك فريقنا لتقديم الخيار الأنسب لرحلتك.",
      ctaLabel: "اطلب عرض سعر",
      ctaHref: "#quote",
    },
    {
      id: "quote",
      number: "02",
      title: "نجهز لك الخيار الأنسب",
      description:
        "نقدم لك خيارات مختلفة وخدمات متميزة لتختار منها ما يناسب رحلتك.",
      ctaLabel: null,
      ctaHref: null,
    },
    {
      id: "confirm",
      number: "03",
      title: "نؤكد رحلتك ونجهّز كل التفاصيل..",
      description:
        "بعد اعتماد العرض، نجهّز الحافلة المناسبة وننسّق تفاصيل الرحلة، ليكون كل شيء جاهزًا في الموعد المحدد.",
      ctaLabel: "تواصل معنا",
      ctaHref: "/contact",
    },
  ],
  aboutEyebrow: "عن المجموعة",
  aboutCta: "اقرأ قصتنا",
  aboutSecondaryCta: "تواصل معنا",
  aboutSocialCta: "تابعوا @dmtcSA",
  aboutImage: "/hero/landing-sky.jpg",
  aboutHeadlineLines: [
    "رحلات آمنة ومريحة.",
    "أسطول منظم. معايير واضحة.",
  ],
  quoteEyebrow: "خطّط لرحلتك",
  quoteHeadline: "استرخوا. نحن نرتّب الباقي.",
  quoteBody:
    "شاركوا نوع الرحلة والمدن والتواريخ وعدد الركاب. يتابعكم فريقنا بخيارات واضحة.",
  testimonialsTitle: "شركاؤنا",
  testimonialsSubtitle:
    "نقل منظم للحملات والمؤسسات والمهام الرسمية.",
  testimonialsCta: "تواصل معنا",
  // TODO(content): replace once client provides approved testimonials
  testimonialsEmpty: "ستظهر شهادات العملاء هنا بعد اعتمادها للنشر.",
  newsTitle: "اقرأ عن المجموعة",
  newsSubtitle:
    "ملاحظات موسمية وتحديثات الأسطول وإعلانات من درة المنورة.",
  newsEmpty: "لا توجد أخبار منشورة حالياً. تابعونا قريباً.",
  faqTitle: "الأسئلة الشائعة",
  faqSubtitle: "إجابات على أكثر ما تسأله المجموعات والمؤسسات.",
  faqCta: "تواصل معنا",
  ctaBandEyebrow: "تجربة نقل منظم لم تعهدوها من قبل",
  ctaBandTitle: "استرخوا، نحن نرتّب الباقي.",
  ctaBandSubtitle:
    "شاركوا تفاصيل رحلتكم وسيتابعكم فريقنا بخيارات واضحة.",
}
