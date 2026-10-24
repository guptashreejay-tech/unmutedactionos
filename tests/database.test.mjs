import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from '../scripts/check-database.mjs';

test('ActionOS persisted lifecycle and adversarial authorization boundaries',async t=>{
 const db=await database();
 const lead='10000000-0000-4000-8000-000000000001', volunteer='10000000-0000-4000-8000-000000000002', partner='10000000-0000-4000-8000-000000000003', admin='10000000-0000-4000-8000-000000000004', stranger='10000000-0000-4000-8000-000000000005';
 async function as(id,sql,params=[]){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']);await db.exec(`set role ${id?'authenticated':'anon'}`);return db.query(sql,params)}
 async function rpc(id,op,payload={}){return (await as(id,'select public.actionos_mutate($1,$2::jsonb) as result',[op,JSON.stringify(payload)])).rows[0].result}
 async function root(sql,params=[]){await db.exec('reset role');return db.query(sql,params)}
 async function deny(id,op,payload,pattern){await assert.rejects(rpc(id,op,payload),pattern)}
 let initiative,org,role,restricted,metric,validation,request;
 await t.test('new accounts can persist only their own profile, never admin authority',async()=>{
  for(const [id,name] of [[lead,'lead'],[volunteer,'volunteer'],[partner,'partner'],[admin,'admin'],[stranger,'stranger']]){await root('insert into auth.users values($1)',[id]);await rpc(id,'profile.save',{id:lead,display_name:`Test ${name}`,username:name,causes:['environment'],skills:['fieldwork'],city:'Pune',onboarding_completed:true,hours:3});}
  assert.equal((await as(stranger,'select display_name from public.profiles where id=$1',[lead])).rows[0].display_name,'Test lead');
  await assert.rejects(as(stranger,"update public.profiles set display_name='Changed' where id=$1",[lead]),/permission denied/);
  await assert.rejects(as(stranger,'insert into public.admin_users(user_id) values($1)',[stranger]),/permission denied/);
  await root('insert into public.admin_users(user_id) values($1)',[admin]);
  assert.equal((await as(stranger,'select * from public.admin_users')).rows.length,0);
  assert.equal((await as(stranger,'select * from public.profile_preferences')).rows.length,1);
 });
 await t.test('drafts and workspace data are private; direct mutations are blocked',async()=>{
  initiative=(await rpc(lead,'initiative.create',{title:'Development river project',observation:'Residents report mixed waste near the river.',cause:'environment',city:'Pune',mode:'In-person'})).id;
  assert.equal((await as(stranger,'select * from public.initiatives where id=$1',[initiative])).rows.length,0);
  await deny(stranger,'initiative.update',{initiative_id:initiative,goal:'Malicious edit'},/Only the project lead/);
  await assert.rejects(as(lead,"update public.initiatives set status='VERIFIED' where id=$1",[initiative]),/permission denied/);
  await deny(lead,'initiative.transition',{initiative_id:initiative,status:'VERIFIED'},/transition/);
  await deny(lead,'initiative.publish',{initiative_id:initiative,visibility:'Public'},/Complete human validation/);
 });
 await t.test('organisation verification requires independent admin review',async()=>{
  org=(await rpc(partner,'organisation.create',{name:'Development Community Partner',organisation_type:'NGO',city:'Pune',description:'Testing partner'})).id;
  await deny(partner,'need.create',{organisation_id:org,title:'Need'},/Only a verified organisation/);
  await rpc(partner,'organisation.request-verification',{organisation_id:org,contact_email:'private@example.test',reference:'Local test reference'});
  const id=(await root('select id from public.organisation_verification_requests where organisation_id=$1',[org])).rows[0].id;
  assert.equal((await as(stranger,'select * from public.organisation_verification_requests')).rows.length,0);
  await deny(partner,'organisation.review',{id,status:'Verified',notes:'Looks valid'},/Admin access/);
  await assert.rejects(as(partner,"update public.organisations set verification_status='Verified' where id=$1",[org]),/permission denied/);
  await rpc(admin,'organisation.review',{id,status:'Verified',notes:'Independently reviewed test reference.'});
  await rpc(partner,'need.create',{organisation_id:org,title:'River need',description:'Reported need',city:'Pune',outcome:'Less unmanaged waste',cause:'environment'});
 });
 await t.test('organisation invitations require acceptance and owner-controlled manager access',async()=>{
  async function member(id,op,payload){return as(id,'select public.actionos_organisation_member($1,$2::jsonb)',[op,JSON.stringify(payload)])}
  await assert.rejects(member(volunteer,'invite',{organisation_id:org,username:'stranger',role:'manager'}),/manager access/);
  await member(partner,'invite',{organisation_id:org,username:'volunteer',role:'member'});
  assert.equal((await as(volunteer,'select actionos_private.org_member($1) as allowed',[org])).rows[0].allowed,false);
  await member(volunteer,'accept',{organisation_id:org});
  assert.equal((await as(volunteer,'select actionos_private.org_member($1) as allowed',[org])).rows[0].allowed,true);
  await assert.rejects(member(volunteer,'remove',{organisation_id:org,user_id:partner}),/owner/);
  await member(partner,'remove',{organisation_id:org,user_id:volunteer});
  assert.equal((await as(volunteer,'select actionos_private.org_member($1) as allowed',[org])).rows[0].allowed,false);
 });
 await t.test('human validation is required and cannot be self-issued',async()=>{
  await rpc(lead,'validation.request',{initiative_id:initiative,organisation_id:org,assumptions:'Check the reported need',questions:'What changes are useful?'});
  validation=(await root('select id from public.initiative_validations where initiative_id=$1',[initiative])).rows[0].id;
  await deny(lead,'validation.respond',{id:validation,verdict:'Yes',refined_problem:'Self validation attempt'},/independent/);
  await rpc(partner,'validation.respond',{id:validation,verdict:'Yes',refined_problem:'Residents need a documented waste recovery route.',inaccuracies:'Confirm measurements',changes:'Coordinate disposal',support:true});
  await rpc(lead,'validation.accept',{id:validation});
  await rpc(lead,'initiative.update',{initiative_id:initiative,goal:'Recover 30 kg through approved handling.',timeline:'Two supervised sessions in November',summary:'Development test project',sdg_primary_id:12});
  role=(await rpc(lead,'role.save',{initiative_id:initiative,title:'Field volunteer',positions_required:1,minimum_required:1,skills:['fieldwork']})).id;
  restricted=(await rpc(lead,'role.save',{initiative_id:initiative,title:'Finance specialist',positions_required:1,minimum_required:0})).id;
  await rpc(lead,'initiative.publish',{initiative_id:initiative,visibility:'Public'});
  assert.equal((await as(null,'select * from public.initiatives')).rows.length,1);
  assert.equal((await as(null,"select * from public.actionos_discover(cause_filter=>'environment')")).rows.length,1);
  assert.equal((await as(null,"select * from public.actionos_discover(cause_filter=>'education')")).rows.length,0);
  assert.equal((await as(stranger,'select * from public.initiative_validations')).rows.length,0);
 });
 await t.test('joining counts real slots; restricted applications and capacity are enforced',async()=>{
  await deny(stranger,'role.join',{role_id:restricted},/requires an application/);
  await rpc(volunteer,'role.join',{role_id:role});
  await deny(volunteer,'role.join',{role_id:role},/full|already joined/);
  await deny(stranger,'role.join',{role_id:role},/full/);
  assert.equal((await root('select positions_filled from public.initiative_roles where id=$1',[role])).rows[0].positions_filled,1);
  await rpc(stranger,'role.apply',{role_id:restricted,motivation:'I can support the test finance process.',experience:'Accounting',availability:'Weekends'});
  const application=(await root('select id from public.role_applications where role_id=$1',[restricted])).rows[0].id;
  assert.equal((await as(volunteer,'select * from public.role_applications')).rows.length,0);
  await deny(stranger,'application.review',{id:application,status:'Approved'},/Only the project lead/);
  await rpc(lead,'application.review',{id:application,status:'Changes Requested',notes:'Please clarify experience.'});
  await rpc(stranger,'role.apply',{role_id:restricted,motivation:'Updated accounting experience and training.',experience:'Bookkeeping',availability:'Weekends'});
  await rpc(lead,'application.review',{id:application,status:'Approved',notes:'Suitable for the role.'});
 });
 await t.test('readiness blocks missing partners, permissions, resources and metrics',async()=>{
  await deny(lead,'initiative.transition',{initiative_id:initiative,status:'READY'},/readiness blockers/);
  await rpc(lead,'partner.request',{initiative_id:initiative,organisation_id:org,role:'Verification Partner',required:true});
  const id=(await root('select id from public.initiative_partners where initiative_id=$1',[initiative])).rows[0].id;
  await deny(lead,'partner.respond',{id,status:'Confirmed'},/Only this organisation/);
  await rpc(partner,'partner.respond',{id,status:'Confirmed'});
  const permission=(await rpc(lead,'permission.save',{initiative_id:initiative,name:'Venue permission',required:true,critical:true,status:'Pending'})).id;
  const resource=(await rpc(lead,'resource.save',{initiative_id:initiative,name:'Safety equipment',required_quantity:5,secured_quantity:0})).id;
  metric=(await rpc(lead,'metric.save',{initiative_id:initiative,name:'Waste recovered',metric_type:'Outcome',unit:'kg',target_value:30,measurement_method:'Weighbridge record',verification_source:'Disposal partner receipt'})).id;
  let ready=(await as(lead,'select public.actionos_readiness($1) as r',[initiative])).rows[0].r;
  assert.equal(ready.ready,false);assert.ok(ready.blockers.some(x=>x.includes('permission')));assert.ok(ready.blockers.some(x=>x.includes('Resources')));
  await rpc(lead,'permission.save',{id:permission,initiative_id:initiative,name:'Venue permission',required:true,critical:true,status:'Approved',reference:'Permit confirmed'});
  await rpc(lead,'resource.save',{id:resource,initiative_id:initiative,name:'Safety equipment',required_quantity:5,secured_quantity:5});
  ready=(await as(lead,'select public.actionos_readiness($1) as r',[initiative])).rows[0].r;assert.equal(ready.ready,true);assert.equal(ready.score,100);
  await rpc(lead,'initiative.transition',{initiative_id:initiative,status:'READY'});
  await rpc(lead,'initiative.transition',{initiative_id:initiative,status:'EXECUTING'});
 });
 await t.test('private storage checks ownership and project membership',async()=>{
  const privatePath=`${initiative}/${volunteer}/result.pdf`;
  await as(volunteer,"insert into storage.objects(bucket_id,name) values('initiative-evidence',$1)",[privatePath]);
  await rpc(volunteer,'evidence.create',{initiative_id:initiative,type:'Photo',storage_path:privatePath,caption:'Test photo',related_metric_id:metric,visibility:'Private'});
  assert.equal((await as(null,"select * from storage.objects where name=$1",[privatePath])).rows.length,0);
  assert.equal((await as(partner,"select * from storage.objects where name=$1",[privatePath])).rows.length,1);
  await assert.rejects(as(volunteer,"insert into storage.objects(bucket_id,name) values('initiative-evidence',$1)",[`${initiative}/${lead}/fake.pdf`]),/row-level security/);
  await assert.rejects(as(null,"insert into storage.objects(bucket_id,name) values('initiative-evidence',$1)",[privatePath+'/public']),/row-level security/);
  await rpc(lead,'metric.record',{id:metric,actual_value:26});
  await deny(lead,'verification.request',{metric_id:metric,organisation_id:org,summary:'Photo alone'},/Photos and attendance/);
  const evidence=`${initiative}/${lead}/receipt.pdf`;
  await as(lead,"insert into storage.objects(bucket_id,name) values('initiative-evidence',$1)",[evidence]);
  await rpc(lead,'evidence.create',{initiative_id:initiative,type:'Receipt',storage_path:evidence,caption:'Weighbridge receipt',related_metric_id:metric,visibility:'Private'});
  await rpc(lead,'verification.request',{metric_id:metric,organisation_id:org,summary:'26 kg measured at approved disposal.'});
  request=(await root('select id from public.impact_verification_requests where metric_id=$1',[metric])).rows[0].id;
 });
 await t.test('only independent accepted partners can verify; snapshots are immutable',async()=>{
  await deny(lead,'verification.decide',{id:request,decision:'Verified',notes:'I verify myself'},/independent/);
  await deny(stranger,'verification.decide',{id:request,decision:'Verified',notes:'Unauthorised claim'},/independent/);
  await deny(lead,'metric.record',{id:metric,actual_value:999},/during execution|locked/);
  await rpc(partner,'verification.decide',{id:request,decision:'Verified',notes:'Receipt reviewed independently against the submitted measurement.'});
  assert.equal((await as(null,'select status from public.initiatives where id=$1',[initiative])).rows[0].status,'VERIFIED');
  assert.equal((await as(null,'select confirmed_value from public.impact_verifications')).rows[0].confirmed_value,'26');
  await deny(partner,'verification.decide',{id:request,decision:'Verified',notes:'Second decision'},/independent/);
  await assert.rejects(as(partner,'update public.impact_verifications set confirmed_value=999'),/permission denied/);
  await rpc(lead,'initiative.transition',{initiative_id:initiative,status:'COMPLETED'});
 });
 await t.test('social, notifications, moderation and suspended-account boundaries',async()=>{
  const post=(await rpc(volunteer,'post.create',{initiative_id:initiative,body:'We completed a real contribution.',kind:'Impact Update'})).id;
  await rpc(partner,'comment.create',{post_id:post,body:'Thank you for the documented evidence.'});
  const comment=(await root('select id from public.comments where post_id=$1',[post])).rows[0].id;
  await rpc(lead,'comment.delete',{id:comment});assert.equal((await root('select * from public.comments where id=$1',[comment])).rows.length,1);
  await rpc(partner,'comment.delete',{id:comment});assert.equal((await root('select * from public.comments where id=$1',[comment])).rows.length,0);
  await rpc(volunteer,'save.toggle',{initiative_id:initiative});assert.equal((await as(lead,'select * from public.saved_initiatives')).rows.length,0);
  await rpc(partner,'follow.toggle',{user_id:volunteer});assert.equal((await as(lead,'select * from public.follows')).rows.length,0);
  assert.ok((await as(volunteer,'select * from public.notifications')).rows.every(n=>n.user_id===volunteer));
  await rpc(lead,'report.create',{target_type:'post',target_id:post,reason:'Misleading',details:'Test report'});
  const report=(await root('select id from public.reports where target_id=$1',[post])).rows[0].id;
  await deny(partner,'report.moderate',{id:report,action:'Hide Content',notes:'Unapproved moderation'},/Admin access/);
  await rpc(admin,'report.moderate',{id:report,action:'Hide Content',notes:'Hidden after reviewing the test report.'});
  assert.equal((await as(null,'select * from public.impact_posts where id=$1',[post])).rows.length,0);
  assert.equal((await as(volunteer,'select * from public.moderation_actions')).rows.length,0);
  await root('update public.profiles set suspended=true where id=$1',[stranger]);
  await deny(stranger,'save.toggle',{initiative_id:initiative},/contact support/);
  await assert.rejects(as(stranger,"insert into storage.objects(bucket_id,name) values('avatars',$1)",[`${stranger}/new.png`]),/row-level security/);
 });
 await db.close();
});
