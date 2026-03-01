# Ully AI — Product Vision & Roadmap

> This document captures the long-term product direction, strategic priorities,
> and build roadmap for Ully AI. Updated as the vision evolves.
> For technical architecture and dev commands, see CLAUDE.md.

---

## What Ully Is Becoming

Ully started as a coffee companion. The long-term vision is larger:

**Ully is a technical assistance platform for professionals in skilled trades and
supply-chain industries — starting with coffee, expanding to every domain where
expert knowledge is locked inside people's heads and not accessible at the moment
it's needed.**

The core product belief:
> Professionals in the field — a barista dialling in at 6am, a farmer identifying
> leaf rust in a remote plot, a roaster troubleshooting a development plateau —
> need expert-level answers immediately, not after a Google search or a call to a
> consultant. Ully puts that expertise in their pocket.

---

## Positioning

| What Ully is | What Ully is not |
|---|---|
| A technical reference tool for professionals | A general-purpose chatbot |
| Domain-specific, opinionated, expert | Broad, vague, hedging |
| Offline-capable, field-ready | Cloud-dependent |
| Built around a curated knowledge base | Relying solely on AI hallucination |
| A platform connecting a supply chain | A single-use consumer app |

---

## Phase 1 — Ully Coffee (Current)

**Status:** Built. Android APK in internal testing. iOS pending Apple Developer enrollment.

**Who it serves:** Baristas, home enthusiasts, café owners, coffee professionals.

**Core features:**
- AI chat assistant (Claude Sonnet) — coffee-only, no preamble, practical answers
- Personal recipe library
- Curated barista content + blog feed
- Café bookmarking
- Coffee news aggregation (Perfect Daily Grind, Barista Magazine, Daily Coffee News)
- Weather-aware recommendations
- Espresso dial-in assistant with photo analysis

**Launch blocklist:**
- [ ] Apple Developer Program enrollment
- [ ] Google Play Console internal testing sign-off
- [ ] Google Play Console store listing + data safety form
- [ ] Production EAS build (AAB) for Play Store submission

---

## Phase 2 — Offline Knowledge Base

**Status:** Planned post-launch.

**The problem:** Ully currently requires an internet connection for every AI response.
Professionals work in cellars, farms, roasting facilities, and remote locations where
connectivity is unreliable or absent.

**The solution:** A curated, proprietary knowledge base authored from domain expertise,
queryable on-device with no API call required.

### Architecture

```
User question
      ↓
KnowledgeService (SQLite FTS5 — on-device)
      ↓
 offline?  ──YES──▶  Return best KB match as Ully response
      │
      NO
      ↓
Inject top KB match as grounding context into Claude system prompt
      ↓
Claude API response (enhanced by KB context)
```

### Knowledge Base Structure

Each entry:
```json
{
  "id": "espresso-bitter-001",
  "category": "troubleshooting",
  "method": "espresso",
  "question": "Why is my espresso bitter?",
  "tags": ["bitter", "over-extraction", "grind", "temperature"],
  "answer": "Full expert answer here...",
  "related": ["espresso-sour-001", "grind-size-001"]
}
```

### Target Categories (v1 KB)

| Category | Target entries |
|---|---|
| Espresso troubleshooting | 40–50 |
| Filter / pour over methods | 25–30 |
| Equipment maintenance | 30–40 |
| Water chemistry | 15–20 |
| Grinder calibration | 15–20 |
| Milk texturing / latte art | 20–25 |
| Dial-in guides per method | 10–15 |
| Roast basics | 15–20 |
| Café ops / workflow | 15–20 |
| **Total** | **~200 entries** |

### Why this matters

- Reduces Claude API costs — common questions hit the KB, not the API
- Makes Ully field-ready — works anywhere, anytime
- The KB is proprietary — competitors cannot replicate it by using Claude
- Grounds Claude's answers in verified, curated expertise

### Files to create

```
services/KnowledgeService.ts     — SQLite FTS5 search, ranked results
assets/knowledge/coffee.json     — authored knowledge base
hooks/useUllyChat.ts             — small change: KB check before/alongside Claude
```

