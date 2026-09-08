-- Pewfinder — link demo staff accounts
-- Run this AFTER creating the real accounts below through Supabase Auth
-- (dashboard → Authentication → Add user, or supabase.auth.admin.createUser).
-- Auth users can't be created from plain SQL, so this file is a template:
-- replace each '<...-uuid>' with the id Supabase assigned that user, then run.

-- Pewfinder staff (Staff Admin portal)
-- insert into profiles (id, email, name) values ('<alicia-uuid>', 'alicia@pewfinder.app', 'Alicia Chen');
-- insert into staff_members (profile_id, role) values ('<alicia-uuid>', 'admin');

-- insert into profiles (id, email, name) values ('<devon-uuid>', 'devon@pewfinder.app', 'Devon Marsh');
-- insert into staff_members (profile_id, role) values ('<devon-uuid>', 'admin');

-- insert into profiles (id, email, name) values ('<priya-uuid>', 'priya@pewfinder.app', 'Priya Raman');
-- insert into staff_members (profile_id, role) values ('<priya-uuid>', 'moderator');

-- insert into profiles (id, email, name) values ('<sam-uuid>', 'sam@pewfinder.app', 'Sam Whitaker');
-- insert into staff_members (profile_id, role) values ('<sam-uuid>', 'moderator');

-- Fusion Church staff (Church Admin console)
-- insert into profiles (id, email, name) values ('<dave-uuid>', 'pastor.dave@fusionchurch.org', 'Pastor Dave M.');
-- insert into church_staff (church_id, profile_id, role)
--   values ((select id from churches where slug = 'fusion'), '<dave-uuid>', 'owner');

-- insert into profiles (id, email, name) values ('<renee-uuid>', 'renee@fusionchurch.org', 'Renee K.');
-- insert into church_staff (church_id, profile_id, role)
--   values ((select id from churches where slug = 'fusion'), '<renee-uuid>', 'editor');

-- insert into profiles (id, email, name) values ('<marcus-uuid>', 'marcus@fusionchurch.org', 'Marcus B.');
-- insert into church_staff (church_id, profile_id, role)
--   values ((select id from churches where slug = 'fusion'), '<marcus-uuid>', 'responder');
