-- Patch: adds real churches across the rest of Atlantic County (everything
-- outside Egg Harbor Twp / Mays Landing, which were already seeded). Run
-- after patch-002-county-wide-schema.sql.
--
-- Sourcing: compiled from web research (church/denomination websites,
-- diocesan directories, and business listings) across the 21 remaining
-- Atlantic County municipalities. All are seeded unclaimed and unrated —
-- same pattern as the existing Mays Landing rows — no ratings or reviews
-- are fabricated for any of them. A church's real staff can claim and
-- verify their listing through /admin once this is live.
--
-- Known caveats worth a manual spot-check before treating any single row
-- as authoritative (research directories can lag behind closures/moves):
--   - Port Republic: both churches list the same street number on Main St.
--   - Somers Point: New Covenant Community Church shares an address with
--     the existing multi-site "Fusion Church" (already seeded under Egg
--     Harbor Twp) — Fusion itself was NOT re-added here to avoid a
--     duplicate of that same organization.
--   - A handful of rows (noted inline) had a town confirmed but no
--     publicly listed street address, so the street is set to the town
--     name — same convention already used for a few Mays Landing rows.
--   - lat/lng are per-town-center approximations, not per-church geocodes,
--     so "near me" distance is accurate to roughly the town, not the
--     exact building.

insert into churches (slug, name, denomination, street, town, county, zip, lat, lng, distance_mi, service_times, facts) values

