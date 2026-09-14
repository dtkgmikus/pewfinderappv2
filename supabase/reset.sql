-- Pewfinder — reset
-- Drops every object schema.sql creates, so you can re-run schema.sql +
-- seed.sql cleanly after a partial/confused run. Safe to run even if some
-- objects don't exist (IF EXISTS on everything). Uses CASCADE so dependent
-- objects (foreign keys, policies, triggers) go with their table/function —
-- this does NOT touch anything outside what our own schema.sql created
-- (Supabase's own auth/storage/etc. schemas are untouched).

drop view if exists church_list cascade;
drop view if exists review_helpful_counts cascade;

drop table if exists question_answers cascade;
drop table if exists questions cascade;
drop table if exists qa_moderators cascade;
drop table if exists question_tags cascade;
drop table if exists mux_assets cascade;

drop table if exists church_page_views cascade;
drop table if exists audit_log cascade;
drop table if exists billing_receipts cascade;
drop table if exists subscriptions cascade;
drop table if exists campaigns cascade;
drop table if exists church_claims cascade;
drop table if exists review_flags cascade;
drop table if exists review_replies cascade;
drop table if exists review_helpful_votes cascade;
drop table if exists review_subcategory_ratings cascade;
drop table if exists review_category_ratings cascade;
drop table if exists reviews cascade;
drop table if exists saved_churches cascade;
drop table if exists sermon_notes cascade;
drop table if exists church_program_links cascade;
drop table if exists church_social_links cascade;
drop table if exists church_media cascade;
drop table if exists church_programs cascade;
drop table if exists church_category_scores cascade;
drop table if exists program_catalog cascade;
drop table if exists category_subquestions cascade;
drop table if exists review_categories cascade;
drop table if exists churches cascade;
drop table if exists church_staff cascade;
drop table if exists staff_members cascade;
drop table if exists profiles cascade;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user() cascade;
drop function if exists strike_member(uuid) cascade;
drop function if exists enforce_video_ready_before_publish() cascade;
drop function if exists set_answer_moderator_flag() cascade;
drop function if exists enforce_question_anonymity() cascade;
drop function if exists is_qa_moderator(uuid) cascade;
drop function if exists protect_mux_asset_fields() cascade;
drop function if exists enforce_mux_duration_cap() cascade;
drop function if exists sync_church_plan_from_subscription() cascade;
drop function if exists protect_church_admin_fields() cascade;
drop function if exists church_is_pro(uuid) cascade;
drop function if exists is_church_editor(uuid, uuid) cascade;
drop function if exists bump_category_score() cascade;
drop function if exists bump_church_rating() cascade;
drop function if exists find_profile_id_by_email(text) cascade;
drop function if exists is_church_staff(uuid, uuid) cascade;
drop function if exists church_role(uuid, uuid) cascade;
drop function if exists is_staff_admin(uuid) cascade;
drop function if exists is_staff(uuid) cascade;
