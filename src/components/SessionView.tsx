import { useEffect, useState } from 'react'
import { dayLabel, formatDuration, formatRest, formatSet, formatTarget, valueUnit, weekLabel } from '../format'
import { getProgram } from '../programs'
import { actions, lastPerformance, useAppState } from '../store'
import { restTimer } from '../timer'
import type { Day, Exercise, LogField, Session, SetEntry, Unit } from '../types'
import { BlockList, CircuitBanner } from './DayContent'
import { IntervalTimer } from './IntervalTimer'

const resultLabels: Record<LogField, { label: string; placeholder: string; numeric: boolean }> = {
  cal: { label: 'Total calories', placeholder: 'e.g. 180', numeric: true },
  rpm: { label: 'Average RPM', placeholder: 'e.g. 68', numeric: true },
  time: { label: 'Time', placeholder: 'e.g. 12:30', numeric: false },
}

export function SessionView({ session, onClose }: { session: Session; onClose: () => void }) {
  const state = useAppState()
  const program = getProgram(session.programId)
  const day = program.weeks[session.week].days[session.day]
  const [timerBlock, setTimerBlock] = useState<number | null>(null)
  const elapsed = useElapsed(session.startedAt)

  const finish = () => {
    restTimer.stop()
    actions.finishSession(session.id)
    onClose()
  }
  const discard = () => {
    if (!confirm('Discard this workout? Nothing will be saved.')) return
    restTimer.stop()
    actions.discardSession(session.id)
    onClose()
  }

  return (
    <main className="page session">
      <header className="session-head">
        <button className="btn ghost small" onClick={onClose}>‹ Back</button>
        <span className="muted">{formatDuration(elapsed)}</span>
      </header>
      <p className="eyebrow">
        {program.name} · {weekLabel(program.weeks[session.week], session.week)} · {dayLabel(day, session.day)}
      </p>
      <h1>{day.title}</h1>
      {day.video && (
        <p><a href={day.video} target="_blank" rel="noreferrer">▶ Watch the demo video</a></p>
      )}

      {day.kind === 'strength' &&
        day.exercises.map((e, i) => (
          <StrengthExercise key={e.id} session={session} exercise={e} exIdx={i} unit={state.settings.unit} />
        ))}

      {day.kind === 'circuit' && <CircuitLog session={session} day={day} unit={state.settings.unit} />}

      {(day.kind === 'cardio' || day.kind === 'test') && (
        <>
          {day.goal && <p className="muted">{day.goal}</p>}
          <BlockList day={day} baseline={state.baseline} onStartTimer={setTimerBlock} />
          <section className="card">
            <h3>Results</h3>
            <div className="field-row">
              {(day.log ?? []).map((field) => (
                <label key={field}>
                  {resultLabels[field].label}
                  <input
                    inputMode={resultLabels[field].numeric ? 'numeric' : 'text'}
                    placeholder={resultLabels[field].placeholder}
                    value={session.results?.[field] ?? ''}
                    onChange={(ev) => actions.setResult(session.id, field, ev.target.value)}
                  />
                </label>
              ))}
            </div>
            {day.kind === 'test' && (
              <p className="muted small">Finishing this test updates your baseline, so every target in the program uses your new numbers.</p>
            )}
          </section>
        </>
      )}

      <section className="card">
        <label>
          Notes
          <textarea
            rows={3}
            placeholder="How did it feel? Anything to change next time?"
            value={session.note ?? ''}
            onChange={(ev) => actions.setNote(session.id, ev.target.value)}
          />
        </label>
      </section>

      <div className="row session-actions">
        <button className="btn" onClick={finish}>Finish workout</button>
        <button className="btn ghost danger" onClick={discard}>Discard</button>
      </div>

      {timerBlock !== null && (
        <IntervalTimer day={day} startBlock={timerBlock} baseline={state.baseline} onClose={() => setTimerBlock(null)} />
      )}
    </main>
  )
}

function useElapsed(since: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now - since
}

/** Suggested values for a set: the previous set this session, otherwise the same set last time. */
function suggestion(sets: SetEntry[], setIdx: number, last?: SetEntry[]): SetEntry | undefined {
  const prev = sets[setIdx - 1]
  if (prev && (prev.weight || prev.value)) return prev
  return last?.[setIdx] ?? last?.[last.length - 1]
}