-- ===================================================== Absecon (5) --
('absecon-presbyterian', 'Absecon Presbyterian Church', 'Presbyterian', '208 New Jersey Ave', 'Absecon', 'Atlantic', '08201', 39.42360, -74.49300, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('absecon-umc', 'Absecon United Methodist Church', 'United Methodist', '100 Pitney Road', 'Absecon', 'Atlantic', '08201', 39.42360, -74.49300, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('absecon-st-elizabeth-ann-seton', 'St. Elizabeth Ann Seton Church', 'Catholic', '591 New Jersey Ave', 'Absecon', 'Atlantic', '08201', 39.42360, -74.49300, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('absecon-grace-falls', 'Grace Falls Church', 'Non-denominational', '306 North Shore Road', 'Absecon', 'Atlantic', '08201', 39.42360, -74.49300, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('absecon-new-life-ag', 'New Life Assembly of God', 'Assemblies of God', 'Absecon', 'Absecon', 'Atlantic', '08201', 39.42360, -74.49300, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- =============================================== Atlantic City (14) --
('ac-st-nicholas-tolentine', 'St. Nicholas of Tolentine Church', 'Catholic', '1409 Pacific Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-our-lady-star-of-the-sea', 'Our Lady Star of the Sea Church', 'Catholic', '2651 Atlantic Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-st-michael', 'St. Michael Roman Catholic Church', 'Catholic', '10 N Mississippi Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-asbury-umc', 'Asbury United Methodist Church', 'United Methodist', '1213 Pacific Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-allen-chapel-ame', 'Allen Chapel AME Church', 'African Methodist Episcopal', '1717 Bishop Richard Allen Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-new-shiloh-baptist', 'New Shiloh Baptist Church & Community Life Center', 'Baptist', '701 Atlantic Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-chelsea-baptist', 'Chelsea Baptist Church', 'Baptist', '2908 Atlantic Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-community-baptist', 'Community Baptist Church', 'Baptist', '234 N New Jersey Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-greater-holy-trinity-baptist', 'Greater Holy Trinity Baptist Church', 'Baptist', '601 N Indiana Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-holy-trinity-baptist', 'Holy Trinity Baptist Church', 'Baptist', '1715 Rev. J.J. Walters Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-st-andrews-lutheran', 'St. Andrew''s Lutheran Church', 'Lutheran', '1920 Pacific Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-st-augustines-episcopal', 'St. Augustine''s Episcopal Church', 'Episcopal', '1709 Arctic Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-congregation-rodef-sholom', 'Congregation Rodef Sholom', 'Jewish (Orthodox)', '4609 Atlantic Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ac-masjid-muhammad', 'Masjid Muhammad of Atlantic City', 'Islamic', '300 N Albany Ave', 'Atlantic City', 'Atlantic', '08401', 39.36430, -74.42290, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- ==================================================== Brigantine (4) --
('brig-st-thomas-apostle', 'Saint Thomas the Apostle Church', 'Catholic', '331 8th Street South', 'Brigantine', 'Atlantic', '08203', 39.41010, -74.36460, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('brig-community-presbyterian', 'Community Presbyterian Church', 'Presbyterian', '1501 W Brigantine Ave', 'Brigantine', 'Atlantic', '08203', 39.41010, -74.36460, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('brig-bible-church', 'Brigantine Bible Church', 'Baptist', '103 Bayshore Ave', 'Brigantine', 'Atlantic', '08203', 39.41010, -74.36460, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('brig-temple-beth-shalom', 'Temple Beth Shalom', 'Jewish', 'Brigantine', 'Brigantine', 'Atlantic', '08203', 39.41010, -74.36460, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- ========================================================= Buena (2) --
('buena-hermitage-holy-protection', 'The Hermitage of the Holy Protection', 'Eastern Orthodox', '333 Weymouth Road', 'Buena', 'Atlantic', '08310', 39.51870, -74.93490, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('buena-st-padre-pio-shrine', 'St. Padre Pio Shrine', 'Catholic', '401 Harding Highway', 'Buena', 'Atlantic', '08310', 39.51870, -74.93490, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- ============================================ Buena Vista Twp (7) --
('bvt-soar-church', 'SOAR Church AC', 'Non-denominational', '150 Cedar Avenue, Richland', 'Buena Vista Twp', 'Atlantic', '08350', 39.51310, -74.88000, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('bvt-first-baptist-richland', 'First Baptist Church of Richland', 'Baptist', '244 Washington Avenue, Richland', 'Buena Vista Twp', 'Atlantic', '08350', 39.51310, -74.88000, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('bvt-milmay-bible', 'Milmay Bible Church', 'Non-denominational', '222 Broad Street, Milmay', 'Buena Vista Twp', 'Atlantic', '08340', 39.51310, -74.88000, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('bvt-milmay-christian', 'Milmay Christian Church', 'Christian', '1022 Tuckahoe Road, Milmay', 'Buena Vista Twp', 'Atlantic', '08340', 39.51310, -74.88000, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('bvt-bethlehem-missionary-baptist', 'Bethlehem Missionary Baptist Church', 'Baptist', '468 Ninth Street, Newtonville', 'Buena Vista Twp', 'Atlantic', '08346', 39.51310, -74.88000, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('bvt-first-union-baptist-newtonville', 'First Union Baptist Church', 'Baptist', '854 Jackson Road, Newtonville', 'Buena Vista Twp', 'Atlantic', '08346', 39.51310, -74.88000, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('bvt-first-sda-newtonville', 'First Seventh-day Adventist Church', 'Seventh-day Adventist', '955 Route 54, Newtonville', 'Buena Vista Twp', 'Atlantic', '08346', 39.51310, -74.88000, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- =================================================== Corbin City (3) --
('corbin-city-baptist', 'Corbin City Baptist Church', 'Independent Baptist', '212 Main Street', 'Corbin City', 'Atlantic', '08270', 39.30160, -74.76020, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('corbin-westminster-reformed-presbyterian', 'Westminster Reformed Presbyterian Church', 'Reformed Presbyterian', '604 Route 50', 'Corbin City', 'Atlantic', '08270', 39.30160, -74.76020, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('corbin-presbyterian-reformed', 'Presbyterian Reformed Church of Corbin City', 'Presbyterian (Reformed)', '1870 Route 50', 'Corbin City', 'Atlantic', '08270', 39.30160, -74.76020, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- =============================================== Egg Harbor City (5) --
('ehc-first-baptist', 'First Baptist Church of Egg Harbor City', 'Baptist', '236 London Ave', 'Egg Harbor City', 'Atlantic', '08215', 39.56370, -74.59590, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ehc-st-nicholas', 'St. Nicholas Church', 'Catholic', '525 Saint Louis Ave', 'Egg Harbor City', 'Atlantic', '08215', 39.56370, -74.59590, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ehc-st-johns-ucc', 'St. John''s United Church of Christ', 'United Church of Christ', '307 London Ave', 'Egg Harbor City', 'Atlantic', '08215', 39.56370, -74.59590, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ehc-emmanuel-congregational', 'Emmanuel Congregational Church', 'Congregational (IFCA)', 'Liverpool Ave & White Horse Pike', 'Egg Harbor City', 'Atlantic', '08215', 39.56370, -74.59590, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ehc-moravian', 'Egg Harbor City Moravian Church', 'Moravian', '245 Boston Avenue', 'Egg Harbor City', 'Atlantic', '08215', 39.56370, -74.59590, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- =================================================== Estell Manor (2) --
('estell-manor-community', 'Estell Manor Community Church', 'Non-denominational', '146 Cumberland Ave', 'Estell Manor', 'Atlantic', '08319', 39.35390, -74.77500, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('estell-head-of-the-river', 'Head of the River Church', 'Methodist', '600 NJ-49', 'Estell Manor', 'Atlantic', '08319', 39.35390, -74.77500, 0, 'Services 2x/year — historic site', array['Historic site, limited services','Unclaimed listing']),

-- ========================================================= Folsom (2) --
('folsom-jacobus-lutheran', 'Jacobus Evangelical Lutheran Church', 'Lutheran', 'Mays Landing Rd & Route 54', 'Folsom', 'Atlantic', '08037', 39.59670, -74.84310, 0, 'Service times not listed', array['Historic church (1852)','Unclaimed listing']),
('folsom-faith-baptist', 'Faith Baptist Church of Folsom', 'Baptist', 'Folsom', 'Folsom', 'Atlantic', '08037', 39.59670, -74.84310, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- =============================================== Galloway Twp (10) --
('galloway-church-of-the-assumption', 'Church of the Assumption', 'Catholic', '146 S Pitney Rd', 'Galloway Twp', 'Atlantic', '08205', 39.49140, -74.47390, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('galloway-mainland-baptist', 'Mainland Baptist Church', 'Baptist', '512 S Pitney Rd', 'Galloway Twp', 'Atlantic', '08205', 39.49140, -74.47390, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('galloway-word-of-life', 'Word of Life Christian Fellowship', 'Non-denominational', '508 S Second Ave', 'Galloway Twp', 'Atlantic', '08205', 39.49140, -74.47390, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('galloway-lifepoint', 'LifePoint Church', 'Apostolic (UPCI)', '733 E Lily Lake Rd', 'Galloway Twp', 'Atlantic', '08205', 39.49140, -74.47390, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('galloway-highland-community', 'Highland Community Church', 'Non-denominational', '515 S 4th Ave', 'Galloway Twp', 'Atlantic', '08205', 39.49140, -74.47390, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('galloway-emmaus-smithville', 'Emmaus Church of Smithville', 'United Methodist', '706 E Moss Mill Rd', 'Galloway Twp', 'Atlantic', '08205', 39.49140, -74.47390, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('galloway-redeeming-love', 'Redeeming Love Christian Fellowship', 'Non-denominational', '506 S Pomona Rd', 'Galloway Twp', 'Atlantic', '08205', 39.49140, -74.47390, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('galloway-church-by-the-bay', 'Church by the Bay', 'Congregational Methodist', '244 E White Horse Pike', 'Galloway Twp', 'Atlantic', '08205', 39.49140, -74.47390, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('galloway-new-apostolic', 'New Apostolic Church of Absecon', 'New Apostolic Church', '77 W White Horse Pike', 'Galloway Twp', 'Atlantic', '08205', 39.49140, -74.47390, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('galloway-uu-south-jersey-shore', 'UU Congregation of the South Jersey Shore', 'Unitarian Universalist', '75 S Pomona Rd', 'Galloway Twp', 'Atlantic', '08240', 39.49140, -74.47390, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- ===================================================== Hammonton (10) --
('hammonton-st-anthony-padua', 'St. Anthony of Padua (St. Mary of Mt. Carmel Parish)', 'Catholic', '285 Route 206', 'Hammonton', 'Atlantic', '08037', 39.66080, -74.76690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('hammonton-baptist', 'Hammonton Baptist Church', 'Baptist', '19 S Third St', 'Hammonton', 'Atlantic', '08037', 39.66080, -74.76690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('hammonton-rosedale-baptist', 'Rosedale Baptist Church', 'Baptist', '115 E 15th St', 'Hammonton', 'Atlantic', '08037', 39.66080, -74.76690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('hammonton-calvary-chapel', 'Calvary Chapel of Hammonton', 'Non-denominational', '660 S Egg Harbor Rd', 'Hammonton', 'Atlantic', '08037', 39.66080, -74.76690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('hammonton-first-umc', 'First United Methodist Church of Hammonton', 'United Methodist', '398 Bellevue Ave', 'Hammonton', 'Atlantic', '08037', 39.66080, -74.76690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('hammonton-st-james-lutheran', 'St. James Lutheran Church', 'Lutheran', '1341 Mays Landing Rd', 'Hammonton', 'Atlantic', '08037', 39.66080, -74.76690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('hammonton-first-ag', 'Hammonton First Assembly of God', 'Assemblies of God', '272 Route 206', 'Hammonton', 'Atlantic', '08037', 39.66080, -74.76690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('hammonton-pentecostal-ag', 'Pentecostal Assembly of God', 'Pentecostal', '100 French St', 'Hammonton', 'Atlantic', '08037', 39.66080, -74.76690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('hammonton-liberty-church-of-christ', 'Liberty Church of Christ', 'Church of Christ', '410 S Liberty St', 'Hammonton', 'Atlantic', '08037', 39.66080, -74.76690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('hammonton-spanish-sda', 'Hammonton Spanish Seventh-day Adventist Church', 'Seventh-day Adventist', '113 Vine St', 'Hammonton', 'Atlantic', '08037', 39.66080, -74.76690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- ======================================================= Linwood (4) --
('linwood-community', 'Linwood Community Church', 'Non-denominational', '1838 Shore Rd', 'Linwood', 'Atlantic', '08221', 39.34370, -74.57110, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('linwood-central-umc', 'Central United Methodist Church', 'United Methodist', '5 Marvin Ave', 'Linwood', 'Atlantic', '08221', 39.34370, -74.57110, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('linwood-our-lady-of-sorrows', 'Our Lady of Sorrows Church', 'Catholic', '724 Maple Ave', 'Linwood', 'Atlantic', '08221', 39.34370, -74.57110, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('linwood-seaview-baptist', 'Seaview Baptist Church', 'Baptist', '2025 Shore Rd', 'Linwood', 'Atlantic', '08221', 39.34370, -74.57110, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- ====================================================== Longport (2) --
('longport-church-of-the-redeemer', 'Church of the Redeemer', 'Episcopal', '108 S 20th Ave', 'Longport', 'Atlantic', '08403', 39.31140, -74.52690, 0, 'Hosts multiple denominations'' services', array['Multi-denominational host site','Unclaimed listing']),
('longport-epiphany-holy-trinity', 'Epiphany (Holy Trinity Parish)', 'Catholic', '2801 Ventnor Ave', 'Longport', 'Atlantic', '08403', 39.31140, -74.52690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- =================================================== Margate City (6) --
('margate-blessed-sacrament', 'Blessed Sacrament Church', 'Catholic', '11 N Kenyon Ave', 'Margate City', 'Atlantic', '08402', 39.33080, -74.50690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('margate-community-church', 'Margate Community Church', 'Interdenominational', '8900 Ventnor Ave', 'Margate City', 'Atlantic', '08402', 39.33080, -74.50690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('margate-trinity-methodist', 'Margate Trinity Methodist Church', 'United Methodist', '9500 Ventnor Ave', 'Margate City', 'Atlantic', '08402', 39.33080, -74.50690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('margate-beth-el-synagogue', 'Beth El Synagogue', 'Jewish (Conservative)', '500 N Jerome Ave', 'Margate City', 'Atlantic', '08402', 39.33080, -74.50690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('margate-chabad-house', 'Chabad House', 'Jewish (Chabad-Lubavitch)', '8223 Fulton Ave', 'Margate City', 'Atlantic', '08402', 39.33080, -74.50690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('margate-young-israel', 'Young Israel of Margate', 'Jewish (Orthodox)', '8401 Ventnor Ave', 'Margate City', 'Atlantic', '08402', 39.33080, -74.50690, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- =================================================== Mullica Twp (4) --
('mullica-greater-love-chapel', 'Greater Love Chapel Church', 'Non-denominational', '279 Prince Albert St, Elwood', 'Mullica Twp', 'Atlantic', '08217', 39.59650, -74.67650, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('mullica-first-holiness-cogic', 'First Holiness Church COGIC', 'Church of God in Christ', '302 Locust St, Elwood', 'Mullica Twp', 'Atlantic', '08217', 39.59650, -74.67650, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('mullica-pinelands-umc', 'Pinelands United Methodist Church', 'United Methodist', '5213 Pleasant Mills Rd, Sweetwater', 'Mullica Twp', 'Atlantic', '08037', 39.59650, -74.67650, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('mullica-batsto-pleasant-mills-umc', 'Batsto-Pleasant Mills United Methodist Church', 'United Methodist', '31 Batsto Rd', 'Mullica Twp', 'Atlantic', '08037', 39.59650, -74.67650, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- ===================================================== Northfield (6) --
('northfield-st-gianna-molla', 'St. Gianna Beretta Molla Parish (Church of St. Bernadette)', 'Catholic', '1421 New Rd', 'Northfield', 'Atlantic', '08225', 39.37310, -74.55410, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('northfield-north-harbor', 'North Harbor Church', 'Non-denominational', '201 Tilton Rd, Suite 10', 'Northfield', 'Atlantic', '08225', 39.37310, -74.55410, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('northfield-good-shepherd-umc', 'Northfield United Methodist Church (Good Shepherd UMC)', 'United Methodist', '207 Northfield Ave', 'Northfield', 'Atlantic', '08225', 39.37310, -74.55410, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('northfield-church-of-christ', 'Northfield Church of Christ', 'Church of Christ', '2535 Shore Rd', 'Northfield', 'Atlantic', '08225', 39.37310, -74.55410, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('northfield-faith-presbyterian', 'Faith Presbyterian Church', 'Presbyterian', '232 W Mill Rd', 'Northfield', 'Atlantic', '08225', 39.37310, -74.55410, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('northfield-baptist', 'Northfield Baptist Church', 'Baptist', '1964 Zion Rd', 'Northfield', 'Atlantic', '08225', 39.37310, -74.55410, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- ================================================== Pleasantville (5) --
('pville-bethany-st-johns-umc', 'Bethany St. John''s United Methodist Church', 'United Methodist', '615 Risley Ave', 'Pleasantville', 'Atlantic', '08232', 39.38880, -74.51430, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('pville-lighthouse-community', 'Lighthouse Community Church', 'Non-denominational', '923 Washington Ave', 'Pleasantville', 'Atlantic', '08232', 39.38880, -74.51430, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('pville-medina-mosque', 'Medina Mosque and Islamic Center', 'Islamic', '1514 N Main St', 'Pleasantville', 'Atlantic', '08232', 39.38880, -74.51430, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('pville-masjid-baitul-nasr', 'Masjid Baitul Nasr', 'Islamic (Sunni)', '101 E West Jersey Ave', 'Pleasantville', 'Atlantic', '08232', 39.38880, -74.51430, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('pville-kingdom-hall', 'Kingdom Hall of Jehovah''s Witnesses', 'Jehovah''s Witness', '820 S Main St', 'Pleasantville', 'Atlantic', '08232', 39.38880, -74.51430, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- =================================================== Port Republic (2) --
('port-republic-community-church', 'Port Community Church', 'Non-denominational', '118 Main St', 'Port Republic', 'Atlantic', '08241', 39.52070, -74.48570, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('port-republic-st-pauls-umc', 'St. Paul''s United Methodist Church', 'United Methodist', 'Main St', 'Port Republic', 'Atlantic', '08241', 39.52070, -74.48570, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- ===================================================== Somers Point (7) --
('sp-st-joseph', 'St. Joseph Roman Catholic Church', 'Catholic', '606 Shore Rd', 'Somers Point', 'Atlantic', '08244', 39.31720, -74.60640, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('sp-christ-episcopal', 'Christ Episcopal Church of Somers Point', 'Episcopal', '157 Shore Rd', 'Somers Point', 'Atlantic', '08244', 39.31720, -74.60640, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('sp-grace-lutheran', 'Grace Lutheran Church', 'Evangelical Lutheran', '11 E Dawes Ave', 'Somers Point', 'Atlantic', '08244', 39.31720, -74.60640, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('sp-lifegate', 'Lifegate Church', 'United Methodist', '296 Bethel Rd', 'Somers Point', 'Atlantic', '08244', 39.31720, -74.60640, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('sp-coastal-christian', 'Coastal Christian', 'Non-denominational', '22 W Dawes Ave', 'Somers Point', 'Atlantic', '08244', 39.31720, -74.60640, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('sp-mission-point', 'Mission Point Church', 'Non-denominational', '900 W New York Ave', 'Somers Point', 'Atlantic', '08244', 39.31720, -74.60640, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('sp-new-covenant-community', 'New Covenant Community Church', 'Non-denominational', '701 New Hampshire Ave', 'Somers Point', 'Atlantic', '08244', 39.31720, -74.60640, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- ===================================================== Ventnor City (5) --
('ventnor-holy-trinity-st-james', 'Holy Trinity Parish (St. James Church)', 'Catholic', '6415 Atlantic Ave', 'Ventnor City', 'Atlantic', '08406', 39.34210, -74.48260, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ventnor-st-johns-by-the-sea', 'St. John''s By-The-Sea Reformed Episcopal Church', 'Reformed Episcopal', '6 S Sacramento Ave', 'Ventnor City', 'Atlantic', '08406', 39.34210, -74.48260, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ventnor-umc', 'Ventnor United Methodist Church', 'United Methodist', '7117 Ventnor Ave', 'Ventnor City', 'Atlantic', '08406', 39.34210, -74.48260, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ventnor-atlantic-chinese-alliance', 'Atlantic Chinese Alliance Church', 'Christian & Missionary Alliance', '300 N Dudley Ave', 'Ventnor City', 'Atlantic', '08406', 39.34210, -74.48260, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('ventnor-community-church', 'Ventnor City Community Church', 'Non-denominational', '5300 Ventnor Ave', 'Ventnor City', 'Atlantic', '08406', 39.34210, -74.48260, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),

-- =================================================== Weymouth Twp (2) --
('weymouth-bethlehem-lutheran', 'Bethlehem Lutheran Church', 'Evangelical Lutheran', '1219 12th Ave, Dorothy', 'Weymouth Twp', 'Atlantic', '08317', 39.39630, -74.82700, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']),
('weymouth-st-johns-community', 'St. Johns Community Evangelistic Church Inc', 'Evangelical/Protestant', '1405 11th Ave, Dorothy', 'Weymouth Twp', 'Atlantic', '08317', 39.39630, -74.82700, 0, 'Service times not listed', array['Service times not listed','Unclaimed listing']);
