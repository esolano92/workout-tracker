import { waitUntil } from '@vercel/functions'
import { sendNotification, type PushSubscription } from 'web-push'

/** Function lifetime is capped at 300s on the Hobby plan; leave room for the push request itself. */
const MAX_WAIT_MS = 280_000

interface Body {
  subscription: PushSubscription
  endsAt: number
  label?: string
}

function isBody(v: unknown): v is Body {
  const b = v as Body
  return (
    !!b &&
    typeof b.endsAt === 'number' &&
    typeof b.subscription?.endpoint === 'string' &&
    /^https:\/\//.test(b.subscription.endpoint) &&
    typeof b.subscription.keys?.p256dh === 'string' &&
    typeof b.subscription.keys?.auth === 'string'
  )
}

export async function POST(request: Request): Promise<Response> {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return new Response('Push is not configured', { status: 503 })

  const body: unknown = await request.json().catch(() => null)
  if (!isBody(body)) return new Response('Bad request', { status: 400 })

  const wait = body.endsAt - Date.now()
  if (wait > MAX_WAIT_MS) return new Response('Rest is too long to schedule', { status: 422 })

  const payload = JSON.stringify({
    endsAt: body.endsAt,
    title: 'Rest is over',
    body: (body.label ?? 'Time for your next set').slice(0, 120),
  })

  waitUntil(
    (async () => {
      if (wait > 0) await new Promise((r) => setTimeout(r, wait))
      await sendNotification(body.subscription, payload, {
        vapidDetails: { subject: VAPID_SUBJECT ?? 'mailto:admin@example.com', publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY },
        TTL: 60,
        urgency: 'high',
      }).catch((err: unknown) => console.error('push failed', err))
    })(),
  )

  return new Response(null, { status: 202 })
}
