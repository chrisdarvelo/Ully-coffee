<div align="center">
  <img src="./assets/icon.png" alt="Ully AI" width="120" />

  <h1>Ully AI</h1>
  <p><em>Brewing at the edge of technology.</em></p>

  <p>
    <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey?style=flat-square" />
    <img src="https://img.shields.io/badge/expo-SDK%2054-black?style=flat-square&logo=expo" />
    <img src="https://img.shields.io/badge/react%20native-0.81-61DAFB?style=flat-square&logo=react" />
    <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript" />
    <img src="https://img.shields.io/badge/firebase-functions%20v2-FFCA28?style=flat-square&logo=firebase" />
    <img src="https://img.shields.io/badge/AI-Claude%20Sonnet-blueviolet?style=flat-square" />
    <img src="https://img.shields.io/badge/version-1.0.0-C8923C?style=flat-square" />
  </p>
</div>

---

## What is Ully AI?

Ully AI is a mobile companion for baristas and coffee enthusiasts. Dial-in your espresso, troubleshoot your equipment, and build your craft — with an AI assistant that knows coffee as well as you do.

Free to download. Pro at **$7.99/month** — unlimited AI, full dial-in assistant, recipe library, and skill tracking.

> Part of the Ully platform. For cafe and business operations, see [Ully Business Platform](https://github.com/chrisdarvelo/ully-web).

---

## Features

| Feature | Description |
|---|---|
| **AI Chat** | Coffee-only assistant — espresso, brewing, equipment, origins, latte art, and more |
| **Espresso Dial-In** | Upload or capture photos of espresso pours for AI extraction analysis |
| **Troubleshoot** | Diagnose equipment issues and get step-by-step fix guidance |
| **Recipe Library** | Personal recipe collection with procedural generative art covers |
| **Weather Context** | AI recommendations adapt to your local weather and location |
| **Voice Input** | Speak your questions directly to Ully |

---

## Ully Learn — Apprentice System (Phase 1b)

*Designed. Not yet built.*

**"SCA in your Pocket"** — a progressive coffee apprenticeship embedded in the app.
SCA courses cost $500+. Ully Learn delivers the same career-ladder progression
on your phone, powered by AI-driven conversational quizzes instead of multiple-choice.

### Tier structure

| Tier | Stages | Target |
|---|---|---|
| Amateur | 10 | Home enthusiasts, new to specialty |
| Barista | 10 | Aspiring and working café staff |
| Hero | 10 | Experienced professionals, senior baristas |
| Champion | 10 | Competition-level — WBC caliber |

### The quiz format is the moat

Ully doesn't ask "Which grind size for espresso?" It asks:
*"You're pulling 18g in, 32g out in 35 seconds and it tastes sour. Walk me through your next adjustments."*
Claude evaluates the response — open-ended, evaluative, not guesssable.

### The business case for cafés

Replacing a barista costs ~$3,000. Rank gives managers a visible, evidence-based
signal for who's ready to advance — and a clear hook for retention:
*"You don't touch the machine until you hit Hero rank."*

On the Business Platform, ranks surface as a **Competency Map** — a heat map of
each team member's skill strengths and gaps, tied to promotions and pay grades.

> See `VISION.md` → Phase 1b for full architecture, technical risks, and web integration spec.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 (React Native 0.81) |
| Language | TypeScript (strict) |
| Navigation | React Navigation 7 — native stack + bottom tabs |
| State | Zustand (`authStore`, `profileStore`) |
| Server State | TanStack React Query v5 |
| Auth | Firebase Authentication (email/password) |
| Backend | Firebase Cloud Functions v2 (Node 22) |
| AI | Anthropic Claude Sonnet via Cloud Function proxy |
| Local Storage | AsyncStorage — all user data (recipes, profile, cafes, follows, chat) |
| Media | Firebase Storage — user uploads under `users/{uid}/` |
| Build & Deploy | EAS Build + EAS Submit |

> All user data lives in **AsyncStorage on-device**. The Claude API key is stored exclusively in Firebase Secret Manager — it never touches the client bundle.

---

## Architecture Overview

```
App.tsx
├── (unauthenticated) → AuthNavigator
│   ├── WelcomeScreen
│   ├── LoginScreen
│   ├── SignUpScreen
│   └── PrivacyPolicyScreen
│
└── (authenticated) → AppNavigator
    ├── OnboardingScreen       ← shown once after signup
    ├── TabNavigator           ← 3 tabs: Home · AI · Profile
    │   ├── HomeScreen         ← Recipes, News, Baristas, Cafes (React Query)
    │   ├── AIScreen           ← Ully AI chat + camera + voice input
    │   └── SettingsScreen     ← Account, preferences, delete account
    ├── RecipeDetailScreen
    ├── BaristaDetailScreen
    └── CafeDetailScreen
```

### Cloud Functions

| Function | Purpose |
|---|---|
| `chatWithUlly` | Proxies Claude Sonnet API — key held in Secret Manager |
| `wipeUserData` | Deletes all Firestore docs + Storage folder on account deletion |

---

## Getting Started

### Prerequisites

- Node 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/eas/) (`npm install -g eas-cli`)
- Firebase project with Authentication, Cloud Functions, and Storage enabled

