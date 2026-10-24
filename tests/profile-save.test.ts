import test from 'node:test';
import assert from 'node:assert/strict';
import { saveProfileWithOptionalImage } from '../src/lib/profile-save';

test('profile saves without an image and does not upload anything', async () => {
  const saved: unknown[] = [];
  const result = await saveProfileWithOptionalImage({display_name:'New member'}, undefined, {
    save: async values => { saved.push(values); },
    uploadAvatar: async () => { throw new Error('Unexpected upload'); },
  });
  assert.deepEqual(result, {});
  assert.deepEqual(saved, [{display_name:'New member',avatar_path:null,onboarding_completed:true,intro_completed:true}]);
});

test('first-time profile is persisted before its optional image upload', async () => {
  const steps: string[] = [];
  await saveProfileWithOptionalImage({}, new File(['image'],'avatar.png',{type:'image/png'}), {
    save: async values => { steps.push(values.avatar_path?'attach image':'save profile'); },
    uploadAvatar: async () => { assert.deepEqual(steps,['save profile']); steps.push('upload'); return 'user/avatar.png'; },
  });
  assert.deepEqual(steps,['save profile','upload','attach image']);
});

test('failed optional upload preserves the saved profile and existing image', async () => {
  let saved = false;
  const result = await saveProfileWithOptionalImage({avatar_path:'user/existing.png'}, new File(['image'],'avatar.png'), {
    save: async values => { saved=true; assert.equal(values.avatar_path,'user/existing.png'); },
    uploadAvatar: async () => { throw new Error('new row violates row-level security policy'); },
  });
  assert.equal(saved,true);
  assert.match(result.imageWarning!,/profile is saved/);
});

test('a failed profile save still fails and never starts the upload', async () => {
  await assert.rejects(saveProfileWithOptionalImage({},new File(['image'],'avatar.png'), {
    save: async () => { throw new Error('Username already exists'); },
    uploadAvatar: async () => { assert.fail('Must not upload before saving profile'); },
  }),/Username already exists/);
});
