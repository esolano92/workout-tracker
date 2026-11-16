import { blockDuration, formatClock, formatRest, formatTarget } from '../format'
import { renderTargets } from '../targets'
import type { Baseline, Day } from '../types'

export function CircuitBanner({ day }: { day: Day }) {
  return (
    <div className="banner">
      <strong>{day.exercises[0]?.sets} rounds.</strong> Do the exercises back to back with no rest. Rest{' '}
      {day.roundRest ? formatRest(day.roundRest) : ''} after the last exercise, then start the next round.
      {day.rpe && <> Target effort: RPE {day.rpe}.</>}
    </div>
  )
}

export function BlockList({
  day,
  baseline,
  onStartTimer,
}: {
  day: Day
  baseline: Baseline
  onStartTimer?: (blockIdx: number) => void
}) {
  return (
    <div className="blocks">
      {day.blocks?.map((b, i) => (
        <section key={i} className="card block">
          <div className="block-head">
            <h3>{b.title}</h3>
            {b.segments && <span className="muted">{formatClock(blockDuration(b))}</span>}
          </div>
          <ul>
            {b.lines.map((line, j) => (
              <li key={j}>{renderTargets(line, baseline)}</li>
            ))}
          </ul>
          {b.segments && onStartTimer && (
            <button className="btn secondary small" onClick={() => onStartTimer(i)}>
              ▶ Start interval timer
            </button>
          )}
        </section>
      ))}
    </div>
  )
}

export function DayContent({ day, baseline }: { day: Day; baseline: Baseline }) {
  if (day.kind === 'rest') {
    return <p className="muted">Rest day. Recover, stretch, walk, sleep well.</p>
  }

  if (day.kind === 'cardio' || day.kind === 'test') {
    return (
      <>
        {day.goal && <p className="muted">{day.goal}</p>}
        <BlockList day={day} baseline={baseline} />
      </>
    )
  }

  const circuit = day.kind === 'circuit'
  return (
    <>
      {circuit && <CircuitBanner day={day} />}
      <ol className="exercise-list">
        {day.exercises.map((e) => (
          <li key={e.id}>
            <div className="ex-name">
              {e.group && <span className="badge">{e.group}</span>}
              {e.name}
            </div>
            <div className="ex-meta">
              {formatTarget(e, circuit)}
              {e.rest && <> · Rest {formatRest(e.rest)}</>}
              {e.rpe && <> · RPE {e.rpe}</>}
            </div>
            {e.notes && <div className="ex-notes">{e.notes}</div>}
          </li>
        ))}
      </ol>
    </>
  )
}
