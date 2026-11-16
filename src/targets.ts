import type { Baseline } from './types'

/**
 * Program text can reference the user's baseline test with tokens:
 *   {pace}            test pace (average RPM)
 *   {pace-10}         10 rpm under test pace
 *   {pace+3..+5}      a range relative to test pace
 *   {cal}             test calories
 *   {cal 10%}         10% of test calories, rounded up
 * With a baseline, tokens become real numbers; without one, they become plain-English descriptions.
 */
export function renderTargets(text: string, baseline: Baseline): string {
  return text
    .replace(/\{pace(?:([+-]\d+)(?:\.\.([+-]\d+))?)?\}/g, (_, a?: string, b?: string) =>
      renderPace(baseline.rpm, a ? Number(a) : undefined, b ? Number(b) : undefined),
    )
    .replace(/\{cal(?:\s+([\d.]+)%)?\}/g, (_, pct?: string) => renderCal(baseline.cal, pct ? Number(pct) : undefined))
}

function renderPace(rpm: number | undefined, a?: number, b?: number): string {
  if (a === undefined) return rpm ? `${rpm} rpm` : 'test pace'
  if (rpm) {
    if (b === undefined) return `about ${rpm + a} rpm`
    const [lo, hi] = [rpm + a, rpm + b].sort((x, y) => x - y)
    return `${lo}-${hi} rpm`
  }
  const dir = a < 0 ? 'under' : 'over'
  const nums = b === undefined ? `${Math.abs(a)}` : [Math.abs(a), Math.abs(b)].sort((x, y) => x - y).join('-')
  return `${nums} rpm ${dir} test pace`
}

function renderCal(cal: number | undefined, pct?: number): string {
  if (pct === undefined) return cal ? `${cal} cal` : 'your test calories'
  return cal ? `${Math.ceil((cal * pct) / 100)} cal` : `${pct}% of your test calories`
}
