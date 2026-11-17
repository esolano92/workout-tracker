import { useState } from 'react'
import { addDays, shortDate, todayKey } from '../dates'
import { actions, useAppState } from '../store'
import { Icon } from './Icon'

/** Log weight and steps for a day. With `allowDate`, any past day can be picked to backfill. */
export function DailyLog({ allowDate = false, date: controlledDate, onDateChange }: {
  allowDate?: boolean
  date?: string
  onDateChange?: (date: string) => void
}) {
  const [ownDate, setOwnDate] = useState(todayKey)
  const date = controlledDate ?? ownDate
  const setDate = onDateChange ?? setOwnDate
  return <DailyLogForm key={date} date={date} allowDate={allowDate} onDateChange={setDate} />
}

function DailyLogForm({ date, allowDate, onDateChange }: {
  date: string
  allowDate: boolean
  onDateChange: (date: string) => void
}) {
  const state = useAppState()
  const entry = state.daily[date]
  const [weight, setWeight] = useState(entry?.weight?.toString() ?? '')
  const [steps, setSteps] = useState(entry?.steps?.toString() ?? '')
  const [saved, setSaved] = useState(false)
  const today = todayKey()

  const save = () => {
    const w = parseFloat(weight)
    const s = parseInt(steps.replace(/[^\d]/g, ''), 10)
    actions.setDaily(date, {
      weight: Number.isFinite(w) && w > 0 ? w : undefined,
      steps: Number.isFinite(s) && s >= 0 ? s : undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  const label = date === today ? 'Today' : date === addDays(today, -1) ? 'Yesterday' : shortDate(date)

  return (
    <section className="card log-card">
      <div className="block-head">
        <h3>{allowDate ? 'Daily check-in' : "Today's check-in"}</h3>
        {allowDate && (
          <div className="date-stepper">
            <button className="icon-btn" onClick={() => onDateChange(addDays(date, -1))} aria-label="Previous day">
              <Icon name="back" size={18} />
            </button>
            <span>{label}</span>
            <button
              className="icon-btn"
              onClick={() => onDateChange(addDays(date, 1))}
              disabled={date >= today}
              aria-label="Next day"
            >
              <Icon name="chevron" size={18} />
            </button>
          </div>
        )}
      </div>
      <div className="log-fields">
        <label className="log-field weight">
          <span><Icon name="scale" size={16} /> Weight</span>
          <div className="input-suffix">
            <input inputMode="decimal" placeholder="—" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <em>{state.settings.unit}</em>
          </div>
        </label>
        <label className="log-field steps">
          <span><Icon name="steps" size={16} /> Steps</span>
          <div className="input-suffix">
            <input inputMode="numeric" placeholder="—" value={steps} onChange={(e) => setSteps(e.target.value)} />
            <em>steps</em>
          </div>
        </label>
      </div>
      <button className={`btn ${saved ? 'saved' : ''}`} onClick={save}>
        {saved ? <><Icon name="check" size={18} /> Saved</> : 'Save'}
      </button>
    </section>
  )
}
