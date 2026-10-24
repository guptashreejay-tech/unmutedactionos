-- Preserve outcome records even if a project has several metrics or validation requests.
create function actionos_private.project_integrity() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status is not distinct from old.status then return new; end if;
 if actionos_private.is_admin() and new.hidden then new.status:=old.status; return new; end if;
 if not (
  (old.status='DRAFT' and new.status in ('VALIDATING','BUILDING','CANCELLED')) or
  (old.status='VALIDATING' and new.status in ('BUILDING','CANCELLED')) or
  (old.status='BUILDING' and new.status in ('VALIDATING','READY','PAUSED','CANCELLED')) or
  (old.status='READY' and new.status in ('EXECUTING','PAUSED','CANCELLED')) or
  (old.status='EXECUTING' and new.status in ('VERIFYING','VERIFIED','PAUSED','CANCELLED')) or
  (old.status='VERIFYING' and new.status in ('EXECUTING','VERIFIED','CANCELLED')) or
  (old.status='PAUSED' and new.status in ('BUILDING','READY','CANCELLED')) or
  (old.status='VERIFIED' and new.status='COMPLETED')
 ) then raise exception 'The project cannot return to this stage'; end if;
 if new.status in ('READY','EXECUTING') and new.works_with_minors and (
  not exists(select 1 from public.initiative_permissions where initiative_id=new.id and name='Parent / guardian consent' and status='Approved') or
  not exists(select 1 from public.initiative_permissions where initiative_id=new.id and name='Safeguarding and institutional permission' and status='Approved')
 ) then raise exception 'Both guardian consent and safeguarding approval are mandatory for work with minors'; end if;
 if new.status='VERIFIED' and (not exists(select 1 from public.impact_verifications where initiative_id=new.id and decision='Verified') or exists(select 1 from public.initiative_metrics where initiative_id=new.id and metric_type='Outcome' and status<>'Verified')) then raise exception 'Every outcome requires an independent verification'; end if;
 return new;
end $$;
create trigger initiative_integrity before update on public.initiatives for each row execute function actionos_private.project_integrity();
create function actionos_private.metric_integrity() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.impact_verification_requests where metric_id=old.id and status='Pending') or exists(select 1 from public.impact_verifications where metric_id=old.id and decision='Verified') then
  if (to_jsonb(new)-'status') is distinct from (to_jsonb(old)-'status') then raise exception 'Submitted and verified metric definitions are immutable'; end if;
 end if;
 return new;
end $$;
create trigger metric_integrity before update on public.initiative_metrics for each row execute function actionos_private.metric_integrity();
revoke all on function actionos_private.project_integrity(),actionos_private.metric_integrity() from public,anon,authenticated;
