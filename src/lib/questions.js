import { supabase } from './supabase'

const QUESTION_SELECT = `
  id, title, body_text, is_anonymous, author_display_name, author_initials,
  tag_key, created_at,
  question_tags(label),
  video_asset:mux_assets(id, mux_playback_id, status, duration_seconds),
  question_answers(count)
`

function withAnswerCount(row) {
  return { ...row, answerCount: row.question_answers?.[0]?.count ?? 0 }
}

export async function fetchQuestionTags() {
  const { data, error } = await supabase.from('question_tags').select('key, label').order('sort_order')
  if (error) throw error
  return data
}

export async function fetchQuestionFeed({ limit = 20, tagKey } = {}) {
  let query = supabase
    .from('questions')
    .select(QUESTION_SELECT)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (tagKey) query = query.eq('tag_key', tagKey)
  const { data, error } = await query
  if (error) throw error
  return data.map(withAnswerCount)
}

/** Full-text search over title + body (see patch-011's search_vector). */
export async function searchQuestions(term, { limit = 20 } = {}) {
  if (!term?.trim()) return fetchQuestionFeed({ limit })
  const { data, error } = await supabase
    .from('questions')
    .select(QUESTION_SELECT)
    .eq('status', 'published')
    .textSearch('search_vector', term.trim(), { type: 'websearch' })
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data.map(withAnswerCount)
}

export async function fetchQuestion(id) {
  const { data: question, error } = await supabase
    .from('questions')
    .select(`id, title, body_text, is_anonymous, author_display_name, author_initials, tag_key, created_at, question_tags(label), video_asset:mux_assets(id, mux_playback_id, status, duration_seconds)`)
    .eq('id', id)
    .single()
  if (error) throw error

  const { data: answers, error: answersErr } = await supabase
    .from('question_answers')
    .select(`id, author_display_name, author_initials, is_moderator_answer, created_at, video_asset:mux_assets(id, mux_playback_id, status, duration_seconds)`)
    .eq('question_id', id)
    .eq('status', 'published')
    .order('is_moderator_answer', { ascending: false })
    .order('created_at', { ascending: false })
  if (answersErr) throw answersErr

  return { ...question, answers }
}

/**
 * Post a question — text, video, or both a title and one of the two body
 * fields. Anonymity works exactly like reviews' is_anonymous pattern
 * (patch-011's enforce_question_anonymity trigger backstops it server-side
 * regardless of what's sent here).
 */
export async function submitQuestion({ authorId, title, bodyText, videoAssetId, tagKey, anonymous, authorName }) {
  const initials = anonymous
    ? '?'
    : authorName.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')

  const { data, error } = await supabase
    .from('questions')
    .insert({
      author_id: authorId,
      title,
      body_text: bodyText || null,
      video_asset_id: videoAssetId || null,
      tag_key: tagKey || null,
      is_anonymous: anonymous,
      author_display_name: anonymous ? 'Anonymous' : authorName,
      author_initials: initials,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

/** Post a video answer — always video, always under the poster's real name (no anonymous option, by design). */
export async function submitAnswer({ questionId, authorId, videoAssetId, authorName }) {
  const initials = authorName.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')
  const { data, error } = await supabase
    .from('question_answers')
    .insert({
      question_id: questionId,
      author_id: authorId,
      video_asset_id: videoAssetId,
      author_display_name: authorName,
      author_initials: initials,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function fetchModeratorStatus(profileId) {
  if (!profileId) return null
  const { data, error } = await supabase
    .from('qa_moderators')
    .select('status, application_text, created_at')
    .eq('profile_id', profileId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function applyForModerator(profileId, applicationText) {
  const { error } = await supabase
    .from('qa_moderators')
    .insert({ profile_id: profileId, application_text: applicationText })
  if (error) throw error
}