---

## Phase 2b — User Feedback & Dataset Pipeline

**Status:** Planned post-launch, after offline KB.

**The problem:** The offline KB starts with manually authored entries. To grow it
faster and make it reflect real user questions, Ully needs a voluntary feedback
loop where users contribute Q&A pairs back to the knowledge base.

**What this is not:** Fine-tuning Claude. Anthropic does not allow model fine-tuning
via the API. This is a **feedback pipeline that informs KB authoring** — user
contributions are reviewed by a human (you) and promoted into the offline KB.
Never describe this as "training the AI" in UI copy.

### User-facing flow

```
User asks question → Claude answers
        ↓
Subtle thumbs row appears below response (not a modal)
  👍  👎  · Share to improve Ully
        ↓
User taps "Share to improve Ully"
        ↓
Single confirmation sheet:
  "This Q&A will be sent anonymously to help improve
   Ully's knowledge base. No personal info is included."
  [ Send anonymously ]   [ No thanks ]
        ↓
Q&A pair + metadata written to Firestore feedback collection
        ↓
You review → good entries authored into offline KB
```

### When to show the prompt

Do not ask after every message. Show only when:
- Response is 3+ sentences long
- User has not been prompted in the last 10 messages
- User has not disabled feedback prompts in Settings

### Firestore schema

```
feedback/{autoId}
  question:    string
  answer:      string
  rating:      'helpful' | 'not_helpful'
  shared:      boolean
  method:      string | null    — espresso, pour_over, etc. if detectable
  category:    string | null    — troubleshooting, technique, etc.
  appVersion:  string
  createdAt:   timestamp
  // NO uid, NO email, NO location — anonymous by design
```

### Privacy requirements before shipping

- Explicit opt-in only — never collect silently
- Update `public/privacy.html` to disclose feedback collection
- Update Play Store data safety form — add "App activity → Other
  user-generated content → Collected, not shared with third parties"
- Add feedback opt-out toggle in Settings screen
- Firestore rules must restrict feedback collection to authenticated writes,
  no client reads

### The compounding effect

```
Users share feedback
      ↓
Identify the 20 most frequently asked questions
      ↓
Author those as KB entries with expert-level answers
      ↓
KB entries serve those questions offline at zero API cost
      ↓
Better answers → more sharing → more KB entries → better Ully
```

This is how the proprietary crop-to-cup dataset starts — not with a data
engineering project, but with a feedback button and human curation.

### Files to create

```
components/FeedbackRow.tsx        — thumbs up/down + share prompt UI
services/FeedbackService.ts       — write to Firestore feedback collection
screens/SettingsScreen.tsx        — add feedback opt-out toggle
public/privacy.html               — update to disclose feedback collection
firestore.rules                   — add feedback collection write rules
```

---

## Phase 3 — Ully Roaster

**Status:** Future.

**Who it serves:** Independent roasters, head roasters, Q Graders, green coffee buyers.

**The problem:** Roasters rely on institutional knowledge and expensive software
(Cropster, Artisan) that doesn't offer AI-assisted guidance. Developing profiles for
new green coffees, diagnosing roast defects, and managing blend consistency are
all solved by experience — not tools.

**Core features:**
- Roast profile development assistant — charge temp, first crack prediction, development
- Green coffee intake — origin, variety, process, moisture, density logging
- Cupping score tracking — lot comparison, QC over time
- Blend formulation — target profile matching
- Inventory management — green coffee freshness windows, lot aging
- Roast defect troubleshooting (tipping, scorching, baked, underdeveloped)
- Direct connection to Ully Coffee consumer data — "what are baristas saying about this origin?"

**Why this is Phase 3, not Phase 2:**
- Roasters are reachable and willing to pay ($100–300/month seat)
- Bridges the farm world and the consumer world
- Requires a shared data layer (Firestore) that Phase 1 doesn't have
- Cropster integration or interop may be needed

---

## Phase 4 — Ully Agriculture

**Status:** Future. Requires dedicated resourcing.

