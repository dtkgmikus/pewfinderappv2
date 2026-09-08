-- Pewfinder — seed data
-- Ported from the three .dc.html prototypes' hardcoded DATA/ROSTER/FEED/
-- REVIEWS/CLAIMS/PROMOS arrays. Run with the service role (bypasses RLS)
-- after schema.sql. Church photos are intentionally left null — the app
-- renders a neutral placeholder plate until a real photo is uploaded
-- (the prototype's Adobe Stock comp images aren't licensed for production).

-- ===================================================== review categories --
insert into review_categories (key, label, sort_order) values
  ('parking', 'Parking', 1),
  ('friendliness', 'Friendliness / welcome', 2),
  ('atmosphere', 'Atmosphere', 3),
  ('bathrooms', 'Bathroom cleanliness', 4),
  ('preaching', 'Preaching', 5),
  ('music', 'Music / worship', 6),
  ('kids_nursery', 'Kids & nursery', 7),
  ('accessibility', 'Accessibility', 8),
  ('coffee', 'Coffee & hospitality', 9),
  ('signage', 'Signage & wayfinding', 10),
  ('followup', 'Follow-up after visiting', 11);

insert into category_subquestions (category_key, sub_key, label, sort_order, heading, note) values
  ('preaching', 'faithful', 'Faithful to the text', 1, 'About the preaching', 'Rate only what you noticed. These roll up into the church''s preaching score.'),
  ('preaching', 'clear', 'Clear and easy to follow', 2, 'About the preaching', 'Rate only what you noticed. These roll up into the church''s preaching score.'),
  ('preaching', 'practical', 'Practical to apply this week', 3, 'About the preaching', 'Rate only what you noticed. These roll up into the church''s preaching score.'),
  ('preaching', 'delivery', 'Delivery and engagement', 4, 'About the preaching', 'Rate only what you noticed. These roll up into the church''s preaching score.'),
  ('preaching', 'length', 'Length felt right', 5, 'About the preaching', 'Rate only what you noticed. These roll up into the church''s preaching score.'),
  ('preaching', 'balance', 'Grace and conviction in balance', 6, 'About the preaching', 'Rate only what you noticed. These roll up into the church''s preaching score.'),
  ('preaching', 'honesty', 'Handled hard topics honestly', 7, 'About the preaching', 'Rate only what you noticed. These roll up into the church''s preaching score.');

-- ======================================================== program catalog --
insert into program_catalog (group_name, label, sort_order) values
  ('Children & youth', 'Sunday school', 1),
  ('Children & youth', 'Nursery / childcare', 2),
  ('Children & youth', 'Kids club (AWANA or similar)', 3),
  ('Children & youth', 'Youth group, grades 6–8', 4),
  ('Children & youth', 'Youth group, grades 9–12', 5),
  ('Children & youth', 'Vacation Bible school', 6),
  ('Children & youth', 'Preschool or day school', 7),
  ('Children & youth', 'After-school program', 8),
  ('Adults & groups', 'Small groups / Bible study', 9),
  ('Adults & groups', 'Prayer meeting', 10),
  ('Adults & groups', 'Men''s ministry', 11),
  ('Adults & groups', 'Women''s ministry', 12),
  ('Adults & groups', 'Young adults', 13),
  ('Adults & groups', 'Senior adult ministry', 14),
  ('Adults & groups', 'Choir or worship team', 15),
  ('Adults & groups', 'Marriage and couples', 16),
  ('Care & support', 'Celebrate Recovery / addiction support', 17),
  ('Care & support', 'Grief support', 18),
  ('Care & support', 'Divorce care', 19),
  ('Care & support', 'Pastoral counseling', 20),
  ('Care & support', 'Meal train for families', 21),
  ('Care & support', 'Hospital and homebound visits', 22),
  ('Community & outreach', 'Food pantry', 23),
  ('Community & outreach', 'Clothing closet', 24),
  ('Community & outreach', 'Community service days', 25),
  ('Community & outreach', 'Mission trips', 26),
  ('Community & outreach', 'Financial and budgeting classes', 27),
  ('Community & outreach', 'Sports or rec leagues', 28),
  ('Community & outreach', 'Benevolence fund', 29),
  ('Access & language', 'Spanish-language service', 30),
  ('Access & language', 'ASL interpretation', 31),
  ('Access & language', 'Large-print or audio materials', 32),
  ('Access & language', 'Special needs ministry', 33),
  ('Access & language', 'Transportation / van pickup', 34);

