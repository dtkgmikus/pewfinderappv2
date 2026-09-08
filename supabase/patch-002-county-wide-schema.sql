-- Patch for databases that already ran the original schema.sql: expands
-- churches.town from the old 2-town check (Egg Harbor Twp, Mays Landing) to
-- every Atlantic County municipality, and adds county/lat/lng so "near me"
-- can compute a real distance from the visitor's browser location instead
-- of the old static, single-reference-point distance_mi column.
-- Safe to run once; if you set up fresh from an updated schema.sql, you
-- don't need this — it's already in there.

alter table churches drop constraint if exists churches_town_check;
alter table churches add constraint churches_town_check check (town in (
  'Absecon','Atlantic City','Brigantine','Buena','Buena Vista Twp','Corbin City',
  'Egg Harbor City','Egg Harbor Twp','Estell Manor','Folsom','Galloway Twp',
  'Hamilton Twp','Hammonton','Linwood','Longport','Margate City','Mays Landing',
  'Mullica Twp','Northfield','Pleasantville','Port Republic','Somers Point',
  'Ventnor City','Weymouth Twp'
));

alter table churches add column if not exists county text not null default 'Atlantic';
alter table churches add column if not exists lat numeric(8,5);
alter table churches add column if not exists lng numeric(8,5);

-- Backfill town-center coordinates for the existing Egg Harbor Twp / Mays
-- Landing rows so "near me" works for them too (per-church precision for
-- these can follow later; town-center is accurate enough to rank by).
update churches set lat = 39.37650, lng = -74.63600 where town = 'Egg Harbor Twp' and lat is null;
update churches set lat = 39.45230, lng = -74.72740 where town = 'Mays Landing' and lat is null;
