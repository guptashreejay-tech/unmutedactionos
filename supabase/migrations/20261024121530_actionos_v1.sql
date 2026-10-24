-- ActionOS V1. New objects deliberately fail on name collision: inspect the target before applying.
create schema if not exists actionos_private;
revoke all on schema actionos_private from public;
grant usage on schema actionos_private to anon, authenticated;

create table public.causes (id text primary key, name text not null unique, active boolean not null default true);
create table public.skills (id text primary key, name text not null unique, active boolean not null default true);
create table public.sdgs (id integer primary key check(id between 1 and 17), name text not null);
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(length(display_name) between 1 and 100),
 username text not null unique check(username ~ '^[a-z0-9_-]{3,40}$'),
 bio text not null default '' check(length(bio)<=1000), city text not null default '' check(length(city)<=100),
 avatar_path text, account_type text not null default 'individual' check(account_type in ('individual','organisation')),
 causes text[] not null default '{}', skills text[] not null default '{}',
 experience_level text not null default 'Beginner' check(experience_level in ('Beginner','Some experience','Experienced')),
 onboarding_completed boolean not null default false, show_availability boolean not null default false,
 suspended boolean not null default false, hidden boolean not null default false, is_demo boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.profile_preferences (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 hours integer not null default 3 check(hours between 1 and 40), days text not null default 'Weekends',
 mode text not null default 'Hybrid' check(mode in ('In-person','Online','Hybrid')),
 contributions text[] not null default '{}', notifications_enabled boolean not null default true,
 intro_completed boolean not null default false, dismissed_tips text[] not null default '{}'
);
create table public.admin_users(user_id uuid primary key references public.profiles(id) on delete cascade, created_at timestamptz not null default now());
create table public.organisations (
 id uuid primary key default gen_random_uuid(), created_by uuid not null references public.profiles(id),
 name text not null check(length(name) between 2 and 150), slug text not null unique check(slug ~ '^[a-z0-9-]+$'),
 organisation_type text not null, city text not null, description text not null default '', website text not null default '', logo_path text,
 causes text[] not null default '{}', verification_status text not null default 'Unverified' check(verification_status in ('Unverified','Pending','Verified','Rejected')),
 hidden boolean not null default false, is_demo boolean not null default false, created_at timestamptz not null default now()
);
create table public.organisation_members (
 organisation_id uuid references public.organisations(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade,
 role text not null check(role in ('owner','manager','member')), status text not null default 'active' check(status in ('active','invited','removed')),
 primary key(organisation_id,user_id)
);
create table public.organisation_verification_requests (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations(id) on delete cascade,
 requested_by uuid not null references public.profiles(id), contact_email text not null, reference text not null default '', document_path text,
 status text not null default 'Pending' check(status in ('Pending','Verified','Rejected')), notes text not null default '',
 reviewed_by uuid references public.profiles(id), created_at timestamptz not null default now(), reviewed_at timestamptz
);
create unique index organisation_pending_request on public.organisation_verification_requests(organisation_id) where status='Pending';
create table public.organisation_needs (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations(id), created_by uuid not null references public.profiles(id),
 title text not null, description text not null, affected text not null default '', city text not null, outcome text not null,
 support text not null default '', roles text[] not null default '{}', timeframe text not null default '', cause text references public.causes(id),
 sdg_id integer references public.sdgs(id), hidden boolean not null default false, is_demo boolean not null default false, created_at timestamptz not null default now()
);
create table public.initiatives (
 id uuid primary key default gen_random_uuid(), creator_id uuid not null references public.profiles(id), title text not null check(length(title) between 3 and 150),
 slug text not null unique check(slug ~ '^[a-z0-9-]+$'), observation text not null, context jsonb not null default '{}',
 structured jsonb not null default '{}', validated_problem text not null default '', summary text not null default '', goal text not null default '',
 cause text not null references public.causes(id), sdg_primary_id integer references public.sdgs(id), secondary_sdgs integer[] not null default '{}',
 city text not null, mode text not null check(mode in ('In-person','Online','Hybrid')), timeline text not null default '',
 status text not null default 'DRAFT' check(status in ('DRAFT','VALIDATING','BUILDING','READY','EXECUTING','VERIFYING','VERIFIED','COMPLETED','PAUSED','CANCELLED')),
 visibility text not null default 'Private Draft' check(visibility in ('Private Draft','Unlisted','Public')),
 requires_validation boolean not null default true, is_need_validated boolean not null default false, works_with_minors boolean not null default false,
 need_id uuid references public.organisation_needs(id), urgent boolean not null default false, cover text not null default 'flowers',
 hidden boolean not null default false, is_demo boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.initiative_roles (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id) on delete cascade, title text not null,
 description text not null default '', skills text[] not null default '{}', preferred_skills text[] not null default '{}', responsibilities text not null default '',
 positions_required integer not null check(positions_required between 1 and 10000), positions_filled integer not null default 0 check(positions_filled>=0),
 minimum_required integer not null default 1 check(minimum_required>=0), commitment_hours integer not null default 3 check(commitment_hours between 1 and 40),
 schedule text not null default 'Weekends', mode text not null default 'Hybrid' check(mode in ('In-person','Online','Hybrid')),
 experience_level text not null default 'Beginner', approval_required boolean not null default false, critical boolean not null default false,
 reasoning text not null default '', unique(initiative_id,title), check(minimum_required<=positions_required), check(positions_filled<=positions_required)
);
create table public.initiative_members (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id) on delete cascade,
 role_id uuid not null references public.initiative_roles(id), user_id uuid not null references public.profiles(id),
 status text not null default 'active' check(status in ('active','left','removed')), joined_at timestamptz not null default now(), unique(role_id,user_id)
);
create table public.role_applications (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id), role_id uuid not null references public.initiative_roles(id),
 user_id uuid not null references public.profiles(id), motivation text not null, experience text not null, availability text not null,
 status text not null default 'Pending' check(status in ('Pending','Approved','Rejected','Changes Requested')), review_notes text not null default '',
 reviewed_by uuid references public.profiles(id), created_at timestamptz not null default now(), unique(role_id,user_id)
);
create table public.initiative_partners (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id), organisation_id uuid not null references public.organisations(id),
 role text not null check(role in ('Need Validator','Community Partner','Venue Partner','Technical Partner','Implementation Partner','Verification Partner','Other')),
 required boolean not null default true, status text not null default 'Requested' check(status in ('Requested','Confirmed','Rejected')),
 created_at timestamptz not null default now(), unique(initiative_id,organisation_id,role)
);
create table public.initiative_validations (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id), organisation_id uuid not null references public.organisations(id),
 requested_by uuid not null references public.profiles(id), observation text not null, assumptions text not null default '', questions text not null default '',
 status text not null default 'Pending' check(status in ('Pending','Responded','Accepted','Needs Revision','Rejected')),
 verdict text check(verdict in ('Yes','Partially','No')), inaccuracies text not null default '', changes text not null default '',
 refined_problem text not null default '', support boolean not null default false, responded_by uuid references public.profiles(id),
 created_at timestamptz not null default now(), responded_at timestamptz
);
create table public.initiative_stakeholders (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id), type text not null, purpose text not null,
 required boolean not null default true, status text not null default 'Missing' check(status in ('Missing','Requested','Confirmed','Rejected','Not Required')),
 organisation_id uuid references public.organisations(id)
);
create table public.initiative_tasks (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id), title text not null, description text not null default '',
 assigned_user uuid references public.profiles(id), due_date date, priority text not null default 'Normal' check(priority in ('Low','Normal','High')),
 status text not null default 'To Do' check(status in ('To Do','In Progress','Done')), created_at timestamptz not null default now()
);
create table public.initiative_permissions (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id), name text not null,
 required boolean not null default true, critical boolean not null default true, owner_id uuid references public.profiles(id),
 status text not null default 'Pending' check(status in ('Pending','Approved','Rejected','Not Required')), reference text not null default '', notes text not null default ''
);
create table public.initiative_resources (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id), name text not null, category text not null default 'Materials',
 required_quantity numeric not null default 1 check(required_quantity>0), secured_quantity numeric not null default 0 check(secured_quantity>=0),
 unit text not null default 'items', notes text not null default ''
);
create table public.initiative_metrics (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id), name text not null, description text not null default '',
 metric_type text not null default 'Outcome' check(metric_type in ('Activity','Outcome')), unit text not null, target_value numeric not null check(target_value>0),
 baseline numeric, actual_value numeric not null default 0 check(actual_value>=0), measurement_method text not null, verification_source text not null,
 status text not null default 'Defined' check(status in ('Defined','Recorded','Verified','Partially Verified')), created_at timestamptz not null default now()
);
create table public.initiative_evidence (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id), uploader_id uuid not null references public.profiles(id),
 type text not null, storage_path text not null unique, caption text not null, related_metric_id uuid references public.initiative_metrics(id),
 visibility text not null default 'Private' check(visibility in ('Private','Public')), created_at timestamptz not null default now()
);
create table public.initiative_attendance (
 initiative_id uuid references public.initiatives(id), user_id uuid references public.profiles(id), recorded_by uuid not null references public.profiles(id),
 attended_on date not null default current_date, primary key(initiative_id,user_id,attended_on)
);
create table public.impact_verification_requests (
 id uuid primary key default gen_random_uuid(), initiative_id uuid not null references public.initiatives(id), metric_id uuid not null references public.initiative_metrics(id),
 organisation_id uuid not null references public.organisations(id), requested_by uuid not null references public.profiles(id),
 target_snapshot numeric not null, actual_snapshot numeric not null, summary text not null,
 status text not null default 'Pending' check(status in ('Pending','Verified','Partially Verified','Clarification Requested','Unable to Verify')),
 created_at timestamptz not null default now()
);
create unique index metric_pending_verification on public.impact_verification_requests(metric_id) where status='Pending';
create table public.impact_verifications (
 id uuid primary key default gen_random_uuid(), request_id uuid not null unique references public.impact_verification_requests(id),
 initiative_id uuid not null references public.initiatives(id), metric_id uuid not null references public.initiative_metrics(id), organisation_id uuid not null references public.organisations(id),
 verified_by_user_id uuid not null references public.profiles(id), decision text not null check(decision in ('Verified','Partially Verified','Clarification Requested','Unable to Verify')),
 confirmed_value numeric, notes text not null, verified_at timestamptz not null default now()
);
create table public.impact_posts (
 id uuid primary key default gen_random_uuid(), author_id uuid not null references public.profiles(id), initiative_id uuid references public.initiatives(id), organisation_id uuid references public.organisations(id),
 body text not null check(length(body) between 1 and 5000), role text not null default '', milestone text not null default '',
 kind text not null default 'Project Update' check(kind in ('Project Update','Recruitment Update','Milestone Update','Execution Update','Impact Update')),
 media_paths text[] not null default '{}', hidden boolean not null default false, created_at timestamptz not null default now()
);
create table public.comments (
 id uuid primary key default gen_random_uuid(), post_id uuid not null references public.impact_posts(id) on delete cascade,
 author_id uuid not null references public.profiles(id), body text not null check(length(body) between 1 and 2000), hidden boolean not null default false, created_at timestamptz not null default now()
);
create table public.saved_initiatives (user_id uuid references public.profiles(id), initiative_id uuid references public.initiatives(id), created_at timestamptz not null default now(), primary key(user_id,initiative_id));
create table public.follows (
 id uuid primary key default gen_random_uuid(), follower_id uuid not null references public.profiles(id), user_id uuid references public.profiles(id), organisation_id uuid references public.organisations(id),
 check((user_id is null)<>(organisation_id is null)), check(follower_id is distinct from user_id),
 unique(follower_id,user_id), unique(follower_id,organisation_id), created_at timestamptz not null default now()
);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id), type text not null,
 body text not null, href text not null, read_at timestamptz, created_at timestamptz not null default now()
);
create table public.reports (
 id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id), target_type text not null check(target_type in ('initiative','profile','organisation','post','comment')),
 target_id uuid not null, reason text not null check(reason in ('Spam','Misleading','Unsafe','Harassment','False impact claim','Inappropriate content','Other')),
 details text not null default '', status text not null default 'Open' check(status in ('Open','Dismissed','Actioned','Clarification Requested')), created_at timestamptz not null default now()
);
create table public.moderation_actions (
 id uuid primary key default gen_random_uuid(), admin_id uuid not null references public.profiles(id), report_id uuid references public.reports(id),
 action text not null, notes text not null, created_at timestamptz not null default now()
);

