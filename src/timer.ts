import { useEffect, useState, useSyncExternalStore } from 'react'

interface TimerState {
  endsAt: number
  total: number
  label: string
}

let timer: TimerState | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const restTimer = {
  start(seconds: number, label: string) {
    timer = { endsAt: Date.now() + seconds * 1000, total: seconds, label }
    emit()
  },
  add(seconds: number) {
    if (!timer) return
    timer = { ...timer, endsAt: timer.endsAt + seconds * 1000, total: timer.total + seconds }
    emit()
  },
  stop() {
    timer = null
    emit()
  },
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
