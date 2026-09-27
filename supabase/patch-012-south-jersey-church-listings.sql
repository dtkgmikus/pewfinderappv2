-- Pilot directory extension for Atlantic, Cape May, and Cumberland counties.
-- Run after patch-004-refresh-church-list-view.sql.
--
-- This import is based on information published by each church on its own
-- website (URLs listed below), not Google Places. Entries remain unclaimed
-- and unrated; this file does not create reviews or church endorsements.
-- Coordinates are approximate municipality centers for map placement and
-- distance ordering, not verified building coordinates.

alter table churches drop constraint if exists churches_town_check;
alter table churches add constraint churches_town_check check (town in (
  'Absecon','Atlantic City','Brigantine','Buena','Buena Vista Twp','Corbin City',
  'Egg Harbor City','Egg Harbor Twp','Estell Manor','Folsom','Galloway Twp',
  'Hamilton Twp','Hammonton','Linwood','Longport','Margate City','Mays Landing',
  'Mullica Twp','Northfield','Pleasantville','Port Republic','Somers Point',
  'Ventnor City','Weymouth Twp',
  'Cape May City','Lower Township','Middle Township','North Wildwood',
  'Bridgeton','Millville','Vineland'
));

alter table churches add column if not exists contact_email text;

insert into churches
  (slug, name, denomination, street, town, county, zip, lat, lng,
   service_times, phone, contact_email, facts)
values
  -- Atlantic County: official church sites
  ('victory-bible-hammonton', 'Victory Bible Church', 'Bible Church', '816 South Egg Harbor Road', 'Hammonton', 'Atlantic', '08037', 39.64, -74.80,
   'Sunday 8:30 AM and 11:00 AM; Sunday School 10:00 AM; Wednesday prayer 7:00 PM', '609-567-4466', null,
   array['Unclaimed listing','Service details from church website']),
  ('hammonton-calvary-chapel', 'Calvary Chapel of Hammonton', 'Non-denominational', '660 S. Egg Harbor Road', 'Hammonton', 'Atlantic', '08037', 39.64, -74.80,
   'Sunday 9:00 AM and 10:30 AM; Wednesday 7:00 PM', '609-704-8778', 'info@cchammonton.org',
   array['Unclaimed listing','Service details from church website']),
  ('galloway-lifepoint', 'LifePoint Church', 'Apostolic (UPCI)', '733 E. Lily Lake Road', 'Galloway Twp', 'Atlantic', '08205', 39.49, -74.46,
   'Sunday 11:00 AM; Wednesday 7:30 PM', '609-645-1317', 'church@lifepointnj.org',
   array['Unclaimed listing','Service details from church website']),
  ('reformation-lutheran-galloway', 'Reformation Lutheran Church', 'Lutheran', '633 S. New York Road', 'Galloway Twp', 'Atlantic', '08205', 39.49, -74.46,
   'Sunday 8:30 AM and 10:00 AM (seasonal schedule may vary)', '609-652-8431', 'reformationlutherannj@gmail.com',
   array['Unclaimed listing','Service details from church website']),
  ('atlantic-county-sda', 'Atlantic County Seventh-day Adventist Church', 'Seventh-day Adventist', '1009 Broad Street', 'Northfield', 'Atlantic', '08225', 39.37, -74.55,
   'Saturday Sabbath School 9:30 AM; worship 11:00 AM; Wednesday prayer 7:00 PM', null, 'atlantic.county.sda@live.com',
   array['Unclaimed listing','Service details from church website']),

  -- Cape May County: official church sites
  ('cape-community-church', 'Cape Community Church', 'Non-denominational', '1159 South Route 9', 'Middle Township', 'Cape May', '08210', 39.08, -74.82,
   'Sunday 10:30 AM', null, null,
   array['Unclaimed listing','Service details from church website']),
  ('calvary-chapel-cape-may', 'Calvary Chapel of Cape May', 'Calvary Chapel', '596 Seashore Road', 'Lower Township', 'Cape May', '08204', 38.99, -74.91,
   'Sunday prayer 7:30 AM; worship 8:30 AM and 10:30 AM; third Sunday prayer 6:00 PM', '609-884-5821', null,
   array['Unclaimed listing','Service details from church website']),
  ('seashore-community-nazarene', 'Seashore Community Church of the Nazarene', 'Church of the Nazarene', '446 Seashore Road', 'Lower Township', 'Cape May', '08204', 38.99, -74.91,
   'Sunday worship 8:30 AM and 10:30 AM; Sunday School 9:30 AM', '609-886-6196', 'seashorechurch@gmail.com',
   array['Unclaimed listing','Service details from church website']),
  ('cape-may-presbyterian', 'Cape May Presbyterian Church', 'Presbyterian (PCUSA)', '500 Hughes Street', 'Cape May City', 'Cape May', '08204', 38.94, -74.91,
   'Seasonal schedule: 10:00 AM October through mid-May; 8:30 AM beach service and 11:00 AM sanctuary service Memorial weekend through September', '609-884-3949', 'office@firstpresbycapemay.com',
   array['Unclaimed listing','Seasonal service schedule; check church website']),
  ('episcopal-church-advent-cape-may', 'Episcopal Church of the Advent', 'Episcopal', 'Franklin and Washington Streets', 'Cape May City', 'Cape May', '08204', 38.94, -74.91,
   'Seasonal schedule: Sunday 9:00 AM in summer; Sunday 8:00 AM and 10:30 AM in the rest of the year', '609-884-3065', null,
   array['Unclaimed listing','Seasonal service schedule; check church website']),
  ('christ-king-reformed-north-wildwood', 'Christ the King Reformed Presbyterian Church', 'Reformed Presbyterian (OPC)', '303 Atlantic Avenue', 'North Wildwood', 'Cape May', '08260', 39.00, -74.80,
   'Sunday 10:30 AM', null, null,
   array['Unclaimed listing','Service details from church website']),
  ('great-commission-baptist-cape-may', 'The Great Commission Baptist Church', 'Baptist', '18 Swainton Goshen Road', 'Middle Township', 'Cape May', '08210', 39.08, -74.82,
   'Sunday School 9:00 AM; Sunday worship 10:00 AM and 7:00 PM; Wednesday 7:00 PM', '609-463-0108', null,
   array['Unclaimed listing','Service details from church website']),

  -- Cumberland County: official church sites
  ('cccc-millville', 'Cumberland County Community Church', 'Non-denominational', '1800 E. Broad Street', 'Millville', 'Cumberland', '08332', 39.40, -75.04,
   'Sunday 9:00 AM and 11:00 AM', '856-327-2222', null,
   array['Unclaimed listing','Service details from church website']),
  ('church-resurrection-millville', 'Church of the Resurrection', 'Episcopal', '1209 W. Main Street', 'Millville', 'Cumberland', '08332', 39.40, -75.04,
   'Saturday 6:00 PM; Sunday 10:00 AM', null, null,
   array['Unclaimed listing','Service details from church website']),
  ('ccs-church-of-god-millville', 'Christ Is Coming Soon Church of God', 'Church of God', '701 N. High Street', 'Millville', 'Cumberland', '08332', 39.40, -75.04,
   'Sunday 11:00 AM', '347-334-8243', null,
   array['Unclaimed listing','Service details from church website']),
  ('kingdom-community-vineland', 'Kingdom Community Church', 'Non-denominational', '1100 W. Sherman Avenue', 'Vineland', 'Cumberland', '08360', 39.49, -75.03,
   'Sunday 10:00 AM', '856-322-8183', 'info.kingdomcochurch@gmail.com',
   array['Unclaimed listing','Meets at Cumberland Christian School','Service details from church website']),
  ('millville-assembly', 'Millville Assembly', 'Assemblies of God', '1700 Wheaton Avenue', 'Millville', 'Cumberland', '08332', 39.40, -75.04,
   'Sunday 11:00 AM; Wednesday 7:00 PM', null, null,
   array['Unclaimed listing','Service details from church website']),
  ('ramoth-church-vineland', 'Ramoth Church', 'Church of the Nazarene', '2725 N. Delsea Drive', 'Vineland', 'Cumberland', '08360', 39.49, -75.03,
   'Sunday worship 9:00 AM', '856-696-4380', null,
   array['Unclaimed listing','Service details from church website'])
