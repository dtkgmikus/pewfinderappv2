// Static constants that mirror seeded, mostly-stable reference data
// (review_categories, category_subquestions, program_catalog). Loaded here
// rather than fetched every render since they change rarely; screens that
// need the live/admin-editable version can still hit Supabase directly.

export const CATEGORIES = [
  { key: 'parking', label: 'Parking' },
  { key: 'friendliness', label: 'Friendliness / welcome' },
  { key: 'atmosphere', label: 'Atmosphere' },
  { key: 'bathrooms', label: 'Bathroom cleanliness' },
  { key: 'preaching', label: 'Preaching' },
  { key: 'music', label: 'Music / worship' },
  { key: 'kids_nursery', label: 'Kids & nursery' },
  { key: 'accessibility', label: 'Accessibility' },
  { key: 'coffee', label: 'Coffee & hospitality' },
  { key: 'signage', label: 'Signage & wayfinding' },
  { key: 'followup', label: 'Follow-up after visiting' },
]

export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]))

export const SUBCATEGORIES = {
  preaching: {
    heading: 'About the preaching',
    note: 'Rate only what you noticed. These roll up into the church’s preaching score.',
    items: [
      { key: 'faithful', label: 'Faithful to the text' },
      { key: 'clear', label: 'Clear and easy to follow' },
      { key: 'practical', label: 'Practical to apply this week' },
      { key: 'delivery', label: 'Delivery and engagement' },
      { key: 'length', label: 'Length felt right' },
      { key: 'balance', label: 'Grace and conviction in balance' },
      { key: 'honesty', label: 'Handled hard topics honestly' },
    ],
  },
}

export const PRIORITY_CHIP_KEYS = ['friendliness', 'kids_nursery', 'parking', 'accessibility', 'music', 'preaching', 'bathrooms']

export const SORT_OPTIONS = ['Best fit', 'Closest', 'Highest rated', 'Newest']

export const PROGRAM_GROUPS = [
  ['Children & youth', ['Sunday school', 'Nursery / childcare', 'Kids club (AWANA or similar)', 'Youth group, grades 6–8', 'Youth group, grades 9–12', 'Vacation Bible school', 'Preschool or day school', 'After-school program']],
  ['Adults & groups', ['Small groups / Bible study', 'Prayer meeting', 'Men’s ministry', 'Women’s ministry', 'Young adults', 'Senior adult ministry', 'Choir or worship team', 'Marriage and couples']],
  ['Care & support', ['Celebrate Recovery / addiction support', 'Grief support', 'Divorce care', 'Pastoral counseling', 'Meal train for families', 'Hospital and homebound visits']],
  ['Community & outreach', ['Food pantry', 'Clothing closet', 'Community service days', 'Mission trips', 'Financial and budgeting classes', 'Sports or rec leagues', 'Benevolence fund']],
  ['Access & language', ['Spanish-language service', 'ASL interpretation', 'Large-print or audio materials', 'Special needs ministry', 'Transportation / van pickup']],
]

export const SIGNUP_GROUPS = [
  ['What matters most to you', ['Preaching', 'Friendliness / welcome', 'Kids & nursery', 'Music / worship', 'Accessibility', 'Parking'], true, true],
  ['Worship style', ['Contemporary', 'Blended', 'Traditional', 'No preference'], true, false],
  ['Where you are right now', ['Looking for a church', 'Between churches', 'Attending somewhere', 'New to faith'], true, false],
  ['How far you would drive', ['Under 5 mi', '5 to 10 mi', '10 to 20 mi', 'Further'], true, false],
  ['Your age', ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'], false, false],
  ['Household', ['Kids under 12', 'Teens at home', 'Single', 'Couple, no kids', 'Empty nester'], false, false],
]

export const AVATAR_COLORS = ['#6b6357', '#8a7a5e', '#5d6b63', '#7a6b74', '#6a7480']

export function avatarColor(initials) {
  const code = (initials || '?').charCodeAt(0) || 0
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

export function initialsOf(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}
