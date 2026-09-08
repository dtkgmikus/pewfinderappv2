-- Patch for databases that already ran the original schema.sql: adds the
-- foreign key that was missing on church_staff.church_id, which caused
-- PostgREST to 400 on any query embedding churches(...) under church_staff
-- (e.g. "get my church" on every app load). Safe to run once; if you set up
-- fresh from an updated schema.sql, you don't need this — it's already in there.
alter table church_staff add constraint church_staff_church_id_fkey
  foreign key (church_id) references churches(id) on delete cascade;
