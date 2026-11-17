import { useState } from 'react'
import { addDays, fromKey, todayKey } from '../dates'
import { actions, useAppState } from '../store'
import { averageSteps, latest, movingAverage, series, stepStreak, trendChange } from '../trends'
import { BarChart, LineChart, Ring } from './Charts'
import { DailyLog } from './DailyLog'
import { Icon } from './Icon'

const ranges = [
  { id: '1W', days: 7 },
  { id: '1M', days: 30 },
  { id: '3M', days: 90 },
  { id: '1Y', days: 365 },
] as const

const fmtInt = (v: number) => Math.round(v).toLocaleString()
const fmtK = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `${Math.round(v)}`)

export function Track() {
  const state = useAppState()
  const unit = state.settings.unit
  const [range, setRange] = useState<(typeof ranges)[number]>(ranges[1])
  const [logDate, setLogDate] = useState(todayKey)

  const end = todayKey()
  const start = addDays(end, -(range.days - 1))
  const weightPts = series(state.daily, 'weight', start, end)
  const weightTrend = movingAverage(state.daily, 'weight', weightPts.map((p) => p.key))
  const stepPts = series(state.daily, 'steps', start, end)
  const stepTrend = movingAverage(state.daily, 'steps', stepPts.map((p) => p.key))

  const current = latest(state.daily, 'weight')
  const change = trendChange(state.daily, range.days)
  const goalWeight = state.goals.weight
  const toGo = current?.value !== undefined && goalWeight ? current.value - goalWeight : undefined

  const todaySteps = state.daily[end]?.steps ?? 0
  const stepGoal = state.goals.steps
  const avgSteps = averageSteps(state.daily, range.days)
  const streak = stepStreak(state.daily, stepGoal)
  const fmtW = (v: number) => `${v.toFixed(1)} ${unit}`

  const recent = Object.keys(state.daily).sort().reverse().slice(0, 14)

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Body</p>
        <h1>Track</h1>
      </header>

      <DailyLog allowDate date={logDate} onDateChange={setLogDate} />

      <div className="segmented range">
        {ranges.map((r) => (
          <button key={r.id} className={range.id === r.id ? 'active' : ''} onClick={() => setRange(r)}>
            {r.id}
          </button>
        ))}
      </div>

      <section className="card metric weight">
        <div className="metric-head">
          <span className="metric-icon"><Icon name="scale" size={18} /></span>
          <h3>Weight</h3>
          <GoalEditor
            label="Goal"
            value={goalWeight}
            suffix={unit}
            decimal
            onSave={(v) => actions.setGoals({ weight: v })}
          />
        </div>
        <div className="metric-stats">
          <div className="big-stat">
            <strong>{current?.value !== undefined ? current.value.toFixed(1) : '—'}</strong>
            <span>{unit} · latest</span>
          </div>
          {change !== undefined && (
            <span className={`chip ${change <= 0 ? 'down' : 'up'}`}>
              {change > 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)} {unit} · {range.id}
            </span>
          )}
          {toGo !== undefined && (
            <span className="chip neutral">
              {Math.abs(toGo) < 0.05 ? 'At goal' : `${Math.abs(toGo).toFixed(1)} ${unit} to go`}
            </span>
          )}
        </div>
        <LineChart
          points={weightPts}
          trend={weightTrend}
          goal={goalWeight}
          color="var(--weight)"
          format={fmtW}
          axisFormat={(v) => (Number.isInteger(v) ? `${v}` : v.toFixed(1))}
          emptyText="Log your weight to see your trend"
        />
        <p className="muted small">Dots are daily weigh-ins. The line is your 7-day average, which smooths out water-weight swings.</p>
      </section>

      <section className="card metric steps">
        <div className="metric-head">
          <span className="metric-icon"><Icon name="steps" size={18} /></span>
          <h3>Steps</h3>
          <GoalEditor
            label="Daily goal"
            value={stepGoal}
            suffix="steps"
            onSave={(v) => actions.setGoals({ steps: v })}
          />
        </div>
        <div className="steps-summary">
          <Ring value={todaySteps} max={stepGoal ?? 0} color="var(--steps)">
            <strong>{fmtK(todaySteps)}</strong>
            <span>today</span>
          </Ring>
          <div className="mini-stats">
            <div><strong>{stepGoal ? `${Math.round((todaySteps / stepGoal) * 100)}%` : '—'}</strong><span>of goal</span></div>
            <div><strong>{avgSteps !== undefined ? fmtInt(avgSteps) : '—'}</strong><span>avg · {range.id}</span></div>
            <div><strong><Icon name="flame" size={14} /> {streak}</strong><span>day streak</span></div>
          </div>
        </div>
        <BarChart
          points={stepPts}
          trend={stepTrend}
          goal={stepGoal}
          color="var(--steps)"
          format={(v) => `${fmtInt(v)} steps`}
          axisFormat={fmtK}
          emptyText="Log your steps to see your trend"
        />
        <p className="muted small">Solid bars hit your goal. The line is your 7-day average.</p>
      </section>

      {recent.length > 0 && (
        <section className="card">
          <h3>Recent entries</h3>
          <div className="entry-list">
            {recent.map((key) => {
              const e = state.daily[key]
              return (
                <div key={key} className="entry-row">
                  <button className="entry-main" onClick={() => setLogDate(key)}>
                    <span className="entry-date">
                      {fromKey(key).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="entry-vals">
                      {e.weight !== undefined && <span className="tag weight">{e.weight.toFixed(1)} {unit}</span>}
                      {e.steps !== undefined && <span className="tag steps">{fmtInt(e.steps)} steps</span>}
                    </span>
                  </button>
                  <button
                    className="icon-btn danger"
                    aria-label="Delete entry"
                    onClick={() =>
                      confirm('Delete this day’s entry?') && actions.setDaily(key, { weight: undefined, steps: undefined })
                    }
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
          <p className="muted small">Tap a day to edit it in the log above.</p>
        </section>
      )}
    </>
  )
}

function GoalEditor({ label, value, suffix, decimal, onSave }: {
  label: string
  value?: number
  suffix: string
  decimal?: boolean
  onSave: (v: number | undefined) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  if (editing) {
    const commit = () => {
      const n = decimal ? parseFloat(draft) : parseInt(draft.replace(/[^\d]/g, ''), 10)
      onSave(Number.isFinite(n) && n > 0 ? n : undefined)
      setEditing(false)
    }
    return (
      <div className="goal-edit">
        <input
          autoFocus
          inputMode={decimal ? 'decimal' : 'numeric'}
          value={draft}
          placeholder={suffix}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
        />
        <button className="btn small" onClick={commit}>Set</button>
      </div>
    )
  }

  return (
    <button
      className="goal-pill"
      onClick={() => {
        setDraft(value?.toString() ?? '')
        setEditing(true)
      }}
    >
      <Icon name="target" size={14} />
      {value ? `${label}: ${value.toLocaleString()} ${suffix}` : `Set ${label.toLowerCase()}`}
    </button>
  )
}
