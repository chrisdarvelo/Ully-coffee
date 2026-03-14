<div align="center">
  <img src="./assets/icon.png" alt="Ully AI" width="120" />

  <h1>Ully AI</h1>
  <p><em>Know your machine the way a pilot knows their plane.</em></p>

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

Ully AI is the professional training and co-pilot platform for espresso machine mastery.

Pilots don't guess. They read instruments — pressure, temperature, system state — and
diagnose problems in real time without leaving the cockpit. Ully builds that barista.
Not someone who makes good coffee. Someone who understands the boiler, the OPV, the
solenoid, the flow meter, and the thermodynamics behind every shot — and can troubleshoot
at the bar, mid-service, without calling a technician.

Free to download — includes Amateur Stages 1–3 of Ully Learn forever, plus a **14-day
full Pro trial** on first signup. Pro at **$7.99/month** — unlimited AI and all 40
learning stages. The **Certified Espresso Pilot** credential is a premium add-on,
available individually or purchased by owners for their team.

> Part of the Ully platform. For café and business operations, see [Ully Business Platform](https://github.com/chrisdarvelo/ully-web).

---

## Features

| Feature | Description |
|---|---|
| **AI Co-Pilot** | Coffee-only assistant with deep machine knowledge — espresso, equipment, boilers, pressure, valves, thermodynamics |
| **Espresso Dial-In** | Upload or capture photos of espresso pours for AI extraction analysis and diagnosis |
| **Machine Troubleshoot** | Diagnose equipment issues at instrument level — OPV, solenoid, group head, temperature stability |
| **Pilot Certification** | Progressive mastery program: Amateur → Barista → Hero → Certified Espresso Pilot |
| **Weather Context** | AI recommendations adapt to your local weather and location |
| **Voice Input** | Speak your questions directly to Ully |

---

## Ully Learn — The Pilot Certification Program

*Designed. Not yet built.*

**"Know your machine the way a pilot knows their plane."**

Ully Learn is a structured professional certification program — the first credential
in the industry built for instrument-level espresso machine mastery, evaluated by AI
conversation instead of multiple-choice tests. This is not a Duolingo alternative.
This is the new industry standard for what a certified barista should know and prove.

A barista who has earned the Ully Champion certification can:
- Diagnose a pressure drop or temperature instability mid-service and fix it on the spot
- Change gaskets, rebuild group heads, calibrate OPV settings, and interpret boiler behavior
- Train junior staff through a structured, testable curriculum
- Produce evidence of their skill level that any owner can verify

That barista is worth more. They get promoted. Their certification means something —
because it was earned through open-ended AI examination, not multiple-choice trivia.

### The Pilot Path

| Tier | Who it's for | Focus |
|---|---|---|
| Amateur | Home enthusiasts, new to specialty | Coffee fundamentals, palate, first espresso |
| Barista | Aspiring and working café staff | Dial-in, extraction science, milk, workflow |
| Hero | Experienced professionals, senior baristas | Machine systems, pressure, temperature, thermodynamics, team leadership |
| Champion | Competition-level, machine experts | Advanced thermodynamics, maintenance, certification examination |

**Champion = Certified Espresso Pilot.** 40 stages total.

### The Quiz Format Is the Moat

Ully doesn't ask "What is the ideal OPV setting?" It asks:

*"Your machine is pulling inconsistent extraction times and your pressure gauge is
peaking at 11 bar. Walk me through your diagnosis and what you'd adjust first."*

Claude evaluates the response — open-ended, evaluative, not guessable. This cannot
be scraped or auto-completed. It is a world-first integration of conversational AI
into structured professional certification.

### The Business Case for Café Owners

> A single technician callout costs $200–$800. A barista who can diagnose a pressure
> drop, replace a group head gasket, or recalibrate the OPV on the spot eliminates
> that cost entirely. Ully Learn builds that barista. The certification proves it.

On the Business Platform, ranks surface as a **Competency Map** — a heat map of
each team member's machine knowledge, tied to promotions and pay grades.

> See `VISION.md` for full architecture, stage curriculum, and web integration spec.

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
    │   ├── HomeScreen         ← Clean landing: logo + greeting + "ask ully" CTA
    │   ├── AIScreen           ← Ully AI chat + camera + voice input
    │   └── SettingsScreen     ← Account, preferences, delete account
    └── PrivacyPolicyScreen
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
  <sub>Know your machine the way a pilot knows their plane.</sub>
</div>
