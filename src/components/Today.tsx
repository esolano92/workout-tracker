import { dayLabel, weekLabel } from '../format'
import { getProgram } from '../programs'
import { getProgress, isDayDone, useAppState } from '../store'
import { BaselineCard } from './BaselineCard'
import { DayActions } from './DayActions'
import { DayContent } from './DayContent'

export function Today({ onOpenSession }: { onOpenSession: () => void }) {
  const state = useAppState()
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

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">{program.name}</p>
        <h1>Today</h1>
      </header>

      {active && activeDay && (
        <section className="card highlight">
          <p className="eyebrow">In progress</p>
          <h3>{activeDay.title}</h3>
          <p className="muted">
            {activeProgram!.name} · {weekLabel(activeProgram!.weeks[active.week], active.week)} ·{' '}
            {dayLabel(activeDay, active.day)}
          </p>
          <button className="btn" onClick={onOpenSession}>Resume workout</button>
        </section>
      )}

      {program.usesBaseline && <BaselineCard />}

      {allDone && (
        <section className="card highlight">
          <h3>Program complete 🎉</h3>
          <p className="muted">You finished every workout. Run it again heavier, or switch programs in the Program tab.</p>
        </section>
      )}

      <section className="card">
        <p className="eyebrow">
          {weekLabel(weekDef, week)} · {dayLabel(dayDef, day)}
          {dayDef.optional && ' · Optional'}
          {isDayDone(state, program.id, week, day) && ' · Done'}
        </p>
        <h2>{dayDef.title}</h2>
        <DayContent day={dayDef} baseline={state.baseline} />
        <DayActions programId={program.id} week={week} dayIdx={day} day={dayDef} onOpenSession={onOpenSession} />
      </section>

      <section className="card">
        <div className="block-head">
          <h3>Progress</h3>
          <span className="muted">{doneCount} / {workoutDays.length} workouts</span>
        </div>
        <div className="progress"><div style={{ width: `${(doneCount / workoutDays.length) * 100}%` }} /></div>
      </section>
    </>
  )
}