**Who it serves:** Smallholder coffee farmers, cooperative managers, agronomists,
farm owners in producing regions (Ethiopia, Colombia, Brazil, Guatemala, Indonesia).

**The problem:** 70%+ of coffee is grown by smallholder farmers with under 5 hectares.
They have almost no purpose-built tech tools. Agronomic knowledge is passed down
verbally or via infrequent extension service visits. Climate change is accelerating
crop stress. Mistakes are expensive. Good information saves harvests.

**Core features:**
- Plant disease identification from photos (coffee leaf rust, CBD, CLR, Anthracnose)
- Soil management — pH, nitrogen, micronutrients, amendment recommendations
- Harvest timing — cherry ripeness assessment via camera
- Processing method guidance — washed vs natural vs honey based on conditions
- Yield forecasting and tracking
- Climate adaptation — altitude shifts, drought response, shade management
- Certification prep — organic, Fair Trade, Rainforest Alliance, UTZ checklists
- Weather integration — hyperlocal forecast impact on harvest decisions

**Technical requirements beyond current Ully stack:**
- Full offline capability — farms have no reliable connectivity
- Multi-language — Spanish, Amharic, Indonesian, Portuguese, Swahili
- Low-bandwidth optimization — images compressed heavily before processing
- Firestore sync when connected — farm records persist across devices/seasons

**Revenue model:**
- Direct to cooperative or farm association (B2B, not individual farmer)
- NGO / impact investment partnerships (USAID, World Bank, Gates Foundation have
  active coffee agriculture programs)
- Importer-funded access — importers pay per farm onboarded for traceability data

---

## The Crop-to-Cup Data Platform

**This is the long-term strategic asset.**

Each Ully vertical captures data at its node of the supply chain:

```
Ully Agriculture
  ↓  farm ID, soil data, variety, process, harvest date, certifications
Ully Logistics (future)
  ↓  lot tracking, shipping conditions, transit time, customs docs
Ully Roaster
  ↓  green coffee intake, roast profile, cupping score, blend use
Ully Coffee (current)
  ↓  barista technique, consumer feedback, brew method preference
```

When this data flows between verticals, Ully becomes a **traceability and quality
correlation platform** — the first tool that connects soil composition and farm
practice to cup quality at scale.

**This dataset does not exist anywhere.** It is Ully's long-term moat.

### Consumer-facing traceability

A barista or consumer scans a QR code on a coffee bag and sees:
- Farm name, region, altitude, farmer name
- Harvest date, processing method, certifications
- Green coffee cupping score
- Roaster's profile notes
- Brewing recommendations from Ully AI

This is demanded by specialty coffee buyers and increasingly required by importers.

---

## Vertical Expansion Beyond Coffee

After proving the model across the crop-to-cup chain, the platform architecture
applies to other skilled trades with the same professional identity + operational
knowledge gap characteristics.

**Prioritisation criteria:**
1. Low liability (advice cannot directly injure or kill)
2. Strong professional community (word of mouth distribution)
3. Underserved by existing software
4. Mobile-first workflow (field, not desk)
5. Willingness to pay for tools that save time

**Target verticals in priority order:**

| Vertical | Professionals served | Key use case |
|---|---|---|
| **Restaurant / F&B** | Chefs, kitchen managers, sommeliers | Kitchen ops, supplier mgmt, recipe scaling, compliance |
| **Independent auto repair** | Mechanics, shop owners | Diagnosis assistance, repair procedures, parts lookup |
| **HVAC / Plumbing / Electrical** | Independent contractors | Troubleshooting, code compliance, part identification |
| **Agriculture (general)** | Farmers, agronomists | Crop disease ID, soil management, yield optimisation |
| **Welding / Fabrication** | Welders, fabricators | Procedure lookup, material compatibility, certification prep |

**Regulated industries (aviation, medical, legal) — approach after Series A:**
These have real opportunity but require legal counsel, compliance frameworks,
and validation processes that are not appropriate until the platform has proven
revenue and dedicated compliance resources.

---

## Business Model & Pricing

### Tier structure

