import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgePercent, Sparkles, X, ArrowRight, Gift } from 'lucide-react'

/**
 * HeroOffersPopups
 * ---
 * Three independent, dismissible promotional surfaces overlaid on the
 * home hero — each governed by its own sessionStorage key so dismissals
 * survive SPA navigation but reappear on a fresh page load.
 *
 *  • Left rail mini-banner   — "Save €250" perma-attention
 *  • Right rail mini-banner  — "Pay only €50 to start"
 *  • Centre modal             — appears 6s after page load, larger CTA
 *
 * Z-indexes: 40 → below the navbar (z-50) but above the hero (z-10).
 *
 * The component renders nothing if all three have been dismissed.
 */

const SS_LEFT = 'sb_hero_offer_left_dismissed'
const SS_RIGHT = 'sb_hero_offer_right_dismissed'
const SS_MODAL = 'sb_hero_offer_modal_dismissed'

const safeRead = (key) => {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}
const safeWrite = (key) => {
  try {
    sessionStorage.setItem(key, '1')
  } catch {
    /* swallow privacy-mode errors */
  }
}

const HeroOffersPopups = () => {
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Side banners fade in shortly after mount; modal waits ~6 seconds.
  useEffect(() => {
    const leftDismissed = safeRead(SS_LEFT)
    const rightDismissed = safeRead(SS_RIGHT)
    const modalDismissed = safeRead(SS_MODAL)

    const leftTimer = setTimeout(() => {
      if (!leftDismissed) setShowLeft(true)
    }, 1200)
    const rightTimer = setTimeout(() => {
      if (!rightDismissed) setShowRight(true)
    }, 1800)
    const modalTimer = setTimeout(() => {
      if (!modalDismissed) setShowModal(true)
    }, 6000)

    return () => {
      clearTimeout(leftTimer)
      clearTimeout(rightTimer)
      clearTimeout(modalTimer)
    }
  }, [])

  // Close the modal on Escape — small UX nicety.
  useEffect(() => {
    if (!showModal) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        safeWrite(SS_MODAL)
        setShowModal(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showModal])

  const dismissLeft = () => {
    safeWrite(SS_LEFT)
    setShowLeft(false)
  }
  const dismissRight = () => {
    safeWrite(SS_RIGHT)
    setShowRight(false)
  }
  const dismissModal = () => {
    safeWrite(SS_MODAL)
    setShowModal(false)
  }

  return (
    <>
      {/* LEFT RAIL */}
      <AnimatePresence>
        {showLeft && (
          <motion.aside
            key="left-banner"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-3 top-32 z-40 hidden w-[260px] rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/[0.06] to-white/[0.04] p-4 shadow-sb-card backdrop-blur-xl md:block lg:left-6 lg:top-36"
          >
            <button
              type="button"
              onClick={dismissLeft}
              aria-label="Dismiss offer"
              className="absolute right-2 top-2 rounded-lg border border-white/10 bg-black/30 p-1 text-white/70 transition hover:bg-black/50 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-100">
              <BadgePercent className="h-3 w-3" /> Save €250
            </span>
            <p className="mt-3 text-sm font-extrabold leading-tight text-white">
              Launch offer · <span className="text-emerald-200">€650</span>{' '}
              <span className="text-white/55 line-through">€900</span>
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-white/75">
              Full Germany consultancy package for the Winter 2026 cohort.
            </p>
            <Link
              to="/payments"
              className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-sb-glow transition hover:scale-[1.02]"
            >
              See pricing <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* RIGHT RAIL */}
      <AnimatePresence>
        {showRight && (
          <motion.aside
            key="right-banner"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-3 top-32 z-40 hidden w-[260px] rounded-2xl border border-sb-accent/30 bg-gradient-to-br from-sb-accent/20 via-sb-accent/[0.07] to-white/[0.04] p-4 shadow-sb-card backdrop-blur-xl md:block lg:right-6 lg:top-36"
          >
            <button
              type="button"
              onClick={dismissRight}
              aria-label="Dismiss offer"
              className="absolute right-2 top-2 rounded-lg border border-white/10 bg-black/30 p-1 text-white/70 transition hover:bg-black/50 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sb-accent/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-sb-glow">
              <Sparkles className="h-3 w-3" /> Pay only €50
            </span>
            <p className="mt-3 text-sm font-extrabold leading-tight text-white">
              Start with just €50 confirmation
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-white/75">
              Remaining €600 charged <em className="not-italic text-emerald-200">only after</em>{' '}
              admission is confirmed.
            </p>
            <Link
              to="/student/login?mode=signup"
              className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white transition hover:bg-white/15"
            >
              Get started <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* DELAYED CENTRE MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="centre-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 px-4 pb-8 sm:items-center sm:pb-0"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-400/40 bg-sb-deep p-7 shadow-2xl"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-sb-accent/30 blur-3xl" />

              <button
                type="button"
                onClick={dismissModal}
                aria-label="Dismiss offer"
                className="absolute right-3 top-3 rounded-lg border border-white/10 bg-black/40 p-1.5 text-white/70 transition hover:bg-black/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2 shadow-sb-glow">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-100">
                    Limited cohort offer
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-extrabold leading-tight text-white">
                  Winter 2026 launch deal: <span className="gradient-text">€650 instead of €900</span>
                </h3>
                <p className="mt-2 text-sm text-sb-muted">
                  Lock your seat with a refundable <strong className="text-white">€50</strong> fee
                  today. The remaining <strong className="text-white">€600</strong> is collected only
                  after your admission is confirmed.
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Link
                    to="/student/login?mode=signup"
                    onClick={dismissModal}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sb-glow transition hover:scale-[1.02]"
                  >
                    Claim €50 confirmation
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/payments"
                    onClick={dismissModal}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    See pricing
                  </Link>
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-widest text-white/55">
                  Manual admin verification · Refundable confirmation fee
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default HeroOffersPopups