### Installation

```bash
git clone https://github.com/chrisdarvelo/Ully.app.git
cd Ully-app
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
APP_CHECK_SITE_KEY=
APP_CHECK_DEBUG_TOKEN=
```

> The Claude API key is **not** in `.env`. Add it to Firebase Secret Manager as `CLAUDE_API_KEY`.

### Run Locally

```bash
npx expo start            # Start Metro bundler
npx expo start --android  # Open on Android device/emulator
npx expo start --ios      # Open on iOS simulator
npx expo start --clear    # Clear Metro cache and start
```

---

## Build & Deploy

### Preview Build (internal testing)

```bash
eas build --platform android --profile preview   # Generates APK
```

### Production Build

```bash
eas build --platform android --profile production  # Signed AAB for Play Store
eas build --platform ios --profile production      # IPA for App Store
eas build --platform all --profile production      # Both platforms
```

### Submit

```bash
eas submit --platform android   # Submit to Google Play Console
eas submit --platform ios       # Submit to App Store Connect
```

### Firebase

```bash
firebase deploy                                 # Deploy everything
firebase deploy --only firestore:rules,storage  # Rules only
firebase deploy --only functions                # Cloud Functions only
firebase emulators:start                        # Local emulator
```

---

## Testing

```bash
npm test                  # Run all Jest unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

E2E tests use [Maestro](https://maestro.mobile.dev/) and require a running device or simulator:

```bash
npm run e2e               # Full happy path
npm run e2e:login         # Login flow
npm run e2e:ai            # AI dial-in flow
npm run e2e:recipe        # Save recipe flow
```

---

## Privacy

- **No analytics SDK** — no Mixpanel, Amplitude, or Firebase Analytics
- **No ad network**
- **Photos are never stored** — images go directly to the Claude API and are not persisted server-side
- **Chat is on-device only** — all conversation history stays in AsyncStorage, never transmitted to Ully servers
- **Age gate at signup** — date of birth is used client-side for a 13+ check only, not stored

---

## Project Structure

```
├── App.tsx                  # Root: auth gate, QueryClient, NavigationContainer
├── app.config.js            # Expo config — version, permissions, EAS project ID
├── navigation/              # Stack + tab navigators and type exports
├── screens/                 # All app screens
├── components/              # Reusable UI components
├── hooks/                   # useUllyChat, useCamera
├── services/                # Firebase, Claude, AsyncStorage service layer
├── store/                   # Zustand auth + profile stores
├── types/                   # Shared TypeScript interfaces
├── utils/                   # Colors, fonts, validation, media utils
├── functions/               # Firebase Cloud Functions (Node 22)
└── __tests__/               # Jest unit tests
```

---

## Contact

Support: [support@ullyapp.com](mailto:support@ullyapp.com)

---

<div align="center">
  <sub>Brewing at the edge of technology ☕</sub>
</div>
