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
  if (sortIdx === 1) copy.sort((a, b) => (!!a.distance_unknown - !!b.distance_unknown) || (a.distance_mi - b.distance_mi))
  if (sortIdx === 2) copy.sort((a, b) => (b.avg_rating - a.avg_rating) || (a.distance_mi - b.distance_mi))
  if (sortIdx === 3) copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return copy
}

const EARTH_RADIUS_MI = 3958.8

/** Great-circle distance in miles between two lat/lng points. */
function haversineMi(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_MI * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Replaces each church's distance_mi with its real distance from the given
 * coordinates (e.g. the visitor's browser geolocation), for churches that
 * carry lat/lng. Churches without coordinates keep their seeded distance_mi
 * and are marked distance_unknown so "Near me" can push them to the end. */
export function withDistanceFrom(list, { lat, lng }) {
  return list.map((c) => (
    c.lat == null || c.lng == null
      ? { ...c, distance_unknown: true }
      : { ...c, distance_mi: haversineMi(lat, lng, c.lat, c.lng), distance_unknown: false }
  ))
}
