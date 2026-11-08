-- EcoLogic Learn, part 4: test accounts (run after schema_bands.sql).
-- A test account is a student login the teacher uses to try the app. The teacher sees it (marked TEST);
-- students never do: it is left out of the class leaderboard and the class student count.
-- Test accounts are named <class>-test-a1, -a2, -b1, -b2 and start at that English level (a teacher override).
alter table ec_users add column if not exists is_test boolean not null default false;
update ec_users set is_test = true where username = 'eco9-25';   -- the earlier test login

-- Create a test account, or reset it (new PIN, all its work deleted). p_band: 0 A1, 1 A2, 2 B1, 3 B2.
-- Not callable from the app on its own: ec_t_add_test checks the teacher first.
create or replace function ec_make_test(p_code text, p_band smallint) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare b smallint := greatest(0, least(3, coalesce(p_band, 0))); lv text; uname text; pin text := ec_new_pin(); id_ uuid;
begin
  if not exists (select 1 from ec_classes where code = lower(p_code)) then raise exception 'no-such-class' using errcode = 'P0001'; end if;
  lv := (array['A1', 'A2', 'B1', 'B2'])[b + 1];
  uname := lower(p_code) || '-test-' || lower(lv);
  select id into id_ from ec_users where username = uname;
  if id_ is null then
    insert into ec_users(username, role, class_code, full_name, display_name, secret_hash, is_test, eng_band, must_change)
    values (uname, 'student', lower(p_code), 'Test account (' || lv || ')', 'Test ' || lv, crypt(pin, gen_salt('bf')), true, b, false);
  else
    delete from ec_attempts where user_id = id_;
    delete from ec_tokens where user_id = id_;
    update ec_users set secret_hash = crypt(pin, gen_salt('bf')), is_test = true, eng_band = b, must_change = false, failed = 0, locked_until = null where id = id_;
  end if;
  return json_build_object('username', uname, 'pin', pin, 'level', lv);
end $$;

create or replace function ec_t_add_test(p_token uuid, p_code text, p_band smallint) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; c ec_classes;
begin
  t := ec_teacher_of(p_token); c := ec_require_class(t, p_code);
  return ec_make_test(c.code, p_band);
end $$;

-- The teacher's class view marks test accounts
create or replace function ec_t_class(p_token uuid, p_code text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; c ec_classes;
begin
  t := ec_teacher_of(p_token); c := ec_require_class(t, p_code);
  return json_build_object('code', c.code, 'name', c.name, 'open_units', c.open_units, 'vi_a1', c.vi_a1,
    'students', coalesce((select json_agg(json_build_object('id', s.id, 'username', s.username, 'full_name', s.full_name, 'display_name', s.display_name,
        'last_seen', s.last_seen, 'locked', s.locked_until > now(), 'eng_band', s.eng_band, 'is_test', s.is_test) order by s.is_test, s.username)
      from ec_users s where s.class_code = c.code and s.role = 'student'), '[]'),
    'attempts', coalesce((select json_agg(json_build_object('id', a.id, 'user_id', a.user_id, 'unit', a.unit, 'activity', a.activity, 'level_start', a.level_start,
        'level_end', a.level_end, 'score', a.score, 'max_score', a.max_score, 'seconds', a.seconds, 'answers', a.answers, 'created_at', a.created_at) order by a.created_at)
      from ec_attempts a join ec_users s on s.id = a.user_id where s.class_code = c.code), '[]'));
end $$;

-- Class list: count real students only
create or replace function ec_t_classes(p_token uuid) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users;
begin
  t := ec_teacher_of(p_token);
  return coalesce((select json_agg(json_build_object('code', c.code, 'name', c.name, 'open_units', c.open_units, 'board', c.board, 'vi_a1', c.vi_a1,
      'students', (select count(*) from ec_users s where s.class_code = c.code and s.role = 'student' and not s.is_test)) order by c.code)
    from ec_classes c where c.teacher_id = t.id or t.is_admin), '[]');
end $$;

-- Leaderboard: students never see test accounts (a test account still sees its own row)
create or replace function ec_board(p_token uuid) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users; on_ boolean;
begin
  u := ec_user_of(p_token);
  select board into on_ from ec_classes where code = u.class_code;
  return json_build_object('on', coalesce(on_, false), 'rows', case when coalesce(on_, false) then coalesce((
    select json_agg(json_build_object('name', x.display_name, 'xp', x.total, 'week', x.week, 'me', x.user_id = u.id) order by x.week desc, x.total desc, x.display_name)
    from ec_xp_table(u.class_code) x join ec_users s on s.id = x.user_id where not s.is_test or s.id = u.id), '[]') else
    (select coalesce(json_agg(json_build_object('name', x.display_name, 'xp', x.total, 'week', x.week, 'me', true)), '[]') from ec_xp_table(u.class_code) x where x.user_id = u.id) end);
end $$;

-- "New PINs for everyone" leaves test accounts alone
create or replace function ec_t_new_pins(p_token uuid, p_code text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; c ec_classes; s ec_users; out jsonb := '[]'; pin text;
begin
  t := ec_teacher_of(p_token); c := ec_require_class(t, p_code);
  for s in select * from ec_users where class_code = c.code and role = 'student' and not is_test order by username loop
    pin := ec_new_pin();
    update ec_users set secret_hash = crypt(pin, gen_salt('bf')), failed = 0, locked_until = null where id = s.id;
    delete from ec_tokens where user_id = s.id;
    out := out || jsonb_build_object('username', s.username, 'full_name', s.full_name, 'display_name', s.display_name, 'pin', pin);
  end loop;
  return out;
end $$;

revoke all on function ec_make_test(text, smallint) from public, anon, authenticated;
revoke all on function ec_t_add_test(uuid, text, smallint) from public;
grant execute on function ec_t_add_test(uuid, text, smallint) to anon;

-- Make the A1 test account for eco9 now. The result below shows its username and PIN.
select ec_make_test('eco9', 0::smallint) as a1_test_account;
