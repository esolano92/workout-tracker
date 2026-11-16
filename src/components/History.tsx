import { useState } from 'react'
import { dayLabel, formatDate, formatDuration, formatSet, plural, weekLabel } from '../format'
import { getProgram } from '../programs'
import { actions, finishedSessions, useAppState } from '../store'
import type { LogField, Session, Unit } from '../types'

const resultNames: Record<LogField, string> = { cal: 'cal', rpm: 'avg rpm', time: 'time' }

export function History() {
  const state = useAppState()
  const sessions = finishedSessions(state).filter((s) => {
    const day = getProgram(s.programId).weeks[s.week]?.days[s.day]
    return day && day.kind !== 'rest' && !s.skipped
  })

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">{plural(sessions.length, 'workout')} logged</p>
        <h1>History</h1>
      </header>
      {sessions.length === 0 && <p className="muted">Finished workouts will show up here.</p>}
      {sessions.map((s) => (
        <HistoryItem key={s.id} session={s} unit={state.settings.unit} />
      ))}
    </>
  )
}

function HistoryItem({ session, unit }: { session: Session; unit: Unit }) {
  const [open, setOpen] = useState(false)
  const program = getProgram(session.programId)
  const day = program.weeks[session.week].days[session.day]
  const setsDone = Object.values(session.sets).flat().filter((x) => x.done).length
  const results = Object.entries(session.results ?? {}).filter(([, v]) => v) as [LogField, string][]

  return (
    <section className="card history-item">
      <button className="history-head" onClick={() => setOpen(!open)}>
        <div>
          <p className="eyebrow">
            {formatDate(session.finishedAt!)} · {program.name}
          </p>
          <h3>{day.title}</h3>
          <p className="muted small">
            {weekLabel(program.weeks[session.week], session.week)} · {dayLabel(day, session.day)} ·{' '}
            {formatDuration(session.finishedAt! - session.startedAt)}
            {setsDone > 0 && ` · ${plural(setsDone, 'set')}`}
            {results.map(([k, v]) => ` · ${v} ${resultNames[k]}`).join('')}
          </p>
        </div>
        <span className="muted">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="history-body">
          {day.exercises.map((e, i) => {
            const done = (session.sets[i] ?? []).filter((x) => x.done)
            if (!done.length) return null
            return (
              <p key={e.id}>
                <strong>{e.name}:</strong> {done.map((x) => formatSet(x, e.measure, unit) || '✓').join(', ')}
              </p>
            )
          })}
          {session.note && <p className="muted">“{session.note}”</p>}
          <button
            className="btn ghost danger small"
            onClick={() => confirm('Delete this workout from your history?') && actions.discardSession(session.id)}
          >
            Delete
          </button>
        </div>
      )}
    </section>
  )
}
