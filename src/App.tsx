import { useState } from 'react'
import { History } from './components/History'
import { Icon, type IconName } from './components/Icon'
import { ProgramView } from './components/ProgramView'
import { RestTimerBar } from './components/RestTimerBar'
import { SessionView } from './components/SessionView'
import { Settings } from './components/Settings'
import { Today } from './components/Today'
import { Track } from './components/Track'
import { useAppState } from './store'
import type { Tab } from './types'

const tabs: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'today', label: 'Today', icon: 'home' },
  { id: 'program', label: 'Program', icon: 'calendar' },
  { id: 'track', label: 'Track', icon: 'chart' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
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
      <main className="page" key={tab}>
        {tab === 'today' && <Today onOpenSession={openSession} onGoTo={setTab} />}
        {tab === 'program' && <ProgramView onOpenSession={openSession} />}
        {tab === 'track' && <Track />}
        {tab === 'history' && <History />}
        {tab === 'settings' && <Settings />}
      </main>
      <RestTimerBar />
      <nav className="tabbar">
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            <span className="tab-icon"><Icon name={t.icon} size={22} /></span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
