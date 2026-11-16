import { useState } from 'react'
import { History } from './components/History'
import { ProgramView } from './components/ProgramView'
import { RestTimerBar } from './components/RestTimerBar'
import { SessionView } from './components/SessionView'
import { Settings } from './components/Settings'
import { Today } from './components/Today'
import { useAppState } from './store'

type Tab = 'today' | 'program' | 'history' | 'settings'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '◉' },
  { id: 'program', label: 'Program', icon: '☰' },
  { id: 'history', label: 'History', icon: '↺' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export default function App() {
  const state = useAppState()
  const [tab, setTab] = useState<Tab>('today')
  const [sessionOpen, setSessionOpen] = useState(false)

  const active = state.sessions.find((s) => s.id === state.activeSessionId && !s.finishedAt)
  const openSession = () => setSessionOpen(true)

  if (sessionOpen && active) {
    return (
      <div className="app">
        <SessionView session={active} onClose={() => setSessionOpen(false)} />
        <RestTimerBar />
      </div>
    )
  }

  return (
    <div className="app">
      <main className="page">
        {tab === 'today' && <Today onOpenSession={openSession} />}
        {tab === 'program' && <ProgramView onOpenSession={openSession} />}
        {tab === 'history' && <History />}
        {tab === 'settings' && <Settings />}
      </main>
      <RestTimerBar />
      <nav className="tabbar">
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
