"use client"

import { Link } from "@/i18n/navigation"
import {
  ApiError,
  clearIdentity,
  connectCustomerSocket,
  disconnectCustomerSocket,
  fetchChatHistory,
  fetchGuidedWelcome,
  joinConversation,
  loadConversationId,
  loadIdentity,
  playChatNotifySound,
  saveConversationId,
  saveIdentity,
  sendChatMessage,
  startChatSession,
  type ChatLang,
  type ChatOption,
  type VisitorIdentity,
} from "@/lib/chat"
import { useLocale, useTranslations } from "next-intl"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { project, SPRING_SHEET } from "@/lib/appleMotion"
import { AnimatePresence, motion, useDragControls } from "motion/react"
import { RobotAvatar } from "./RobotAvatar"
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react"

type Role = "user" | "assistant" | "admin" | "system"

type UiMessage = {
  id: string
  role: Role
  text: string
}

type ChatPanelProps = {
  open: boolean
  onClose: () => void
  onUnreadChange?: (count: number) => void
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const mapSocketSender = (sender: string): Role => {
  if (sender === "admin") return "admin"
  if (sender === "customer") return "user"
  if (sender === "system") return "system"
  return "assistant"
}

const emptyIdentity = (): VisitorIdentity => ({ name: "", phone: "" })

/** Turn bare https:// links in a message into real links. */
const RichText = ({ text }: { text: string }) => {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g)
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}

