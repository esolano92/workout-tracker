import { useSyncExternalStore } from 'react'
import { getProgram, programs } from './programs'
import type { AppState, Baseline, DailyEntry, LogField, Session, SetEntry, Unit } from './types'

const STORAGE_KEY = 'workout-tracker:v1'

function defaultState(): AppState {
  return {
    version: 1,
    activeProgramId: programs[0].id,
    progress: {},
    sessions: [],
    baseline: {},
    daily: {},
    goals: { steps: 10000 },
    settings: { unit: 'lb' },
  }
}

function isAppState(value: unknown): value is AppState {
  const v = value as AppState
  return !!v && v.version === 1 && Array.isArray(v.sessions) && typeof v.progress === 'object'
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (isAppState(parsed)) return { ...defaultState(), ...parsed }
    }
  } catch {
    // Corrupt storage falls through to a fresh state.
  }
  return defaultState()
}

let state = load()
const listeners = new Set<() => void>()

function setState(next: AppState) {
  state = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  listeners.forEach((l) => l())
}

function update(fn: (s: AppState) => AppState) {
  setState(fn(state))
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state)
}

const emptySet = (): SetEntry => ({ weight: '', value: '', done: false })

function patchSession(id: string, fn: (s: Session) => Session) {
  update((s) => ({ ...s, sessions: s.sessions.map((x) => (x.id === id ? fn(x) : x)) }))
}

export function getProgress(s: AppState, programId: string) {
  return s.progress[programId] ?? { week: 0, day: 0 }
}

export function nextPosition(programId: string, week: number, day: number) {
  const program = getProgram(programId)
  if (day + 1 < program.weeks[week].days.length) return { week, day: day + 1 }
  if (week + 1 < program.weeks.length) return { week: week + 1, day: 0 }
  return { week, day }
}

