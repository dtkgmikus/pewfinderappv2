-- Patch: church_list is a "select c.* from churches c" view, and Postgres
-- locks in a view's column list at CREATE time — it does NOT pick up
-- columns added to the underlying table afterward. patch-002 added
-- county/lat/lng to churches, but if church_list was created before that
-- (i.e. from the original schema.sql, before this session's changes), the
-- view still doesn't expose them — so the app (which reads from church_list,
-- not churches directly) sees every church as having no coordinates, even
-- though the churches table itself is correct.
--
-- CREATE OR REPLACE VIEW can only ever *append* new columns at the end of
-- the list, and county/lat/lng were added in the middle of churches'
-- column order, so a plain replace fails — this drops and recreates the
-- view instead, which re-expands "c.*" against the table's current columns.
--
-- Safe to run any number of times. Run after patch-002 and patch-003.

drop view if exists church_list;

create view church_list with (security_invoker = true) as
  select c.*,
    coalesce(
      (select jsonb_object_agg(cs.category_key, cs.avg_score)
       from church_category_scores cs where cs.church_id = c.id),
      '{}'::jsonb
    ) as category_scores
  from churches c;
