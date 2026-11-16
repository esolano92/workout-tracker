import { useEffect, useRef } from 'react'
import { formatClock } from '../format'
import { beep, restTimer, useRestTimer } from '../timer'

export function RestTimerBar() {
  const timer = useRestTimer()
  const beeped = useRef<number | null>(null)

  useEffect(() => {
    if (timer && timer.remaining === 0 && beeped.current !== timer.endsAt) {
      beeped.current = timer.endsAt
      beep()
    }
  }, [timer])

  if (!timer) return null
  const done = timer.remaining === 0
  const pct = done ? 100 : ((timer.total - timer.remaining) / timer.total) * 100

  return (
    <div className={`rest-bar ${done ? 'done' : ''}`}>
      <div className="rest-progress" style={{ width: `${pct}%` }} />
      <div className="rest-content">
        <div>
          <div className="rest-clock">{done ? 'Go!' : formatClock(timer.remaining)}</div>
          <div className="rest-label">{done ? 'Rest is over' : timer.label}</div>
        </div>
        <div className="row">
          {!done && <button className="btn ghost small" onClick={() => restTimer.add(15)}>+15s</button>}
          <button className="btn ghost small" onClick={() => restTimer.stop()}>{done ? 'Dismiss' : 'Skip'}</button>
        </div>
      </div>
    </div>
  )
}
