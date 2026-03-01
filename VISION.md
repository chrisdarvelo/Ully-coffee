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

## Business Model Evolution

| Phase | Model | Target price |
|---|---|---|
| v1 Consumer | Freemium — free tier + Pro subscription | $4.99–9.99/month |
| v2 Professional | Pro tier with KB + advanced features | $14.99–29.99/month |
| v3 Roaster | Business seat license | $99–299/month/seat |
| v4 Agriculture | Cooperative license (B2B) | $500–2000/month/cooperative |
| Platform | Data licensing + traceability API | Enterprise contract |

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
