import { supabase } from './supabase.js'

const MAX_DURATION_SECONDS = 300 // 5 minutes — see MOBILE.md / patch-010's enforce_mux_duration_cap

/**
 * Starts a direct-to-Mux video upload. Returns { assetId, uploadUrl } —
 * `assetId` is our own mux_assets row id (use it as video_asset_id when
 * creating the question/answer once the asset is ready); `uploadUrl` is
 * where to PUT the raw file. The video's bytes go straight to Mux — they
 * never pass through our own server.
 */
async function createMuxUpload() {
  const { data, error } = await supabase.functions.invoke('create-mux-upload-url', { body: {} })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data // { assetId, uploadUrl }
}

/** PUTs the file to Mux's direct-upload URL, reporting 0–1 progress. */
function uploadVideoFile(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl, true)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('Upload failed — check your connection.'))
    xhr.send(file)
  })
}

/**
 * Polls our own mux_assets row until Mux has finished processing (the
 * mux-webhook function is what actually flips this, once Mux calls it —
 * see supabase/functions/mux-webhook). Resolves with the row once it
 * leaves 'uploading'/'preprocessing', or rejects on timeout.
 */
async function waitForAssetReady(assetId, { timeoutMs = 120_000, intervalMs = 2500 } = {}) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const { data, error } = await supabase
      .from('mux_assets')
      .select('status, duration_seconds')
      .eq('id', assetId)
      .single()
    if (error) throw error
    if (data.status === 'ready' || data.status === 'errored' || data.status === 'rejected_too_long') {
      return data
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  throw new Error('Still processing — check back in a moment.')
}

/** Full flow: upload the file, then wait for Mux (and our duration cap) to clear it. */
async function uploadAndWait(file, onProgress) {
  const { assetId, uploadUrl } = await createMuxUpload()
  await uploadVideoFile(uploadUrl, file, onProgress)
  const asset = await waitForAssetReady(assetId)
  if (asset.status === 'rejected_too_long') {
    throw new Error(`That video is longer than the ${MAX_DURATION_SECONDS / 60}-minute limit — please trim it and try again.`)
  }
  if (asset.status === 'errored') {
    throw new Error('That video could not be processed — please try a different file.')
  }
  return assetId
}

export { MAX_DURATION_SECONDS, createMuxUpload, uploadVideoFile, waitForAssetReady, uploadAndWait }