-- Identity and membership helpers are private, bounded lookups; no user metadata authorization.
create function actionos_private.active_actor() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.profiles where id=auth.uid() and not suspended)
$$;
create function actionos_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select actionos_private.active_actor() and exists(select 1 from public.admin_users where user_id=auth.uid())
$$;
create function actionos_private.org_member(oid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select actionos_private.active_actor() and exists(select 1 from public.organisation_members where organisation_id=oid and user_id=auth.uid() and status='active')
$$;
create function actionos_private.org_manager(oid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select actionos_private.active_actor() and exists(select 1 from public.organisation_members where organisation_id=oid and user_id=auth.uid() and status='active' and role in ('owner','manager'))
$$;
create function actionos_private.is_lead(iid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select actionos_private.active_actor() and exists(select 1 from public.initiatives where id=iid and creator_id=auth.uid() and not hidden)
$$;
create function actionos_private.is_member(iid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select actionos_private.is_lead(iid) or (actionos_private.active_actor() and exists(select 1 from public.initiative_members where initiative_id=iid and user_id=auth.uid() and status='active'))
$$;
create function actionos_private.is_partner(iid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select actionos_private.active_actor() and exists(select 1 from public.initiative_partners p where p.initiative_id=iid and p.status='Confirmed' and actionos_private.org_member(p.organisation_id))
$$;
create function actionos_private.can_read_initiative(iid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.initiatives i where i.id=iid and not i.hidden and (i.visibility in ('Public','Unlisted') or actionos_private.is_member(iid) or actionos_private.is_partner(iid))) or actionos_private.is_admin()
$$;
create function actionos_private.can_read_post(pid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.impact_posts p where p.id=pid and not p.hidden and (p.initiative_id is null or actionos_private.can_read_initiative(p.initiative_id))) or actionos_private.is_admin()
$$;
create function actionos_private.notify(uid uuid, kind text, message text, link text) returns void language sql security definer set search_path='' as $$
 insert into public.notifications(user_id,type,body,href) select uid,kind,message,link where uid is not null and exists(select 1 from public.profile_preferences where user_id=uid and notifications_enabled)
$$;

-- Consistent, concurrency-safe occupancy; mutation locks the role before adding a member.
create function actionos_private.membership_count() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update public.initiative_roles r set positions_filled=(select count(*) from public.initiative_members m where m.role_id=r.id and m.status='active') where r.id=coalesce(new.role_id,old.role_id);
 return coalesce(new,old);
end $$;
create trigger member_count after insert or update or delete on public.initiative_members for each row execute function actionos_private.membership_count();

-- Read-only table grants. All changes use checked transactions below, preventing protected-field escalation.
do $$ declare t record; begin
 for t in select tablename from pg_tables where schemaname='public' and tablename in ('causes','skills','sdgs','profiles','profile_preferences','admin_users','organisations','organisation_members','organisation_verification_requests','organisation_needs','initiatives','initiative_roles','initiative_members','role_applications','initiative_partners','initiative_validations','initiative_stakeholders','initiative_tasks','initiative_permissions','initiative_resources','initiative_metrics','initiative_evidence','initiative_attendance','impact_verification_requests','impact_verifications','impact_posts','comments','saved_initiatives','follows','notifications','reports','moderation_actions') loop
 execute format('alter table public.%I enable row level security',t.tablename);
 execute format('revoke all on public.%I from anon, authenticated',t.tablename);
 execute format('grant select on public.%I to anon, authenticated',t.tablename);
 end loop;
end $$;
create policy causes_read on public.causes for select using(active or actionos_private.is_admin());
create policy skills_read on public.skills for select using(active or actionos_private.is_admin());
create policy sdgs_read on public.sdgs for select using(true);
create policy profiles_read on public.profiles for select using((not hidden and not suspended) or id=(select auth.uid()) or actionos_private.is_admin());
create policy preferences_own on public.profile_preferences for select to authenticated using(user_id=(select auth.uid()));
create policy admins_self on public.admin_users for select to authenticated using(user_id=(select auth.uid()) and actionos_private.is_admin());
create policy organisations_read on public.organisations for select using(not hidden or actionos_private.org_member(id) or actionos_private.is_admin());
create policy org_members_read on public.organisation_members for select to authenticated using(user_id=(select auth.uid()) or actionos_private.org_member(organisation_id) or actionos_private.is_admin());
create policy org_verification_read on public.organisation_verification_requests for select to authenticated using(actionos_private.org_manager(organisation_id) or actionos_private.is_admin());
create policy needs_read on public.organisation_needs for select using((not hidden and exists(select 1 from public.organisations o where o.id=organisation_id and o.verification_status='Verified' and not o.hidden)) or actionos_private.org_member(organisation_id) or actionos_private.is_admin());
create policy initiatives_read on public.initiatives for select using(actionos_private.can_read_initiative(id));
create policy roles_read on public.initiative_roles for select using(actionos_private.can_read_initiative(initiative_id));
create policy members_read on public.initiative_members for select to authenticated using(user_id=(select auth.uid()) or actionos_private.is_member(initiative_id) or actionos_private.is_partner(initiative_id) or actionos_private.is_admin());
create policy applications_read on public.role_applications for select to authenticated using(user_id=(select auth.uid()) or actionos_private.is_lead(initiative_id));
create policy partners_read on public.initiative_partners for select using(actionos_private.can_read_initiative(initiative_id) or actionos_private.org_member(organisation_id));
create policy validations_private on public.initiative_validations for select to authenticated using(actionos_private.is_member(initiative_id) or actionos_private.org_member(organisation_id) or actionos_private.is_admin());
do $$ declare n text; begin
 foreach n in array array['initiative_stakeholders','initiative_tasks','initiative_permissions','initiative_resources','initiative_attendance'] loop
 execute format('create policy project_internal on public.%I for select to authenticated using(actionos_private.is_member(initiative_id) or actionos_private.is_partner(initiative_id) or actionos_private.is_admin())',n);
 end loop;
end $$;
create policy metrics_read on public.initiative_metrics for select using(actionos_private.can_read_initiative(initiative_id));
create policy evidence_read on public.initiative_evidence for select using((visibility='Public' and actionos_private.can_read_initiative(initiative_id)) or actionos_private.is_member(initiative_id) or actionos_private.is_partner(initiative_id) or actionos_private.is_admin());
create policy verification_requests_read on public.impact_verification_requests for select to authenticated using(actionos_private.is_member(initiative_id) or actionos_private.org_member(organisation_id) or actionos_private.is_admin());
create policy verifications_read on public.impact_verifications for select using(actionos_private.can_read_initiative(initiative_id));
create policy posts_read on public.impact_posts for select using(actionos_private.can_read_post(id));
create policy comments_read on public.comments for select using((not hidden and actionos_private.can_read_post(post_id)) or actionos_private.is_admin());
create policy saved_own on public.saved_initiatives for select to authenticated using(user_id=(select auth.uid()));
create policy follows_own on public.follows for select to authenticated using(follower_id=(select auth.uid()));
create policy notifications_own on public.notifications for select to authenticated using(user_id=(select auth.uid()));
create policy reports_own_admin on public.reports for select to authenticated using(reporter_id=(select auth.uid()) or actionos_private.is_admin());
create policy moderation_admin on public.moderation_actions for select to authenticated using(actionos_private.is_admin());

-- Index every referencing FK column, plus bounded feed and unread indexes.
do $$ declare c record; begin
 for c in select distinct cl.relname,a.attname from pg_constraint pc join pg_class cl on cl.oid=pc.conrelid join pg_namespace ns on ns.oid=cl.relnamespace join pg_attribute a on a.attrelid=cl.oid and a.attnum=any(pc.conkey) where pc.contype='f' and ns.nspname='public' loop
 execute format('create index if not exists %I on public.%I (%I)',left(c.relname||'_'||c.attname||'_fk_idx',63),c.relname,c.attname);
 end loop;
end $$;
create index initiative_feed_idx on public.initiatives(visibility,created_at desc) where not hidden;
create index initiative_search_idx on public.initiatives using gin(to_tsvector('english',title||' '||summary||' '||observation));
create index posts_feed_idx on public.impact_posts(created_at desc) where not hidden;
create index notifications_unread_idx on public.notifications(user_id,created_at desc) where read_at is null;

create function actionos_private.readiness(iid uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare i public.initiatives; need numeric; partners numeric; team numeric; permissions numeric; resources numeric; plan numeric; metric numeric; score integer; blockers text[]='{}';
begin
 if not actionos_private.can_read_initiative(iid) then raise exception 'Initiative not available'; end if;
 select * into i from public.initiatives where id=iid;
 need:=case when i.is_need_validated or not i.requires_validation then 100 else 0 end;
 select coalesce(100.0*count(*) filter(where status='Confirmed')/nullif(count(*),0),100) into partners from public.initiative_partners where initiative_id=iid and required;
 select coalesce(100.0*sum(least(positions_filled,minimum_required))/nullif(sum(minimum_required),0),0) into team from public.initiative_roles where initiative_id=iid;
 select coalesce(100.0*count(*) filter(where status in ('Approved','Not Required'))/nullif(count(*),0),100) into permissions from public.initiative_permissions where initiative_id=iid and required;
 select coalesce(100.0*avg(least(secured_quantity/required_quantity,1)),100) into resources from public.initiative_resources where initiative_id=iid;
 plan:=case when length(i.timeline)>0 and length(i.goal)>0 then 100 else 0 end;
 metric:=case when exists(select 1 from public.initiative_metrics where initiative_id=iid and metric_type='Outcome') then 100 else 0 end;
 if need=0 then blockers:=array_append(blockers,'Human validation required'); end if;
 if partners<100 then blockers:=array_append(blockers,'A required partner has not confirmed'); end if;
 if exists(select 1 from public.initiative_stakeholders where initiative_id=iid and required and status not in ('Confirmed','Not Required')) then blockers:=array_append(blockers,'A required stakeholder is missing'); end if;
 if exists(select 1 from public.initiative_permissions where initiative_id=iid and critical and required and status not in ('Approved','Not Required')) then blockers:=array_append(blockers,'A critical permission is pending'); end if;
 if metric=0 then blockers:=array_append(blockers,'Define an outcome metric before execution'); end if;
 if not exists(select 1 from public.initiative_members m join public.initiative_roles r on r.id=m.role_id where m.initiative_id=iid and m.user_id=i.creator_id and m.status='active' and r.title='Project Lead') then blockers:=array_append(blockers,'An active project lead is required'); end if;
 if team<100 then blockers:=array_append(blockers,'Minimum team positions are unfilled'); end if;
 if resources<100 then blockers:=array_append(blockers,'Resources still need to be secured'); end if;
 if plan=0 then blockers:=array_append(blockers,'Complete the goal and timeline'); end if;
 score:=round(need*.20+partners*.20+team*.20+permissions*.15+resources*.10+plan*.10+metric*.05);
 return jsonb_build_object('score',score,'ready',cardinality(blockers)=0,'blockers',to_jsonb(blockers),'parts',jsonb_build_object('Need validation',round(need),'Required partners',round(partners),'Team minimums',round(team),'Permissions',round(permissions),'Resources',round(resources),'Execution plan',plan,'Impact metric',metric));
end $$;
create function public.actionos_readiness(initiative_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$ select actionos_private.readiness(initiative_id) $$;

-- Explicit operation allowlist. Each call is one PostgreSQL transaction; no direct writable API tables.
create function actionos_private.mutate(operation text, payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); iid uuid; oid uuid; rid uuid; obj uuid; result uuid; i public.initiatives; r public.initiative_roles; a public.role_applications; v public.initiative_validations; q public.impact_verification_requests; m public.initiative_metrics; actor uuid; val text; n text; item jsonb; ready jsonb;
begin
 if u is null then raise exception 'Sign in to continue'; end if;
 if operation='profile.save' then
  if exists(select 1 from public.profiles where id=u and suspended) then raise exception 'Account suspended'; end if;
  if jsonb_array_length(coalesce(payload->'causes','[]'))>5 then raise exception 'Choose at most five causes'; end if;
  insert into public.profiles(id,display_name,username,city,bio,account_type,causes,skills,experience_level,onboarding_completed,show_availability,avatar_path)
  values(u,payload->>'display_name',lower(payload->>'username'),coalesce(payload->>'city',''),coalesce(payload->>'bio',''),coalesce(payload->>'account_type','individual'),array(select jsonb_array_elements_text(coalesce(payload->'causes','[]'))),array(select jsonb_array_elements_text(coalesce(payload->'skills','[]'))),coalesce(payload->>'experience_level','Beginner'),coalesce((payload->>'onboarding_completed')::boolean,false),coalesce((payload->>'show_availability')::boolean,false),payload->>'avatar_path')
  on conflict(id) do update set display_name=excluded.display_name,username=excluded.username,city=excluded.city,bio=excluded.bio,causes=excluded.causes,skills=excluded.skills,experience_level=excluded.experience_level,onboarding_completed=excluded.onboarding_completed,show_availability=excluded.show_availability,avatar_path=excluded.avatar_path,updated_at=now();
  insert into public.profile_preferences(user_id,hours,days,mode,contributions,intro_completed,notifications_enabled,dismissed_tips)
  values(u,coalesce((payload->>'hours')::integer,3),coalesce(payload->>'days','Weekends'),coalesce(payload->>'mode','Hybrid'),array(select jsonb_array_elements_text(coalesce(payload->'contributions','[]'))),coalesce((payload->>'intro_completed')::boolean,false),coalesce((payload->>'notifications_enabled')::boolean,true),array(select jsonb_array_elements_text(coalesce(payload->'dismissed_tips','[]'))))
  on conflict(user_id) do update set hours=excluded.hours,days=excluded.days,mode=excluded.mode,contributions=excluded.contributions,intro_completed=excluded.intro_completed,notifications_enabled=excluded.notifications_enabled,dismissed_tips=excluded.dismissed_tips;
  return jsonb_build_object('id',u);
 end if;
 if not actionos_private.active_actor() then raise exception 'Complete your account profile or contact support'; end if;
 iid:=nullif(payload->>'initiative_id','')::uuid; oid:=nullif(payload->>'organisation_id','')::uuid; obj:=nullif(payload->>'id','')::uuid;

 if operation='initiative.create' then
  result:=gen_random_uuid();
  insert into public.initiatives(id,creator_id,title,slug,observation,context,cause,city,mode,works_with_minors,requires_validation,need_id,cover)
  values(result,u,payload->>'title',trim(both '-' from regexp_replace(lower(payload->>'title'),'[^a-z0-9]+','-','g'))||'-'||left(result::text,8),payload->>'observation',coalesce(payload->'context','{}'),payload->>'cause',payload->>'city',payload->>'mode',coalesce((payload->>'works_with_minors')::boolean,false),true,nullif(payload->>'need_id','')::uuid,case when payload->>'cause'='environment' then 'flowers' when payload->>'cause'='animal-welfare' then 'animals' else 'education' end);
  insert into public.initiative_roles(initiative_id,title,positions_required,minimum_required,critical,approval_required,skills) values(result,'Project Lead',1,1,true,true,array['Project Management']) returning id into rid;
  insert into public.initiative_members(initiative_id,role_id,user_id) values(result,rid,u);
  if coalesce((payload->>'works_with_minors')::boolean,false) then
   insert into public.initiative_permissions(initiative_id,name,critical) values(result,'Parent / guardian consent',true),(result,'Safeguarding and institutional permission',true);
  end if;
  return jsonb_build_object('id',result,'slug',(select slug from public.initiatives where id=result));
 end if;
 if operation='initiative.update' then
  if not actionos_private.is_lead(iid) then raise exception 'Only the project lead can edit the blueprint'; end if;
  select * into i from public.initiatives where id=iid for update;
  if i.status not in ('DRAFT','VALIDATING','BUILDING','PAUSED') then raise exception 'Blueprint is locked after readiness. Pause before editing.'; end if;
  update public.initiatives set title=coalesce(payload->>'title',title),summary=coalesce(payload->>'summary',summary),goal=coalesce(payload->>'goal',goal),timeline=coalesce(payload->>'timeline',timeline),structured=coalesce(payload->'structured',structured),sdg_primary_id=coalesce((payload->>'sdg_primary_id')::integer,sdg_primary_id),secondary_sdgs=case when payload ? 'secondary_sdgs' then array(select jsonb_array_elements_text(payload->'secondary_sdgs'))::integer[] else secondary_sdgs end,urgent=coalesce((payload->>'urgent')::boolean,urgent),updated_at=now() where id=iid;
 elsif operation='initiative.publish' then
  if not actionos_private.is_lead(iid) then raise exception 'Only the project lead can publish'; end if;
  select * into i from public.initiatives where id=iid for update;
  if i.status not in ('DRAFT','VALIDATING','BUILDING') or length(i.validated_problem)<10 or length(i.goal)<5 or length(i.timeline)<3 or (i.requires_validation and not i.is_need_validated) or not exists(select 1 from public.initiative_roles where initiative_id=iid and title<>'Project Lead') then raise exception 'Complete human validation, problem, goal, timeline and at least one contributor role'; end if;
  if payload->>'visibility' not in ('Public','Unlisted') then raise exception 'Choose public or unlisted visibility'; end if;
  update public.initiatives set visibility=payload->>'visibility',status='BUILDING',updated_at=now() where id=iid;
 elsif operation='initiative.transition' then
  if not actionos_private.is_lead(iid) then raise exception 'Only the project lead can change stages'; end if;
  select * into i from public.initiatives where id=iid for update; val:=payload->>'status';
  if val='READY' and i.status in ('BUILDING','PAUSED') then
   ready:=actionos_private.readiness(iid); if not (ready->>'ready')::boolean then raise exception 'Resolve all readiness blockers first'; end if;
  elsif val='EXECUTING' and i.status='READY' then
   ready:=actionos_private.readiness(iid); if not (ready->>'ready')::boolean then raise exception 'Requirements changed. Resolve blockers before executing'; end if;
  elsif val='COMPLETED' and i.status='VERIFIED' then null;
  elsif val='PAUSED' and i.status in ('BUILDING','READY','EXECUTING') then null;
  elsif val='BUILDING' and i.status='PAUSED' then null;
  elsif val='CANCELLED' and i.status not in ('VERIFIED','COMPLETED','CANCELLED') then null;
  else raise exception 'This stage transition is not allowed'; end if;
  update public.initiatives set status=val,updated_at=now() where id=iid;
  perform actionos_private.notify(u,'Project stage','Project is now '||lower(val),'/initiatives/'||i.slug||'/workspace');
 elsif operation='role.save' then
  if not actionos_private.is_lead(iid) or not exists(select 1 from public.initiatives where id=iid and status in ('DRAFT','VALIDATING','BUILDING','PAUSED')) then raise exception 'Only the lead can edit roles during planning'; end if;
  if obj is not null and not exists(select 1 from public.initiative_roles where id=obj and initiative_id=iid and title<>'Project Lead') then raise exception 'Role not editable'; end if;
  if payload->>'title'='Project Lead' then raise exception 'Project lead is managed separately'; end if;
  insert into public.initiative_roles(id,initiative_id,title,description,skills,preferred_skills,positions_required,minimum_required,commitment_hours,schedule,mode,experience_level,approval_required,critical,responsibilities,reasoning)
  values(coalesce(obj,gen_random_uuid()),iid,payload->>'title',coalesce(payload->>'description',''),array(select jsonb_array_elements_text(coalesce(payload->'skills','[]'))),array(select jsonb_array_elements_text(coalesce(payload->'preferred_skills','[]'))),(payload->>'positions_required')::integer,coalesce((payload->>'minimum_required')::integer,1),coalesce((payload->>'commitment_hours')::integer,3),coalesce(payload->>'schedule','Weekends'),coalesce(payload->>'mode','Hybrid'),coalesce(payload->>'experience_level','Beginner'),coalesce((payload->>'approval_required')::boolean,false) or lower(payload->>'title') similar to '%(finance|liaison|safeguard|specialist)%',coalesce((payload->>'critical')::boolean,false),coalesce(payload->>'responsibilities',''),coalesce(payload->>'reasoning',''))
  on conflict(id) do update set title=excluded.title,description=excluded.description,skills=excluded.skills,preferred_skills=excluded.preferred_skills,positions_required=excluded.positions_required,minimum_required=excluded.minimum_required,commitment_hours=excluded.commitment_hours,schedule=excluded.schedule,mode=excluded.mode,experience_level=excluded.experience_level,approval_required=excluded.approval_required,critical=excluded.critical,responsibilities=excluded.responsibilities,reasoning=excluded.reasoning returning id into result;
 elsif operation in ('role.join','role.apply') then
  select * into r from public.initiative_roles where id=(payload->>'role_id')::uuid for update;
  if r.id is null or not actionos_private.can_read_initiative(r.initiative_id) then raise exception 'Role not available'; end if;
  select * into i from public.initiatives where id=r.initiative_id;
  if i.status not in ('BUILDING','READY') or i.hidden then raise exception 'This project is not recruiting'; end if;
  if r.positions_filled>=r.positions_required then raise exception 'This role is full'; end if;
  if exists(select 1 from public.initiative_members where role_id=r.id and user_id=u and status='active') then raise exception 'You already joined this role'; end if;
  if operation='role.join' then
   if r.approval_required or i.works_with_minors then raise exception 'This role requires an application'; end if;
   insert into public.initiative_members(initiative_id,role_id,user_id) values(i.id,r.id,u) on conflict(role_id,user_id) do update set status='active',joined_at=now();
   perform actionos_private.notify(i.creator_id,'Member joined','A contributor joined '||r.title,'/initiatives/'||i.slug||'/workspace');
  else
   if length(coalesce(payload->>'motivation',''))<10 then raise exception 'Tell the team why you are interested'; end if;
   insert into public.role_applications(initiative_id,role_id,user_id,motivation,experience,availability) values(i.id,r.id,u,payload->>'motivation',coalesce(payload->>'experience',''),coalesce(payload->>'availability','')) on conflict(role_id,user_id) do update set motivation=excluded.motivation,experience=excluded.experience,availability=excluded.availability,status='Pending',review_notes='' where public.role_applications.status in ('Changes Requested','Rejected');
   perform actionos_private.notify(i.creator_id,'Role application','A new application for '||r.title,'/initiatives/'||i.slug||'/workspace');
  end if;
 elsif operation='application.review' then
  select * into a from public.role_applications where id=obj for update;
  if a.id is null or not actionos_private.is_lead(a.initiative_id) then raise exception 'Only the project lead can review applications'; end if;
  if a.status<>'Pending' then raise exception 'Application has already been reviewed'; end if;
  val:=payload->>'status'; if val not in ('Approved','Rejected','Changes Requested') then raise exception 'Invalid review decision'; end if;
  if val='Approved' then
   select * into r from public.initiative_roles where id=a.role_id for update;
   if r.positions_filled>=r.positions_required then raise exception 'This role is full'; end if;
   if not exists(select 1 from public.initiatives where id=a.initiative_id and status in ('BUILDING','READY')) then raise exception 'Project is not recruiting'; end if;
   insert into public.initiative_members(initiative_id,role_id,user_id) values(a.initiative_id,a.role_id,a.user_id) on conflict(role_id,user_id) do update set status='active';
  end if;
  update public.role_applications set status=val,review_notes=coalesce(payload->>'notes',''),reviewed_by=u where id=obj;
  perform actionos_private.notify(a.user_id,'Application decision','Your application was '||lower(val),'/my-initiatives');
 elsif operation='organisation.create' then
  result:=gen_random_uuid();
  insert into public.organisations(id,created_by,name,slug,organisation_type,city,description,website,causes) values(result,u,payload->>'name',trim(both '-' from regexp_replace(lower(payload->>'name'),'[^a-z0-9]+','-','g'))||'-'||left(result::text,8),payload->>'organisation_type',payload->>'city',coalesce(payload->>'description',''),coalesce(payload->>'website',''),array(select jsonb_array_elements_text(coalesce(payload->'causes','[]'))));
  insert into public.organisation_members values(result,u,'owner','active');
 elsif operation='organisation.update' then
  if not actionos_private.org_manager(oid) then raise exception 'Organisation manager access required'; end if;
  update public.organisations set name=coalesce(payload->>'name',name),description=coalesce(payload->>'description',description),website=coalesce(payload->>'website',website),city=coalesce(payload->>'city',city),logo_path=coalesce(payload->>'logo_path',logo_path) where id=oid;
 elsif operation='organisation.request-verification' then
  if not actionos_private.org_manager(oid) then raise exception 'Organisation manager access required'; end if;
  if exists(select 1 from public.organisations where id=oid and verification_status='Verified') then raise exception 'Organisation already verified'; end if;
  insert into public.organisation_verification_requests(organisation_id,requested_by,contact_email,reference,document_path) values(oid,u,payload->>'contact_email',coalesce(payload->>'reference',''),payload->>'document_path');
  update public.organisations set verification_status='Pending' where id=oid;
 elsif operation='organisation.review' then
  if not actionos_private.is_admin() then raise exception 'Admin access required'; end if;
  select organisation_id,requested_by into oid,actor from public.organisation_verification_requests where id=obj and status='Pending' for update;
  if oid is null or actor=u or actionos_private.org_member(oid) then raise exception 'You cannot review your own organisation'; end if;
  val:=payload->>'status'; if val not in ('Verified','Rejected') then raise exception 'Invalid review'; end if;
  if length(coalesce(payload->>'notes',''))<5 then raise exception 'Add a review note'; end if;
  update public.organisation_verification_requests set status=val,notes=payload->>'notes',reviewed_by=u,reviewed_at=now() where id=obj;
  update public.organisations set verification_status=val where id=oid;
  insert into public.moderation_actions(admin_id,action,notes) values(u,'Organisation '||val,oid::text||': '||(payload->>'notes'));
  perform actionos_private.notify(actor,'Organisation review','Organisation verification: '||val,'/partner');
 elsif operation='need.create' then
  if not actionos_private.org_manager(oid) or not exists(select 1 from public.organisations where id=oid and verification_status='Verified' and not hidden) then raise exception 'Only a verified organisation can post a verified need'; end if;
  insert into public.organisation_needs(organisation_id,created_by,title,description,affected,city,outcome,support,roles,timeframe,cause,sdg_id) values(oid,u,payload->>'title',payload->>'description',coalesce(payload->>'affected',''),payload->>'city',payload->>'outcome',coalesce(payload->>'support',''),array(select jsonb_array_elements_text(coalesce(payload->'roles','[]'))),coalesce(payload->>'timeframe',''),payload->>'cause',nullif(payload->>'sdg_id','')::integer) returning id into result;
 elsif operation='partner.request' then
  if not actionos_private.is_lead(iid) then raise exception 'Only the lead can request a partner'; end if;
  if not exists(select 1 from public.organisations where id=oid and not hidden) then raise exception 'Organisation not found'; end if;
  insert into public.initiative_partners(initiative_id,organisation_id,role,required) values(iid,oid,payload->>'role',coalesce((payload->>'required')::boolean,true));
  for actor in select user_id from public.organisation_members where organisation_id=oid and status='active' and role in ('owner','manager') loop perform actionos_private.notify(actor,'Partner request','An initiative requested your partnership','/partner'); end loop;
 elsif operation='partner.respond' then
  select organisation_id,initiative_id into oid,iid from public.initiative_partners where id=obj;
  if not actionos_private.org_manager(oid) then raise exception 'Only this organisation can respond'; end if;
  if payload->>'status' not in ('Confirmed','Rejected') then raise exception 'Invalid response'; end if;
  update public.initiative_partners set status=payload->>'status' where id=obj;
  perform actionos_private.notify((select creator_id from public.initiatives where id=iid),'Partner response','Your partner request was '||lower(payload->>'status'),'/my-initiatives');
 elsif operation='validation.request' then
  if not actionos_private.is_lead(iid) then raise exception 'Only the project lead can request validation'; end if;
  if not exists(select 1 from public.organisations where id=oid and verification_status='Verified' and not hidden) then raise exception 'Choose a verified organisation'; end if;
  select * into i from public.initiatives where id=iid;
  if i.status not in ('DRAFT','VALIDATING','BUILDING') then raise exception 'Validation is part of planning'; end if;
  insert into public.initiative_validations(initiative_id,organisation_id,requested_by,observation,assumptions,questions) values(iid,oid,u,i.observation,coalesce(payload->>'assumptions',''),coalesce(payload->>'questions',''));
  update public.initiatives set status='VALIDATING' where id=iid;
  for actor in select user_id from public.organisation_members where organisation_id=oid and status='active' and role in ('owner','manager') loop perform actionos_private.notify(actor,'Validation request','A community need is awaiting your perspective','/partner'); end loop;
 elsif operation='validation.respond' then
  select * into v from public.initiative_validations where id=obj for update;
  if v.id is null or not actionos_private.org_manager(v.organisation_id) or v.requested_by=u or actionos_private.is_member(v.initiative_id) then raise exception 'An independent organisation manager must respond'; end if;
  if v.status not in ('Pending','Needs Revision') then raise exception 'Validation has already been answered'; end if;
  if not exists(select 1 from public.organisations where id=v.organisation_id and verification_status='Verified' and not hidden) then raise exception 'Organisation must be verified'; end if;
  update public.initiative_validations set verdict=payload->>'verdict',inaccuracies=coalesce(payload->>'inaccuracies',''),changes=coalesce(payload->>'changes',''),refined_problem=coalesce(payload->>'refined_problem',''),support=coalesce((payload->>'support')::boolean,false),status=case when payload->>'verdict'='No' then 'Rejected' else 'Responded' end,responded_by=u,responded_at=now() where id=obj;
  perform actionos_private.notify(v.requested_by,'Validation response','Your community partner has responded','/my-initiatives');
 elsif operation='validation.accept' then
  select * into v from public.initiative_validations where id=obj for update;
  if not actionos_private.is_lead(v.initiative_id) or v.status<>'Responded' or v.responded_by is null or length(v.refined_problem)<10 then raise exception 'A human response with a refined problem is required'; end if;
  update public.initiative_validations set status='Accepted' where id=obj;
  update public.initiatives set validated_problem=v.refined_problem,is_need_validated=true,status='BUILDING',updated_at=now() where id=v.initiative_id;
 elsif operation='validation.revise' then
  select * into v from public.initiative_validations where id=obj;
  if not actionos_private.is_lead(v.initiative_id) or v.status<>'Responded' then raise exception 'Only the lead can request revision of a response'; end if;
  update public.initiative_validations set status='Needs Revision',questions=coalesce(payload->>'questions',questions) where id=obj;
 elsif operation in ('task.save','permission.save','resource.save','stakeholder.save','metric.save') then
  if not actionos_private.is_lead(iid) then raise exception 'Only the lead can change project requirements'; end if;
  select * into i from public.initiatives where id=iid;
  if i.status in ('VERIFYING','VERIFIED','COMPLETED','CANCELLED') then raise exception 'The project record is locked at this stage'; end if;
  result:=coalesce(obj,gen_random_uuid());
  if operation='task.save' then
   if obj is not null and not exists(select 1 from public.initiative_tasks where id=obj and initiative_id=iid) then raise exception 'Task not found'; end if;
   actor:=nullif(payload->>'assigned_user','')::uuid;
   if actor is not null and not exists(select 1 from public.initiative_members where initiative_id=iid and user_id=actor and status='active') then raise exception 'Assign a team member'; end if;
   insert into public.initiative_tasks(id,initiative_id,title,description,assigned_user,due_date,priority,status) values(result,iid,payload->>'title',coalesce(payload->>'description',''),actor,nullif(payload->>'due_date','')::date,coalesce(payload->>'priority','Normal'),coalesce(payload->>'status','To Do')) on conflict(id) do update set title=excluded.title,description=excluded.description,assigned_user=excluded.assigned_user,due_date=excluded.due_date,priority=excluded.priority,status=excluded.status;
   perform actionos_private.notify(actor,'Task assigned',payload->>'title','/initiatives/'||i.slug||'/workspace');
  elsif operation='permission.save' then
   if obj is not null and not exists(select 1 from public.initiative_permissions where id=obj and initiative_id=iid) then raise exception 'Permission not found'; end if;
   insert into public.initiative_permissions(id,initiative_id,name,required,critical,owner_id,status,reference,notes) values(result,iid,payload->>'name',coalesce((payload->>'required')::boolean,true),coalesce((payload->>'critical')::boolean,true),u,coalesce(payload->>'status','Pending'),coalesce(payload->>'reference',''),coalesce(payload->>'notes','')) on conflict(id) do update set name=excluded.name,required=excluded.required,critical=excluded.critical,status=excluded.status,reference=excluded.reference,notes=excluded.notes;
   perform actionos_private.notify(u,'Permission updated',payload->>'name','/initiatives/'||i.slug||'/workspace');
  elsif operation='resource.save' then
   if obj is not null and not exists(select 1 from public.initiative_resources where id=obj and initiative_id=iid) then raise exception 'Resource not found'; end if;
   insert into public.initiative_resources(id,initiative_id,name,category,required_quantity,secured_quantity,unit,notes) values(result,iid,payload->>'name',coalesce(payload->>'category','Materials'),(payload->>'required_quantity')::numeric,coalesce((payload->>'secured_quantity')::numeric,0),coalesce(payload->>'unit','items'),coalesce(payload->>'notes','')) on conflict(id) do update set name=excluded.name,category=excluded.category,required_quantity=excluded.required_quantity,secured_quantity=excluded.secured_quantity,unit=excluded.unit,notes=excluded.notes;
  elsif operation='stakeholder.save' then
   if obj is not null and not exists(select 1 from public.initiative_stakeholders where id=obj and initiative_id=iid) then raise exception 'Stakeholder not found'; end if;
   insert into public.initiative_stakeholders(id,initiative_id,type,purpose,required,status,organisation_id) values(result,iid,payload->>'type',payload->>'purpose',coalesce((payload->>'required')::boolean,true),coalesce(payload->>'status','Missing'),oid) on conflict(id) do update set type=excluded.type,purpose=excluded.purpose,required=excluded.required,status=excluded.status,organisation_id=excluded.organisation_id;
  else
   if i.status in ('READY','EXECUTING') then raise exception 'Metrics must be defined before readiness'; end if;
   if obj is not null and not exists(select 1 from public.initiative_metrics where id=obj and initiative_id=iid) then raise exception 'Metric not found'; end if;
   insert into public.initiative_metrics(id,initiative_id,name,description,metric_type,unit,target_value,baseline,measurement_method,verification_source) values(result,iid,payload->>'name',coalesce(payload->>'description',''),coalesce(payload->>'metric_type','Outcome'),payload->>'unit',(payload->>'target_value')::numeric,nullif(payload->>'baseline','')::numeric,payload->>'measurement_method',payload->>'verification_source') on conflict(id) do update set name=excluded.name,description=excluded.description,metric_type=excluded.metric_type,unit=excluded.unit,target_value=excluded.target_value,baseline=excluded.baseline,measurement_method=excluded.measurement_method,verification_source=excluded.verification_source;
  end if;
 elsif operation='task.status' then
  select initiative_id,assigned_user into iid,actor from public.initiative_tasks where id=obj;
  if not(actionos_private.is_lead(iid) or (actor=u and actionos_private.is_member(iid))) then raise exception 'Only the assignee or project lead can update this task'; end if;
  if exists(select 1 from public.initiatives where id=iid and status in ('VERIFYING','VERIFIED','COMPLETED','CANCELLED')) then raise exception 'This project record is locked'; end if;
  update public.initiative_tasks set status=payload->>'status' where id=obj;
 elsif operation='attendance.record' then
  if not actionos_private.is_lead(iid) or not exists(select 1 from public.initiatives where id=iid and status='EXECUTING') then raise exception 'Only the lead can record execution attendance'; end if;
  actor:=(payload->>'user_id')::uuid;
  if not exists(select 1 from public.initiative_members where initiative_id=iid and user_id=actor and status='active') then raise exception 'Person is not a team member'; end if;
  insert into public.initiative_attendance(initiative_id,user_id,recorded_by) values(iid,actor,u) on conflict do nothing;
 elsif operation='metric.record' then
  select * into m from public.initiative_metrics where id=obj;
  if not actionos_private.is_lead(m.initiative_id) or not exists(select 1 from public.initiatives where id=m.initiative_id and status='EXECUTING') then raise exception 'Only the lead can record metrics during execution'; end if;
  if m.status='Verified' or exists(select 1 from public.impact_verification_requests where metric_id=m.id and status='Pending') then raise exception 'This metric is locked for verification'; end if;
  update public.initiative_metrics set actual_value=(payload->>'actual_value')::numeric,status='Recorded' where id=obj;
 elsif operation='evidence.create' then
  if not actionos_private.is_member(iid) then raise exception 'Only project members can add evidence'; end if;
  if not exists(select 1 from public.initiatives where id=iid and status in ('BUILDING','READY','EXECUTING')) then raise exception 'Evidence is locked while verification is in progress or complete'; end if;
  if split_part(payload->>'storage_path','/',1)<>iid::text or split_part(payload->>'storage_path','/',2)<>u::text then raise exception 'Invalid evidence owner/path'; end if;
  if not exists(select 1 from storage.objects where bucket_id='initiative-evidence' and name=payload->>'storage_path') then raise exception 'Upload the evidence file first'; end if;
  if nullif(payload->>'related_metric_id','') is not null and not exists(select 1 from public.initiative_metrics where id=(payload->>'related_metric_id')::uuid and initiative_id=iid) then raise exception 'Metric belongs to another initiative'; end if;
  if payload->>'visibility'='Public' and not actionos_private.is_lead(iid) then raise exception 'Only the lead can make evidence public'; end if;
  insert into public.initiative_evidence(initiative_id,uploader_id,type,storage_path,caption,related_metric_id,visibility) values(iid,u,payload->>'type',payload->>'storage_path',payload->>'caption',nullif(payload->>'related_metric_id','')::uuid,coalesce(payload->>'visibility','Private')) returning id into result;
 elsif operation='verification.request' then
  select * into m from public.initiative_metrics where id=(payload->>'metric_id')::uuid for update;
  iid:=m.initiative_id;
  if not actionos_private.is_lead(iid) or not exists(select 1 from public.initiatives where id=iid and status in ('EXECUTING','VERIFYING')) or m.metric_type<>'Outcome' or m.status<>'Recorded' then raise exception 'Record an outcome during execution first'; end if;
  if not exists(select 1 from public.initiative_partners p join public.organisations o on o.id=p.organisation_id where p.initiative_id=iid and p.organisation_id=oid and p.status='Confirmed' and p.role='Verification Partner' and o.verification_status='Verified' and not o.hidden) then raise exception 'Choose a confirmed, verified verification partner'; end if;
  if not exists(select 1 from public.initiative_evidence where initiative_id=iid and related_metric_id=m.id and type in ('Receipt','Survey','Metric Record','Partner Confirmation','Document')) then raise exception 'Attach outcome evidence to this metric. Photos and attendance alone are not sufficient'; end if;
  insert into public.impact_verification_requests(initiative_id,metric_id,organisation_id,requested_by,target_snapshot,actual_snapshot,summary) values(iid,m.id,oid,u,m.target_value,m.actual_value,payload->>'summary');
  update public.initiatives set status='VERIFYING' where id=iid;
  for actor in select user_id from public.organisation_members where organisation_id=oid and status='active' and role in ('owner','manager') loop perform actionos_private.notify(actor,'Verification requested','An outcome is ready for your review','/partner'); end loop;
 elsif operation='verification.decide' then
  select * into q from public.impact_verification_requests where id=obj for update;
  if q.id is null or q.status<>'Pending' or not actionos_private.org_manager(q.organisation_id) or actionos_private.is_member(q.initiative_id) or q.requested_by=u then raise exception 'Only an independent authorised partner can verify this outcome'; end if;
  if not exists(select 1 from public.initiative_partners p join public.organisations o on o.id=p.organisation_id where p.initiative_id=q.initiative_id and p.organisation_id=q.organisation_id and p.status='Confirmed' and p.role='Verification Partner' and o.verification_status='Verified' and not o.hidden) then raise exception 'Partner authorisation is no longer active'; end if;
  val:=payload->>'decision'; if val not in ('Verified','Partially Verified','Clarification Requested','Unable to Verify') then raise exception 'Invalid verification decision'; end if;
  if length(coalesce(payload->>'notes',''))<5 then raise exception 'Explain your verification decision'; end if;
  if val='Partially Verified' and (nullif(payload->>'confirmed_value','') is null or (payload->>'confirmed_value')::numeric<0 or (payload->>'confirmed_value')::numeric>=q.actual_snapshot) then raise exception 'Enter the confirmed portion below the submitted outcome'; end if;
  insert into public.impact_verifications(request_id,initiative_id,metric_id,organisation_id,verified_by_user_id,decision,confirmed_value,notes) values(q.id,q.initiative_id,q.metric_id,q.organisation_id,u,val,case when val='Verified' then q.actual_snapshot when val='Partially Verified' then (payload->>'confirmed_value')::numeric else null end,payload->>'notes');
  update public.impact_verification_requests set status=val where id=q.id;
  update public.initiative_metrics set status=case when val='Verified' then 'Verified' when val='Partially Verified' then 'Partially Verified' else 'Recorded' end where id=q.metric_id;
  if val='Verified' and not exists(select 1 from public.initiative_metrics where initiative_id=q.initiative_id and metric_type='Outcome' and status<>'Verified') then
   update public.initiatives set status='VERIFIED',updated_at=now() where id=q.initiative_id;
   for actor in select distinct user_id from public.initiative_members where initiative_id=q.initiative_id and status='active' loop perform actionos_private.notify(actor,'Impact verified','Your project outcome has been partner verified','/my-impact'); end loop;
  elsif val<>'Verified' then update public.initiatives set status='EXECUTING' where id=q.initiative_id; end if;
  perform actionos_private.notify(q.requested_by,'Verification decision',val||': '||(payload->>'notes'),'/my-initiatives');
 elsif operation='post.create' then
  if iid is not null and not actionos_private.is_member(iid) then raise exception 'Only contributors can post project updates'; end if;
  if oid is not null and not actionos_private.org_manager(oid) then raise exception 'Organisation manager access required'; end if;
  if iid is null and oid is null then raise exception 'Link your update to an initiative or organisation'; end if;
  if payload->>'kind'='Recruitment Update' and not actionos_private.is_lead(iid) then raise exception 'Only the lead can publish recruitment updates'; end if;
  for n in select jsonb_array_elements_text(coalesce(payload->'media_paths','[]')) loop
   if split_part(n,'/',1)<>u::text or not exists(select 1 from storage.objects where bucket_id='impact-post-media' and name=n) then raise exception 'Attach only media you uploaded'; end if;
  end loop;
  insert into public.impact_posts(author_id,initiative_id,organisation_id,body,role,milestone,kind,media_paths) values(u,iid,oid,payload->>'body',coalesce(payload->>'role',''),coalesce(payload->>'milestone',''),coalesce(payload->>'kind','Project Update'),array(select jsonb_array_elements_text(coalesce(payload->'media_paths','[]')))) returning id into result;
 elsif operation='comment.create' then
  obj:=(payload->>'post_id')::uuid;
  if not actionos_private.can_read_post(obj) then raise exception 'Post is not available'; end if;
  insert into public.comments(post_id,author_id,body) values(obj,u,payload->>'body');
  perform actionos_private.notify((select author_id from public.impact_posts where id=obj),'Comment','Someone commented on your impact update','/posts/'||obj::text);
 elsif operation='comment.delete' then
  delete from public.comments where id=obj and author_id=u;
 elsif operation='save.toggle' then
  if not actionos_private.can_read_initiative(iid) then raise exception 'Initiative not available'; end if;
  if exists(select 1 from public.saved_initiatives where user_id=u and initiative_id=iid) then delete from public.saved_initiatives where user_id=u and initiative_id=iid; else insert into public.saved_initiatives values(u,iid,now()); end if;
 elsif operation='follow.toggle' then
  actor:=nullif(payload->>'user_id','')::uuid;
  if (actor is null)=(oid is null) or actor=u then raise exception 'Choose one other person or organisation'; end if;
  if exists(select 1 from public.follows where follower_id=u and (user_id=actor or organisation_id=oid)) then delete from public.follows where follower_id=u and (user_id=actor or organisation_id=oid);
  else insert into public.follows(follower_id,user_id,organisation_id) values(u,actor,oid); perform actionos_private.notify(actor,'Follow','Someone is following your impact journey','/profile/'||(select username from public.profiles where id=u)); end if;
 elsif operation='notification.read' then
  update public.notifications set read_at=now() where user_id=u and (obj is null or id=obj);
 elsif operation='report.create' then
  insert into public.reports(reporter_id,target_type,target_id,reason,details) values(u,payload->>'target_type',(payload->>'target_id')::uuid,payload->>'reason',coalesce(payload->>'details',''));
 elsif operation='report.moderate' then
  if not actionos_private.is_admin() then raise exception 'Admin access required'; end if;
  val:=payload->>'action'; if val not in ('Dismiss','Hide Content','Suspend Initiative','Suspend Account','Request Clarification') then raise exception 'Invalid moderation action'; end if;
  if length(coalesce(payload->>'notes',''))<5 then raise exception 'Add an audit note'; end if;
  select target_type,target_id,reporter_id into n,result,actor from public.reports where id=obj;
  if n is null then raise exception 'Report not found'; end if;
  if val='Hide Content' then
   if n='post' then update public.impact_posts set hidden=true where id=result;
   elsif n='comment' then update public.comments set hidden=true where id=result;
   elsif n='initiative' then update public.initiatives set hidden=true where id=result;
   elsif n='organisation' then update public.organisations set hidden=true where id=result;
   elsif n='profile' then update public.profiles set hidden=true where id=result; end if;
  elsif val='Suspend Initiative' and n='initiative' then update public.initiatives set hidden=true,status='PAUSED' where id=result;
  elsif val='Suspend Account' and n='profile' then
   if result=u or exists(select 1 from public.admin_users where user_id=result) then raise exception 'Cannot suspend an administrator through reports'; end if;
   update public.profiles set suspended=true where id=result;
  elsif val in ('Suspend Account','Suspend Initiative') then raise exception 'Report target does not match this action'; end if;
  update public.reports set status=case when val='Dismiss' then 'Dismissed' when val='Request Clarification' then 'Clarification Requested' else 'Actioned' end where id=obj;
  insert into public.moderation_actions(admin_id,report_id,action,notes) values(u,obj,val,payload->>'notes');
  perform actionos_private.notify(actor,'Report reviewed','Your report was reviewed: '||val,'/notifications');
 elsif operation='category.save' then
  if not actionos_private.is_admin() then raise exception 'Admin access required'; end if;
  if payload->>'category_type'='cause' then insert into public.causes values(payload->>'key',payload->>'name',coalesce((payload->>'active')::boolean,true)) on conflict(id) do update set name=excluded.name,active=excluded.active;
  elsif payload->>'category_type'='skill' then insert into public.skills values(payload->>'key',payload->>'name',coalesce((payload->>'active')::boolean,true)) on conflict(id) do update set name=excluded.name,active=excluded.active;
  else raise exception 'Unknown category'; end if;
 else raise exception 'Unsupported operation';
 end if;
 return jsonb_build_object('id',coalesce(result,obj,iid,oid));
end $$;
create function public.actionos_mutate(operation text, payload jsonb) returns jsonb language sql security invoker set search_path='' as $$ select actionos_private.mutate(operation,payload) $$;

-- Remove implicit PUBLIC execution on all privileged implementation functions.
revoke all on all functions in schema actionos_private from public, anon, authenticated;
grant execute on function actionos_private.active_actor(),actionos_private.is_admin(),actionos_private.org_member(uuid),actionos_private.org_manager(uuid),actionos_private.is_lead(uuid),actionos_private.is_member(uuid),actionos_private.is_partner(uuid),actionos_private.can_read_initiative(uuid),actionos_private.can_read_post(uuid),actionos_private.readiness(uuid) to anon,authenticated;
grant execute on function actionos_private.mutate(text,jsonb) to authenticated;
revoke all on function public.actionos_mutate(text,jsonb) from public,anon;
grant execute on function public.actionos_mutate(text,jsonb) to authenticated;
revoke all on function public.actionos_readiness(uuid) from public;
grant execute on function public.actionos_readiness(uuid) to anon,authenticated;

-- Files are private by default, with short-lived URLs issued only after these RLS checks.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('avatars','avatars',false,2097152,array['image/jpeg','image/png','image/webp']),
 ('organisation-logos','organisation-logos',false,2097152,array['image/jpeg','image/png','image/webp']),
 ('impact-post-media','impact-post-media',false,5242880,array['image/jpeg','image/png','image/webp']),
 ('initiative-evidence','initiative-evidence',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf','text/csv']),
 ('organisation-verification','organisation-verification',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf']);
create function actionos_private.storage_access(bucket text,path text,writing boolean) returns boolean language plpgsql stable security definer set search_path='' as $$
declare entity uuid; owner uuid;
begin
 if writing and not actionos_private.active_actor() then return false; end if;
 if bucket in ('avatars','impact-post-media') then owner:=split_part(path,'/',1)::uuid;
 else entity:=split_part(path,'/',1)::uuid; owner:=split_part(path,'/',2)::uuid; end if;
 if writing and owner is distinct from auth.uid() then return false; end if;
 if bucket='avatars' then return case when writing then true else exists(select 1 from public.profiles where id=owner and not hidden and not suspended and avatar_path=path) end;
 elsif bucket='organisation-logos' then return case when writing then actionos_private.org_manager(entity) else exists(select 1 from public.organisations where id=entity and not hidden and logo_path=path) end;
 elsif bucket='impact-post-media' then return case when writing then true else exists(select 1 from public.impact_posts where path=any(media_paths) and actionos_private.can_read_post(id)) end;
 elsif bucket='organisation-verification' then return actionos_private.org_manager(entity) or (not writing and actionos_private.is_admin());
 elsif bucket='initiative-evidence' then
  if writing then return actionos_private.is_member(entity) and exists(select 1 from public.initiatives where id=entity and status in ('BUILDING','READY','EXECUTING','PAUSED')); end if;
  return actionos_private.is_member(entity) or actionos_private.is_partner(entity) or actionos_private.is_admin() or exists(select 1 from public.initiative_evidence where initiative_id=entity and storage_path=path and visibility='Public' and actionos_private.can_read_initiative(entity));
 end if;
 return false;
exception when invalid_text_representation then return false;
end $$;
revoke all on function actionos_private.storage_access(text,text,boolean) from public;
grant execute on function actionos_private.storage_access(text,text,boolean) to anon,authenticated;
create policy actionos_files_read on storage.objects for select to anon,authenticated using(actionos_private.storage_access(bucket_id,name,false));
create policy actionos_files_upload on storage.objects for insert to authenticated with check(actionos_private.storage_access(bucket_id,name,true));
-- No overwrite/delete permissions: a submitted verification must keep its original evidence.

insert into public.causes(id,name) values ('environment','Environment'),('education','Education'),('animals','Animal welfare'),('inclusion','Inclusion & accessibility'),('community','Community wellbeing'),('health','Health'),('food','Food security');
insert into public.skills(id,name) values ('coordination','Coordination'),('teaching','Teaching'),('design','Design'),('research','Research'),('communication','Communication'),('fieldwork','Fieldwork'),('technology','Technology'),('documentation','Documentation'),('finance','Finance'),('photography','Photography');
insert into public.sdgs(id,name) values (1,'No Poverty'),(2,'Zero Hunger'),(3,'Good Health and Well-being'),(4,'Quality Education'),(5,'Gender Equality'),(6,'Clean Water and Sanitation'),(7,'Affordable and Clean Energy'),(8,'Decent Work and Economic Growth'),(9,'Industry, Innovation and Infrastructure'),(10,'Reduced Inequalities'),(11,'Sustainable Cities and Communities'),(12,'Responsible Consumption and Production'),(13,'Climate Action'),(14,'Life Below Water'),(15,'Life on Land'),(16,'Peace, Justice and Strong Institutions'),(17,'Partnerships for the Goals');