export const actions = {
  startSession(programId: string, week: number, day: number): string {
    const active = state.sessions.find((x) => x.id === state.activeSessionId && !x.finishedAt)
    if (active && active.programId === programId && active.week === week && active.day === day) {
      return active.id
    }
    const dayDef = getProgram(programId).weeks[week].days[day]
    const session: Session = {
      id: crypto.randomUUID(),
      programId,
      week,
      day,
      startedAt: Date.now(),
      sets: Object.fromEntries(
        dayDef.exercises.map((e, i) => [i, Array.from({ length: e.sets }, emptySet)]),
      ),
    }
    update((s) => ({
      ...s,
      // Starting a new workout replaces any unfinished one.
      sessions: [...s.sessions.filter((x) => x.finishedAt || x.id !== s.activeSessionId), session],
      activeSessionId: session.id,
    }))
    return session.id
  },

  updateSet(sessionId: string, exIdx: number, setIdx: number, patch: Partial<SetEntry>) {
    patchSession(sessionId, (x) => ({
      ...x,
      sets: {
        ...x.sets,
        [exIdx]: x.sets[exIdx].map((set, i) => (i === setIdx ? { ...set, ...patch } : set)),
      },
    }))
  },

  addSet(sessionId: string, exIdx: number) {
    patchSession(sessionId, (x) => ({
      ...x,
      sets: { ...x.sets, [exIdx]: [...(x.sets[exIdx] ?? []), emptySet()] },
    }))
  },

  removeSet(sessionId: string, exIdx: number) {
    patchSession(sessionId, (x) => ({
      ...x,
      sets: { ...x.sets, [exIdx]: x.sets[exIdx].slice(0, -1) },
    }))
  },

  setNote(sessionId: string, note: string) {
    patchSession(sessionId, (x) => ({ ...x, note }))
  },

  setResult(sessionId: string, field: LogField, value: string) {
    patchSession(sessionId, (x) => ({ ...x, results: { ...x.results, [field]: value } }))
  },

  finishSession(sessionId: string) {
    update((s) => {
      const session = s.sessions.find((x) => x.id === sessionId)
      if (!session) return s
      const day = getProgram(session.programId).weeks[session.week].days[session.day]
      let baseline = s.baseline
      if (day.kind === 'test') {
        const cal = Number(session.results?.cal)
        const rpm = Number(session.results?.rpm)
        baseline = {
          cal: cal > 0 ? cal : baseline.cal,
          rpm: rpm > 0 ? rpm : baseline.rpm,
          time: session.results?.time || baseline.time,
        }
      }
      return {
        ...s,
        baseline,
        sessions: s.sessions.map((x) => (x.id === sessionId ? { ...x, finishedAt: Date.now() } : x)),
        activeSessionId: undefined,
        progress: {
          ...s.progress,
          [session.programId]: nextPosition(session.programId, session.week, session.day),
        },
      }
    })
  },

  /** Rest days and skipped optional sessions: record them as done and move on. */
  completeWithoutLogging(programId: string, week: number, day: number, skipped: boolean) {
    const now = Date.now()
    const session: Session = { id: crypto.randomUUID(), programId, week, day, startedAt: now, finishedAt: now, sets: {}, skipped }
    update((s) => ({
      ...s,
      sessions: [...s.sessions, session],
      progress: { ...s.progress, [programId]: nextPosition(programId, week, day) },
    }))
  },

  setBaseline(baseline: Baseline) {
    update((s) => ({ ...s, baseline }))
  },

  /** Pass `undefined` for a field to clear it. Days with nothing left are removed. */
  setDaily(date: string, patch: Partial<DailyEntry>) {
    update((s) => {
      const entry = { ...s.daily[date], ...patch }
      const daily = { ...s.daily }
      if (entry.weight === undefined && entry.steps === undefined) delete daily[date]
      else daily[date] = entry
      return { ...s, daily }
    })
  },

  setGoals(patch: Partial<AppState['goals']>) {
    update((s) => ({ ...s, goals: { ...s.goals, ...patch } }))
  },

  discardSession(sessionId: string) {
    update((s) => ({
      ...s,
      sessions: s.sessions.filter((x) => x.id !== sessionId),
      activeSessionId: s.activeSessionId === sessionId ? undefined : s.activeSessionId,
    }))
  },

  setProgress(programId: string, week: number, day: number) {
    update((s) => ({ ...s, progress: { ...s.progress, [programId]: { week, day } } }))
  },

  setActiveProgram(programId: string) {
    update((s) => ({ ...s, activeProgramId: programId }))
  },

  setUnit(unit: Unit) {
    update((s) => ({ ...s, settings: { ...s.settings, unit } }))
  },

  exportJson(): string {
    return JSON.stringify(state, null, 2)
  },

  importJson(json: string) {
    const parsed = JSON.parse(json)
    if (!isAppState(parsed)) throw new Error('That file is not a workout backup.')
    setState({ ...defaultState(), ...parsed })
  },

  resetAll() {
    setState(defaultState())
  },
}

export function finishedSessions(s: AppState): Session[] {
  return s.sessions.filter((x) => x.finishedAt).sort((a, b) => b.finishedAt! - a.finishedAt!)
}

export function isDayDone(s: AppState, programId: string, week: number, day: number): boolean {
  return s.sessions.some((x) => x.finishedAt && x.programId === programId && x.week === week && x.day === day)
}

/** Sets from the most recent finished session that included an exercise with this name. */
export function lastPerformance(s: AppState, exerciseName: string, excludeId?: string): SetEntry[] | undefined {
  for (const session of finishedSessions(s)) {
    if (session.id === excludeId) continue
    const day = getProgram(session.programId).weeks[session.week]?.days[session.day]
    if (!day) continue
    const idx = day.exercises.findIndex((e) => e.name === exerciseName)
    if (idx === -1) continue
    const done = (session.sets[idx] ?? []).filter((x) => x.done && (x.weight || x.value))
    if (done.length) return done
  }
  return undefined
}
