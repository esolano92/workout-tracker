import { useEffect, useMemo, useRef, useState } from 'react'
import { formatClock } from '../format'
import { renderTargets } from '../targets'
import { beep, keepScreenOn, tone } from '../timer'
import type { Baseline, Day, SegmentKind } from '../types'

interface Step {
  seconds: number
  label: string
  kind: SegmentKind
  blockTitle: string
  round: number
  rounds: number
}

/** Flattens the starting block, plus any timed blocks that follow it, into one timeline. */
function buildSteps(day: Day, start: number): Step[] {
  const steps: Step[] = []
  for (const b of (day.blocks ?? []).slice(start)) {
    if (!b.segments) break
    const rounds = b.rounds ?? 1
    for (let r = 1; r <= rounds; r++) {
      for (const s of b.segments) steps.push({ ...s, blockTitle: b.title, round: r, rounds })
    }
    if (b.restAfter) {
      steps.push({ seconds: b.restAfter, label: 'Rest before the next part', kind: 'rest', blockTitle: b.title, round: rounds, rounds })
    }
  }
  return steps
}

interface Clock {
  idx: number
  /** Wall-clock end of the current step while running; null while paused. */
  endsAt: number | null
  pausedLeft: number
}

const kindLabel: Record<SegmentKind, string> = { work: 'Work', easy: 'Easy', rest: 'Rest' }

export function IntervalTimer({
  day,
  startBlock,
  baseline,
  onClose,
}: {
  day: Day
  startBlock: number
  baseline: Baseline
  onClose: () => void
}) {
  const steps = useMemo(() => buildSteps(day, startBlock), [day, startBlock])
  const [clock, setClock] = useState<Clock>({ idx: 0, endsAt: null, pausedLeft: steps[0].seconds * 1000 })
  const clockRef = useRef(clock)
  const [now, setNow] = useState(() => Date.now())
  const lastBeep = useRef<number | null>(null)

  const update = (next: Clock) => {
    clockRef.current = next
    setClock(next)
  }

  const { idx, endsAt, pausedLeft } = clock
  const running = endsAt !== null
  const finished = idx >= steps.length
  const step = steps[Math.min(idx, steps.length - 1)]
  const leftMs = finished ? 0 : endsAt !== null ? Math.max(0, endsAt - now) : pausedLeft
  const left = Math.ceil(leftMs / 1000)

  useEffect(() => keepScreenOn(), [])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const t = Date.now()
      const c = clockRef.current
      setNow(t)
      if (c.endsAt === null) return
      const secsLeft = Math.ceil((c.endsAt - t) / 1000)
      if (secsLeft <= 3 && secsLeft > 0 && lastBeep.current !== secsLeft) {
        lastBeep.current = secsLeft
        tone(660, 0.15)
      }
      if (t >= c.endsAt) {
        const next = c.idx + 1
        beep()
        lastBeep.current = null
        update({
          idx: next,
          endsAt: next < steps.length ? c.endsAt + steps[next].seconds * 1000 : null,
          pausedLeft: 0,
        })
      }
    }, 100)
    return () => clearInterval(id)
  }, [running, steps])

  const toggle = () => {
    const t = Date.now()
    setNow(t)
    if (endsAt !== null) update({ ...clock, endsAt: null, pausedLeft: Math.max(0, endsAt - t) })
    else update({ ...clock, endsAt: t + pausedLeft })
  }

  const skip = () => {
    const next = idx + 1
    lastBeep.current = null
    if (next >= steps.length) return update({ idx: next, endsAt: null, pausedLeft: 0 })
    const ms = steps[next].seconds * 1000
    const t = Date.now()
    setNow(t)
    update({ idx: next, endsAt: running ? t + ms : null, pausedLeft: ms })
  }

  const totalLeft = finished
    ? 0
    : left + steps.slice(idx + 1).reduce((sum, s) => sum + s.seconds, 0)
  const upNext = steps[idx + 1]

  return (
    <div className={`interval-timer ${finished ? 'finished' : step.kind}`}>
      <div className="it-top">
        <button className="btn ghost small" onClick={onClose}>✕ Close</button>
        <span>{formatClock(totalLeft)} left</span>
      </div>

      {finished ? (
        <div className="it-main">
          <p className="it-kind">Done</p>
          <p className="it-label">Nice work. Log your results below.</p>
          <button className="btn" onClick={onClose}>Back to workout</button>
        </div>
      ) : (
        <>
          <div className="it-main">
            <p className="it-block">{step.blockTitle}{step.rounds > 1 && ` · Round ${step.round} of ${step.rounds}`}</p>
            <p className="it-kind">{kindLabel[step.kind]}</p>
            <p className="it-clock">{formatClock(left)}</p>
            <p className="it-label">{renderTargets(step.label, baseline)}</p>
          </div>
          <div className="it-bottom">
            {upNext && (
              <p className="it-next">
                Next: {kindLabel[upNext.kind]} {formatClock(upNext.seconds)}
                {upNext.label !== kindLabel[upNext.kind] && ` · ${renderTargets(upNext.label, baseline)}`}
              </p>
            )}
            <div className="row">
              <button className="btn big" onClick={toggle}>
                {running ? 'Pause' : idx === 0 && pausedLeft === steps[0].seconds * 1000 ? 'Start' : 'Resume'}
              </button>
              <button className="btn ghost" onClick={skip}>Skip ›</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
