// POST with a Bearer access token (any logged-in, non-restricted member —
// posting a video question OR a video answer both start here). Returns
// { assetId, uploadUrl }. The client PUTs the raw video file directly to
// `uploadUrl` (Mux's direct-upload endpoint) — the video bytes never pass
// through this function or through Supabase. Once Mux finishes processing
// the upload, it calls mux-webhook, which is the ONLY thing that ever marks
// the resulting mux_assets row 'ready' (see patch-010's
// protect_mux_asset_fields trigger) — this function only ever creates the
// row in 'uploading' state and hands back where to send the bytes.
import { verifyMember, AuthError } from '../_shared/verifyMember.ts'

const MUX_TOKEN_ID = Deno.env.get('MUX_TOKEN_ID')!
const MUX_TOKEN_SECRET = Deno.env.get('MUX_TOKEN_SECRET')!
const SITE_URL = Deno.env.get('SITE_URL')! // e.g. https://get-god.com — no trailing slash

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  try {
    const { userId, serviceClient } = await verifyMember(req)

    // Create our own row first so we have an id to hand Mux as `passthrough`
    // — that's how the webhook matches an incoming asset back to this row
    // without trusting anything the client says.
    const { data: assetRow, error: insertErr } = await serviceClient
      .from('mux_assets')
      .insert({ owner_profile_id: userId, status: 'uploading' })
      .select('id')
      .single()
    if (insertErr || !assetRow) throw new AuthError('Could not create the video record', 500)

    const muxRes = await fetch('https://api.mux.com/video/v1/uploads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`),
      },
      body: JSON.stringify({
        cors_origin: SITE_URL,
        new_asset_settings: {
          playback_policy: ['public'],
          passthrough: assetRow.id,
          // Mux still processes and stores anything longer, but this keeps
          // the 5-minute cap visible in the Mux dashboard too — the real
          // enforcement is patch-010's duration-cap trigger on our side.
          max_resolution_tier: '1080p',
        },
      }),
    })
    if (!muxRes.ok) {
      const detail = await muxRes.text()
      console.error('Mux upload creation failed', muxRes.status, detail)
      throw new AuthError('Could not start the video upload', 502)
    }
    const mux = await muxRes.json()

    await serviceClient
      .from('mux_assets')
      .update({ mux_upload_id: mux.data.id })
      .eq('id', assetRow.id)

    return json({ assetId: assetRow.id, uploadUrl: mux.data.url })
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 500
    console.error('create-mux-upload-url failed', e)
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, status)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
