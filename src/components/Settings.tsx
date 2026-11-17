import { useRef } from 'react'
import { actions, useAppState } from '../store'
import { BaselineCard } from './BaselineCard'
import { RestAlertsCard } from './RestAlertsCard'

export function Settings() {
  const state = useAppState()
  const fileInput = useRef<HTMLInputElement>(null)

  const exportBackup = () => {
    const blob = new Blob([actions.exportJson()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importBackup = async (file: File) => {
    if (!confirm('Replace all current data with this backup?')) return
    try {
      actions.importJson(await file.text())
      alert('Backup restored.')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not read that file.')
    }
  }

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Settings</p>
        <h1>Settings</h1>
      </header>

      <section className="card">
        <h3>Weight unit</h3>
        <div className="segmented">
          {(['lb', 'kg'] as const).map((u) => (
            <button key={u} className={state.settings.unit === u ? 'active' : ''} onClick={() => actions.setUnit(u)}>
              {u}
            </button>
          ))}
        </div>
      </section>

      <RestAlertsCard />

      <BaselineCard />

      <section className="card">
        <h3>Backup</h3>
        <p className="muted">
          Your data is stored only on this device. Export a backup now and then so you don't lose it if you clear your
          browser data or switch phones.
        </p>
        <div className="row">
          <button className="btn secondary" onClick={exportBackup}>Export backup</button>
          <button className="btn ghost" onClick={() => fileInput.current?.click()}>Import backup</button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importBackup(file)
              e.target.value = ''
            }}
          />
        </div>
      </section>

      <section className="card">
        <h3>Reset</h3>
        <button
          className="btn ghost danger"
          onClick={() => confirm('Delete all workouts, progress and your baseline? This cannot be undone.') && actions.resetAll()}
        >
          Delete all data
        </button>
      </section>
    </>
  )
}
