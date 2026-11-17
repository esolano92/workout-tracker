import { addDays, dayRange, todayKey } from './dates'
import type { DailyEntry } from './types'

export type Field = keyof DailyEntry

export interface Point {
  key: string
  value?: number
}

export function series(daily: Record<string, DailyEntry>, field: Field, start: string, end: string): Point[] {
  return dayRange(start, end).map((key) => ({ key, value: daily[key]?.[field] }))
}

/** Trailing average over the last `window` calendar days that have a value. Days with no data in the window are undefined. */
export function movingAverage(
  daily: Record<string, DailyEntry>,
  field: Field,
  keys: string[],
  window = 7,
): Point[] {
  return keys.map((key) => {
    const values = dayRange(addDays(key, -(window - 1)), key)
      .map((k) => daily[k]?.[field])
      .filter((v): v is number => v !== undefined)
    return { key, value: values.length ? values.reduce((a, b) => a + b, 0) / values.length : undefined }
  })
}

export function earliestKey(daily: Record<string, DailyEntry>, field: Field): string | undefined {
  return Object.keys(daily)
    .filter((k) => daily[k][field] !== undefined)
    .sort()[0]
}

export function latest(daily: Record<string, DailyEntry>, field: Field): Point | undefined {
  const key = Object.keys(daily)
    .filter((k) => daily[k][field] !== undefined)
    .sort()
    .at(-1)
  return key ? { key, value: daily[key][field] } : undefined
}

/** Change in the 7-day weight trend over the last `days` days. */
export function trendChange(daily: Record<string, DailyEntry>, days: number): number | undefined {
  const today = todayKey()
  const [then, now] = movingAverage(daily, 'weight', [addDays(today, -days), today])
  if (then.value === undefined || now.value === undefined) return undefined
  return now.value - then.value
}

export function averageSteps(daily: Record<string, DailyEntry>, days: number): number | undefined {
  const values = dayRange(addDays(todayKey(), -(days - 1)), todayKey())
    .map((k) => daily[k]?.steps)
    .filter((v): v is number => v !== undefined)
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : undefined
}

/** Consecutive days hitting the step goal, ending today (or yesterday, if today isn't logged yet). */
export function stepStreak(daily: Record<string, DailyEntry>, goal?: number): number {
  if (!goal) return 0
  let key = todayKey()
  if ((daily[key]?.steps ?? 0) < goal) key = addDays(key, -1)
  let streak = 0
  while ((daily[key]?.steps ?? 0) >= goal) {
    streak++
    key = addDays(key, -1)
  }
  return streak
}
