// Mux calls this on every asset lifecycle event. This is the ONLY place
// that ever sets mux_assets.status to 'ready' (or writes duration/asset/
// playback ids) — never the client, and never create-mux-upload-url — so
// a browser tab closed mid-upload can't leave a video looking usable before
// Mux has actually finished processing it and reported a real duration.
// patch-010's protect_mux_asset_fields trigger enforces this at the DB
// layer too (checks auth.role() = 'service_role', which this function runs
// as); enforce_mux_duration_cap is what actually rejects anything over the
// 5-minute cap, no matter what this function sends it.
//
// Configure this URL as the endpoint in the Mux Dashboard (Settings →
// Webhooks), subscribed to at least: video.asset.ready, video.asset.errored.
// Deploy with `supabase functions deploy mux-webhook --no-verify-jwt` — Mux
// calls this directly, with no Supabase session, and this function
// authenticates the request itself via the Mux-Signature header instead.
import { createClient } from 'npm:@supabase/supabase-js@2'

const MUX_WEBHOOK_SECRET = Deno.env.get('MUX_WEBHOOK_SECRET')!

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  const rawBody = await req.text()
  const signatureHeader = req.headers.get('mux-signature')

  if (!(await isValidMuxSignature(rawBody, signatureHeader, MUX_WEBHOOK_SECRET))) {
    console.error('Mux webhook signature verification failed')
    return new Response('Invalid signature', { status: 400 })
  }

  let event: { type: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'video.asset.ready': {
        const asset = event.data as {
          id: string
          passthrough?: string
          duration?: number
          playback_ids?: { id: string; policy: string }[]
        }
        const assetRowId = asset.passthrough
        if (!assetRowId) break
        const playbackId = asset.playback_ids?.find((p) => p.policy === 'public')?.id
        await supabase.from('mux_assets').update({
          status: 'ready',
          mux_asset_id: asset.id,
          mux_playback_id: playbackId,
          duration_seconds: asset.duration,
          updated_at: new Date().toISOString(),
        }).eq('id', assetRowId)
        break
      }
      case 'video.asset.errored': {
        const asset = event.data as { passthrough?: string }
        const assetRowId = asset.passthrough
        if (!assetRowId) break
        await supabase.from('mux_assets')
          .update({ status: 'errored', updated_at: new Date().toISOString() })
          .eq('id', assetRowId)
        break
      }
      default:
        // Unhandled event types are expected and fine to ignore.
        break
    }
  } catch (e) {
    // Log and 500 so Mux retries — swallowing this would silently leave a
    // video stuck 'uploading'/'preprocessing' forever.
    console.error(`Failed handling ${event.type}`, e)
    return new Response('Handler error', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})

// Mux signs webhooks as `Mux-Signature: t=<unix ts>,v1=<hex hmac-sha256>`,
// computed over `${t}.${rawBody}` with the dashboard's signing secret.
async function isValidMuxSignature(rawBody: string, header: string | null, secret: string): Promise<boolean> {
  if (!header || !secret) return false
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=') as [string, string]))
  const timestamp = parts.t
  const expectedHex = parts.v1
  if (!timestamp || !expectedHex) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`))
  const actualHex = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('')

  return timingSafeEqual(actualHex, expectedHex)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
