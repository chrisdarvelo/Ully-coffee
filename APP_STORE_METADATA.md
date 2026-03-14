# Ully Coffee — App Store Metadata

## App Name
Ully AI

## Subtitle (30 chars max)
Espresso Mastery & Certification

## Category
Primary: Food & Drink
Secondary: Education

## Description

Ully AI is the professional training and co-pilot platform for espresso machine mastery — building baristas who know their machine the way a pilot knows their plane.

Most baristas learn to make coffee. Ully builds baristas who understand pressure, temperature, thermodynamics, and machine systems at instrument level — and can troubleshoot, calibrate, and maintain their equipment on the spot without calling a technician.

**AI Machine Technician**
Ask Ully about boiler behavior, OPV calibration, solenoid diagnostics, pressure curves, flow profiling, PID tuning, group head maintenance, and more. Get direct, technical answers — no hedging, no guessing. Upload a photo of your espresso pour for instant extraction diagnosis.

**The Pilot Certification Program**
Ully Learn is a structured 40-stage mastery curriculum that takes baristas from first espresso to Certified Espresso Pilot. Four tiers — Amateur, Barista, Hero, Champion — each with progressive lessons and AI-evaluated open-ended examinations. Pro ($7.99/month) unlocks all four tiers. The Certified Espresso Pilot credential is a premium add-on — an AI-conducted examination and exportable certificate that proves instrument-level machine mastery.

**For Café Owners and Managers**
A Ully-certified barista can change gaskets, recalibrate pressure, and diagnose machine failures at the bar — eliminating $200–$800 technician callouts. Owners can purchase certification for their team directly, and track every barista's progress and competency gaps on the Ully Business Platform.

**Privacy First**
No ads, no tracking, no analytics SDKs. Photos are analyzed in real-time and never stored. Chat history stays on your device.

## Keywords (100 chars max)
espresso,barista,machine,pressure,boiler,certification,dial-in,extraction,coffee,pilot

## Support URL
https://ullyapp.com

## Support Email
support@ullyapp.com

## Marketing URL (optional)
https://ullyapp.com

---

## Apple Privacy Nutrition Labels

### Data Linked to You

| Data Type | Purpose | Details |
|-----------|---------|---------|
| Email Address | App Functionality | Firebase Auth — account creation and login |
| Other User Content | App Functionality | Profile info (display location, favorite shops), recipes, cafe bookmarks — stored in Firebase linked to account |

### Data Not Linked to You

| Data Type | Purpose | Details |
|-----------|---------|---------|
| Photos or Videos | App Functionality | Sent directly to Anthropic API for real-time analysis; not stored on any server |
| Other User Content | App Functionality | Chat messages with AI — stored locally on device only, never transmitted to our servers |

### Data NOT Collected
- Precise Location
- Coarse Location (user types a city name manually — this is user content, not device location)
- Health & Fitness
- Financial Info
- Contacts
- Browsing History
- Search History
- Identifiers (no device ID, ad ID, etc.)
- Diagnostics
- Usage Data (no analytics SDK)
- Purchases

### Tracking Declaration
**This app does not track users.** No data is shared with data brokers, no ad networks, no analytics platforms.

### Notes for Apple Review
- Date of birth is collected at signup for age verification (13+) but is NOT stored on any server — it is only used client-side to calculate age and is discarded.
- Photos sent to Anthropic API are processed under Anthropic's API terms: inputs are not used for model training and are retained only briefly for trust & safety.
- All user content (recipes, cafes, profile) is stored in Firebase and linked to the authenticated user.
- Chat history is stored in AsyncStorage on-device only.
- No third-party analytics, advertising, or tracking SDKs are used.
- Camera and photo library access are used solely for AI-powered coffee equipment scanning and espresso extraction analysis.

---

## Google Play Store

### Short Description (80 chars max)
Espresso mastery & certification — know your machine like a pilot knows their plane.

### Full Description
(Use the same App Store description above.)

### Category
Food & Drink

### Content Rating
Everyone (no objectionable content)

### Data Safety
- **Data shared with third parties:** Photos shared with Anthropic API for analysis (not stored)
- **Data collected:** Email address, user-created content (profile, recipes, cafes)
- **Security:** Data encrypted in transit (HTTPS), Firebase encryption at rest
- **Data deletion:** Users can request account deletion via support@ullyapp.com (in-app deletion flow planned)

---

## Screenshots Needed

### iPhone 6.7" (iPhone 14 Pro Max — 1290x2796)
1. Home screen with recipes, news, baristas sections populated
2. AI chat conversation showing coffee help
3. Camera scan view with the scan frame overlay
4. Recipe detail screen with procedural art cover
5. Barista detail screen with blog posts

### iPhone 5.5" (iPhone 8 Plus — 1242x2208)
Same 5 screens at this resolution.

### iPad (optional, if supportsTablet stays true)
Same screens at iPad resolution.

### Android (Play Store — min 2, max 8)
Same screens, taken on Android device/emulator.

---

## support@ullyapp.com Setup

Options:
1. **Domain email forwarding** — Forward support@ullyapp.com to your personal email via your domain registrar (Namecheap, Cloudflare, Google Domains, etc.)
2. **Google Workspace** — Full inbox at ~$6/mo
3. **Zoho Mail free tier** — Free custom domain email (1 user)
4. **Cloudflare Email Routing** — Free forwarding if domain is on Cloudflare
