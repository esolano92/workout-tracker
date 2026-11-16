import type { Block, Day, Exercise, Measure, SetEntry, Unit, Week } from './types'

export function blockDuration(block: Block): number {
  const round = (block.segments ?? []).reduce((sum, s) => sum + s.seconds, 0)
  return round * (block.rounds ?? 1) + (block.restAfter ?? 0)
}

export const weekLabel = (week: Week, i: number) => week.label ?? `Week ${i + 1}`
export const dayLabel = (day: Day, i: number) => day.label ?? `Day ${i + 1}`

export const valueUnit: Record<Measure, string> = { reps: 'reps', time: 'sec', distance: 'yd' }

export function formatSet(set: SetEntry, measure: Measure, unit: Unit): string {
  const parts: string[] = []
  if (set.weight) parts.push(`${set.weight} ${unit}`)
  if (set.value) parts.push(measure === 'reps' ? `${set.value}` : `${set.value} ${valueUnit[measure]}`)
  return parts.join(measure === 'reps' ? ' × ' : ' · ')
}

export function formatTarget(e: Exercise, circuit: boolean): string {
  const target = e.measure === 'reps' && !/[a-z]/i.test(e.target) ? `${e.target} reps` : e.target
  return circuit ? target : `${e.sets} sets × ${target}`
}

export function formatRest(rest: string): string {
  return rest.replace(/^([\d-]+)/, '$1s')
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatDuration(ms: number): string {
  const min = Math.round(ms / 60000)
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}m`
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
