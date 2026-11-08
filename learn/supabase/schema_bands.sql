-- EcoLogic Learn, part 3: English bands (run after schema.sql and schema_xp.sql).
-- A student's English band (0 A1, 1 A2, 2 B1, 3 B2) is worked out in the app from the baseline and later results.
-- eng_band holds a teacher's override (null = automatic). vi_a1 lets a class switch Vietnamese help for A1 on or off.
alter table ec_users add column if not exists eng_band smallint check (eng_band between 0 and 3);
alter table ec_classes add column if not exists vi_a1 boolean not null default true;

create or replace function ec_login(p_username text, p_secret text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users; tok uuid; c ec_classes;
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
  select * into c from ec_classes where code = u.class_code;
  return json_build_object('token', tok, 'role', u.role, 'username', u.username, 'display_name', u.display_name, 'full_name', u.full_name,
    'class_code', u.class_code, 'must_change', u.must_change, 'is_admin', u.is_admin, 'open_units', coalesce(c.open_units, '{}'),
    'eng_band', u.eng_band, 'vi_a1', coalesce(c.vi_a1, true));
end $$;

create or replace function ec_me(p_token uuid) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users; c ec_classes;
begin
  u := ec_user_of(p_token);
  select * into c from ec_classes where code = u.class_code;
  return json_build_object('role', u.role, 'username', u.username, 'display_name', u.display_name, 'full_name', u.full_name,
    'class_code', u.class_code, 'must_change', u.must_change, 'is_admin', u.is_admin, 'open_units', coalesce(c.open_units, '{}'),
    'eng_band', u.eng_band, 'vi_a1', coalesce(c.vi_a1, true));
end $$;

create or replace function ec_t_class(p_token uuid, p_code text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; c ec_classes;
begin
  t := ec_teacher_of(p_token); c := ec_require_class(t, p_code);
  return json_build_object('code', c.code, 'name', c.name, 'open_units', c.open_units, 'vi_a1', c.vi_a1,
    'students', coalesce((select json_agg(json_build_object('id', s.id, 'username', s.username, 'full_name', s.full_name, 'display_name', s.display_name,
        'last_seen', s.last_seen, 'locked', s.locked_until > now(), 'eng_band', s.eng_band) order by s.username) from ec_users s where s.class_code = c.code and s.role = 'student'), '[]'),
    'attempts', coalesce((select json_agg(json_build_object('id', a.id, 'user_id', a.user_id, 'unit', a.unit, 'activity', a.activity, 'level_start', a.level_start,
        'level_end', a.level_end, 'score', a.score, 'max_score', a.max_score, 'seconds', a.seconds, 'answers', a.answers, 'created_at', a.created_at) order by a.created_at)
      from ec_attempts a join ec_users s on s.id = a.user_id where s.class_code = c.code), '[]'));
end $$;

create or replace function ec_t_classes(p_token uuid) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users;
begin
  t := ec_teacher_of(p_token);
  return coalesce((select json_agg(json_build_object('code', c.code, 'name', c.name, 'open_units', c.open_units, 'board', c.board, 'vi_a1', c.vi_a1,
      'students', (select count(*) from ec_users s where s.class_code = c.code and s.role = 'student')) order by c.code)
    from ec_classes c where c.teacher_id = t.id or t.is_admin), '[]');
end $$;

-- p_band null = back to automatic
create or replace function ec_t_set_band(p_token uuid, p_user uuid, p_band smallint) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; s ec_users;
begin
  t := ec_teacher_of(p_token); s := ec_t_student_of(t, p_user);
  if p_band is not null and (p_band < 0 or p_band > 3) then raise exception 'bad-band' using errcode = 'P0001'; end if;
  update ec_users set eng_band = p_band where id = s.id;
end $$;

create or replace function ec_t_set_vi(p_token uuid, p_code text, p_on boolean) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; c ec_classes;
begin
  t := ec_teacher_of(p_token); c := ec_require_class(t, p_code);
  update ec_classes set vi_a1 = coalesce(p_on, true) where code = c.code;
end $$;

revoke all on function ec_t_set_band(uuid, uuid, smallint), ec_t_set_vi(uuid, text, boolean) from public;
grant execute on function ec_t_set_band(uuid, uuid, smallint), ec_t_set_vi(uuid, text, boolean) to anon;
