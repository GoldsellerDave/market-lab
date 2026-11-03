-- EcoLogic Learn, part 2: XP and the class leaderboard (run after schema.sql).
-- XP per saved activity: Learn 20 (once a day); others 10 per answer right first time + 2 per question done.
-- Only the first 5 runs of each activity per day earn XP. Weeks start Monday, Vietnam time.
alter table ec_classes add column if not exists board boolean not null default true;

create or replace function ec_xp_table(p_class text) returns table (user_id uuid, display_name text, total bigint, week bigint)
language sql stable security definer set search_path = public, extensions as $$
  with a as (
    select a.user_id, a.activity, a.created_at,
      case when a.activity = 'learn' then 20 else least(a.score, a.max_score) * 10 + a.max_score * 2 end as xp,
      row_number() over (partition by a.user_id, a.activity, (a.created_at at time zone 'Asia/Ho_Chi_Minh')::date order by a.created_at) as n
    from ec_attempts a where a.class_code = p_class),
  ok as (select * from a where (activity = 'learn' and n <= 1) or (activity <> 'learn' and n <= 5))
  select s.id, s.display_name, coalesce(sum(ok.xp), 0),
    coalesce(sum(ok.xp) filter (where ok.created_at >= (date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh')), 0)
  from ec_users s left join ok on ok.user_id = s.id
  where s.class_code = p_class and s.role = 'student' group by s.id, s.display_name
$$;

create or replace function ec_board(p_token uuid) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare u ec_users; on_ boolean;
begin
  u := ec_user_of(p_token);
  select board into on_ from ec_classes where code = u.class_code;
  return json_build_object('on', coalesce(on_, false), 'rows', case when coalesce(on_, false) then coalesce((
    select json_agg(json_build_object('name', x.display_name, 'xp', x.total, 'week', x.week, 'me', x.user_id = u.id) order by x.week desc, x.total desc, x.display_name)
    from ec_xp_table(u.class_code) x), '[]') else
    (select coalesce(json_agg(json_build_object('name', x.display_name, 'xp', x.total, 'week', x.week, 'me', true)), '[]') from ec_xp_table(u.class_code) x where x.user_id = u.id) end);
end $$;

create or replace function ec_t_set_board(p_token uuid, p_code text, p_on boolean) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users; c ec_classes;
begin
  t := ec_teacher_of(p_token); c := ec_require_class(t, p_code);
  update ec_classes set board = coalesce(p_on, true) where code = c.code;
end $$;

create or replace function ec_t_classes(p_token uuid) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare t ec_users;
begin
  t := ec_teacher_of(p_token);
  return coalesce((select json_agg(json_build_object('code', c.code, 'name', c.name, 'open_units', c.open_units, 'board', c.board,
      'students', (select count(*) from ec_users s where s.class_code = c.code and s.role = 'student')) order by c.code)
    from ec_classes c where c.teacher_id = t.id or t.is_admin), '[]');
end $$;

revoke all on function ec_xp_table(text) from public, anon, authenticated;
revoke all on function ec_board(uuid), ec_t_set_board(uuid, text, boolean) from public;
grant execute on function ec_board(uuid), ec_t_set_board(uuid, text, boolean) to anon;