-- ============================================================== churches --
insert into churches (slug, name, denomination, street, town, zip, distance_mi, service_times, facts, claimed, verified, verification_method, verified_at, plan, avg_rating, review_count) values
  ('greentree', 'Greentree Church', 'Non-denominational', '125 School House Rd', 'Egg Harbor Twp', '08234', 1.2, 'Sun 9:00 & 11:00',
    array['Sun 9:00 & 11:00','~600 attend','Modern worship band','35-min sermons','Nursery + K-5','Step-free entry','ASL on request'],
    true, true, 'domain_email', now() - interval '4 months', 'pro', 4.6, 128),
  ('oceanheights', 'Ocean Heights Presbyterian', 'Presbyterian', '2116 Ocean Heights Ave', 'Egg Harbor Twp', '08234', 2.4, 'Sun 8:00 & 10:15',
    array['Sun 8:00 & 10:15','~180 attend','Choir & organ','20-min homilies','Sunday school','Ramp at side door'],
    true, true, 'phone_call', now() - interval '3 months', 'free', 4.4, 61),
  ('zion', 'Zion United Methodist', 'United Methodist', '652 Zion Rd', 'Egg Harbor Twp', '08234', 3.1, 'Sun 9:30 & 11:00',
    array['Sun 9:30 & 11:00','~400 attend','Blended music','45-min sermons','Nursery + youth','Large paved lot'],
    true, true, 'postcard', now() - interval '6 months', 'free', 4.2, 94),
  ('faithbible', 'Faith Bible Baptist Church', 'Baptist', '2063 Ocean Heights Ave', 'Egg Harbor Twp', '08234', 4.0, 'Sun 10:00',
    array['Sun 10:00','~150 attend','Hymns & piano','30-min sermons','Nursery','Hearing loop','Step-free'],
    true, true, 'domain_email', now() - interval '5 months', 'pro', 4.7, 43),
  ('holytrinity', 'Holy Trinity Greek Orthodox', 'Greek Orthodox', '7004 Ridge Ave', 'Egg Harbor Twp', '08234', 5.2, 'Sun 9:30 Divine Liturgy',
    array['Sun 9:30 Liturgy','~90 attend','Byzantine chant','25-min homilies','No nursery','Stairs at entry'],
    true, true, 'upload', now() - interval '2 months', 'pro', 4.5, 27),
  ('drexel', 'St. Katharine Drexel', 'Catholic', '6075 W Jersey Ave', 'Egg Harbor Twp', '08234', 2.9, 'Sat 5:00 · Sun 8:00, 10:00 & 12:00',
    array['Sat 5:00 · Sun 8:00, 10:00 & 12:00','~700 attend','Cantor & organ','15-min homilies','Religious ed','Step-free entry'],
    true, true, 'domain_email', now() - interval '7 months', 'pro', 3.9, 72),
  ('newlife', 'New Life Church', 'Charismatic', '2577 Tilton Rd', 'Egg Harbor Twp', '08234', 1.8, 'Sun 9:00 & 11:00',
    array['Sun 9:00 & 11:00','~450 attend','Full worship band','40-min sermons','Nursery + youth','Step-free entry'],
    true, true, 'domain_email', now() - interval '2 months', 'free', 4.3, 88),
  ('scullville', 'Scullville Bible Church', 'Bible', '1546 Somers Point Rd', 'Egg Harbor Twp', '08234', 3.6, 'Sun 9:45 & 11:00',
    array['Sun 9:45 & 11:00','~140 attend','Hymns & piano','40-min sermons','Sunday school','Gravel lot'],
    true, true, 'phone_call', now() - interval '1 month', 'free', 4.4, 39),
  ('stpaul', 'St. Paul''s Coptic Orthodox', 'Coptic Orthodox', '3090 Tremont Ave', 'Egg Harbor Twp', '08234', 4.4, 'Sun 9:00 Liturgy',
    array['Sun 9:00 Liturgy','~120 attend','Coptic chant','30-min homilies','Sunday school','Stairs at entry'],
    true, true, 'upload', now() - interval '3 months', 'free', 4.6, 22),
  ('asbury', 'Asbury United Methodist', 'United Methodist', '290 Asbury Rd', 'Egg Harbor Twp', '08234', 2.1, 'Sun 8:30 & 10:30',
    array['Sun 8:30 & 10:30','~200 attend','Choir & organ','25-min sermons','Nursery','Ramp at side door'],
    true, true, 'postcard', now() - interval '9 months', 'free', 4.1, 54),
  ('fusion', 'Fusion Church', 'Non-denominational', '6300 E Black Horse Pike', 'Egg Harbor Twp', '08234', 4.9, 'Sun 9:00, 10:45 & 12:30',
    array['Sun 9:00, 10:45 & 12:30','Multi-site · also Newfield and Ventnor','Claimed and verified'],
    true, true, 'domain_email', now() - interval '5 days', 'pro', 4.6, 23);

