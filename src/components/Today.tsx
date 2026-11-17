import { useState } from 'react'
import { addDays, toKey, todayKey } from '../dates'
import { blockDuration, dayLabel, plural, weekLabel } from '../format'
import { getProgram } from '../programs'
import { getProgress, isDayDone, useAppState } from '../store'
import { latest, trendChange } from '../trends'
import type { Day, Program, Tab } from '../types'
import { BaselineCard } from './BaselineCard'
import { Ring } from './Charts'
import { DailyLog } from './DailyLog'
import { DayActions } from './DayActions'
import { DayContent } from './DayContent'
import { Icon } from './Icon'

function greeting(now: Date) {
  const h = now.getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

const isBike = (p: Program) => p.id.startsWith('bike')

function dayMeta(day: Day): string {
  if (day.kind === 'rest') return 'Recovery'
  if (day.kind === 'strength') return plural(day.exercises.length, 'exercise')
  if (day.kind === 'circuit') return `${day.exercises[0]?.sets ?? 0} rounds · ${plural(day.exercises.length, 'exercise')}`
  const secs = (day.blocks ?? []).reduce((sum, b) => sum + blockDuration(b), 0)
  return secs ? `${Math.round(secs / 60)} min on the clock` : plural(day.blocks?.length ?? 0, 'part')
}

export function Today({ onOpenSession, onGoTo }: { onOpenSession: () => void; onGoTo: (tab: Tab) => void }) {
  const state = useAppState()
  const [now] = useState(() => new Date())
  const program = getProgram(state.activeProgramId)
  const { week, day } = getProgress(state, program.id)
  const weekDef = program.weeks[week]
  const dayDef = weekDef.days[day]

  const active = state.sessions.find((s) => s.id === state.activeSessionId && !s.finishedAt)
  const activeProgram = active && getProgram(active.programId)
  const activeDay = active && activeProgram?.weeks[active.week].days[active.day]

  const workoutDays = program.weeks.flatMap((w, wi) =>
    w.days.map((d, di) => ({ d, wi, di })).filter(({ d }) => d.kind !== 'rest'),
  )
  const doneCount = workoutDays.filter(({ wi, di }) => isDayDone(state, program.id, wi, di)).length
  const allDone = doneCount === workoutDays.length

  const today = todayKey()
  const weight = latest(state.daily, 'weight')
  const weekChange = trendChange(state.daily, 7)
  const steps = state.daily[today]?.steps ?? 0
  const stepGoal = state.goals.steps ?? 0
  const weekStart = addDays(today, -6)
  const workoutsThisWeek = state.sessions.filter(
    (s) =>
      s.finishedAt &&
      !s.skipped &&
      getProgram(s.programId).weeks[s.week]?.days[s.day]?.kind !== 'rest' &&
      toKey(new Date(s.finishedAt)) >= weekStart,
  ).length

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">
          {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1>{greeting(now)}</h1>
      </header>

      {active && activeDay && (
        <button className="resume-banner" onClick={onOpenSession}>
          <span className="pulse" />
          <span className="resume-text">
            <strong>Workout in progress</strong>
            <span>{activeDay.title} · {activeProgram!.name}</span>
          </span>
          <Icon name="chevron" size={20} />
        </button>
      )}

      <section className={`hero ${isBike(program) ? 'bike' : 'kb'} ${dayDef.kind === 'rest' ? 'rest' : ''}`}>
        <div className="hero-top">
          <span className="hero-icon"><Icon name={isBike(program) ? 'bike' : 'dumbbell'} size={20} /></span>
          <span className="hero-program">{program.name}</span>
          {dayDef.optional && <span className="badge light">Optional</span>}
        </div>
        <p className="hero-eyebrow">Up next · {weekLabel(weekDef, week)} · {dayLabel(dayDef, day)}</p>
        <h2 className="hero-title">{dayDef.title}</h2>
        <p className="hero-meta">{dayMeta(dayDef)}</p>
        {allDone && <p className="hero-meta">You finished every workout in this program. 🎉</p>}
        <div className="hero-actions">
          <DayActions programId={program.id} week={week} dayIdx={day} day={dayDef} onOpenSession={onOpenSession} />
        </div>
        <div className="hero-progress">
          <div className="hero-bar"><div style={{ width: `${(doneCount / workoutDays.length) * 100}%` }} /></div>
          <span>{doneCount}/{workoutDays.length}</span>
        </div>
      </section>

      {dayDef.kind !== 'rest' && (
        <details className="card preview">
          <summary>
            <span>See the workout</span>
            <Icon name="chevron" size={18} className="summary-chevron" />
          </summary>
          <DayContent day={dayDef} baseline={state.baseline} />
        </details>
      )}

      <div className="tiles">
        <button className="tile weight" onClick={() => onGoTo('track')}>
          <span className="tile-label"><Icon name="scale" size={15} /> Weight</span>
          <strong>{weight?.value !== undefined ? weight.value.toFixed(1) : '—'}</strong>
          <span className="tile-sub">
            {weekChange !== undefined
              ? `${weekChange > 0 ? '▲' : '▼'} ${Math.abs(weekChange).toFixed(1)} this week`
              : state.settings.unit}
          </span>
        </button>
        <button className="tile steps" onClick={() => onGoTo('track')}>
          <Ring value={steps} max={stepGoal} size={58} stroke={7} color="var(--steps)">
            <Icon name="steps" size={16} />
          </Ring>
          <span className="tile-text">
            <strong>{steps.toLocaleString()}</strong>
            <span className="tile-sub">{stepGoal ? `of ${stepGoal.toLocaleString()}` : 'steps today'}</span>
          </span>
        </button>
        <button className="tile workouts" onClick={() => onGoTo('history')}>
          <span className="tile-label"><Icon name="flame" size={15} /> Last 7 days</span>
          <strong>{workoutsThisWeek}</strong>
          <span className="tile-sub">{workoutsThisWeek === 1 ? 'workout' : 'workouts'}</span>
        </button>
      </div>

      <DailyLog />

      {program.usesBaseline && <BaselineCard />}
    </>
  )
}
