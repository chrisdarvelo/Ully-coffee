import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
// @ts-expect-error getReactNativePersistence is available at runtime via the react-native export condition
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.rn';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getFunctions } from 'firebase/functions';
import type { Functions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey as string,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain as string,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId as string,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket as string,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId as string,
  appId: Constants.expoConfig?.extra?.firebaseAppId as string,
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;
// Guard against re-initialization on hot reload / Fast Refresh
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}
const functions: Functions = getFunctions(app);

// Firebase App Check
const appCheckSiteKey = Constants.expoConfig?.extra?.appCheckSiteKey as string;
if (__DEV__) {
  if (typeof (global as any).self !== 'undefined') {
    (global as any).self.FIREBASE_APPCHECK_DEBUG_TOKEN =
      Constants.expoConfig?.extra?.appCheckDebugToken || true;
  }
}

try {
  if (appCheckSiteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }
} catch {
  // App Check init may fail in some environments (e.g. Expo Go)
}

export { app, auth, functions };
