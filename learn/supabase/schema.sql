-- EcoLogic Learn: accounts, classes and progress for the IGCSE Economics practice app.
-- Safe to run again. Every table has row-level security on and no public rights:
-- the website only calls the ec_* functions below, which check the sign-in token first.

create extension if not exists pgcrypto with schema extensions;

create table if not exists ec_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  role text not null default 'student' check (role in ('student', 'teacher')),
  class_code text,
  full_name text not null default '',
  display_name text not null default '',
  secret_hash text not null,
  is_admin boolean not null default false,
  must_change boolean not null default false,
  failed int not null default 0,
  locked_until timestamptz,
  last_seen timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists ec_tokens (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null references ec_users(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '120 days'
);
create table if not exists ec_classes (
  code text primary key,
  name text not null default '',
  teacher_id uuid references ec_users(id) on delete set null,
  open_units text[] not null default '{2.6}',
  created_at timestamptz not null default now()
);
create table if not exists ec_attempts (
  id bigserial primary key,
  user_id uuid not null references ec_users(id) on delete cascade,
  class_code text,
  unit text not null,
  activity text not null,
  level_start int,
  level_end int,
  score int not null default 0,
  max_score int not null default 0,
  seconds int not null default 0,
  answers jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index if not exists ec_attempts_user on ec_attempts(user_id, created_at);
create index if not exists ec_attempts_class on ec_attempts(class_code, created_at);
create index if not exists ec_tokens_user on ec_tokens(user_id);

alter table ec_users enable row level security;
alter table ec_tokens enable row level security;
alter table ec_classes enable row level security;
alter table ec_attempts enable row level security;
revoke all on ec_users, ec_tokens, ec_classes, ec_attempts from anon, authenticated;
revoke all on sequence ec_attempts_id_seq from anon, authenticated;

-- ---------- helpers (not callable from the website) ----------
create or replace function ec_user_of(p_token uuid) returns ec_users
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users;
begin
  select users.* into u from ec_tokens t join ec_users users on users.id = t.user_id where t.token = p_token and t.expires_at > now();
  if u.id is null then raise exception 'not-signed-in' using errcode = 'P0001'; end if;
  update ec_users set last_seen = now() where id = u.id;
  return u;
end $$;

create or replace function ec_teacher_of(p_token uuid) returns ec_users
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users;
begin
  u := ec_user_of(p_token);
  if u.role <> 'teacher' then raise exception 'teachers-only' using errcode = 'P0001'; end if;
  return u;
end $$;

create or replace function ec_require_class(p_teacher ec_users, p_code text) returns ec_classes
language plpgsql security definer set search_path = public, extensions as $$
declare c ec_classes;
begin
  select * into c from ec_classes where code = lower(p_code);
  if c.code is null then raise exception 'no-such-class' using errcode = 'P0001'; end if;
  if c.teacher_id is distinct from p_teacher.id and not p_teacher.is_admin then raise exception 'not-your-class' using errcode = 'P0001'; end if;
  return c;
end $$;

create or replace function ec_new_pin() returns text
language sql volatile security definer set search_path = public, extensions as $$
  select lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
$$;

-- ---------- sign-in ----------
create or replace function ec_login(p_username text, p_secret text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users; tok uuid; units text[];
begin
  -- wrong logins return an error object (not an exception), so the failed-login counter is not rolled back
  select * into u from ec_users where username = lower(trim(p_username));
  if u.id is null then return json_build_object('error', 'wrong-login'); end if;
  if u.locked_until is not null and u.locked_until > now() then return json_build_object('error', 'locked'); end if;
  if u.secret_hash <> crypt(p_secret, u.secret_hash) then
    update ec_users set locked_until = case when failed + 1 >= 5 then now() + interval '5 minutes' else locked_until end,
      failed = case when failed + 1 >= 5 then 0 else failed + 1 end where id = u.id;
    return json_build_object('error', 'wrong-login');
  end if;
  update ec_users set failed = 0, locked_until = null, last_seen = now() where id = u.id;
  delete from ec_tokens where user_id = u.id and expires_at < now();
  insert into ec_tokens(user_id) values (u.id) returning token into tok;
  select open_units into units from ec_classes where code = u.class_code;
  return json_build_object('token', tok, 'role', u.role, 'username', u.username, 'display_name', u.display_name, 'full_name', u.full_name,
    'class_code', u.class_code, 'must_change', u.must_change, 'is_admin', u.is_admin, 'open_units', coalesce(units, '{}'));
end $$;

create or replace function ec_me(p_token uuid) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users; units text[];
begin
  u := ec_user_of(p_token);
  select open_units into units from ec_classes where code = u.class_code;
  return json_build_object('role', u.role, 'username', u.username, 'display_name', u.display_name, 'full_name', u.full_name,
    'class_code', u.class_code, 'must_change', u.must_change, 'is_admin', u.is_admin, 'open_units', coalesce(units, '{}'));
end $$;

create or replace function ec_logout(p_token uuid) returns void
language sql security definer set search_path = public, extensions as $$
  delete from ec_tokens where token = p_token;
$$;

create or replace function ec_set_secret(p_token uuid, p_old text, p_new text) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users;
begin
  u := ec_user_of(p_token);
  if u.secret_hash <> crypt(p_old, u.secret_hash) then raise exception 'wrong-login' using errcode = 'P0001'; end if;
  if (u.role = 'teacher' and length(p_new) < 8) or (u.role = 'student' and p_new !~ '^[0-9]{4,6}$') then raise exception 'weak-secret' using errcode = 'P0001'; end if;
  update ec_users set secret_hash = crypt(p_new, gen_salt('bf')), must_change = false where id = u.id;
end $$;

-- ---------- students ----------
create or replace function ec_save_attempt(p_token uuid, p_unit text, p_activity text, p_level_start int, p_level_end int,
  p_score int, p_max int, p_seconds int, p_answers jsonb) returns bigint
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users; new_id bigint;
begin
  u := ec_user_of(p_token);
  if u.role <> 'student' then return null; end if;
  if length(p_unit) > 12 or length(p_activity) > 40 or jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) > 120 or length(p_answers::text) > 60000 then
    raise exception 'bad-attempt' using errcode = 'P0001';
  end if;
  insert into ec_attempts(user_id, class_code, unit, activity, level_start, level_end, score, max_score, seconds, answers)
  values (u.id, u.class_code, p_unit, p_activity, p_level_start, p_level_end,
    greatest(0, least(p_score, greatest(p_max, 0))), greatest(0, least(p_max, 500)), greatest(0, least(p_seconds, 7200)), p_answers)
  returning id into new_id;
  return new_id;
end $$;

create or replace function ec_history(p_token uuid) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users;
begin
  u := ec_user_of(p_token);
  return coalesce((select json_agg(a order by a.created_at) from (
    select id, unit, activity, level_start, level_end, score, max_score, seconds, answers, created_at
    from ec_attempts where user_id = u.id order by created_at desc limit 600) a), '[]');
end $$;

-- ---------- teachers ----------
create or replace function ec_t_classes(p_token uuid) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users;
begin
  t := ec_teacher_of(p_token);
  return coalesce((select json_agg(json_build_object('code', c.code, 'name', c.name, 'open_units', c.open_units,
      'students', (select count(*) from ec_users s where s.class_code = c.code and s.role = 'student')) order by c.code)
    from ec_classes c where c.teacher_id = t.id or t.is_admin), '[]');
end $$;

create or replace function ec_t_add_students(p_token uuid, p_code text, p_people jsonb) returns json
language plpgsql security definer set search_path = public, extensions as $$
-- p_people: [{"full_name": "...", "display_name": "..."}, ...]; returns each new login with its PIN (shown once)
declare t ec_users; c ec_classes; p jsonb; n int; uname text; pin text; out jsonb := '[]';
begin
  t := ec_teacher_of(p_token); c := ec_require_class(t, p_code);
  select coalesce(max(substring(username from '-([0-9]+)$')::int), 0) into n from ec_users where class_code = c.code and role = 'student';
  for p in select * from jsonb_array_elements(p_people) loop
    n := n + 1; uname := c.code || '-' || lpad(n::text, 2, '0'); pin := ec_new_pin();
    insert into ec_users(username, role, class_code, full_name, display_name, secret_hash)
    values (uname, 'student', c.code, left(coalesce(p->>'full_name', ''), 80), left(coalesce(nullif(p->>'display_name', ''), p->>'full_name', uname), 40), crypt(pin, gen_salt('bf')));
    out := out || jsonb_build_object('username', uname, 'full_name', p->>'full_name', 'display_name', coalesce(nullif(p->>'display_name', ''), p->>'full_name'), 'pin', pin);
  end loop;
  return out;
end $$;

create or replace function ec_t_add_class(p_token uuid, p_code text, p_name text, p_people jsonb) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; v_code text := lower(trim(p_code));
begin
  t := ec_teacher_of(p_token);
  if v_code !~ '^[a-z0-9]{2,12}$' then raise exception 'bad-class-code' using errcode = 'P0001'; end if;
  if exists (select 1 from ec_classes c where c.code = v_code) then raise exception 'class-exists' using errcode = 'P0001'; end if;
  insert into ec_classes(code, name, teacher_id) values (v_code, left(coalesce(p_name, ''), 60), t.id);
  return ec_t_add_students(p_token, v_code, coalesce(p_people, '[]'));
end $$;

create or replace function ec_t_class(p_token uuid, p_code text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; c ec_classes;
begin
  t := ec_teacher_of(p_token); c := ec_require_class(t, p_code);
  return json_build_object('code', c.code, 'name', c.name, 'open_units', c.open_units,
    'students', coalesce((select json_agg(json_build_object('id', s.id, 'username', s.username, 'full_name', s.full_name, 'display_name', s.display_name,
        'last_seen', s.last_seen, 'locked', s.locked_until > now()) order by s.username) from ec_users s where s.class_code = c.code and s.role = 'student'), '[]'),
    'attempts', coalesce((select json_agg(json_build_object('id', a.id, 'user_id', a.user_id, 'unit', a.unit, 'activity', a.activity, 'level_start', a.level_start,
        'level_end', a.level_end, 'score', a.score, 'max_score', a.max_score, 'seconds', a.seconds, 'answers', a.answers, 'created_at', a.created_at) order by a.created_at)
      from ec_attempts a join ec_users s on s.id = a.user_id where s.class_code = c.code), '[]'));
end $$;

create or replace function ec_t_set_units(p_token uuid, p_code text, p_units text[]) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; c ec_classes;
begin
  t := ec_teacher_of(p_token); c := ec_require_class(t, p_code);
  update ec_classes set open_units = coalesce(p_units, '{}') where code = c.code;
end $$;

create or replace function ec_t_student_of(p_teacher ec_users, p_user uuid) returns ec_users
language plpgsql security definer set search_path = public, extensions as $$
declare s ec_users;
begin
  select * into s from ec_users where id = p_user and role = 'student';
  if s.id is null then raise exception 'no-such-student' using errcode = 'P0001'; end if;
  perform ec_require_class(p_teacher, s.class_code);
  return s;
end $$;

create or replace function ec_t_reset_pin(p_token uuid, p_user uuid) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; s ec_users; pin text := ec_new_pin();
begin
  t := ec_teacher_of(p_token); s := ec_t_student_of(t, p_user);
  update ec_users set secret_hash = crypt(pin, gen_salt('bf')), failed = 0, locked_until = null where id = s.id;
  delete from ec_tokens where user_id = s.id;
  return pin;
end $$;

create or replace function ec_t_new_pins(p_token uuid, p_code text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; c ec_classes; s ec_users; out jsonb := '[]'; pin text;
begin
  t := ec_teacher_of(p_token); c := ec_require_class(t, p_code);
  for s in select * from ec_users where class_code = c.code and role = 'student' order by username loop
    pin := ec_new_pin();
    update ec_users set secret_hash = crypt(pin, gen_salt('bf')), failed = 0, locked_until = null where id = s.id;
    delete from ec_tokens where user_id = s.id;
    out := out || jsonb_build_object('username', s.username, 'full_name', s.full_name, 'display_name', s.display_name, 'pin', pin);
  end loop;
  return out;
end $$;

create or replace function ec_t_rename(p_token uuid, p_user uuid, p_display text) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; s ec_users;
begin
  t := ec_teacher_of(p_token); s := ec_t_student_of(t, p_user);
  update ec_users set display_name = left(trim(p_display), 40) where id = s.id and length(trim(p_display)) > 0;
end $$;

create or replace function ec_t_remove_student(p_token uuid, p_user uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; s ec_users;
begin
  t := ec_teacher_of(p_token); s := ec_t_student_of(t, p_user);
  delete from ec_users where id = s.id;
end $$;

-- Only the ec_* entry points are callable from the website; the helpers stay private.
revoke all on function ec_user_of(uuid), ec_teacher_of(uuid), ec_require_class(ec_users, text), ec_new_pin(), ec_t_student_of(ec_users, uuid) from public, anon, authenticated;
revoke all on function ec_login(text, text), ec_me(uuid), ec_logout(uuid), ec_set_secret(uuid, text, text), ec_save_attempt(uuid, text, text, int, int, int, int, int, jsonb),
  ec_history(uuid), ec_t_classes(uuid), ec_t_add_students(uuid, text, jsonb), ec_t_add_class(uuid, text, text, jsonb), ec_t_class(uuid, text),
  ec_t_set_units(uuid, text, text[]), ec_t_reset_pin(uuid, uuid), ec_t_new_pins(uuid, text), ec_t_rename(uuid, uuid, text), ec_t_remove_student(uuid, uuid) from public;
grant execute on function ec_login(text, text), ec_me(uuid), ec_logout(uuid), ec_set_secret(uuid, text, text), ec_save_attempt(uuid, text, text, int, int, int, int, int, jsonb),
  ec_history(uuid), ec_t_classes(uuid), ec_t_add_students(uuid, text, jsonb), ec_t_add_class(uuid, text, text, jsonb), ec_t_class(uuid, text),
  ec_t_set_units(uuid, text, text[]), ec_t_reset_pin(uuid, uuid), ec_t_new_pins(uuid, text), ec_t_rename(uuid, uuid, text), ec_t_remove_student(uuid, uuid) to anon;
