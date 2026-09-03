import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Module-scoped "already played" registry, keyed by the `id` prop.
 *
 * Lifetime semantics (matches what the user asked for):
 *   - Plays on first page load.
 *   - Plays on full refresh (F5 / hard reload) — the module re-imports and
 *     this Set is re-created empty.
 *   - Does NOT replay during in-app SPA navigation (Home → Services → Home)
 *     because the module stays loaded and the id stays in the Set.
 */
const PLAYED_IDS = new Set()

/**
 * TypingHeadline — premium typewriter effect for hero headings.
 *
 * Why this implementation?
 *  • Multi-segment input keeps the gradient highlight aligned with the rest
 *    of the title as it types in (no flash of un-styled text).
 *  • A "phantom" copy of the full heading reserves the final layout footprint
 *    so the page never reflows while typing, on any breakpoint.
 *  • The visible text is overlaid on top, growing left-to-right; the cursor
 *    is rendered inline at the END of the visible text so it tracks each
 *    keystroke like a real terminal — not stuck at the right edge.
 *  • Variable per-character delay (random ±20% jitter + longer pauses on
 *    punctuation / shorter pauses at spaces) for a hand-typed cadence.
 *  • Respects `prefers-reduced-motion` — instantly reveals the full text
 *    with the cursor at idle blink.
 *  • `playOnce` + `id` — the animation runs only once per page load (or
 *    refresh) and shows the full text instantly on subsequent SPA mounts.
 *  • Accessible: `aria-label` on the heading exposes the full text to
 *    screen readers, every char span is `aria-hidden`.
 *  • Performance: a single `setTimeout` chain. Once typing completes the
 *    only remaining animation is the CSS-only cursor blink.
 */
export function TypingHeadline({
  segments,
  speedMs = 55,
  startDelayMs = 200,
  className = '',
  cursorClassName = '',
  as: Tag = 'h1',
  loop = false,
  pauseAfterMs = 2200,
  playOnce = false,
  id,
}) {
  const fullText = useMemo(
    () => segments.map((s) => s.text || '').join(''),
    [segments]
  )

  // Flat per-character map so we can slice the visible text per segment
  // without losing each segment's className.
  const flatChars = useMemo(() => {
    const out = []
    segments.forEach((seg, segIdx) => {
      const text = seg.text || ''
      for (let i = 0; i < text.length; i += 1) {
        out.push({ ch: text[i], segIdx })
      }
    })
    return out
  }, [segments])

  const totalChars = flatChars.length

  // When `playOnce` is true and this id has already animated in the current
  // page lifetime, mount with the heading already complete so SPA route
  // changes don't replay the effect.
  const alreadyPlayed = playOnce && id != null && PLAYED_IDS.has(id)
  const [count, setCount] = useState(alreadyPlayed ? totalChars : 0)
  const [done, setDone] = useState(alreadyPlayed)
  const timerRef = useRef(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false

    // Skip the timer entirely on subsequent SPA mounts.
    if (alreadyPlayed) {
      return undefined
    }

    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      setCount(totalChars)
      setDone(true)
      if (playOnce && id != null) PLAYED_IDS.add(id)
      return undefined
    }

    const clear = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const delayFor = (ch) => {
      if (ch === '.' || ch === '!' || ch === '?') return speedMs * 4
      if (ch === ',' || ch === ':' || ch === ';') return speedMs * 2.4
      if (ch === ' ') return speedMs * 0.55
      return speedMs * (0.85 + Math.random() * 0.3)
    }

    const advance = (i) => {
      if (cancelledRef.current) return
      if (i > totalChars) return
      setCount(i)
      if (i === totalChars) {
        setDone(true)
        if (playOnce && id != null) PLAYED_IDS.add(id)
        if (loop && totalChars > 0) {
          timerRef.current = setTimeout(() => {
            if (cancelledRef.current) return
            setDone(false)
            setCount(0)
            timerRef.current = setTimeout(() => advance(1), 220)
          }, pauseAfterMs)
        }
        return
      }
      const ch = flatChars[i - 1]?.ch || ''
      timerRef.current = setTimeout(() => advance(i + 1), delayFor(ch))
    }

    timerRef.current = setTimeout(() => advance(1), startDelayMs)
    return () => {
      cancelledRef.current = true
      clear()
    }
  }, [flatChars, totalChars, speedMs, startDelayMs, loop, pauseAfterMs, alreadyPlayed, playOnce, id])

  // ----- Phantom (reserves the final layout footprint) -----
  const phantom = segments.map((seg, i) => (
    <span key={`p-${i}`} className={seg.className || ''}>
      {seg.text}
    </span>
  ))

  // ----- Visible overlay (grows left-to-right, ends with cursor) -----
  let remaining = count
  const visible = segments.map((seg, segIdx) => {
    const segLen = (seg.text || '').length
    if (remaining <= 0) {
      return <span key={`v-${segIdx}`} className={seg.className || ''} />
    }
    const take = Math.min(segLen, remaining)
    remaining -= segLen
    const slice = (seg.text || '').slice(0, take)
    return (
      <span key={`v-${segIdx}`} className={seg.className || ''}>
        {slice}
      </span>
    )
  })

  return (
    <Tag className={className} aria-label={fullText}>
      <span className="typing-headline">
        {/* Phantom — invisible, reserves the full footprint so the layout
            does not shift while typing. */}
        <span aria-hidden="true" className="typing-headline__phantom">
          {phantom}
        </span>
        {/* Visible overlay — grows with `count` and carries the cursor. */}
        <span aria-hidden="true" className="typing-headline__visible">
          {visible}
          <span
            data-state={done && !loop ? 'idle' : 'typing'}
            className={`typing-cursor ${cursorClassName}`}
          />
        </span>
      </span>
    </Tag>
  )
}

export default TypingHeadline
