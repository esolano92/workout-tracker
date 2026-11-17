import { useEffect, useState } from 'react'
import { alertStatus, disableAlerts, enableAlerts, testRestAlert, type AlertStatus } from '../restAlerts'

const messages: Record<AlertStatus, string> = {
  'needs-install':
    'On iPhone, alerts only work from the home-screen app. In Safari, tap Share, then Add to Home Screen, open the app from there and come back to this screen.',
  unsupported: 'This browser can’t show notifications. The rest timer will still beep while the app is open.',
  denied:
    'Notifications are blocked for this app. Turn them on in your phone’s Settings, under Notifications, then Workouts.',
  off: 'Get a notification on your lock screen when a rest ends, even if your phone is locked or you’re in another app.',
  on: 'You’ll get a lock-screen notification whenever a rest ends. While the app is open, the timer beeps instead.',
}

export function RestAlertsCard() {
  const [status, setStatus] = useState<AlertStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [tested, setTested] = useState(false)

  useEffect(() => {
    alertStatus().then(setStatus)
  }, [])

  if (!status) return null

  const run = async (fn: () => Promise<AlertStatus>) => {
    setBusy(true)
    try {
      setStatus(await fn())
    } catch {
      setStatus(await alertStatus())
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card">
      <div className="block-head">
        <h3>Rest timer alerts</h3>
        {status === 'on' && <span className="chip down">On</span>}
      </div>
      <p className="muted">{messages[status]}</p>
      {status === 'off' && (
        <button className="btn" disabled={busy} onClick={() => run(enableAlerts)}>
          Turn on alerts
        </button>
      )}
      {status === 'on' && (
        <div className="row">
          <button
            className="btn secondary"
            onClick={() => {
              testRestAlert()
              setTested(true)
            }}
          >
            Send a test
          </button>
          <button
            className="btn ghost"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await disableAlerts()
                return 'off'
              })
            }
          >
            Turn off
          </button>
        </div>
      )}
      {tested && <p className="muted small">Lock your phone now. The test alert arrives in about 5 seconds.</p>}
    </section>
  )
}
