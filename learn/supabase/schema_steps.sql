-- EcoLogic Learn: the step-level event log (see learn/docs/DATA-SPEC.md).
-- One row per student step, in the CMU DataShop style, with the fields IRT and in-class experiments need.
-- Run after schema.sql. Safe to run again. Row-level security on, no public rights: the website writes only through
-- ec_log_steps, which checks the sign-in token and takes the student and class from it (never from the browser).

create table if not exists ec_steps (
  id bigserial primary key,
  user_id uuid not null references ec_users(id) on delete cascade,
  class_code text,
  session_id text not null,
  client_t timestamptz,
  created_at timestamptz not null default now(),
  unit text not null,
  activity text not null,
  mode text not null default 'practice' check (mode in ('practice', 'checkpoint', 'review', 'live', 'exam')),
  item_id text not null,
  item_version text not null default '',
  step text not null default '',
  template text,
  params jsonb,
  kc text[] not null default '{}',
  attempt int not null default 1,
  outcome text not null check (outcome in ('correct', 'incorrect', 'hint', 'partial', 'skip')),
  score numeric,
  max_score numeric,
  response text,
  diagnosis text,
  help text[] not null default '{}',
  band int,
  confidence smallint check (confidence between 1 and 3),
  duration_ms int,
  level int,
  condition text not null default ''
);
create index if not exists ec_steps_user on ec_steps(user_id, created_at);
create index if not exists ec_steps_item on ec_steps(item_id, step);
create index if not exists ec_steps_class on ec_steps(class_code, created_at);
create index if not exists ec_steps_kc on ec_steps using gin(kc);

alter table ec_steps enable row level security;
revoke all on ec_steps from anon, authenticated;
revoke all on sequence ec_steps_id_seq from anon, authenticated;

-- p_rows: a JSON array of up to 100 steps, each with the fields above except user_id, class_code, created_at.
-- Rows with a missing item_id or a bad outcome are skipped, text is cut to a safe length. Returns how many were saved.
create or replace function ec_log_steps(p_token uuid, p_rows jsonb) returns int
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users; r jsonb; n int := 0;
begin
  u := ec_user_of(p_token);
  if u.role <> 'student' then return 0; end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 100 or length(p_rows::text) > 200000 then
    raise exception 'bad-steps' using errcode = 'P0001';
  end if;
  for r in select * from jsonb_array_elements(p_rows) loop
    continue when coalesce(r->>'item_id', '') = '' or coalesce(r->>'outcome', '') not in ('correct', 'incorrect', 'hint', 'partial', 'skip');
    insert into ec_steps(user_id, class_code, session_id, client_t, unit, activity, mode, item_id, item_version, step, template, params,
      kc, attempt, outcome, score, max_score, response, diagnosis, help, band, confidence, duration_ms, level, condition)
    values (u.id, u.class_code, left(coalesce(r->>'session_id', ''), 40),
      case when (r->>'client_t') ~ '^\d{4}-\d\d-\d\dT' then (r->>'client_t')::timestamptz end,
      left(coalesce(r->>'unit', ''), 12), left(coalesce(r->>'activity', ''), 40),
      case when r->>'mode' in ('practice', 'checkpoint', 'review', 'live', 'exam') then r->>'mode' else 'practice' end,
      left(r->>'item_id', 60), left(coalesce(r->>'item_version', ''), 16), left(coalesce(r->>'step', ''), 20),
      left(r->>'template', 40), case when jsonb_typeof(r->'params') = 'object' and length((r->'params')::text) < 2000 then r->'params' end,
      coalesce((select array_agg(left(x, 40)) from (select x from jsonb_array_elements_text(case when jsonb_typeof(r->'kc') = 'array' then r->'kc' else '[]' end) x limit 8) k), '{}'),
      case when (r->>'attempt') ~ '^\d{1,3}$' then greatest(1, least((r->>'attempt')::int, 50)) else 1 end, r->>'outcome',
      case when (r->>'score') ~ '^-?\d+(\.\d+)?$' then (r->>'score')::numeric end, case when (r->>'max_score') ~ '^\d+(\.\d+)?$' then (r->>'max_score')::numeric end, left(r->>'response', 400), left(r->>'diagnosis', 40),
      coalesce((select array_agg(left(x, 20)) from (select x from jsonb_array_elements_text(case when jsonb_typeof(r->'help') = 'array' then r->'help' else '[]' end) x limit 8) h), '{}'),
      case when (r->>'band') ~ '^[0-3]$' then (r->>'band')::int end,
      case when (r->>'confidence') ~ '^[1-3]$' then (r->>'confidence')::smallint end,
      case when (r->>'duration_ms') ~ '^\d{1,9}$' then least((r->>'duration_ms')::int, 3600000) end,
      case when (r->>'level') ~ '^[0-2]$' then (r->>'level')::int end,
      left(coalesce(r->>'condition', ''), 40));
    n := n + 1;
  end loop;
  return n;
end $$;

-- Teacher view: a class's steps (most recent first), for the teacher console and exports. Teachers see only their classes.
create or replace function ec_t_steps(p_token uuid, p_code text, p_since timestamptz default now() - interval '30 days') returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users;
begin
  t := ec_teacher_of(p_token);
  perform ec_require_class(t, p_code);
  return coalesce((select json_agg(s order by s.created_at desc) from (
    select st.user_id, st.session_id, st.created_at, st.unit, st.activity, st.mode, st.item_id, st.item_version, st.step, st.template,
      st.kc, st.attempt, st.outcome, st.score, st.max_score, st.diagnosis, st.help, st.band, st.confidence, st.duration_ms, st.level, st.condition
    from ec_steps st where st.class_code = p_code and st.created_at >= p_since order by st.created_at desc limit 20000) s), '[]');
end $$;

revoke all on function ec_log_steps(uuid, jsonb), ec_t_steps(uuid, text, timestamptz) from public;
grant execute on function ec_log_steps(uuid, jsonb), ec_t_steps(uuid, text, timestamptz) to anon, authenticated;