insert into churches (slug, name, denomination, street, town, zip, distance_mi, service_times, facts) values
  ('r0', 'Shore Fellowship Church', 'Non-denominational', '1049 Ocean Heights Ave', 'Egg Harbor Twp', '08234', 3.4, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r1', 'Cardiff Baptist Church', 'Baptist', '6523 W Jersey Ave', 'Egg Harbor Twp', '08234', 2.6, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r2', 'Heavensway Baptist Church', 'Baptist', '5082 Tremont Ave', 'Egg Harbor Twp', '08234', 4.1, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r3', 'Trinity Baptist Church', 'Baptist Bible Fellowship', '1049 Ocean Heights Ave', 'Egg Harbor Twp', '08234', 3.4, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r4', 'Haitian Evangelical Baptist Church', 'Baptist', '6045 W Jersey Ave', 'Egg Harbor Twp', '08234', 2.8, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r5', 'First Baptist Church of Atlantic City', 'Baptist', '6801 Delilah Rd', 'Egg Harbor Twp', '08234', 5.6, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r6', 'Grace Tabernacle Church', 'Non-denominational', '5019 Tremont Ave', 'Egg Harbor Twp', '08234', 4.0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r7', 'Lighthouse Outreach Ministries', 'Non-denominational', '1414 Doughty Rd', 'Egg Harbor Twp', '08234', 5.1, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r8', 'Stone Truth Gospel of Christ Church', 'Non-denominational', '9 Stafford Ave', 'Egg Harbor Twp', '08234', 3.9, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r9', 'Praise Tabernacle', 'Non-denominational', '2235 Ocean Heights Ave', 'Egg Harbor Twp', '08234', 2.5, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r10', 'Morning Star Holiness Church', 'Holiness', '2816 Fire Rd', 'Egg Harbor Twp', '08234', 3.2, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r11', 'New Life Assembly of God', 'Assemblies of God', '5071 Fernwood Ave', 'Egg Harbor Twp', '08234', 2.2, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r12', 'Solid Rock United Pentecostal', 'Pentecostal', '1140 Ocean Heights Ave', 'Egg Harbor Twp', '08234', 3.5, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r13', 'Deeper Life Deliverance Ministries', 'Non-denominational', '6024 Black Horse Pike', 'Egg Harbor Twp', '08234', 4.7, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r14', 'Graves Temple', 'Denomination not listed', '123 Church St', 'Egg Harbor Twp', '08234', 3.0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r15', 'First United Methodist Church', 'United Methodist', '6011 Main St', 'Mays Landing', '08330', 7.4, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r16', 'The Presbyterian Church of Mays Landing', 'Presbyterian', '6100 Main St', 'Mays Landing', '08330', 7.5, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r17', 'St. Vincent de Paul Catholic Church', 'Catholic', 'Main St area', 'Mays Landing', '08330', 7.2, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r18', 'Orthodox Church of the Mother of God', 'Orthodox', '115 Hudson St', 'Mays Landing', '08330', 7.6, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r19', 'Anglican Church of Transformation', 'Anglican / Episcopal', '114 Route 50', 'Mays Landing', '08330', 8.1, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r20', 'Lakewood Chapel', 'Christian & Missionary Alliance', '6155 Harding Hwy', 'Mays Landing', '08330', 8.4, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r21', 'Mays Landing Baptist Church', 'Independent Baptist', 'Mays Landing', 'Mays Landing', '08330', 7.9, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r22', 'Mount Olive Missionary Baptist Church', 'Baptist', '6844 Strand Ave', 'Mays Landing', '08330', 7.7, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r23', 'First Union Baptist Church', 'Baptist', '854 Jackson Rd', 'Mays Landing', '08330', 9.2, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r24', 'First Baptist Church', 'Baptist', '1326 Annapolis Ave', 'Mays Landing', '08330', 7.1, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r25', 'Evangel Assembly of God', 'Assemblies of God', 'Mays Landing', 'Mays Landing', '08330', 7.3, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r26', 'Apostles'' Doctrine Church', 'Pentecostal (UPCI)', '6108 7th St', 'Mays Landing', '08330', 7.5, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r27', 'Spirit & Truth Worship Center', 'Non-denominational', '4529 Drosera St', 'Mays Landing', '08330', 8.6, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r28', 'One Hope in Christ Christian Fellowship', 'Baptist', 'Mays Landing', 'Mays Landing', '08330', 8.0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
  ('r29', 'Weymouth United Methodist Church', 'United Methodist', 'Mays Landing', 'Mays Landing', '08330', 9.6, 'Service times not listed', array['Service times not listed','Unclaimed listing']);

-- Town-center coordinates for "near me" — see patch-002 for the same
-- backfill against an already-deployed database.
update churches set lat = 39.37650, lng = -74.63600 where town = 'Egg Harbor Twp' and lat is null;
update churches set lat = 39.45230, lng = -74.72740 where town = 'Mays Landing' and lat is null;

-- ==================================================== map pin placements --
update churches set map_x = v.x, map_y = v.y from (values
  ('greentree', 58, 36), ('oceanheights', 30, 52), ('zion', 72, 58), ('faithbible', 44, 70),
  ('holytrinity', 20, 26), ('drexel', 62, 16), ('newlife', 38, 22), ('scullville', 78, 34),
  ('stpaul', 26, 68), ('asbury', 52, 50), ('fusion', 58, 44)
) as v(slug, x, y) where churches.slug = v.slug;

-- ==================================================== church category scores
-- Maintained baselines (see churches.avg_rating for the overall figure).
-- Keys: parking, friendliness, atmosphere, bathrooms, preaching, music,
-- kids_nursery, accessibility, coffee, signage, followup.
insert into church_category_scores (church_id, category_key, avg_score, n)
select c.id, v.category_key, v.avg_score, c.review_count
from (values
  ('greentree','parking',4.8),('greentree','friendliness',4.9),('greentree','atmosphere',4.6),('greentree','bathrooms',4.7),('greentree','preaching',4.4),('greentree','music',4.7),('greentree','kids_nursery',4.8),('greentree','accessibility',4.3),('greentree','coffee',4.5),('greentree','signage',3.6),('greentree','followup',3.2),
  ('oceanheights','parking',3.9),('oceanheights','friendliness',4.5),('oceanheights','atmosphere',4.9),('oceanheights','bathrooms',4.0),('oceanheights','preaching',4.5),('oceanheights','music',4.8),('oceanheights','kids_nursery',3.8),('oceanheights','accessibility',3.5),('oceanheights','coffee',4.6),('oceanheights','signage',4.1),('oceanheights','followup',4.2),
  ('zion','parking',4.7),('zion','friendliness',4.3),('zion','atmosphere',3.9),('zion','bathrooms',4.4),('zion','preaching',4.6),('zion','music',3.7),('zion','kids_nursery',4.5),('zion','accessibility',4.2),('zion','coffee',3.6),('zion','signage',4.3),('zion','followup',4.4),
  ('faithbible','parking',4.4),('faithbible','friendliness',4.8),('faithbible','atmosphere',4.5),('faithbible','bathrooms',4.9),('faithbible','preaching',4.7),('faithbible','music',4.2),('faithbible','kids_nursery',4.1),('faithbible','accessibility',4.8),('faithbible','coffee',4.7),('faithbible','signage',4.5),('faithbible','followup',4.6),
  ('holytrinity','parking',4.1),('holytrinity','friendliness',4.4),('holytrinity','atmosphere',5.0),('holytrinity','bathrooms',4.2),('holytrinity','preaching',4.3),('holytrinity','music',4.9),('holytrinity','kids_nursery',3.2),('holytrinity','accessibility',2.9),('holytrinity','coffee',4.8),('holytrinity','signage',3.4),('holytrinity','followup',3.9),
  ('drexel','parking',4.2),('drexel','friendliness',4.1),('drexel','atmosphere',3.7),('drexel','bathrooms',3.3),('drexel','preaching',3.8),('drexel','music',4.0),('drexel','kids_nursery',3.9),('drexel','accessibility',4.1),('drexel','coffee',3.8),('drexel','signage',3.9),('drexel','followup',3.5),
  ('newlife','parking',4.5),('newlife','friendliness',4.7),('newlife','atmosphere',4.6),('newlife','bathrooms',4.2),('newlife','preaching',4.1),('newlife','music',4.8),('newlife','kids_nursery',4.4),('newlife','accessibility',4.0),('newlife','coffee',4.3),('newlife','signage',3.8),('newlife','followup',3.5),
  ('scullville','parking',3.8),('scullville','friendliness',4.6),('scullville','atmosphere',4.3),('scullville','bathrooms',4.5),('scullville','preaching',4.8),('scullville','music',3.9),('scullville','kids_nursery',4.0),('scullville','accessibility',3.6),('scullville','coffee',4.4),('scullville','signage',4.0),('scullville','followup',4.5),
  ('stpaul','parking',4.0),('stpaul','friendliness',4.5),('stpaul','atmosphere',4.9),('stpaul','bathrooms',4.3),('stpaul','preaching',4.4),('stpaul','music',4.7),('stpaul','kids_nursery',3.5),('stpaul','accessibility',3.1),('stpaul','coffee',4.9),('stpaul','signage',3.3),('stpaul','followup',4.0),
  ('asbury','parking',4.3),('asbury','friendliness',4.4),('asbury','atmosphere',4.2),('asbury','bathrooms',3.9),('asbury','preaching',4.0),('asbury','music',4.3),('asbury','kids_nursery',3.7),('asbury','accessibility',4.4),('asbury','coffee',4.1),('asbury','signage',4.2),('asbury','followup',3.8),
  ('fusion','parking',4.6),('fusion','friendliness',4.5),('fusion','atmosphere',4.7),('fusion','bathrooms',4.5),('fusion','preaching',4.8),('fusion','music',4.4),('fusion','kids_nursery',3.4),('fusion','accessibility',3.6),('fusion','coffee',4.4),('fusion','signage',3.1),('fusion','followup',4.2)
) as v(slug, category_key, avg_score)
join churches c on c.slug = v.slug;

-- ==================================================================== reviews
-- Sample review text, ported verbatim. Not tied to real accounts
-- (member_id null); tags are display chips only, not category ratings.
insert into reviews (church_id, overall_rating, well_text, visited_on, is_anonymous, author_display_name, author_initials, tags, seed_helpful_count, created_at)
select c.id, v.rating, v.text, v.visited_on::date, v.anon, v.author, v.initials, v.tags, v.helpful, v.created_at
from (values
  ('greentree', 5, 'We came in ten minutes late with two kids and never once felt it. A greeter walked us to the nursery, checked our daughter in, and had a badge printed before the second song. The room is dim and loud in a way I like, though my mother-in-law asked for the volume twice.', '2026-08-24', false, 'Marisol D.', 'MD', array['Friendliness / welcome','Kids & nursery'], 34, now() - interval '13 days'),
  ('greentree', 3, 'Preaching was clear and grounded in the text. Everything else took work: the lot has no signs for visitor parking, the door we chose led to a hallway with no one in it, and nobody reached out after we filled in the card. Good church, hard to enter.', '2026-08-17', true, 'Anonymous visitor', '—', array['Signage & wayfinding','Follow-up after visiting'], 21, now() - interval '20 days'),
  ('oceanheights', 5, 'The 8:00 is spoken and nearly empty and it is the best half hour of my week. Choir at 10:15 is genuinely good. Parking is street-only and tight after 10, so walk a block and save yourself the circling.', '2026-08-10', false, 'Grant W.', 'GW', array['Atmosphere','Music / worship'], 19, now() - interval '27 days'),
  ('zion', 4, 'Verse-by-verse preaching, forty-five minutes, worth every one. The music has not changed in a decade and the band knows it. Enormous lot, so you will never be late for parking reasons.', '2026-07-27', true, 'Anonymous visitor', '—', array['Preaching','Music / worship'], 12, now() - interval '41 days'),
  ('faithbible', 5, 'My husband uses a walker and this is the only church nearby where he has never needed help getting in. Hearing loop actually works. The bathrooms are cleaner than most restaurants I have been in this year.', '2026-08-31', false, 'Deb R.', 'DR', array['Accessibility','Bathroom cleanliness'], 27, now() - interval '6 days'),
  ('holytrinity', 5, 'Two hours standing, incense, chant, no projector. If you have never been to a liturgy, arrive early and let someone explain the layout. Coffee hour afterward is a full meal and they will not let you leave without eating.', '2026-08-03', false, 'Nadia P.', 'NP', array['Atmosphere','Coffee & hospitality'], 15, now() - interval '34 days'),
  ('drexel', 4, 'Warm room, easy to talk to people afterward, and the 9:00 is quiet enough to think. The downstairs bathrooms need attention — that is the one thing keeping this from a five for us.', '2026-08-17', false, 'Tom L.', 'TL', array['Friendliness / welcome','Bathroom cleanliness'], 8, now() - interval '20 days'),
  ('newlife', 4, 'The music carries this place — full band, loud, and the room sings along instead of watching. Sermon leaned more encouraging than expository, which will suit some people more than others. Easy parking either service.', '2026-08-24', false, 'Renee K.', 'RK', array['Music / worship','Friendliness / welcome'], 11, now() - interval '13 days'),
  ('scullville', 5, 'Small, plain, and the teaching is the reason to come. Someone called on Tuesday to ask how our week was going, which has never happened to us anywhere else. The lot is gravel and uneven if that matters to you.', '2026-08-17', true, 'Anonymous visitor', '—', array['Preaching','Follow-up after visiting'], 9, now() - interval '20 days'),
  ('stpaul', 5, 'Liturgy is long and mostly sung, some of it in Coptic with English on the screens. We were fed twice before anyone asked our names. Steps at the front door are the one hurdle — there is a side entrance, but it is not signed.', '2026-08-10', false, 'Peter A.', 'PA', array['Atmosphere','Coffee & hospitality'], 7, now() - interval '27 days'),
  ('asbury', 4, 'The 8:30 is small and quiet, the 10:30 has the choir. Ramp at the side door is well kept and the ushers watch for people who need it. Nursery is staffed but tight on space at the later service.', '2026-08-31', false, 'Joanne T.', 'JT', array['Accessibility','Music / worship'], 6, now() - interval '6 days')
) as v(slug, rating, text, visited_on, anon, author, initials, tags, helpful, created_at)
join churches c on c.slug = v.slug;

-- Fusion Church reviews (superset from the Church Admin console, includes
-- the flagged "false claim" review) — with real per-review category ratings,
-- since the admin console captured those explicitly.
insert into reviews (church_id, overall_rating, well_text, visited_on, is_anonymous, author_display_name, author_initials, tags, seed_helpful_count, created_at)
select (select id from churches where slug = 'fusion'), v.rating, v.text, v.visited_on::date, v.anon, v.author, v.initials, v.tags, v.helpful, v.created_at
from (values
  (5, 'First Sunday visiting and three different people introduced themselves without it feeling staged. The 10:45 was full but a greeter found us seats. Kids check-in took two minutes.', '2026-09-01', false, 'Danielle R.', 'DR', array['Friendliness / welcome','Kids & nursery'], 4, now() - interval '3 hours'),
  (3, 'Preaching was strong and clearly from the text. Parking is the problem — we circled for eight minutes before the 10:45 and ended up on the grass. Signage from the Pike is easy to miss.', '2026-08-31', false, 'Kevin O.', 'KO', array['Preaching','Parking'], 11, now() - interval '1 day'),
  (1, 'Pastor is a liar and the whole place is a money grab. My cousin works there and told me they spent the building fund on a boat. Do not give these people a dollar.', '2026-08-30', true, 'Anonymous', 'AN', array[]::text[], 2, now() - interval '2 days'),
  (5, 'Came in ten minutes late with two kids and never once felt it. Someone walked us to the nursery and had a badge printed before the second song ended.', '2026-08-24', false, 'Marisol D.', 'MD', array['Friendliness / welcome','Kids & nursery'], 18, now() - interval '4 days'),
  (4, 'Good music, a little loud for us. Coffee was free and actually good. Bathrooms clean. Would have liked a bulletin — everything is on a screen or an app.', '2026-08-22', false, 'Tom B.', 'TB', array['Music / worship','Coffee & hospitality'], 7, now() - interval '6 days'),
  (4, 'Wheelchair access is good at the main doors but the middle rows have no space for a chair, so my mother sat at the back on her own.', '2026-08-17', false, 'Grace L.', 'GL', array['Accessibility'], 9, now() - interval '7 days')
) as v(rating, text, visited_on, anon, author, initials, tags, helpful, created_at);

-- Three extra reviews that exist solely so the Staff Admin "Flagged reviews"
-- demo (f2, f3, f4) has real rows to point at.
insert into reviews (church_id, overall_rating, well_text, visited_on, is_anonymous, author_display_name, author_initials, created_at) values
  ((select id from churches where slug = 'greentree'), 2, 'Sanctuary was freezing, the organist was off, and the pastor read the whole thing off a page. Not what I expected from a Presbyterian service.', '2026-08-19', false, 'Ronald T.', 'RT', now() - interval '3 days'),
  ((select id from churches where slug = 'drexel'), 2, 'The woman at the welcome desk was rude to my daughter and made a comment about her clothes. Her name badge said Carol.', '2026-08-12', false, 'Bethany W.', 'BW', now() - interval '5 days'),
  ((select id from churches where slug = 'zion'), 5, 'Best church in South Jersey hands down. Amazing pastor, amazing music, amazing everything. Ten out of ten would recommend to anyone.', '2026-08-28', true, 'Anonymous', 'AN', now() - interval '7 days');

-- Fusion's per-review category ratings (the one church whose sample reviews
-- carry explicit numeric breakdowns in the source prototype).
insert into review_category_ratings (review_id, category_key, rating)
select r.id, v.category_key, v.rating from reviews r
join (values
  ('Danielle R.', 'friendliness', 5), ('Danielle R.', 'kids_nursery', 5),
  ('Kevin O.', 'preaching', 5), ('Kevin O.', 'parking', 2), ('Kevin O.', 'signage', 3),
  ('Tom B.', 'music', 4), ('Tom B.', 'coffee', 5), ('Tom B.', 'bathrooms', 5),
  ('Grace L.', 'accessibility', 3)
) as v(author, category_key, rating) on v.author = r.author_display_name
where r.church_id = (select id from churches where slug = 'fusion');

