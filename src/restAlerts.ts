/** Lock-screen "rest is over" alerts, sent as web push by /api/rest-alert. Must match public/push-handler.js. */

const VAPID_PUBLIC_KEY = 'BHgXgTQEef0aLBFay3-eK09RCOwhPY2CqpsIjMT3VRqQYp39TRZgL9X0fJAF3_Gz4OvEx7lFAvLc7Tc0QzYOYLw'
const ENABLED_KEY = 'workout-tracker:rest-alerts'
const REST_CACHE = 'rest-alert'
const REST_KEY = '/__rest-alert/current'

export type AlertStatus = 'unsupported' | 'needs-install' | 'denied' | 'off' | 'on'

const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent))
const isInstalled = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true

function keyBytes(base64: string): Uint8Array<ArrayBuffer> {
  const b64 = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

async function registration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined
  return navigator.serviceWorker.getRegistration()
}

export async function alertStatus(): Promise<AlertStatus> {
  if (isIOS() && !isInstalled()) return 'needs-install'
  if (!('PushManager' in window) || !('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const sub = await (await registration())?.pushManager.getSubscription()
  return sub && localStorage.getItem(ENABLED_KEY) === '1' ? 'on' : 'off'
}

/** Must be called from a tap: iOS only shows the permission prompt in response to user interaction. */
export async function enableAlerts(): Promise<AlertStatus> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off'
  const reg = await navigator.serviceWorker.ready
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) }))
  if (!sub) return 'off'
  localStorage.setItem(ENABLED_KEY, '1')
  return 'on'
}

export async function disableAlerts(): Promise<void> {
  localStorage.removeItem(ENABLED_KEY)
  await (await (await registration())?.pushManager.getSubscription())?.unsubscribe()
}

async function setCurrentRest(endsAt: number | null) {
  if (!('caches' in window)) return
  const cache = await caches.open(REST_CACHE)
  if (endsAt === null) await cache.delete(REST_KEY)
  else await cache.put(REST_KEY, new Response(JSON.stringify({ endsAt })))
}

/** Ask the server to push an alert at `endsAt`. Pushes for any earlier rest are suppressed by the service worker. */
export function scheduleRestAlert(endsAt: number, label: string) {
  if (localStorage.getItem(ENABLED_KEY) !== '1') return
  void (async () => {
    try {
      await setCurrentRest(endsAt)
      const sub = await (await registration())?.pushManager.getSubscription()
      if (!sub) return
      await fetch('/api/rest-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), endsAt, label }),
        keepalive: true,
      })
    } catch {
      // Offline or push unavailable: the in-app timer still beeps.
    }
  })()
}

export function cancelRestAlert() {
  if (localStorage.getItem(ENABLED_KEY) !== '1') return
  void setCurrentRest(null).catch(() => {})
}

/** Sends an alert a few seconds from now so you can check it shows up with the phone locked. */
export function testRestAlert(seconds = 5) {
  scheduleRestAlert(Date.now() + seconds * 1000, 'Test alert: this is what the end of a rest looks like')
}
