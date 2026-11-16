import { useState } from 'react'
import { dayLabel, weekLabel } from '../format'
import { getProgram, programs } from '../programs'
import { actions, getProgress, isDayDone, useAppState } from '../store'
import { DayActions } from './DayActions'
import { DayContent } from './DayContent'

export function ProgramView({ onOpenSession }: { onOpenSession: () => void }) {
  const state = useAppState()
  const program = getProgram(state.activeProgramId)
  const progress = getProgress(state, program.id)
  const [open, setOpen] = useState<string | null>(null)

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Program</p>
        <h1>{program.name}</h1>
      </header>

      <div className="program-picker">
        {programs.map((p) => (
          <button
            key={p.id}
            className={p.id === program.id ? 'active' : ''}
            onClick={() => {
              actions.setActiveProgram(p.id)
              setOpen(null)
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <section className="card">
        {program.author && <p className="eyebrow">by {program.author}</p>}
        <p>{program.summary}</p>
        {program.equipment && <p className="muted"><strong>Equipment:</strong> {program.equipment}</p>}
        <details>
          <summary>How this program works</summary>
          <ul>{program.guidelines.map((g, i) => <li key={i}>{g}</li>)}</ul>
        </details>
        <details>
          <summary>Terms</summary>
          <dl className="glossary">
            {program.glossary.map((g) => (
              <div key={g.term}><dt>{g.term}</dt><dd>{g.meaning}</dd></div>
            ))}
          </dl>
        </details>
      </section>

      {program.weeks.map((w, wi) => (
        <section key={wi} className="week">
          <h3 className="week-title">{weekLabel(w, wi)}</h3>
          {w.days.map((d, di) => {
            const done = isDayDone(state, program.id, wi, di)
            const isNext = progress.week === wi && progress.day === di
            const expanded = open === d.id
            return (
              <div key={d.id} className={`day-row ${d.kind === 'rest' ? 'rest' : ''}`}>
                <button className="day-row-head" onClick={() => setOpen(expanded ? null : d.id)}>
                  <span className={`check ${done ? 'done' : ''}`}>{done ? '✓' : ''}</span>
                  <span className="day-row-text">
                    <span className="muted small">{dayLabel(d, di)}{d.optional && ' · Optional'}</span>
                    <span>{d.title}</span>
                  </span>
                  {isNext && <span className="badge">Next</span>}
                </button>
                {expanded && (
                  <div className="day-row-body">
                    <DayContent day={d} baseline={state.baseline} />
                    {d.video && (
                      <p><a href={d.video} target="_blank" rel="noreferrer">▶ Watch the demo video</a></p>
                    )}
                    <DayActions programId={program.id} week={wi} dayIdx={di} day={d} onOpenSession={onOpenSession} />
                    {!isNext && (
                      <button className="btn ghost small" onClick={() => actions.setProgress(program.id, wi, di)}>
                        Make this my next workout
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </section>
      ))}
    </>
  )
}
