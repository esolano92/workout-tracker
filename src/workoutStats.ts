import { getProgram } from './programs'
import { finishedSessions } from './store'
import type { AppState, Exercise, Session, SetEntry } from './types'

export const doneSets = (sets: SetEntry[] = []) => sets.filter((s) => s.done)

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined)
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export interface Timing {
  /** Average seconds from the end of a rest to checking off the set. */
  avgSet?: number
  /** Average seconds of rest actually taken. */
  avgRest?: number
  /** Average planned rest, for the same sets as avgRest. */
  avgPlanned?: number
  workTotal: number
  restTotal: number
  timedSets: number
}

export function timingOf(sets: SetEntry[]): Timing {
  const work = sets.map((s) => s.workSec).filter((v): v is number => v !== undefined)
  const rested = sets.filter((s) => s.restSec !== undefined && s.restPlanned)
  return {
    avgSet: avg(work),
    avgRest: avg(rested.map((s) => s.restSec!)),
    avgPlanned: avg(rested.map((s) => s.restPlanned!)),
    workTotal: sum(work),
    restTotal: sum(rested.map((s) => s.restSec!)),
    timedSets: work.length,
  }
}

export function sessionTiming(session: Session): Timing {
  return timingOf(Object.values(session.sets).flatMap(doneSets))
}

export interface ExerciseLog {
  session: Session
  sets: SetEntry[]
}

export interface ExerciseHistory {
  name: string
  exercise: Exercise
  /** Most recent first. */
  logs: ExerciseLog[]
}

/** Every exercise you've logged at least one completed set for, most recently trained first. */
export function exerciseHistories(state: AppState): ExerciseHistory[] {
  const byName = new Map<string, ExerciseHistory>()
  for (const session of finishedSessions(state)) {
    if (session.skipped) continue
    const day = getProgram(session.programId).weeks[session.week]?.days[session.day]
    if (!day) continue
    day.exercises.forEach((exercise, i) => {
      const sets = doneSets(session.sets[i])
      if (!sets.length) return
      let h = byName.get(exercise.name)
      if (!h) byName.set(exercise.name, (h = { name: exercise.name, exercise, logs: [] }))
      h.logs.push({ session, sets })
    })
  }
  return [...byName.values()]
}

export const num = (s: string) => {
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : undefined
}

/** Heaviest weight in a group of sets. */
export function topWeight(sets: SetEntry[]): number | undefined {
  const ws = sets.map((s) => num(s.weight)).filter((v): v is number => v !== undefined)
  return ws.length ? Math.max(...ws) : undefined
}

/** Best set: heaviest weight, then most reps/seconds at that weight. */
export function bestSet(sets: SetEntry[]): SetEntry | undefined {
  return [...sets].sort(
    (a, b) => (num(b.weight) ?? 0) - (num(a.weight) ?? 0) || (num(b.value) ?? 0) - (num(a.value) ?? 0),
  )[0]
}

/** Total weight × reps. */
export function volume(sets: SetEntry[]): number {
  return sum(sets.map((s) => (num(s.weight) ?? 0) * (num(s.value) ?? 0)))
}

export function formatSeconds(sec: number): string {
  const s = Math.round(sec)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