| Tier | Price | What's included |
|---|---|---|
| **Free** | 14-day full Pro trial, then limited | 20 AI messages/day, basic recipe library, news feed |
| **Pro** | $9.99/month or **$79/year** | Unlimited AI, shot history, full dial-in assistant, offline KB |
| **Business** | $24.99/location/month | Everything in Pro + shared recipe library, team dial-in sync, priority support |
| **Technician Lifetime** | $149 one-time (first 100 CTG members) | Full Pro forever — seeding the highest-leverage community |

### Pricing anchors

- $79/year Pro = what Cropster charges **per month** — position this explicitly
- $9.99/month Pro = 33% below Barista Hustle's $15/month individual tier
- $24.99/location Business = a 20-location chain is $500/month MRR from one customer
- Launch with 14-day full Pro trial, not a feature-limited free tier — professionals
  need to experience the full product before committing

### Business model evolution

| Phase | Model | Target price |
|---|---|---|
| v1 Consumer | 14-day Pro trial → freemium conversion | $9.99/month or $79/year |
| v2 Professional | Pro + offline KB + shot history | $14.99/month |
| v3 Business | Location-based team license | $24.99/location/month |
| v4 Roaster | Roaster seat license | $99–299/month/seat |
| v5 Agriculture | Cooperative license (B2B) | $500–2000/month/cooperative |
| Platform | Data licensing + traceability API | Enterprise contract |

---

## 90-Day GTM Plan (March — June 2026)

### Community channels — where to show up

| Channel | Audience | Approach |
|---|---|---|
| **r/espresso** (546K members) | Home baristas, enthusiasts | Post expert troubleshooting threads — no promotion, just knowledge |
| **Barista Hustle Forum** | Serious professionals, Matt Perger community | High-quality methodology posts; most influential professional forum |
| **Coffee Technicians Guild** | Working technicians | Direct outreach, CTG member Pro offer |
| **Home-Barista.com** | Equipment-obsessed enthusiasts | Equipment repair and dial-in threads |
| **Instagram / TikTok** | Barista culture | WoC field content, dial-in videos |
| **Perfect Daily Grind** | Global specialty professionals | Contributed articles, press pitch |
| **Sprudge** | Culture + tech audience | Press pitch — receptive to novel products |
| **Daily Coffee News** | Industry professionals | First press pitch target — most likely to cover solo-founder story |

### Press pitch targets — priority order

1. **Daily Coffee News** — most likely to cover a solo-founder coffee tech launch
   with a technician angle
2. **Sprudge** — covers culture and tech, receptive to novel products
3. **Perfect Daily Grind** — larger audience, higher bar; better for a follow-up
   story post-WoC with user data

**Pitch angle:** *"A working espresso technician built the AI tool the industry has
been waiting for — and it launched at World of Coffee."*

### Influencer targets (post-launch)

- **James Hoffmann** (2.35M YouTube) — does not take paid placements; pitch on
  technical merit only; approach at 3-month mark with established user base
- **Morgan Eckroth** (1M+ YouTube, 2022 US Barista Champion) — most authentic
  professional barista voice; natural Ully user persona

### Week-by-week plan

**March 2026 — Now (6 weeks to WoC)**
- [ ] Register for World of Coffee San Diego at usa.worldofcoffee.org
- [ ] Email CTG at ctg@sca.coffee — introduce Ully, propose free Pro for members
- [ ] Expedite Apple Developer Program enrollment — TestFlight critical for WoC
- [ ] Enroll in SCA professional membership ($100/year — network access)
- [ ] Founder begins posting expertise on r/espresso and Barista Hustle Forum
      (no promotion — genuine knowledge sharing only)
- [ ] Draft three media pitches: Daily Coffee News, Sprudge, Perfect Daily Grind
- [ ] Print 100 QR code cards for Android beta + TestFlight (once live)
- [ ] Start March 15: WoC pre-event content series on Instagram/TikTok

**April 2026 — WoC San Diego (April 10–12)**
- [ ] Attend WoC as professional attendee — target 10 live product demos on the
      show floor with baristas and technicians
