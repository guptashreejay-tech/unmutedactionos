create function actionos_private.organisation_member_action(operation text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare oid uuid:=(payload->>'organisation_id')::uuid; actor uuid:=auth.uid(); target uuid; member_role text; owner boolean;
begin
 if not actionos_private.active_actor() then raise exception 'Sign in with an active account'; end if;
 owner:=exists(select 1 from public.organisation_members where organisation_id=oid and user_id=actor and role='owner' and status='active');
 if operation='accept' or operation='decline' then
  if not exists(select 1 from public.organisation_members where organisation_id=oid and user_id=actor and status='invited') then raise exception 'Invitation not found'; end if;
  update public.organisation_members set status=case when operation='accept' then 'active' else 'removed' end where organisation_id=oid and user_id=actor;
 elsif operation='invite' then
  if not actionos_private.org_manager(oid) then raise exception 'Organisation manager access required'; end if;
  member_role:=payload->>'role';
  if member_role not in ('member','manager') or (member_role='manager' and not owner) then raise exception 'Only an owner can invite managers'; end if;
  select id into target from public.profiles where username=lower(payload->>'username') and not suspended and not hidden;
  if target is null or target=actor then raise exception 'Choose another existing username'; end if;
  if exists(select 1 from public.organisation_members where organisation_id=oid and user_id=target and status in ('active','invited')) then raise exception 'This person is already a member or has an invitation'; end if;
  insert into public.organisation_members(organisation_id,user_id,role,status) values(oid,target,member_role,'invited') on conflict(organisation_id,user_id) do update set role=excluded.role,status='invited';
  perform actionos_private.notify(target,'Organisation invitation','You have been invited to join an organisation','/partner');
 elsif operation='remove' then
  target:=(payload->>'user_id')::uuid;
  select role into member_role from public.organisation_members where organisation_id=oid and user_id=target;
  if member_role is null or member_role='owner' then raise exception 'The organisation owner cannot be removed'; end if;
  if target<>actor and (not actionos_private.org_manager(oid) or (member_role='manager' and not owner)) then raise exception 'You do not have permission to remove this member'; end if;
  update public.organisation_members set status='removed' where organisation_id=oid and user_id=target;
 else raise exception 'Unknown membership operation'; end if;
 return jsonb_build_object('id',oid);
end $$;
create function public.actionos_organisation_member(operation text,payload jsonb) returns jsonb language sql security invoker set search_path='' as $$ select actionos_private.organisation_member_action(operation,payload) $$;
revoke all on function actionos_private.organisation_member_action(text,jsonb),public.actionos_organisation_member(text,jsonb) from public,anon;
grant execute on function actionos_private.organisation_member_action(text,jsonb),public.actionos_organisation_member(text,jsonb) to authenticated;

-- Filter and rank the entire visible collection before pagination, not one client page.
create function public.actionos_discover(search_text text default '',cause_filter text default '',mode_filter text default '',city_filter text default '',stage_filter text default '',skill_filter text default '',beginner_only boolean default false,fits_hours boolean default false,recommended boolean default false,page_number integer default 0)
returns setof public.initiatives language sql stable security invoker set search_path='' as $$
 with me as(select p.id,p.causes,p.skills,p.city,p.experience_level,pref.hours,pref.days,pref.mode from public.profiles p join public.profile_preferences pref on pref.user_id=p.id where p.id=(select auth.uid())),
 scored as(select i,
  case when i.cause=any(me.causes) then 30 else 0 end+
  case when exists(select 1 from public.initiative_roles r where r.initiative_id=i.id and r.positions_filled<r.positions_required and r.skills&&me.skills) then 25 else 0 end+
  case when exists(select 1 from public.initiative_roles r where r.initiative_id=i.id and r.positions_filled<r.positions_required and r.commitment_hours<=me.hours and r.schedule in (me.days,'Flexible')) then 15 else 0 end+
  case when i.mode='Online' or (lower(i.city)=lower(me.city) and (i.mode=me.mode or me.mode='Hybrid' or i.mode='Hybrid')) then 15 else 0 end+
  case when i.urgent then 10 else 0 end+
  case when exists(select 1 from public.initiative_roles r where r.initiative_id=i.id and r.positions_filled<r.positions_required and r.experience_level in ('Beginner',me.experience_level)) then 5 else 0 end as score
 from public.initiatives i left join me on true
 where i.visibility='Public' and (search_text='' or strpos(lower(i.title||' '||i.summary||' '||i.observation),lower(search_text))>0)
 and (cause_filter='' or i.cause=cause_filter) and (mode_filter='' or i.mode=mode_filter) and (city_filter='' or lower(i.city)=lower(city_filter)) and (stage_filter='' or i.status=stage_filter)
 and ((skill_filter='' and not beginner_only and not fits_hours) or exists(select 1 from public.initiative_roles r where r.initiative_id=i.id and r.positions_filled<r.positions_required and (skill_filter='' or skill_filter=any(r.skills)) and (not beginner_only or r.experience_level='Beginner') and (not fits_hours or (r.commitment_hours<=me.hours and r.schedule in (me.days,'Flexible')))))
 ) select (i).* from scored order by case when recommended then score else 0 end desc,(i).created_at desc,(i).id limit 24 offset greatest(0,least(page_number,10000))*24;
$$;
revoke all on function public.actionos_discover(text,text,text,text,text,text,boolean,boolean,boolean,integer) from public;
grant execute on function public.actionos_discover(text,text,text,text,text,text,boolean,boolean,boolean,integer) to anon,authenticated;
