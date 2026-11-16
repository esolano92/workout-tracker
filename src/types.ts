export type Measure = 'reps' | 'time' | 'distance'

export interface Exercise {
  id: string
  name: string
  /** Number of sets (or rounds, for circuit days). */
  sets: number
  /** Human-readable target, e.g. "8-10", "6-8 each side", "45-60 sec". */
  target: string
  measure: Measure
  /** Rest as written in the plan, e.g. "45-60" or "20 before A2". */
  rest?: string
  /** Rest used by the timer, in seconds. */
  restSec?: number
  rpe?: string
  notes?: string
  /** Superset label, e.g. "A1". */
  group?: string
}

export type SegmentKind = 'work' | 'easy' | 'rest'

/** One timed step of an interval round. Labels may contain pace/calorie tokens (see targets.ts). */
export interface Segment {
  seconds: number
  label: string
  kind: SegmentKind
}

export interface Block {
  title: string
  lines: string[]
  /** If present, the block can be run with the interval timer. */
  rounds?: number
  segments?: Segment[]
  /** Rest after the whole block, before the next one. */
  restAfter?: number
}

export type LogField = 'cal' | 'rpm' | 'time'

export type DayKind = 'strength' | 'circuit' | 'cardio' | 'test' | 'rest'

export interface Day {
  id: string
  /** Shown instead of "Day N", e.g. "Day 8" for calendar-style programs. */
  label?: string
  title: string
  kind: DayKind
  optional?: boolean
  rpe?: string
  /** Circuit days only: rest between rounds, as written. */
  roundRest?: string
  roundRestSec?: number
  video?: string
  goal?: string
  exercises: Exercise[]
  blocks?: Block[]
  log?: LogField[]
}

export interface Week {
  label?: string
  days: Day[]
}

export interface Program {
  id: string
  name: string
  author?: string
  summary: string
  equipment?: string
  /** Programs that use pace/calorie targets need a baseline test. */
  usesBaseline?: boolean
  guidelines: string[]
  glossary: { term: string; meaning: string }[]
  weeks: Week[]
}

export interface SetEntry {
  weight: string
  value: string
  done: boolean
}

export interface Session {
  id: string
  programId: string
  week: number
  day: number
  startedAt: number
  finishedAt?: number
  /** Keyed by exercise index within the day. */
  sets: Record<number, SetEntry[]>
  /** Cardio results, keyed by LogField. */
  results?: Partial<Record<LogField, string>>
  skipped?: boolean
  note?: string
}

export interface Baseline {
  /** Total calories in the 10-minute max test. */
  cal?: number
  /** Average RPM in the 10-minute max test. */
  rpm?: number
  /** 50-calorie (or 100) time, as entered, e.g. "2:35". */
  time?: string
}

export type Unit = 'lb' | 'kg'

export interface AppState {
  version: 1
  activeProgramId: string
  progress: Record<string, { week: number; day: number }>
  sessions: Session[]
  activeSessionId?: string
  baseline: Baseline
  settings: { unit: Unit }
}
