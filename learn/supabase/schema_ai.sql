-- EcoLogic Learn, part 5: AI marking log (run after schema_test.sql).
-- The "ecl-grade" Edge Function (learn/supabase/functions/ecl-grade) writes one row per AI check, using the service key.
-- Students cannot read or write this table; teachers see their own classes' rows through ec_t_ai_log and can flag a decision.
create table if not exists ec_ai_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references ec_users(id) on delete cascade,
  unit text not null default '',
  item text not null default '',
  band smallint,
  question text not null default '',
  answer text not null default '',
  ok boolean not null default false,
  hits jsonb not null default '[]',
  need smallint,
  keyword_ok boolean,
  feedback text not null default '',
  model text not null default '',
  overruled boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists ec_ai_log_user on ec_ai_log(user_id, created_at);
alter table ec_ai_log enable row level security;
revoke all on ec_ai_log from anon, authenticated;

-- The last 300 AI decisions in a class, newest first
create or replace function ec_t_ai_log(p_token uuid, p_code text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; c ec_classes;
begin
  t := ec_teacher_of(p_token); c := ec_require_class(t, p_code);
  return coalesce((select json_agg(x order by x.created_at desc) from (
    select l.id, l.user_id, s.username, s.display_name, s.is_test, l.unit, l.item, l.band, l.question, l.answer, l.ok, l.hits, l.need,
           l.keyword_ok, l.feedback, l.model, l.overruled, l.created_at
    from ec_ai_log l join ec_users s on s.id = l.user_id
    where s.class_code = c.code order by l.created_at desc limit 300) x), '[]');
end $$;

-- The teacher disagrees with an AI decision (a note for the teacher; it does not change marks or XP)
create or replace function ec_t_ai_flag(p_token uuid, p_id bigint, p_overruled boolean) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users;
begin
  t := ec_teacher_of(p_token);
  update ec_ai_log l set overruled = p_overruled from ec_users s
   where l.id = p_id and s.id = l.user_id and (t.is_admin or exists (select 1 from ec_classes c where c.code = s.class_code and c.teacher_id = t.id));
end $$;

revoke all on function ec_t_ai_log(uuid, text), ec_t_ai_flag(uuid, bigint, boolean) from public;
grant execute on function ec_t_ai_log(uuid, text), ec_t_ai_flag(uuid, bigint, boolean) to anon;
