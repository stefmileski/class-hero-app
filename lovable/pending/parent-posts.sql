-- OPTIONAL — not applied. Lets a parent post to a class their child is in.
--
-- Decision pending. Run one statement at a time via query_database.
--
-- VERIFY FIRST: read `can_view_post`'s definition and confirm a class-audience
-- post authored by a *parent* is visible to the people you expect — the class
-- teacher and the other class parents. That function was written on the
-- assumption that class posts come from staff, and it may key off the author's
-- role or off class_members rather than off the audience. If it does, this
-- policy would let a parent create a post that nobody can read, including
-- themselves.

-- Parent of a child in this class, by approved link only. Mirrors the
-- `status = 'approved'` condition already used by is_parent_of().
create or replace function public.is_parent_in_class(_class_id uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (
    select 1
    from public.students s
    join public.parent_links pl on pl.student_id = s.id
    where s.class_id = _class_id
      and pl.user_id = auth.uid()
      and pl.status = 'approved'
  );
$$;

revoke execute on function public.is_parent_in_class(uuid) from anon;

drop policy if exists "teachers admins write posts" on public.posts;

create policy "teachers admins parents write posts"
on public.posts for insert to authenticated
with check (
  author_id = auth.uid()
  and (
    -- unchanged: a class teacher posts to their own class
    (audience = 'class' and class_id is not null
      and public.has_class_role(class_id, 'teacher'))
    -- unchanged: a school admin posts anywhere in their school
    or public.has_school_role(school_id, 'admin')
    -- new: a parent posts to a class their child is in, and only to a class.
    -- Note there is no branch admitting audience = 'school' for a parent —
    -- broadcasting to an entire school stays with administrators.
    or (audience = 'class' and class_id is not null
      and public.is_parent_in_class(class_id))
  )
);

-- Moderation already exists and is unchanged: the DELETE policy lets the
-- author, any school teacher, or any school admin remove a post.

-- ── Then, in the app ────────────────────────────────────────────────────
-- 1. `composer.tsx` computes `canPost = isAdmin || teachingClasses.length > 0`.
--    Extend it to include classes the user is a parent in, and offer those in
--    the class picker. "Whole school" must stay disabled for parents.
-- 2. Keep parent posts text-only. The photo-consent architecture
--    (can_view_post, post_tags, signed URLs, watermarking, photo_consent)
--    assumes staff authorship; a parent-uploaded photo would put other
--    people's children in front of the class without any of it engaging.
--    Today the composer writes only title and body, so this holds by accident.
--    Make it hold on purpose before adding media upload.
