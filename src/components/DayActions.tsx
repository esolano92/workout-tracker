import { actions, useAppState } from '../store'
import type { Day } from '../types'

export function DayActions({
  programId,
  week,
  dayIdx,
  day,
  onOpenSession,
}: {
  programId: string
  week: number
  dayIdx: number
  day: Day
  onOpenSession: () => void
}) {
  const state = useAppState()
  const active = state.sessions.find((s) => s.id === state.activeSessionId && !s.finishedAt)
  const isActiveHere = active && active.programId === programId && active.week === week && active.day === dayIdx

  if (day.kind === 'rest') {
    return (
      <button className="btn" onClick={() => actions.completeWithoutLogging(programId, week, dayIdx, false)}>
        ✓ Mark rest day done
      </button>
    )
  }

  const start = () => {
    if (active && !isActiveHere && !confirm('You have an unfinished workout. Discard it and start this one?')) return
    actions.startSession(programId, week, dayIdx)
    onOpenSession()
  }

  return (
    <div className="row">
      <button className="btn" onClick={start}>
        {isActiveHere ? 'Resume workout' : 'Start workout'}
      </button>
      {day.optional && !isActiveHere && (
        <button className="btn ghost" onClick={() => actions.completeWithoutLogging(programId, week, dayIdx, true)}>
          Skip (optional)
        </button>
      )}
    </div>
  )
}
