import { useEffect, useState, useSyncExternalStore } from 'react'
import { cancelRestAlert, scheduleRestAlert } from './restAlerts'

interface TimerState {
  endsAt: number
  total: number
  label: string
}

let timer: TimerState | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** The most recent rest, kept after the timer is dismissed so the next set can be timed against it. */
let lastRest: { startedAt: number; endsAt: number; planned: number; stoppedAt?: number } | null = null

/** Longer than this between a rest ending and the next check-off means the set wasn't being timed. */
const MAX_SET_MS = 10 * 60_000

export const restTimer = {
  start(seconds: number, label: string) {
    const now = Date.now()
    timer = { endsAt: now + seconds * 1000, total: seconds, label }
    lastRest = { startedAt: now, endsAt: timer.endsAt, planned: seconds }
    scheduleRestAlert(timer.endsAt, label)
    emit()
  },
  add(seconds: number) {
    if (!timer) return
    timer = { ...timer, endsAt: timer.endsAt + seconds * 1000, total: timer.total + seconds }
    if (lastRest) lastRest = { ...lastRest, endsAt: timer.endsAt }
    scheduleRestAlert(timer.endsAt, timer.label)
    emit()
  },
  stop() {
    if (lastRest && !lastRest.stoppedAt) lastRest = { ...lastRest, stoppedAt: Date.now() }
    if (timer && timer.endsAt > Date.now()) cancelRestAlert()
    timer = null
    emit()
  },
}

/**
 * Timing for a set checked off now, measured from the end of the last rest, or from the previous
 * check-off when there was no rest in between. Empty if nothing recent to measure from.
 */
export function setTiming(now = Date.now()): { restSec?: number; restPlanned?: number; workSec?: number } {
  const rest = lastRest
  lastRest = { startedAt: now, endsAt: now, planned: 0 }
  if (!rest) return {}
  const restEnd = Math.min(rest.endsAt, rest.stoppedAt ?? Infinity, now)
  const work = now - restEnd
  if (work > MAX_SET_MS) return {}
  return {
    ...(rest.planned > 0 && {
      restSec: Math.round((restEnd - rest.startedAt) / 1000),
      restPlanned: rest.planned,
    }),
    // Checked off while the rest was still running: there's no separate set time to report.
    workSec: restEnd < now ? Math.round(work / 1000) : undefined,
  }
}

/** Forget the last rest, e.g. when a new workout starts. */
export function resetSetTiming() {
  lastRest = null
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Re-renders every 250ms while a timer is running. Timing is based on wall clock so it survives backgrounding. */
export function useRestTimer() {
  const current = useSyncExternalStore(subscribe, () => timer)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!current) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [current])

  if (!current) return null
  // `now` can be stale for the first tick after a new timer starts, so clamp to the timer's length.
  const remaining = Math.min(current.total, Math.max(0, Math.ceil((current.endsAt - now) / 1000)))
  return { ...current, remaining }
}

let audio: AudioContext | null = null

export function tone(frequency = 880, duration = 0.6) {
  try {
    audio ??= new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.25, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration)
    osc.connect(gain).connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + duration)
  } catch {
    // Audio unavailable.
  }
}

export function beep() {
  tone()
  navigator.vibrate?.([200, 100, 200])
}

/** Keeps the screen on while a timer is visible. Returns a release function. */
export function keepScreenOn(): () => void {
  let lock: WakeLockSentinel | undefined
  let released = false
  navigator.wakeLock
    ?.request('screen')
    .then((l) => {
      if (released) l.release()
      else lock = l
    })
    .catch(() => {})
  return () => {
    released = true
    lock?.release()
  }
}
