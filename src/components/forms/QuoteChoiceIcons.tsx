import type { ReactNode } from "react"

/** Compact line icons for quote wizard choices — keyed by option id. */
export const choiceIcon = (id: string): ReactNode => {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "size-[1.15rem]",
  }

  switch (id) {
    case "individual":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="2.4" />
          <circle cx="16" cy="9" r="2" />
          <path d="M4.5 18.5c.6-2.8 2.5-4.3 4.5-4.3s3.9 1.5 4.5 4.3" />
          <path d="M13.2 14.8c1.1-.7 2.4-1 3.5-1 1.6 0 3 .7 3.8 2.7" />
        </svg>
      )
    case "company":
    case "workers":
    case "events":
      return (
        <svg {...common}>
          <rect x="4" y="7" width="16" height="13" rx="1.5" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
          <path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
        </svg>
      )
    case "government":
      return (
        <svg {...common}>
          <path d="M4 19h16M6 19V10l6-5 6 5v9" />
          <path d="M9 19v-5h6v5" />
        </svg>
      )
    case "school":
    case "education":
      return (
        <svg {...common}>
          <path d="m3 9 9-5 9 5-9 5-9-5Z" />
          <path d="M7 11.5v4.2c0 .7 2.2 2.3 5 2.3s5-1.6 5-2.3v-4.2" />
          <path d="M21 9v6" />
        </svg>
      )
    case "umrah_campaigns":
      return (
        <svg {...common}>
          <path d="M4 19h16" />
          <path d="M6 19V11l6-5 6 5v8" />
          <path d="M12 6V4" />
          <circle cx="12" cy="3.2" r="0.9" fill="currentColor" stroke="none" />
          <path d="M10 19v-4h4v4" />
        </svg>
      )
    case "umrah":
    case "dawra":
    case "long":
      return (
        <svg {...common}>
          <path d="M12 21c-3.2-2.3-7-6-7-10a7 7 0 1 1 14 0c0 4-3.8 7.7-7 10Z" />
          <circle cx="12" cy="11" r="2.4" />
        </svg>
      )
    case "tourism":
    case "tourism_group":
    case "charter":
    case "coach":
    case "city":
    case "employee":
      return (
        <svg {...common}>
          <rect x="3.5" y="6" width="17" height="10" rx="2" />
          <path d="M6 16v2.5M18 16v2.5M7 10h4M14 10h3" />
          <circle cx="8" cy="18.5" r="1.2" />
          <circle cx="16" cy="18.5" r="1.2" />
        </svg>
      )
    case "maktaa":
    case "oneway":
      return (
        <svg {...common}>
          <path d="M4 12h14" />
          <path d="m14 7 5 5-5 5" />
        </svg>
      )
    case "twoway":
    case "short":
      return (
        <svg {...common}>
          <path d="M7 8h11l-2.5-2.5M17 16H6l2.5 2.5" />
        </svg>
      )
    case "vip":
      return (
        <svg {...common}>
          <path d="m12 3 2.2 4.5L19 8.2l-3.5 3.4.8 4.9L12 14.3 7.7 16.5l.8-4.9L5 8.2l4.8-.7L12 3Z" />
        </svg>
      )
    case "standard":
      return (
        <svg {...common}>
          <rect x="5" y="5" width="14" height="14" rx="2.5" />
          <path d="M9 12h6M12 9v6" />
        </svg>
      )
    case "vip_airport":
    case "international":
      return (
        <svg {...common}>
          <path d="M3 12h18" />
          <path d="M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18Z" />
          <path d="M12 3c2.5 2.8 3.8 6 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-6-3.8-9s1.3-6.2 3.8-9Z" />
        </svg>
      )
    case "other":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7.5" />
          <path d="M12 8.5v.01M12 11v4.5" />
        </svg>
      )
  }
}

export const CheckBadge = () => (
  <span
    aria-hidden
    className="absolute end-3 top-1/2 -translate-y-1/2 inline-flex size-5 items-center justify-center rounded-full bg-orange text-white shadow-sm"
  >
    <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="m3.5 8.2 2.8 2.8 6.2-6.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
)
