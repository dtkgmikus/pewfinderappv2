import { supabase } from './supabase'
import { CATEGORIES } from '../data/constants'

/** Fetch the full church_list (churches + folded category_scores jsonb). */
export async function fetchChurches() {
  const { data, error } = await supabase.from('church_list').select('*').order('name')
  if (error) throw error
  return data.map(normalizeChurch)
}

export async function fetchChurchBySlug(slug) {
  const { data, error } = await supabase.from('church_list').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data ? normalizeChurch(data) : null
}

function normalizeChurch(row) {
  return {
    ...row,
    scores: row.category_scores || {},
    rated: row.review_count > 0,
  }
}

/** "Best fit" score used by Discover's sort — average of the member's
 * chosen priority categories, falling back to overall rating with none set. */
export function fitScore(church, priorities) {
  if (!church.rated) return -1
  if (!priorities || !priorities.length) return church.avg_rating
  const vals = priorities.map((k) => church.scores[k]).filter((v) => v != null)
  if (!vals.length) return church.avg_rating
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

/** Ranked category rows (strongest → weakest) for a church's profile page. */
export function rankedCategories(church) {
  if (!church.rated) return []
  return CATEGORIES
    .map((c) => ({ key: c.key, label: c.label, score: church.scores[c.key] }))
    .filter((c) => c.score != null)
    .sort((a, b) => b.score - a.score)
}

export function sortChurches(list, sortIdx, priorities) {
  const copy = [...list]
  if (sortIdx === 0) copy.sort((a, b) => fitScore(b, priorities) - fitScore(a, priorities))
  if (sortIdx === 1) copy.sort((a, b) => a.distance_mi - b.distance_mi)
  if (sortIdx === 2) copy.sort((a, b) => (b.avg_rating - a.avg_rating) || (a.distance_mi - b.distance_mi))
  if (sortIdx === 3) copy.sort((a, b) => (b.review_count - a.review_count) || (a.distance_mi - b.distance_mi))
  return copy
}
