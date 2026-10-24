-- Transactional smoke test. All fixture users and records are rolled back.
begin;
insert into auth.users(id,email) values
 ('d0000000-0000-4000-8000-000000000001','actionos-smoke-lead@example.test'),
 ('d0000000-0000-4000-8000-000000000002','actionos-smoke-partner@example.test'),
 ('d0000000-0000-4000-8000-000000000003','actionos-smoke-volunteer@example.test'),
 ('d0000000-0000-4000-8000-000000000004','actionos-smoke-admin@example.test');
do $$ declare uid uuid; n text; begin
 for uid,n in select id,email from auth.users where email like 'actionos-smoke-%@example.test' loop
 perform set_config('request.jwt.claim.sub',uid::text,true);
 perform public.actionos_mutate('profile.save',jsonb_build_object('display_name','Development smoke test','username',split_part(n,'@',1),'city','Pune','onboarding_completed',true));
 end loop;
end $$;
insert into public.admin_users(user_id) values('d0000000-0000-4000-8000-000000000004');
set local role authenticated;
do $$
declare lead uuid:='d0000000-0000-4000-8000-000000000001'; partner uuid:='d0000000-0000-4000-8000-000000000002'; volunteer uuid:='d0000000-0000-4000-8000-000000000003'; administrator uuid:='d0000000-0000-4000-8000-000000000004'; iid uuid; oid uuid; rid uuid; mid uuid; req uuid; vid uuid; path text; answer jsonb;
begin
 perform set_config('request.jwt.claim.sub',partner::text,true);
 oid:=(public.actionos_mutate('organisation.create','{"name":"Development smoke partner","organisation_type":"NGO","city":"Pune"}')->>'id')::uuid;
 perform public.actionos_mutate('organisation.request-verification',jsonb_build_object('organisation_id',oid,'contact_email','test@example.test','reference','Transactional smoke fixture'));
 perform set_config('request.jwt.claim.sub',administrator::text,true);
 select id into req from public.organisation_verification_requests where organisation_id=oid;
 perform public.actionos_mutate('organisation.review',jsonb_build_object('id',req,'status','Verified','notes','Smoke test review, rolled back.'));
 perform set_config('request.jwt.claim.sub',lead::text,true);
 iid:=(public.actionos_mutate('initiative.create','{"title":"Development smoke initiative","observation":"A documented community need for local testing.","cause":"environment","city":"Pune","mode":"In-person"}')->>'id')::uuid;
 perform public.actionos_mutate('validation.request',jsonb_build_object('initiative_id',iid,'organisation_id',oid,'questions','Is this need accurately described?'));
 perform set_config('request.jwt.claim.sub',volunteer::text,true);
 if exists(select 1 from public.initiatives where id=iid) then raise exception 'RLS failure: private draft visible'; end if;
 begin
  perform public.actionos_mutate('initiative.update',jsonb_build_object('initiative_id',iid,'goal','Unauthorised edit'));
  raise exception 'RLS failure: unauthorised update';
 exception when raise_exception then if sqlerrm not like 'Only the project lead%' then raise; end if; end;
 perform set_config('request.jwt.claim.sub',partner::text,true);
 select id into vid from public.initiative_validations where initiative_id=iid;
 perform public.actionos_mutate('validation.respond',jsonb_build_object('id',vid,'verdict','Yes','refined_problem','A community-validated need with a measured response.'));
 perform set_config('request.jwt.claim.sub',lead::text,true);
 perform public.actionos_mutate('validation.accept',jsonb_build_object('id',vid));
 perform public.actionos_mutate('initiative.update',jsonb_build_object('initiative_id',iid,'goal','Recover 20 kg of material.','timeline','Two weekend sessions.'));
 rid:=(public.actionos_mutate('role.save',jsonb_build_object('initiative_id',iid,'title','Field volunteer','positions_required',1,'minimum_required',1))->>'id')::uuid;
 mid:=(public.actionos_mutate('metric.save',jsonb_build_object('initiative_id',iid,'name','Material recovered','unit','kg','target_value',20,'measurement_method','Weighing','verification_source','Partner receipt'))->>'id')::uuid;
 perform public.actionos_mutate('partner.request',jsonb_build_object('initiative_id',iid,'organisation_id',oid,'role','Verification Partner'));
 perform public.actionos_mutate('initiative.publish',jsonb_build_object('initiative_id',iid,'visibility','Public'));
 perform set_config('request.jwt.claim.sub',volunteer::text,true);
 perform public.actionos_mutate('role.join',jsonb_build_object('role_id',rid));
 perform set_config('request.jwt.claim.sub',partner::text,true);
 select id into req from public.initiative_partners where initiative_id=iid;
 perform public.actionos_mutate('partner.respond',jsonb_build_object('id',req,'status','Confirmed'));
 perform set_config('request.jwt.claim.sub',lead::text,true);
 answer:=public.actionos_readiness(iid);
 if not (answer->>'ready')::boolean then raise exception 'Readiness failure: %',answer; end if;
 perform public.actionos_mutate('initiative.transition',jsonb_build_object('initiative_id',iid,'status','READY'));
 perform public.actionos_mutate('initiative.transition',jsonb_build_object('initiative_id',iid,'status','EXECUTING'));
 perform public.actionos_mutate('metric.record',jsonb_build_object('id',mid,'actual_value',18));
 path:=iid::text||'/'||lead::text||'/transactional-test.pdf';
 insert into storage.objects(bucket_id,name,owner_id) values('initiative-evidence',path,lead::text);
 perform public.actionos_mutate('evidence.create',jsonb_build_object('initiative_id',iid,'type','Receipt','storage_path',path,'caption','Transactional test record, not a real uploaded file','related_metric_id',mid,'visibility','Private'));
 perform public.actionos_mutate('verification.request',jsonb_build_object('metric_id',mid,'organisation_id',oid,'summary','18 kg reported in transaction-only fixture.'));
 select id into req from public.impact_verification_requests where metric_id=mid;
 begin
  perform public.actionos_mutate('verification.decide',jsonb_build_object('id',req,'decision','Verified','notes','Attempted self-verification'));
  raise exception 'RLS failure: self-verification accepted';
 exception when raise_exception then if sqlerrm not like 'Only an independent%' then raise; end if; end;
 perform set_config('request.jwt.claim.sub',partner::text,true);
 perform public.actionos_mutate('verification.decide',jsonb_build_object('id',req,'decision','Verified','notes','Independently checked transaction-only test.'));
 if not exists(select 1 from public.initiatives where id=iid and status='VERIFIED') then raise exception 'Verified lifecycle failed'; end if;
 if not exists(select 1 from public.impact_verifications where request_id=req and confirmed_value=18) then raise exception 'Snapshot failed'; end if;
 perform set_config('request.jwt.claim.sub',lead::text,true);
 perform public.actionos_mutate('initiative.transition',jsonb_build_object('initiative_id',iid,'status','COMPLETED'));
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if exists(select 1 from storage.objects where name like '%/transactional-test.pdf') then raise exception 'Private evidence leaked to anonymous visitor'; end if;
 if exists(select 1 from public.profile_preferences) then raise exception 'Private preferences leaked'; end if;
end $$;
reset role;
select 'PASS: live lifecycle, independent verification, cross-user RLS and private storage; fixtures rolled back' as result;
rollback;