on conflict (slug) do update set
  name = excluded.name,
  denomination = excluded.denomination,
  street = excluded.street,
  town = excluded.town,
  county = excluded.county,
  zip = excluded.zip,
  lat = excluded.lat,
  lng = excluded.lng,
  service_times = excluded.service_times,
  phone = coalesce(excluded.phone, churches.phone),
  contact_email = coalesce(excluded.contact_email, churches.contact_email),
  facts = excluded.facts;

-- Primary source URLs: church websites (recheck service times before visits).
insert into church_social_links (church_id, platform, url)
select c.id, 'website', v.url
from (values
  ('victory-bible-hammonton','https://vbcnj.org/'),
  ('hammonton-calvary-chapel','https://www.cchammonton.org/'),
  ('galloway-lifepoint','https://lifepointnj.org/'),
  ('reformation-lutheran-galloway','https://www.rlc.church/'),
  ('atlantic-county-sda','https://atlanticcountynj.adventistchurch.org/'),
  ('cape-community-church','https://www.capecommunitychurch.org/'),
  ('calvary-chapel-cape-may','https://www.cccapemay.org/'),
  ('seashore-community-nazarene','https://sccnaz.com/'),
  ('cape-may-presbyterian','https://www.capemaypresbyterian.com/'),
  ('episcopal-church-advent-cape-may','https://capemayadvent.org/'),
  ('christ-king-reformed-north-wildwood','https://www.christthekingwildwood.org/'),
  ('great-commission-baptist-cape-may','https://gcbc.today/'),
  ('cccc-millville','https://ccccmillville.org/'),
  ('church-resurrection-millville','https://cumberlandnjepiscopal.org/about/worship/'),
  ('ccs-church-of-god-millville','https://ccschurchofgod.org/'),
  ('kingdom-community-vineland','https://www.kingdomco.cc/'),
  ('millville-assembly','https://millville.churchcenter.com/'),
  ('ramoth-church-vineland','https://www.ramothchurch.com/')
) as v(slug, url)
join churches c on c.slug = v.slug
where not exists (
  select 1 from church_social_links s
  where s.church_id = c.id and s.platform = 'website' and s.url = v.url
);

-- Recreate the listing view so newly added contact_email is selectable.
drop view if exists church_list;
create view church_list with (security_invoker = true) as
  select c.*,
    coalesce(
      (select jsonb_object_agg(cs.category_key, cs.avg_score)
       from church_category_scores cs where cs.church_id = c.id),
      '{}'::jsonb
    ) as category_scores
  from churches c;
