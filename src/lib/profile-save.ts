import type { Json } from './database.types';

type ProfileValues = Record<string, Json | undefined>;
type ProfileSaveDependencies = {
  save: (values: ProfileValues) => Promise<unknown>;
  uploadAvatar: (file: File) => Promise<string>;
};

/** Establish the account profile before Storage checks its active-account policy. */
export async function saveProfileWithOptionalImage(
  values: ProfileValues,
  image: File | undefined,
  dependencies: ProfileSaveDependencies,
): Promise<{ imageWarning?: string }> {
  const profile = {
    ...values,
    avatar_path: values.avatar_path ?? null,
    onboarding_completed: true,
    intro_completed: true,
  };
  await dependencies.save(profile);
  if (!image) return {};

  try {
    const avatar_path = await dependencies.uploadAvatar(image);
    await dependencies.save({ ...profile, avatar_path });
    return {};
  } catch {
    return {
      imageWarning:
        'Your profile is saved. The image could not be added; you can try again later in Settings.',
    };
  }
}
