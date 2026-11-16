import { useState } from 'react'
import { actions, useAppState } from '../store'

export function BaselineCard() {
  const { baseline } = useAppState()
  const [editing, setEditing] = useState(false)
  const [cal, setCal] = useState(baseline.cal?.toString() ?? '')
  const [rpm, setRpm] = useState(baseline.rpm?.toString() ?? '')
  const [time, setTime] = useState(baseline.time ?? '')
  const missing = !baseline.cal || !baseline.rpm

  const save = () => {
    actions.setBaseline({ cal: Number(cal) || undefined, rpm: Number(rpm) || undefined, time: time || undefined })
    setEditing(false)
  }

  if (editing) {
    return (
      <section className="card">
        <h3>Your 10-minute test</h3>
        <div className="field-row">
          <label>
            Total calories
            <input inputMode="numeric" value={cal} onChange={(e) => setCal(e.target.value)} placeholder="e.g. 180" />
          </label>
          <label>
            Average RPM
            <input inputMode="numeric" value={rpm} onChange={(e) => setRpm(e.target.value)} placeholder="e.g. 68" />
          </label>
          <label>
            50 cal time
            <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 2:35" />
          </label>
        </div>
        <div className="row">
          <button className="btn" onClick={save}>Save</button>
          <button className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </section>
    )
  }

  return (
    <section className={`card baseline ${missing ? 'warn' : ''}`}>
      <div className="block-head">
        <h3>Your baseline</h3>
        <button className="btn ghost small" onClick={() => setEditing(true)}>Edit</button>
      </div>
      {missing ? (
        <p className="muted">
          Do the baseline test first, or enter your numbers if you've already done it. Until then, targets are
          shown as descriptions instead of exact numbers.
        </p>
      ) : (
        <div className="stats">
          <div><strong>{baseline.cal}</strong><span>test cal</span></div>
          <div><strong>{baseline.rpm}</strong><span>test pace (rpm)</span></div>
          {baseline.time && <div><strong>{baseline.time}</strong><span>50 cal time</span></div>}
        </div>
      )}
    </section>
  )
}
