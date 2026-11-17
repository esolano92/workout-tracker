import { useState } from 'react'
import { shortDate, toKey } from '../dates'
import { dayLabel, formatDate, formatDuration, plural, weekLabel } from '../format'
import { getProgram } from '../programs'
import { actions, finishedSessions, useAppState } from '../store'
import type { Point } from '../trends'
import type { LogField, Measure, Session, SetEntry, Unit } from '../types'
import {
  bestSet,
  doneSets,
  exerciseHistories,
  formatSeconds,
  num,
  sessionTiming,
  timingOf,
  topWeight,
  volume,
  type ExerciseHistory,
} from '../workoutStats'
import { LineChart } from './Charts'
import { Icon } from './Icon'

const resultNames: Record<LogField, string> = { cal: 'Calories', rpm: 'Avg RPM', time: 'Time' }
const ROWS = 6

type View = 'exercises' | 'workouts'

export function History() {
  const state = useAppState()
  const [view, setView] = useState<View>('exercises')
  const [query, setQuery] = useState('')
  const sessions = finishedSessions(state).filter((s) => {
    const day = getProgram(s.programId).weeks[s.week]?.days[s.day]
    return day && day.kind !== 'rest' && !s.skipped
  })
  const exercises = exerciseHistories(state)
  const shown = exercises.filter((e) => e.name.toLowerCase().includes(query.trim().toLowerCase()))
  const unit = state.settings.unit

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">{plural(sessions.length, 'workout')} logged</p>
        <h1>History</h1>
      </header>

      <div className="segmented">
        <button className={view === 'exercises' ? 'active' : ''} onClick={() => setView('exercises')}>
          By exercise
        </button>
        <button className={view === 'workouts' ? 'active' : ''} onClick={() => setView('workouts')}>
          By workout
        </button>
      </div>

      {view === 'exercises' && (
        <>
          {exercises.length === 0 && (
            <p className="muted empty">Check off sets during a workout and each exercise gets a table of the weights you used.</p>
          )}
          {exercises.length > 5 && (
            <input
              className="search"
              type="search"
              placeholder="Find an exercise"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          {shown.map((h) => (
            <ExerciseTable key={h.name} history={h} unit={unit} />
          ))}
          {exercises.length > 0 && shown.length === 0 && <p className="muted empty">No exercise matches “{query}”.</p>}
        </>
      )}

      {view === 'workouts' && (
        <>
          <PaceCard sessions={sessions} />
          {sessions.length === 0 && <p className="muted empty">Finished workouts will show up here.</p>}
          {sessions.map((s) => (
            <WorkoutCard key={s.id} session={s} unit={unit} />
          ))}
        </>
      )}
    </>
  )
}

function SetCell({ set, measure, best }: { set?: SetEntry; measure: Measure; best?: boolean }) {
  if (!set) return <td className="empty-cell">–</td>
  const value = set.value ? (measure === 'reps' ? set.value : `${set.value}${measure === 'time' ? 's' : 'yd'}`) : ''
  return (
    <td className={best ? 'best' : ''}>
      {set.weight ? (
        <>
          <strong>{set.weight}</strong>
          {value && <span>×{value}</span>}
        </>
      ) : (
        <strong>{value || '✓'}</strong>
      )}
    </td>
  )
}

function ExerciseTable({ history, unit }: { history: ExerciseHistory; unit: Unit }) {
  const [all, setAll] = useState(false)
  const { exercise, logs } = history
  const rows = all ? logs : logs.slice(0, ROWS)
  const cols = Math.max(...rows.map((l) => l.sets.length))
  const allSets = logs.flatMap((l) => l.sets)
  const best = bestSet(allSets)
  const bestW = topWeight(allSets)
  const first = topWeight(logs.at(-1)!.sets)
  const last = topWeight(logs[0].sets)
  const gain = first !== undefined && last !== undefined && logs.length > 1 ? last - first : undefined
  const hasTiming = logs.some((l) => timingOf(l.sets).avgSet !== undefined)
  const valueLabel = exercise.measure === 'reps' ? 'reps' : exercise.measure === 'time' ? 'sec' : 'yd'

  return (
    <section className="card ex-history">
      <div className="ex-history-head">
        <div>
          <h3>{history.name}</h3>
          <p className="muted small">
            {plural(logs.length, 'workout')}
            {best?.weight && ` · best ${best.weight} ${unit}${best.value ? ` × ${best.value}` : ''}`}
          </p>
        </div>
        {gain !== undefined && gain !== 0 && (
          <span className={`chip ${gain > 0 ? 'down' : 'up'}`}>
            {gain > 0 ? '▲' : '▼'} {Math.abs(gain)} {unit}
          </span>
        )}
      </div>
      <div className="table-wrap">
        <table className="log-table">
          <thead>
            <tr>
              <th className="sticky">Date</th>
              {Array.from({ length: cols }, (_, i) => (
                <th key={i}>Set {i + 1}</th>
              ))}
              {hasTiming && <th>Avg set</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((log, r) => {
              const top = topWeight(log.sets)
              const prevTop = logs[r + 1] ? topWeight(logs[r + 1].sets) : undefined
              const dir = top !== undefined && prevTop !== undefined ? Math.sign(top - prevTop) : 0
              const t = timingOf(log.sets)
              return (
                <tr key={log.session.id}>
                  <th className="sticky date-cell">
                    {shortDate(toKey(new Date(log.session.finishedAt!)))}
                    {dir !== 0 && <span className={dir > 0 ? 'trend-up' : 'trend-down'}>{dir > 0 ? '▲' : '▼'}</span>}
                  </th>
                  {Array.from({ length: cols }, (_, i) => {
                    const set = log.sets[i]
                    return (
                      <SetCell
                        key={i}
                        set={set}
                        measure={exercise.measure}
                        best={!!set && bestW !== undefined && num(set.weight) === bestW}
                      />
                    )
                  })}
                  {hasTiming && <td className="time-cell">{t.avgSet !== undefined ? formatSeconds(t.avgSet) : '–'}</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="table-foot">
        <span className="muted small">
          {unit} × {valueLabel} · <span className="best-key">highlighted</span> = your heaviest
        </span>
        {logs.length > ROWS && (
          <button className="link small" onClick={() => setAll(!all)}>
            {all ? 'Show less' : `Show all ${logs.length}`}
          </button>
        )}
      </div>
    </section>
  )
}

function PaceCard({ sessions }: { sessions: Session[] }) {
  const timed = sessions
    .map((s) => ({ s, t: sessionTiming(s) }))
    .filter(({ t }) => t.avgSet !== undefined || t.avgRest !== undefined)
    .slice(0, 30)
    .reverse()
  if (!timed.length) {
    return (
      <section className="card pace-card">
        <div className="metric-head">
          <span className="metric-icon pace"><Icon name="timer" size={18} /></span>
          <h3>Set pace</h3>
        </div>
        <p className="muted small">
          Check off sets as you go and use the rest timer. You'll see how long each set takes once the rest ends, and how
          your real rest compares to the plan.
        </p>
      </section>
    )
  }

  const byDay = new Map<string, number[]>()
  for (const { s, t } of timed) {
    if (t.avgRest === undefined) continue
    const key = toKey(new Date(s.finishedAt!))
    byDay.set(key, [...(byDay.get(key) ?? []), t.avgRest])
  }
  const restPts: Point[] = [...byDay].map(([key, xs]) => ({ key, value: xs.reduce((a, b) => a + b, 0) / xs.length }))
  const overall = timingOf(timed.flatMap(({ s }) => Object.values(s.sets).flatMap(doneSets)))
  const over = overall.avgRest !== undefined && overall.avgPlanned ? overall.avgRest - overall.avgPlanned : undefined

  return (
    <section className="card pace-card">
      <div className="metric-head">
        <span className="metric-icon pace"><Icon name="timer" size={18} /></span>
        <h3>Set pace</h3>
        <span className="muted small">last {plural(timed.length, 'workout')}</span>
      </div>
      <div className="pace-strip big">
        <div><strong>{overall.avgSet !== undefined ? formatSeconds(overall.avgSet) : '—'}</strong><span>avg set</span></div>
        <div><strong>{overall.avgRest !== undefined ? formatSeconds(overall.avgRest) : '—'}</strong><span>avg rest</span></div>
        <div>
          <strong className={over === undefined ? '' : over > 10 ? 'warn-text' : 'good-text'}>
            {over === undefined ? '—' : `${over > 0 ? '+' : over < 0 ? '−' : ''}${formatSeconds(Math.abs(over))}`}
          </strong>
          <span>vs planned rest</span>
        </div>
      </div>
      {restPts.length > 0 && (
        <LineChart
          points={restPts}
          connect
          goal={overall.avgPlanned}
          goalLabel="plan"
          color="var(--accent)"
          format={(v) => `${formatSeconds(v)} rest`}
          axisFormat={(v) => formatSeconds(v)}
          emptyText=""
        />
      )}
      <p className="muted small">
        Set time runs from the moment your rest ends to when you tap ✓. The chart shows your average rest per workout; the
        dashed line is what the plan calls for.
      </p>
    </section>
  )
}

function WorkoutCard({ session, unit }: { session: Session; unit: Unit }) {
  const [open, setOpen] = useState(false)
  const program = getProgram(session.programId)
  const day = program.weeks[session.week].days[session.day]
  const logged = day.exercises
    .map((e, i) => ({ e, sets: doneSets(session.sets[i]) }))
    .filter((x) => x.sets.length)
  const setsDone = logged.reduce((n, x) => n + x.sets.length, 0)
  const cols = Math.max(0, ...logged.map((x) => x.sets.length))
  const results = Object.entries(session.results ?? {}).filter(([, v]) => v) as [LogField, string][]
  const t = sessionTiming(session)
  const totalVolume = logged.reduce((n, x) => n + volume(x.sets), 0)

  return (
    <section className="card history-item">
      <button className="history-head" onClick={() => setOpen(!open)}>
        <div>
          <p className="eyebrow">{formatDate(session.finishedAt!)}</p>
          <h3>{day.title}</h3>
          <p className="muted small">
            {program.name} · {weekLabel(program.weeks[session.week], session.week)} · {dayLabel(day, session.day)}
          </p>
          <div className="history-chips">
            <span className="tag">{formatDuration(session.finishedAt! - session.startedAt)}</span>
            {setsDone > 0 && <span className="tag">{plural(setsDone, 'set')}</span>}
            {t.avgSet !== undefined && <span className="tag">{formatSeconds(t.avgSet)} / set</span>}
            {results.map(([k, v]) => (
              <span key={k} className="tag">{v} {k === 'time' ? '' : resultNames[k].toLowerCase()}</span>
            ))}
          </div>
        </div>
        <span className={`chevron ${open ? 'open' : ''}`}><Icon name="chevron" size={18} /></span>
      </button>
      {open && (
        <div className="history-body">
          {logged.length > 0 && (
            <div className="table-wrap">
              <table className="log-table">
                <thead>
                  <tr>
                    <th className="sticky">Exercise</th>
                    {Array.from({ length: cols }, (_, i) => (
                      <th key={i}>Set {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logged.map(({ e, sets }) => (
                    <tr key={e.id}>
                      <th className="sticky ex-cell">{e.name}</th>
                      {Array.from({ length: cols }, (_, i) => (
                        <SetCell key={i} set={sets[i]} measure={e.measure} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(t.timedSets > 0 || totalVolume > 0 || results.length > 0) && (
            <div className="pace-strip">
              {totalVolume > 0 && <div><strong>{Math.round(totalVolume).toLocaleString()}</strong><span>{unit} lifted</span></div>}
              {t.avgSet !== undefined && <div><strong>{formatSeconds(t.avgSet)}</strong><span>avg set</span></div>}
              {t.avgRest !== undefined && (
                <div>
                  <strong>{formatSeconds(t.avgRest)}</strong>
                  <span>avg rest{t.avgPlanned ? ` (plan ${formatSeconds(t.avgPlanned)})` : ''}</span>
                </div>
              )}
              {results.map(([k, v]) => (
                <div key={k}><strong>{v}</strong><span>{resultNames[k]}</span></div>
              ))}
            </div>
          )}
          {session.note && <p className="muted">“{session.note}”</p>}
          <button
            className="btn ghost danger small"
            onClick={() => confirm('Delete this workout from your history?') && actions.discardSession(session.id)}
          >
            Delete workout
          </button>
        </div>
      )}
    </section>
  )
}
