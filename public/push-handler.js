/* Loaded into the generated service worker via workbox `importScripts`. */

const REST_CACHE = 'rest-alert'
const REST_KEY = '/__rest-alert/current'
const TAG = 'rest-timer'

async function currentRest() {
  const res = await (await caches.open(REST_CACHE)).match(REST_KEY)
  return res ? res.json() : null
}

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  event.waitUntil(
    (async () => {
      const current = await currentRest()
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const visible = windows.some((c) => c.visibilityState === 'visible')
      const unwanted = visible || !current || current.endsAt !== data.endsAt
      // iOS revokes push access if a push doesn't show a notification, so always show one,
      // then close it right away when it's for a rest that was skipped or extended, or the app is open.
      await self.registration.showNotification(data.title || 'Rest is over', {
        body: data.body || 'Time for your next set',
        tag: TAG,
        renotify: !unwanted,
        silent: unwanted,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { endsAt: data.endsAt },
      })
      if (unwanted) {
        const shown = await self.registration.getNotifications({ tag: TAG })
        shown.forEach((n) => n.close())
      }
    })(),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      if (windows.length) return windows[0].focus()
      return self.clients.openWindow('/')
    })(),
  )
})