-- Replies
insert into review_replies (review_id, church_id, author_profile_id, text)
select r.id, r.church_id, null,
  'Thank you — this is fair. New exterior signage goes up in October, and a volunteer now calls every card within 48 hours. Please stop by the welcome desk next time. — Church office'
from reviews r where r.church_id = (select id from churches where slug = 'greentree') and r.author_display_name = 'Anonymous visitor' and r.overall_rating = 3;

insert into review_replies (review_id, church_id, author_profile_id, text)
select r.id, r.church_id, null, 'Marisol, thank you — I passed this to our check-in team, who will be glad to hear it. Hope to see you Sunday.'
from reviews r where r.church_id = (select id from churches where slug = 'fusion') and r.author_display_name = 'Marisol D.';

insert into review_replies (review_id, church_id, author_profile_id, text)
select r.id, r.church_id, null, 'Tom, fair point on the bulletin. We are printing a short one for the 9:00 starting this month.'
from reviews r where r.church_id = (select id from churches where slug = 'fusion') and r.author_display_name = 'Tom B.';

-- Flags (mirrors Staff Admin's FLAGS f1–f4)
insert into review_flags (review_id, flagged_by_type, flagged_by_church_id, reason, note, status)
select r.id, 'church', r.church_id, 'False claim',
  'Names me personally and states something about our finances that is simply untrue. The reviewer has never attended.', 'open'
from reviews r where r.church_id = (select id from churches where slug = 'fusion') and r.author_display_name = 'Anonymous' and r.overall_rating = 1;

insert into review_flags (review_id, flagged_by_type, flagged_by_church_id, reason, note, status)
select r.id, 'church', r.church_id, 'Wrong church',
  'We are non-denominational and have no organ. I believe this is meant for Ocean Heights Presbyterian down the road.', 'open'
from reviews r where r.church_id = (select id from churches where slug = 'greentree') and r.author_display_name = 'Ronald T.';

insert into review_flags (review_id, flagged_by_type, flagged_by_church_id, reason, note, status)
select r.id, 'church', r.church_id, 'Personal attack',
  'Naming a volunteer by first name in a public review feels wrong even if the exchange happened. We would rather answer it than have her named.', 'open'
from reviews r where r.church_id = (select id from churches where slug = 'drexel') and r.author_display_name = 'Bethany W.';

insert into review_flags (review_id, flagged_by_type, flagged_by_church_id, reason, note, status)
select r.id, 'church', r.church_id, 'Suspected fake',
  'Third five-star review from a brand-new anonymous account in one week. Reads like nobody who was actually there.', 'open'
from reviews r where r.church_id = (select id from churches where slug = 'zion') and r.author_display_name = 'Anonymous' and r.overall_rating = 5;

-- ============================================================= sermon notes
insert into sermon_notes (church_id, title, scripture, date_preached, summary, media_link)
select (select id from churches where slug = 'fusion'), v.title, v.scripture, v.date_preached::date, v.summary, null
from (values
  ('What the Widow Kept', 'Mark 12:41–44', '2026-08-31', 'Jesus watches people give and singles out the one nobody noticed. We spent most of the morning on what she kept — nothing — and what that says about trust rather than arithmetic.'),
  ('Nobody Outgrows Grace', 'Romans 5', '2026-08-24', 'A long look at the difference between being forgiven once and living forgiven. Ends with the practical question of who you have not forgiven.')
) as v(title, scripture, date_preached, summary);

insert into sermon_notes (church_id, title, scripture, date_preached, summary)
values ((select id from churches where slug = 'greentree'), 'A House With Room In It', 'Luke 14:15–24', '2026-08-17',
  'The parable of the banquet, read as an argument about who a church is actually built for. Short, direct, and uncomfortable in the middle.');

-- ================================================================ programs
insert into church_programs (church_id, program_id)
select (select id from churches where slug = 'fusion'), p.id
from program_catalog p
where p.label in (
  'Sunday school','Nursery / childcare','Youth group, grades 6–8','Youth group, grades 9–12',
  'Vacation Bible school','Small groups / Bible study','Young adults','Choir or worship team',
  'Celebrate Recovery / addiction support','Food pantry','Community service days','Mission trips',
  'Transportation / van pickup'
);
insert into church_programs (church_id, custom_label) values
  ((select id from churches where slug = 'fusion'), 'Surf ministry at Margate'),
  ((select id from churches where slug = 'fusion'), 'Thursday food truck night');

-- =========================================================== social links
insert into church_social_links (church_id, platform, url) values
  ((select id from churches where slug = 'fusion'), 'website', 'https://fusionchurch.org'),
  ((select id from churches where slug = 'fusion'), 'youtube', 'https://youtube.com/@fusionchurch'),
  ((select id from churches where slug = 'fusion'), 'instagram', 'https://instagram.com/fusionchurchnj');

-- ================================================================== claims
insert into church_claims (church_id, claimant_name, claimant_email, method, status, created_at) values
  ((select id from churches where slug = 'r29'), 'Joan Petrillo', 'office@weymouthumc.net', 'postcard', 'pending', now() - interval '1 day'),
  ((select id from churches where slug = 'r28'), 'Pastor Sam Idowu', 'sam@onehopenj.org', 'domain_email', 'pending', now() - interval '2 days'),
  ((select id from churches where slug = 'r0'), 'Pastor Rick Alvarez', 'rick@shorefellowship.org', 'upload', 'pending', now() - interval '4 hours'),
  ((select id from churches where slug = 'r1'), 'Deacon Ray Ellis', 'rayellis48@gmail.com', '501c3_letter', 'pending', now() - interval '2 days');

-- =============================================================== campaigns
insert into campaigns (church_id, title, blurb, event_when, cost, audience, radius_miles, towns, channel_pinned, channel_push, channel_feed, reach_estimate, status, submitted_at) values
  ((select id from churches where slug = 'fusion'), 'Fall Fest — free trunk or treat', 'Trunk or treat, bounce houses, free food. Nothing to buy.', 'Sat 24 Oct, 4–7 pm', 'Free', array['Families','Anyone new'], 10, array['Egg Harbor Twp','Mays Landing','Northfield','Absecon'], true, true, false, 1240, 'waiting', now() - interval '2 hours'),
  ((select id from churches where slug = 'greentree'), 'Grief support group — six weeks', 'A quiet six-week group for anyone who lost someone this year.', 'Tuesdays from 6 Oct, 7 pm', 'Free', array['Anyone'], 5, array['Egg Harbor Twp','Mays Landing'], false, false, true, 640, 'waiting', now() - interval '6 hours'),
  ((select id from churches where slug = 'holytrinity'), 'Christmas Eve services', 'Four services, 3 pm through midnight. Childcare at the 3 and 5.', 'Wed 24 Dec', 'Free', array['Anyone'], 15, array['Egg Harbor Twp','Mays Landing','Northfield','Absecon','Somers Point','Linwood'], true, true, true, 2910, 'approved', now() - interval '5 days'),
  ((select id from churches where slug = 'faithbible'), 'Men''s breakfast — $12 at the door', 'Sausage, eggs, and a short talk. Bring a friend.', 'Sat 11 Oct, 8 am', '$12', array['Men'], 20, array['Egg Harbor Twp','Mays Landing','Northfield','Absecon','Somers Point','Linwood','Pleasantville','Galloway'], false, true, false, 3180, 'sent_back', now() - interval '6 days');

update campaigns set decision_note = 'Radius too wide for a $12 breakfast', decided_at = now() - interval '5 days'
  where title like 'Men''s breakfast%';
update campaigns set decided_at = now() - interval '5 days' where title = 'Christmas Eve services';

-- ========================================================== subscriptions
insert into subscriptions (church_id, plan, status, started_at, renews_at, card_last4) values
  ((select id from churches where slug = 'fusion'), 'pro', 'active', now() - interval '5 days', now() + interval '25 days', '4417'),
  ((select id from churches where slug = 'greentree'), 'pro', 'active', now() - interval '6 months', now() + interval '25 days', '2210'),
  ((select id from churches where slug = 'holytrinity'), 'pro', 'active', now() - interval '2 months', now() + interval '25 days', '9981'),
  ((select id from churches where slug = 'drexel'), 'pro', 'comped', now() - interval '8 months', null, null),
  ((select id from churches where slug = 'faithbible'), 'pro', 'card_failed', now() - interval '3 months', now() + interval '2 days', '5502'),
  ((select id from churches where slug = 'zion'), 'free', 'active', now() - interval '6 months', null, null),
  ((select id from churches where slug = 'oceanheights'), 'free', 'active', now() - interval '3 months', null, null),
  ((select id from churches where slug = 'newlife'), 'free', 'active', now() - interval '2 months', null, null),
  ((select id from churches where slug = 'scullville'), 'free', 'active', now() - interval '1 month', null, null),
  ((select id from churches where slug = 'stpaul'), 'free', 'active', now() - interval '3 months', null, null),
  ((select id from churches where slug = 'asbury'), 'free', 'active', now() - interval '9 months', null, null);

insert into billing_receipts (church_id, occurred_on, description, amount_cents)
select (select id from churches where slug = 'fusion'), d::date, 'Pewfinder Pro — monthly', 5000
from generate_series(current_date - interval '2 months', current_date, interval '1 month') as d;

-- ================================================================ staff --
-- Real staff accounts (church owners, Pewfinder admins/moderators) must be
-- created through Supabase Auth first — there's no way to seed auth.users
-- safely from plain SQL. See supabase/link-demo-staff.sql for the follow-up
-- step that attaches roles once those accounts exist.

-- ========================================================= page views --
-- Anonymous traffic so the Church Admin "Insights → Views & saves" block
-- has something real to show. Demographic breakdowns (age, household, town,
-- priorities) are intentionally left empty until real member profiles with
-- those answers exist — the product's own 10-person floor should read
-- "not enough data yet" honestly on a fresh install rather than fake it.
insert into church_page_views (church_id, viewer_profile_id, event_type, created_at)
select (select id from churches where slug = 'fusion'), null,
  (array['view','view','view','view','view','save','directions','service_times','photo','sermon_note'])[1 + floor(random() * 10)],
  now() - (random() * interval '30 days')
from generate_series(1, 360);

insert into church_page_views (church_id, viewer_profile_id, event_type, search_term, created_at)
select (select id from churches where slug = 'fusion'), null, 'search', v.term, now() - (random() * interval '30 days')
from (values
  ('fusion church'), ('fusion church'), ('fusion church'),
  ('non denominational egg harbor'), ('contemporary worship near me'),
  ('church with nursery 08234'), ('sunday evening service'), ('church that welcomes wheelchairs')
) as v(term);
