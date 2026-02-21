import 'dotenv/config';

export default {
  expo: {
    name: 'Ully Coffee',
    slug: 'ully-coffee',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#1A1614',
    },
    updates: {
      url: 'https://u.expo.dev/baf4d91f-12b9-47cd-b0b4-a01aadd37f08',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ullycoffee.app',
      infoPlist: {
        NSCameraUsageDescription:
          'Ully uses your camera to scan coffee equipment parts and analyze espresso extractions for dial-in suggestions.',
        NSPhotoLibraryUsageDescription:
          'Ully uses your photo library to upload photos of coffee equipment and espresso extractions for AI analysis.',
        NSLocationWhenInUseUsageDescription:
          'Ully uses your location to recommend local cafes, roasteries, and weather-appropriate coffee drinks.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1A1614',
      },
      package: 'com.ullycoffee.app',
      versionCode: 1,
      permissions: ['CAMERA', 'ACCESS_COARSE_LOCATION'],
    },
    plugins: [
      'expo-secure-store',
      'expo-asset',
      'expo-font',
      [
        'expo-camera',
        {
          cameraPermission:
            'Ully uses your camera to scan coffee equipment parts and analyze espresso extractions for dial-in suggestions.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Ully uses your photo library to upload photos of coffee equipment and espresso extractions for AI analysis.',
        },
      ],
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Ully uses your location to recommend local cafes, roasteries, and weather-appropriate coffee drinks.',
        },
      ],
      [
        'expo-speech-recognition',
        {
          microphonePermission:
            'Ully Coffee needs microphone access for voice input.',
          speechRecognitionPermission:
            'Ully Coffee needs speech recognition to convert your voice to text.',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'baf4d91f-12b9-47cd-b0b4-a01aadd37f08',
      },
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      appCheckSiteKey: process.env.APP_CHECK_SITE_KEY,
      appCheckDebugToken: process.env.APP_CHECK_DEBUG_TOKEN,
    },
  },
};
