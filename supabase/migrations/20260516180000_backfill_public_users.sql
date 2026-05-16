-- Backfill public.users for any auth.users rows missing a mirror row (fixes FK on interviews / plan hydration).
insert into public.users (id, name, email, plan_type)
select
  au.id,
  coalesce(
    au.raw_user_meta_data ->> 'name',
    au.raw_user_meta_data ->> 'full_name',
    split_part(coalesce(au.email::text, ''), '@', 1),
    'User'
  ),
  coalesce(au.email::text, ''),
  'free'
from auth.users au
where
  not exists (
    select 1
    from public.users pu
    where pu.id = au.id
  );
