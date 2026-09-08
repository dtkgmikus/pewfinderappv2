import { supabase } from './supabase'

const REVIEW_SELECT = `
  id, church_id, overall_rating, well_text, improve_text, visited_on, is_anonymous,
  author_display_name, author_initials, tags, seed_helpful_count, created_at,
  review_replies(text, created_at)
`

async function attachHelpfulCounts(rows) {
  if (!rows.length) return rows
  const { data: counts } = await supabase
    .from('review_helpful_counts')
    .select('review_id, helpful_count')
    .in('review_id', rows.map((r) => r.id))
  const byId = Object.fromEntries((counts || []).map((c) => [c.review_id, c.helpful_count]))
  return rows.map((r) => ({
    ...r,
    reply: r.review_replies?.text || null,
    helpfulCount: r.seed_helpful_count + (byId[r.id] || 0),
  }))
}

export async function fetchReviewsForChurch(churchId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('church_id', churchId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  if (error) throw error
  return attachHelpfulCounts(data)
}

export async function fetchFeed(limit = 20) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`${REVIEW_SELECT}, churches(name, slug, town)`)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return attachHelpfulCounts(data)
}

export async function hasHelpfulVote(reviewId, memberId) {
  if (!memberId) return false
  const { data } = await supabase
    .from('review_helpful_votes')
    .select('review_id')
    .eq('review_id', reviewId)
    .eq('member_id', memberId)
    .maybeSingle()
  return !!data
}

export async function toggleHelpful(reviewId, memberId, currentlyOn) {
  if (currentlyOn) {
    await supabase.from('review_helpful_votes').delete().eq('review_id', reviewId).eq('member_id', memberId)
  } else {
    await supabase.from('review_helpful_votes').insert({ review_id: reviewId, member_id: memberId })
  }
}

export async function flagReviewAsMember(reviewId, memberId, reason) {
  const { error } = await supabase
    .from('review_flags')
    .insert({ review_id: reviewId, flagged_by_type: 'member', flagged_by_profile_id: memberId, reason })
  if (error) throw error
}

/**
 * Submit a review: overall rating, optional per-category ratings, optional
 * Preaching sub-ratings, free text, visit date, anonymity.
 */
export async function submitReview({
  churchId, memberId, overall, categories, subcategories,
  wellText, improveText, visitedOn, anonymous, authorName,
}) {
  const initials = anonymous
    ? '—'
    : authorName.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      church_id: churchId,
      member_id: memberId,
      overall_rating: overall,
      well_text: wellText || null,
      improve_text: improveText || null,
      visited_on: visitedOn,
      is_anonymous: anonymous,
      author_display_name: anonymous ? 'Anonymous visitor' : authorName,
      author_initials: initials,
    })
    .select('id')
    .single()
  if (error) throw error

  const catRows = Object.entries(categories || {})
    .filter(([, v]) => v > 0)
    .map(([category_key, rating]) => ({ review_id: review.id, category_key, rating }))
  if (catRows.length) {
    const { error: catErr } = await supabase.from('review_category_ratings').insert(catRows)
    if (catErr) throw catErr
  }

  const subRows = Object.entries(subcategories || {})
    .filter(([, v]) => v > 0)
    .map(([compositeKey, rating]) => {
      const [category_key, sub_key] = compositeKey.split('|')
      return { review_id: review.id, category_key, sub_key, rating }
    })
  if (subRows.length) {
    const { error: subErr } = await supabase.from('review_subcategory_ratings').insert(subRows)
    if (subErr) throw subErr
  }

  return review.id
}
