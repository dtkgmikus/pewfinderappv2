-- Deletes the fabricated demo reviews (ported from the original design
-- mockup, attached to the 11 originally-"claimed" Egg Harbor Twp churches)
-- so the site starts clean and every review a visitor sees going forward
-- is a real one.
--
-- Only removes reviews where member_id is null — seeded/demo reviews were
-- never tied to a real signed-in account (see the comment on
-- reviews.member_id in schema.sql: "Real reviews created through the app
-- always set this to auth.uid()"), so this can't touch a genuine review a
-- real member has already submitted while testing the live app.
delete from reviews where member_id is null;

-- Rebuild church_category_scores from whatever real reviews remain. The
-- delete above already cascaded away every seed row here (review_id
-- references reviews(id) on delete cascade); this recomputes the
-- aggregate correctly rather than just leaving stale seed numbers behind.
delete from church_category_scores;
insert into church_category_scores (church_id, category_key, avg_score, n)
select r.church_id, rcr.category_key, round(avg(rcr.rating)::numeric, 2), count(*)
from review_category_ratings rcr
join reviews r on r.id = rcr.review_id
group by r.church_id, rcr.category_key;

-- Recompute churches.avg_rating / review_count the same way. These were
-- seeded as flat literal numbers alongside the fake reviews (not derived
-- from the reviews table via the app's usual trigger), so deleting the
-- fake reviews above does not automatically zero them out on its own.
update churches c set
  avg_rating = coalesce((
    select round(avg(r.overall_rating)::numeric, 2) from reviews r
    where r.church_id = c.id and r.status = 'published'
  ), 0),
  review_count = coalesce((
    select count(*) from reviews r
    where r.church_id = c.id and r.status = 'published'
  ), 0);
