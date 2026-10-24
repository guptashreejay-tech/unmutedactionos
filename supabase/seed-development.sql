-- Opt-in development data for a real existing signed-up profile. No passwords or fake verifications.
-- Before running: select set_config('actionos.seed_lead_id','YOUR_PROFILE_UUID',false);
begin;
do $$ declare lead uuid; item record; iid uuid; begin
 lead:=nullif(current_setting('actionos.seed_lead_id',true),'')::uuid;
 if lead is null or not exists(select 1 from public.profiles where id=lead) then raise exception 'Set actionos.seed_lead_id to an existing development profile UUID'; end if;
 perform set_config('request.jwt.claim.sub',lead::text,true);
 for item in select * from (values
  ('Development example: Project Ripple','environment','Mixed waste is reported near a river access point.','Recover material through an approved disposal partner.'),
  ('Development example: Digital Confidence','education','Some older residents report difficulty using essential digital services.','Help participants complete agreed digital tasks independently.'),
  ('Development example: Community Animal Care','animals','Residents report uncoordinated care for local animals.','Support an established welfare partner with documented care outcomes.'),
  ('Development example: Access Together','inclusion','Residents report barriers on common pedestrian routes.','Document barriers and seek verified accessibility improvements.')
 ) as examples(title,cause,observation,goal) loop
  if exists(select 1 from public.initiatives where creator_id=lead and title=item.title and is_demo) then continue; end if;
  iid:=(public.actionos_mutate('initiative.create',jsonb_build_object('title',item.title,'cause',item.cause,'observation',item.observation,'city','Pune','mode','In-person'))->>'id')::uuid;
  update public.initiatives set is_demo=true,goal=item.goal,summary='Clearly labelled development draft. Requires real human validation before publication.' where id=iid;
  perform public.actionos_mutate('role.save',jsonb_build_object('initiative_id',iid,'title','Community volunteer','description','Help plan and document the work with the partner.','positions_required',3,'minimum_required',2,'commitment_hours',3));
 end loop;
end $$;
commit;
