/** Dates are stored as local-time "YYYY-MM-DD" keys so a day never shifts with time zones. */

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = () => toKey(new Date())

export function addDays(key: string, n: number): string {
  const d = fromKey(key)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

/** Every date key from `start` to `end`, inclusive. */
export function dayRange(start: string, end: string): string[] {
  const keys: string[] = []
  for (let k = start; k <= end; k = addDays(k, 1)) keys.push(k)
  return keys
}

export function shortDate(key: string): string {
  return fromKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
