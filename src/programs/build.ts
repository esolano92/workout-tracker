import type { Block, Day, Exercise, LogField, Measure, Program, Segment, SegmentKind } from '../types'

type ExerciseDraft = Omit<Exercise, 'id' | 'measure' | 'restSec'> & { measure?: Measure }
type DayDraft = Omit<Day, 'id' | 'exercises' | 'roundRestSec'> & { exercises?: ExerciseDraft[] }
type WeekDraft = DayDraft[] | { label: string; days: DayDraft[] }
type ProgramDraft = Omit<Program, 'weeks'> & { weeks: WeekDraft[] }

interface ExOptions {
  notes?: string
  group?: string
  measure?: Measure
}

/** Upper bound of the first number range in a rest string: "45-60" -> 60, "20-30 before A2" -> 30. */
export function parseRestSeconds(rest?: string): number | undefined {
  if (!rest) return undefined
  const match = rest.match(/(\d+)\s*(?:-\s*(\d+))?/)
  if (!match) return undefined
  return Number(match[2] ?? match[1])
}

function inferMeasure(target: string): Measure {
  if (/\b(sec|min)\b/i.test(target)) return 'time'
  if (/\b(yd|yds|m|mi|km)\b/i.test(target)) return 'distance'
  return 'reps'
}

/** Straight-set or superset exercise. */
export function ex(
  name: string,
  sets: number,
  target: string,
  rest: string,
  rpe: string | undefined,
  opts: ExOptions = {},
): ExerciseDraft {
  return { name, sets, target, rest, rpe, ...opts }
}

/** Circuit exercise: sets are filled in from the day's round count. */
export function cx(name: string, target: string, notes?: string, rest?: string): ExerciseDraft {
  return { name, sets: 0, target, notes, rest }
}

export function strength(title: string, video: string, exercises: ExerciseDraft[]): DayDraft {
  return { title, kind: 'strength', video, exercises }
}

export function circuit(
  title: string,
  video: string,
  rounds: number,
  roundRest: string,
  rpe: string,
  exercises: ExerciseDraft[],
): DayDraft {
  return {
    title,
    kind: 'circuit',
    video,
    rpe,
    roundRest,
    exercises: exercises.map((e) => ({ ...e, sets: rounds })),
  }
}

export const work = (seconds: number, label: string): Segment => seg(seconds, label, 'work')
export const easy = (seconds: number, label: string): Segment => seg(seconds, label, 'easy')
export const off = (seconds: number, label = 'Rest'): Segment => seg(seconds, label, 'rest')
function seg(seconds: number, label: string, kind: SegmentKind): Segment {
  return { seconds, label, kind }
}

export function block(
  title: string,
  lines: string[],
  timed?: { rounds?: number; segments: Segment[]; restAfter?: number },
): Block {
  return { title, lines, ...(timed && { rounds: timed.rounds ?? 1, ...timed }) }
}

interface CardioOptions {
  optional?: boolean
  goal?: string
  log?: LogField[]
}

export function cardio(label: string, title: string, blocks: Block[], opts: CardioOptions = {}): DayDraft {
  return { label, title, kind: 'cardio', blocks, log: opts.log ?? ['cal', 'rpm'], ...opts }
}

export function test(label: string, title: string, blocks: Block[], log: LogField[]): DayDraft {
  return { label, title, kind: 'test', blocks, log }
}

export function restDay(label: string): DayDraft {
  return { label, title: 'Rest day', kind: 'rest' }
}

export function buildProgram(draft: ProgramDraft): Program {
  return {
    ...draft,
    weeks: draft.weeks.map((week, w) => {
      const { label, days } = Array.isArray(week) ? { label: undefined, days: week } : week
      return {
        label,
        days: days.map((day, d) => {
          const dayId = `${draft.id}-w${w + 1}-d${d + 1}`
          return {
            ...day,
            id: dayId,
            roundRestSec: parseRestSeconds(day.roundRest),
            exercises: (day.exercises ?? []).map((e, i) => ({
              ...e,
              id: `${dayId}-e${i + 1}`,
              measure: e.measure ?? inferMeasure(e.target),
              restSec: parseRestSeconds(e.rest),
            })),
          }
        }),
      }
    }),
  }
}
