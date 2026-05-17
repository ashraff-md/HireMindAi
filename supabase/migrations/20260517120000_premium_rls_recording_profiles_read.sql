-- Premium: client-read own interview data, recording path on interviews, profiles read own

alter table public.interviews
  add column if not exists user_recording_object_path text;

comment on column public.interviews.user_recording_object_path is
  'Supabase Storage object path in interview-audio bucket (premium user mic recording).';

drop policy if exists "interviews_select_own" on public.interviews;

create policy "interviews_select_own"
on public.interviews
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "interview_messages_select_own" on public.interview_messages;

create policy "interview_messages_select_own"
on public.interview_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.interviews i
    where i.id = interview_messages.interview_id
      and i.user_id = auth.uid ()
  )
);

drop policy if exists "feedback_select_own" on public.feedback;

create policy "feedback_select_own"
on public.feedback
for select
to authenticated
using (
  exists (
    select 1
    from public.interviews i
    where i.id = feedback.interview_id
      and i.user_id = auth.uid ()
  )
);

drop policy if exists "profiles_select_own" on public.profiles;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);
