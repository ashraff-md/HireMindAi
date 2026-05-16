-- Allow signed-in users to read their own row (e.g. plan_type for client hydration).
create policy "users_select_own"
on public.users
for select
to authenticated
using (auth.uid() = id);