function SetRow({
  label,
  set,
  hint,
  exercise,
  unit,
  onChange,
  onDone,
}: {
  label: string
  set: SetEntry
  hint?: SetEntry
  exercise: Exercise
  unit: Unit
  onChange: (patch: Partial<SetEntry>) => void
  onDone: () => void
}) {
  const toggle = () => {
    if (set.done) return onChange({ done: false })
    onChange({ done: true, weight: set.weight || hint?.weight || '', value: set.value || hint?.value || '' })
    onDone()
  }
  return (
    <div className={`set-row ${set.done ? 'done' : ''}`}>
      <span className="set-label">{label}</span>
      <label className="set-input">
        <input
          inputMode="decimal"
          placeholder={hint?.weight || '—'}
          value={set.weight}
          onChange={(ev) => onChange({ weight: ev.target.value })}
        />
        <span>{unit}</span>
      </label>
      <label className="set-input">
        <input
          inputMode="numeric"
          placeholder={hint?.value || exercise.target.match(/^[\d-]+/)?.[0] || ''}
          value={set.value}
          onChange={(ev) => onChange({ value: ev.target.value })}
        />
        <span>{valueUnit[exercise.measure]}</span>
      </label>
      <button className="set-check" onClick={toggle} aria-label="Mark set done">✓</button>
    </div>
  )
}

function LastTime({ exercise, last, unit }: { exercise: Exercise; last?: SetEntry[]; unit: Unit }) {
  if (!last) return null
  return (
    <p className="last-time">
      Last time: {last.map((s) => formatSet(s, exercise.measure, unit)).join(', ')}
    </p>
  )
}

function StrengthExercise({
  session,
  exercise,
  exIdx,
  unit,
}: {
  session: Session
  exercise: Exercise
  exIdx: number
  unit: Unit
}) {
  const state = useAppState()
  const sets = session.sets[exIdx] ?? []
  const last = lastPerformance(state, exercise.name, session.id)
  const [showNotes, setShowNotes] = useState(false)

  return (
    <section className="card exercise">
      <div className="ex-name">
        {exercise.group && <span className="badge">{exercise.group}</span>}
        {exercise.name}
      </div>
      <div className="ex-meta">
        {formatTarget(exercise, false)}
        {exercise.rest && <> · Rest {formatRest(exercise.rest)}</>}
        {exercise.rpe && <> · RPE {exercise.rpe}</>}
      </div>
      {exercise.notes && (
        <button className="link small" onClick={() => setShowNotes(!showNotes)}>
          {showNotes ? 'Hide how-to' : 'How to do it'}
        </button>
      )}
      {showNotes && <p className="ex-notes">{exercise.notes}</p>}
      <LastTime exercise={exercise} last={last} unit={unit} />

      {sets.map((set, i) => (
        <SetRow
          key={i}
          label={`${i + 1}`}
          set={set}
          hint={suggestion(sets, i, last)}
          exercise={exercise}
          unit={unit}
          onChange={(patch) => actions.updateSet(session.id, exIdx, i, patch)}
          onDone={() => exercise.restSec && restTimer.start(exercise.restSec, `Rest · ${exercise.name}`)}
        />
      ))}
      <div className="row">
        <button className="btn ghost small" onClick={() => actions.addSet(session.id, exIdx)}>+ Set</button>
        {sets.length > 0 && (
          <button className="btn ghost small" onClick={() => actions.removeSet(session.id, exIdx)}>− Set</button>
        )}
      </div>
    </section>
  )
}

function CircuitLog({ session, day, unit }: { session: Session; day: Day; unit: Unit }) {
  const state = useAppState()
  const rounds = Math.max(...day.exercises.map((_, i) => session.sets[i]?.length ?? 0))
  const lasts = day.exercises.map((e) => lastPerformance(state, e.name, session.id))

  return (
    <>
      <CircuitBanner day={day} />
      <section className="card">
        {day.exercises.map((e, i) => (
          <div key={e.id} className="circuit-ex">
            <div className="ex-name">{e.name} <span className="muted">· {e.target}</span></div>
            {e.notes && <div className="ex-notes">{e.notes}</div>}
            <LastTime exercise={e} last={lasts[i]} unit={unit} />
          </div>
        ))}
      </section>
      {Array.from({ length: rounds }, (_, r) => (
        <section key={r} className="card">
          <h3>Round {r + 1}</h3>
          {day.exercises.map((e, i) => {
            const sets = session.sets[i] ?? []
            const set = sets[r]
            if (!set) return null
            const isLast = i === day.exercises.length - 1
            return (
              <SetRow
                key={e.id}
                label={e.name}
                set={set}
                hint={suggestion(sets, r, lasts[i])}
                exercise={e}
                unit={unit}
                onChange={(patch) => actions.updateSet(session.id, i, r, patch)}
                onDone={() => {
                  if (e.restSec) restTimer.start(e.restSec, `Rest · ${e.name}`)
                  else if (isLast && day.roundRestSec && r < rounds - 1) {
                    restTimer.start(day.roundRestSec, `Rest before round ${r + 2}`)
                  }
                }}
              />
            )
          })}
        </section>
      ))}
      <div className="row">
        <button className="btn ghost small" onClick={() => day.exercises.forEach((_, i) => actions.addSet(session.id, i))}>
          + Round
        </button>
      </div>
    </>
  )
}