- [ ] Collect 5 written or video testimonials from demo users
- [ ] Post daily WoC field reports from a working technician's perspective
- [ ] Press pitches go live the week of April 7
- [ ] Soft public launch: Google Play Store open beta or early access

**May 2026 — Post-WoC consolidation**
- [ ] Publish post-WoC recap (blog or PDG contributed piece)
- [ ] Activate CTG member offer: free 90-day Pro trial for verified CTG members
- [ ] Begin collecting in-app feedback data from beta users
- [ ] Prepare iOS App Store submission based on TestFlight feedback
- [ ] World of Coffee Asia, Bangkok (May 7–9) — press hook, no travel required

**June 2026 — iOS launch + European moment**
- [ ] Submit to App Store — target full iOS availability
- [ ] World of Coffee Europe, Brussels (June 25–27) — "now available globally"
      press story hook
- [ ] Begin small paid social testing on Instagram and Reddit ($500/month,
      performance-oriented, r/espresso and barista-adjacent communities)

### Three product moves to ship before WoC

These are high-leverage, low-engineering-cost changes that make Ully dramatically
more compelling at live demos:

**1. Shift Mode**
One-tap UI switch that sets the AI to maximum brevity — one paragraph max, no
preamble, optimised for on-shift, time-pressure, greasy-hand environments.
Implementation: system prompt flag in `useUllyChat.ts`. Not a new feature — a
mode switch.

**2. Dial-in shot history**
Save each dial-in session to AsyncStorage under `@ully_dialin_{uid}` with
timestamp, grind size, dose, yield, time, taste, and notes. Display as a simple
chronological list in the dial-in screen. Even three sessions of history makes
the app dramatically stickier than any competitor.

**3. "Share this fix" button on diagnostic responses**
After the AI resolves a troubleshooting question, one tap generates a formatted
summary ("Machine: [model]. Issue: [problem]. Fix: [AI response].") and opens
the native Share sheet. Implementation: React Native `Share` API, two lines of
code. Drives organic peer-to-peer distribution among technician networks.

### Key dates — 2026 industry calendar

| Date | Event | Action |
|---|---|---|
| **April 10–12** | World of Coffee San Diego | **Attend. Primary launch window.** |
| May 7–9 | World of Coffee Asia, Bangkok | International press hook |
| June 25–27 | World of Coffee Europe, Brussels | iOS global launch story |
| TBD | CTG Summit 2026 | Single best event for technician ICP |
| October 23–25 | World Barista Championship, Panama City | 6-month story + WBC content push |

---

## What to Build and When

```
NOW
├── Ship Ully Coffee v1 (iOS + Android)
├── Internal testing → Play Store internal track
└── Apple Developer enrollment → TestFlight

NEXT (3–6 months post-launch)
├── Offline knowledge base (Phase 2)
│   ├── Author ~200 KB entries
│   ├── KnowledgeService.ts (SQLite FTS5)
│   └── Wire into useUllyChat.ts
├── Pro subscription tier (RevenueCat integration)
└── User growth — barista community outreach

6–12 MONTHS
├── Ully Roaster (Phase 3)
│   ├── Shared Firestore data layer
│   ├── Roast profile + cupping score features
│   └── Green coffee lot tracking
└── Web dashboard (roasters + importers need desktop)

12–24 MONTHS
├── Ully Agriculture (Phase 4)
│   ├── Offline-first architecture
│   ├── Multi-language support
│   └── Cooperative B2B sales motion
└── Crop-to-cup traceability QR system

24+ MONTHS
├── Logistics / supply chain node
├── Traceability data platform + API
└── First regulated vertical (TBD based on resources)
```

---

## Principles That Do Not Change

1. **Coffee-only** in the coffee product. Domain focus is the product.
2. **No analytics SDK.** No Mixpanel, no Amplitude. Privacy is a feature.
3. **On-device first.** User data stays on the user's device unless they explicitly share it.
4. **No preamble.** Ully answers immediately. Every product built on this platform follows the same rule.
5. **Mobile-first.** Professionals are not at desks. Every feature must work one-handed, outdoors, in a loud environment.
6. **The KB is proprietary.** Curated domain expertise is the moat. Protect it.
