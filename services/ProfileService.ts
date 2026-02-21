import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './FirebaseConfig';
import { UserProfile } from '../types';

const KEY_PREFIX = '@ully_profile_';

function profileKey(uid: string): string {
  return `${KEY_PREFIX}${uid}`;
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  try {
    const json = await AsyncStorage.getItem(profileKey(uid));
    return json ? JSON.parse(json) as UserProfile : null;
  } catch {
    return null;
  }
}

export async function saveProfile(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
  const existing = await getProfile(uid);
  const profile: UserProfile = {
    uid,
    email: auth.currentUser?.email ?? existing?.email ?? null,
    onboarded: true,
    ...existing,
    ...data,
    onboarded: true,
  };
  await AsyncStorage.setItem(profileKey(uid), JSON.stringify(profile));
  return profile;
}

export async function isOnboarded(uid: string): Promise<boolean> {
  const profile = await getProfile(uid);
  return profile?.onboarded === true;
}