export const ChatPanel = ({ open, onClose, onUnreadChange }: ChatPanelProps) => {
  const t = useTranslations("chat")
  const locale = useLocale()
  const lang: ChatLang = locale === "ar" ? "ar" : "en"
  const titleId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const seenIdsRef = useRef<Set<string>>(new Set())
  const openRef = useRef(open)
  const unreadRef = useRef(0)
  const dragControls = useDragControls()
  const reducedMotion = useReducedMotion()

  const [identity, setIdentity] = useState<VisitorIdentity>(
    () => loadIdentity() || emptyIdentity(),
  )
  const [identified, setIdentified] = useState(() => Boolean(loadIdentity()))
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [options, setOptions] = useState<ChatOption[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [bootError, setBootError] = useState<string | null>(null)
  const [booted, setBooted] = useState(false)
  const [moreTopics, setMoreTopics] = useState(false)

  openRef.current = open

  const setUnread = useCallback(
    (n: number) => {
      unreadRef.current = n
      onUnreadChange?.(n)
    },
    [onUnreadChange],
  )

  const bumpUnread = useCallback(() => {
    if (openRef.current) return
    const next = unreadRef.current + 1
    setUnread(next)
    playChatNotifySound()
  }, [setUnread])

  useEffect(() => {
    if (open) setUnread(0)
  }, [open, setUnread])

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  /** De-duplicates by server message id, then by identical consecutive text. */
  // A fresh set of buttons starts collapsed again once the chat is under way.
  useEffect(() => {
    setMoreTopics(false)
  }, [options])

  const appendMessage = useCallback((message: UiMessage) => {
    if (seenIdsRef.current.has(message.id)) return
    seenIdsRef.current.add(message.id)
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (last && last.role === message.role && last.text === message.text) {
        return prev
      }
      return [...prev, message]
    })
  }, [])

  const scrollToEnd = useCallback(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    if (open && identified) scrollToEnd()
  }, [open, identified, messages, options, busy, scrollToEnd])

  // Focus the composer when the panel opens — but only with a mouse/keyboard,
  // so phones don't pop the on-screen keyboard over the answers.
  useEffect(() => {
    if (!open || !identified) return
    if (!window.matchMedia("(pointer: fine)").matches) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120)
    return () => window.clearTimeout(timer)
  }, [open, identified])

  useEffect(() => {
    if (!conversationId) return

    const socket = connectCustomerSocket()
    joinConversation(conversationId)

    const onMessage = (payload: {
      sender?: string
      text?: string
      messageId?: string
      conversationId?: string
    }) => {
      if (
        payload.conversationId &&
        payload.conversationId !== conversationId
      ) {
        return
      }
      const text = String(payload.text || "").trim()
      if (!text) return
      const sender = payload.sender || "ai"
      if (sender === "customer") return

      appendMessage({
        id: payload.messageId || `sock-${uid()}`,
        role: mapSocketSender(sender),
        text,
      })
      bumpUnread()

      if (sender === "admin") {
        setClaimed(true)
        setEscalated(true)
        setOptions([])
      }
    }

    const onClaimed = (payload: { conversationId?: string }) => {
      if (payload.conversationId && payload.conversationId !== conversationId) {
        return
      }
      setClaimed(true)
      setEscalated(true)
      setOptions([])
      appendMessage({
        id: `claimed-${uid()}`,
        role: "system",
        text: t("claimed"),
      })
      bumpUnread()
    }

    const onEscalated = (payload: { conversationId?: string }) => {
      if (payload.conversationId && payload.conversationId !== conversationId) {
        return
      }
      setEscalated(true)
      setOptions([])
    }

    socket.on("message:new", onMessage)
    socket.on("conversation:claimed", onClaimed)
    socket.on("conversation:escalated", onEscalated)

    // Rooms are lost on disconnect: rejoin, and after a *re*connect pull anything missed.
    let wasConnected = socket.connected
    const onConnect = () => {
      joinConversation(conversationId)
      if (!wasConnected) {
        wasConnected = true
        return
      }
      const phone = loadIdentity()?.phone
      if (!phone) return
      fetchChatHistory(conversationId, phone)
        .then((history) => {
          if (!history.resumable) return
          for (const m of history.messages) {
            if (m.sender === "customer") continue
            appendMessage({ id: m.id, role: mapSocketSender(m.sender), text: m.text })
          }
        })
        .catch(() => {})
    }
    socket.on("connect", onConnect)

    return () => {
      socket.off("message:new", onMessage)
      socket.off("conversation:claimed", onClaimed)
      socket.off("conversation:escalated", onEscalated)
      socket.off("connect", onConnect)
    }
  }, [conversationId, appendMessage, bumpUnread, t])

  useEffect(() => {
    return () => disconnectCustomerSocket()
  }, [])

  /**
   * Open the chat: restore the stored conversation if the server still has it open,
   * otherwise start a fresh session with the welcome menu.
   */
  const beginSession = useCallback(
    async (visitor: VisitorIdentity) => {
      setBusy(true)
      setBootError(null)
      try {
        saveIdentity(visitor)

        const storedId = loadConversationId()
        if (storedId) {
          try {
            const history = await fetchChatHistory(storedId, visitor.phone)
            if (history.resumable && history.messages.length > 0) {
              seenIdsRef.current.clear()
              history.messages.forEach((m) => seenIdsRef.current.add(m.id))
              setMessages(
                history.messages.map((m) => ({
                  id: m.id,
                  role: mapSocketSender(m.sender),
                  text: m.text,
                })),
              )
              setOptions(history.options ?? [])
              setConversationId(history.conversationId)
              joinConversation(history.conversationId)
              setEscalated(history.status === "needs_human" || history.status === "claimed")
              setClaimed(history.status === "claimed")
              setIdentified(true)
              setBooted(true)
              setUnread(0)
              return
            }
          } catch {
            /* stale or unreachable history — fall through to a fresh chat */
          }
          saveConversationId(null)
        }

        const session = await startChatSession(visitor, lang)
        const welcome = await fetchGuidedWelcome(lang)

        const welcomeMsg = {
          id: uid(),
          role: "assistant" as const,
          text: welcome.answer,
        }
        seenIdsRef.current.clear()
        seenIdsRef.current.add(welcomeMsg.id)
        setMessages([welcomeMsg])
        setOptions(welcome.options ?? [])
        setConversationId(session.conversationId)
        saveConversationId(session.conversationId)
        joinConversation(session.conversationId)
        setEscalated(false)
        setClaimed(false)
        setIdentified(true)
        setBooted(true)
        setUnread(0)
      } catch (err) {
        setBootError(err instanceof ApiError ? err.message : t("error"))
        throw err
      } finally {
        setBusy(false)
      }
    },
    [t, setUnread, lang],
  )

  useEffect(() => {
    if (!open || !identified || booted) return
    const visitor = loadIdentity()
    if (!visitor) {
      setIdentified(false)
      return
    }
    let cancelled = false
    void beginSession(visitor).catch(() => {
      if (!cancelled) setIdentified(false)
    })
    return () => {
      cancelled = true
    }
  }, [open, identified, booted, beginSession])

  const handleIdentitySubmit = async (event: FormEvent) => {
    event.preventDefault()
    const next = {
      name: identity.name.trim(),
      phone: identity.phone.trim(),
    }
    if (!next.name || !next.phone) return
    setIdentity(next)
    try {
      await beginSession(next)
    } catch {
      /* bootError set */
    }
  }

  const send = useCallback(
    async (payload: { text?: string; choiceId?: string; label?: string }) => {
      if (busy || !conversationId) return
      const text = payload.text?.trim()
      const choiceId = payload.choiceId
      if (!text && !choiceId) return

      setBusy(true)
      setBootError(null)
      const previousOptions = options
      const optimistic = payload.label || text || ""
      if (optimistic) {
        appendMessage({ id: uid(), role: "user", text: optimistic })
      }
      setDraft("")
      setOptions([])

      try {
        const reply = await sendChatMessage({
          text: text || undefined,
          choiceId,
          conversationId,
          lang,
        })

        setConversationId(reply.conversationId)
        saveConversationId(reply.conversationId)
        joinConversation(reply.conversationId)

        if (
          reply.escalated ||
          reply.reason === "claimed" ||
          reply.reason === "already_escalated"
        ) {
          setEscalated(true)
        }
        if (reply.reason === "claimed") setClaimed(true)
        setOptions(reply.options ?? [])

        if (reply.escalated && reply.systemMessage) {
          appendMessage({
            id: reply.messageId || uid(),
            role: "system",
            text: reply.systemMessage,
          })
        } else if (reply.answer?.trim()) {
          appendMessage({
            id: reply.messageId || uid(),
            role: "assistant",
            text: reply.answer.trim(),
          })
        } else if (reply.reason === "already_escalated" && reply.systemMessage) {
          appendMessage({ id: uid(), role: "system", text: reply.systemMessage })
        }
      } catch (err) {
        // Give the customer their words and buttons back so nothing is lost.
        setDraft(text ?? "")
        setOptions(previousOptions)
        setBootError(err instanceof ApiError ? err.message : t("error"))
      } finally {
        setBusy(false)
      }
    },
    [appendMessage, busy, conversationId, lang, options, t],
  )

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void send({ text: draft })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void send({ text: draft })
    }
  }

  const handleResetChat = () => {
    saveConversationId(null)
    setConversationId(null)
    setMessages([])
    setOptions([])
    setEscalated(false)
    setClaimed(false)
    setBooted(false)
    setBootError(null)
    setDraft("")
    seenIdsRef.current.clear()
    setUnread(0)
    disconnectCustomerSocket()
  }

  const handleChangeIdentity = () => {
    clearIdentity()
    saveConversationId(null)
    setConversationId(null)
    setIdentified(false)
    setBooted(false)
    setMessages([])
    setOptions([])
    setEscalated(false)
    setClaimed(false)
    setBootError(null)
    setDraft("")
    seenIdsRef.current.clear()
    setUnread(0)
    disconnectCustomerSocket()
  }

  const whoLabel = (role: Role) => {
    if (role === "user") return t("you")
    if (role === "system") return t("system")
    if (role === "admin") return t("agent")
    return t("assistant")
  }

  const canSubmitIdentity =
    identity.name.trim() && identity.phone.trim()

  const COMPACT_TOPICS = 6
  const topics = options.filter((o) => !o.href)
  const compactMenu = messages.length > 2 && !moreTopics && topics.length > COMPACT_TOPICS
  const visibleTopics = compactMenu ? topics.slice(0, COMPACT_TOPICS) : topics
  const hiddenCount = topics.length - COMPACT_TOPICS

  const statusLabel = claimed
    ? t("claimed")
    : escalated
      ? t("escalated")
      : t("subtitle")

  const handleSheetDragEnd = (
    _: unknown,
    info: { offset: { y: number }; velocity: { y: number } },
  ) => {
    const projected = info.offset.y + project(info.velocity.y)
    if (projected > 110 || info.velocity.y > 700) onClose()
  }

  return (
    <AnimatePresence>
      {open ? (
    <motion.div
      key="chat-panel"
      className="chat-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      dir={locale === "ar" ? "rtl" : "ltr"}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
      transition={SPRING_SHEET}
      drag={reducedMotion ? false : "y"}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.06, bottom: 0.5 }}
      onDragEnd={handleSheetDragEnd}
    >
      <header
        className="chat-panel__header"
        onPointerDown={(event) => {
          if (reducedMotion) return
          // Don't steal taps on close / reset.
          if ((event.target as HTMLElement).closest("button")) return
          dragControls.start(event)
        }}
      >
        <div className="chat-panel__heading">
          <div className="chat-panel__title-row">
            <RobotAvatar className="chat-panel__avatar" />
            <span className="chat-panel__live" aria-hidden />
            <h2 id={titleId}>{t("title")}</h2>
          </div>
          {identified ? (
            <p>
              {statusLabel}
              {" · "}
              <button
                type="button"
                className="chat-panel__inline"
                onClick={handleChangeIdentity}
              >
                {t("identityChange")}
              </button>
            </p>
          ) : null}
        </div>
        <div className="chat-panel__actions">
          {identified ? (
            <button
              type="button"
              className="chat-panel__ghost"
              onClick={handleResetChat}
            >
              {t("reset")}
            </button>
          ) : null}
          <button
            type="button"
            className="chat-panel__close"
            aria-label={t("close")}
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>

      {!identified ? (
        <form
          className="chat-panel__identity"
          onSubmit={(e) => void handleIdentitySubmit(e)}
        >
          <h3>{t("identityTitle")}</h3>
          <p>{t("identityLead")}</p>
          <label>
            <span>{t("identityName")}</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              value={identity.name}
              placeholder={t("identityNamePh")}
              onChange={(e) =>
                setIdentity((s) => ({ ...s, name: e.target.value }))
              }
            />
          </label>
          <label>
            <span>{t("identityPhone")}</span>
            <input
              type="tel"
              name="phone"
              dir="ltr"
              autoComplete="tel"
              inputMode="tel"
              required
              value={identity.phone}
              placeholder={t("identityPhonePh")}
              onChange={(e) =>
                setIdentity((s) => ({ ...s, phone: e.target.value }))
              }
            />
          </label>
          {bootError ? <p className="chat-panel__error">{bootError}</p> : null}
          <button type="submit" disabled={busy || !canSubmitIdentity}>
            {busy ? t("identityStarting") : t("identityContinue")}
          </button>
        </form>
      ) : (
        <>
          <div
            className="chat-panel__messages"
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.length === 0 && !busy && !bootError ? (
              <p className="chat-panel__hint">{t("empty")}</p>
            ) : null}

            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`chat-bubble chat-bubble--${message.role}`}
                style={{ animationDelay: `${Math.min(index, 8) * 28}ms` }}
              >
                {message.role === "assistant" ? (
                  <RobotAvatar className="chat-bubble__avatar" />
                ) : null}
                <div className="chat-bubble__body">
                  <span className="chat-bubble__who">{whoLabel(message.role)}</span>
                  <p dir="auto">
                    <RichText text={message.text} />
                  </p>
                </div>
              </div>
            ))}

            {busy ? (
              <div className="chat-typing" role="status" aria-label={t("typing")}>
                <span />
                <span />
                <span />
              </div>
            ) : null}
            {bootError ? <p className="chat-panel__error">{bootError}</p> : null}
          </div>

          {options.length > 0 && !escalated ? (
            <div className="chat-panel__options">
              {options
                .filter((o) => o.href)
                .map((option, i) => (
                  <Link
                    key={option.id}
                    href={option.href!}
                    className="chat-panel__option-link"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={onClose}
                  >
                    {option.label} →
                  </Link>
                ))}
              {visibleTopics.map((option, i) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={busy}
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() =>
                    void send({ choiceId: option.id, label: option.label })
                  }
                >
                  {option.label}
                </button>
              ))}
              {topics.length > COMPACT_TOPICS && messages.length > 2 ? (
                <button
                  type="button"
                  className="chat-panel__more"
                  aria-expanded={moreTopics}
                  onClick={() => setMoreTopics((v) => !v)}
                >
                  {moreTopics ? t("fewerTopics") : `${t("moreTopics")} (${hiddenCount})`}
                </button>
              ) : null}
            </div>
          ) : null}
          <form className="chat-panel__composer" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              rows={2}
              dir="auto"
              maxLength={1000}
              value={draft}
              disabled={busy || !conversationId}
              placeholder={t("placeholder")}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              disabled={busy || !draft.trim() || !conversationId}
            >
              {t("send")}
            </button>
          </form>
        </>
      )}
    </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
