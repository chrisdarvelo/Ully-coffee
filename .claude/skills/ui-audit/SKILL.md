---
name: ui-audit
description: Frontend design audit for Ully Coffee. Reviews screens and components for design token compliance, visual consistency, accessibility, and React Native patterns. Use when reviewing a screen, component, or before shipping a UI change.
argument-hint: [file or component name]
---

Perform a thorough frontend and design audit of $ARGUMENTS (or the most recently discussed screen/component if no argument given).

Read the target file(s) before auditing. Also read `utils/constants.ts` to verify token usage.

---

## 1. Design Token Compliance

Check every hardcoded color, font, or spacing value.

**Colours — nothing hardcoded. All values must come from `Colors` or `AuthColors`:**
- `Colors.primary` = `#C8923C` — crema gold, primary actions and highlights
- `Colors.background` = `#0E0C0A` — screen background
- `Colors.card` = `#1A1614` — card/surface
- `Colors.text` = `#FFFFFF`
- `Colors.textSecondary` = `#A09888` — secondary labels, hints
- `Colors.border` = `#2A2218`
- `Colors.danger` = `#E74C3C`
- `Colors.tabBar` / `Colors.tabInactive`
- `AuthColors.*` — auth screens only

Flag any raw hex, `rgb()`, or named colour string not from the token set.

**Typography — all `fontFamily` must use `Fonts.mono` or `Fonts.header`:**
- `Fonts.mono` — default for all body, labels, buttons, hints
- `Fonts.header` — section headers only (heavy weight, feed-style)
- `Fonts.retro` — brand wordmark on auth screens only
- Flag any hardcoded font string or missing `fontFamily`.

**No hardcoded spacing magic numbers** — flag values that aren't consistent with the existing rhythm (multiples of 4/8 px).

---

## 2. Visual Consistency

- Does the screen use `PaperBackground` or `Colors.background` as the root background? It must — never white or a custom dark value.
- Are card surfaces using `Colors.card` with `borderWidth: 1` and `borderColor: Colors.border`?
- Are `borderRadius` values consistent with the rest of the app (8–14px range)?
- Are primary action buttons using `GoldGradient` or `Colors.primary` fill with `AuthColors.buttonText` (`#0E0C0A`) for text?
- Are destructive actions using `Colors.danger`?
- Is the espresso-crema dark aesthetic preserved? Flag anything that looks light-mode, colourful, or off-brand.

---

## 3. Layout & Spacing

- Does the screen handle safe areas? (`useSafeAreaInsets` or `SafeAreaView`)
- Does scroll content have adequate `paddingBottom` so nothing is clipped by the tab bar?
- Are interactive touch targets at least 44×44pt?
- Is there consistent horizontal padding (typically 24px) on full-width sections?
- Does the screen handle the keyboard correctly for inputs? (`KeyboardAvoidingView` with platform-aware `behavior`)

---

## 4. Accessibility

- Do all `TouchableOpacity` elements have `activeOpacity` set (typically 0.7)?
- Do icon-only buttons have an `accessibilityLabel`?
- Are `accessibilityRole` props set on interactive elements where role is not implicit?
- Is there sufficient colour contrast for text on card surfaces?
- Are loading states communicated (`accessibilityLiveRegion` or descriptive text)?

---

## 5. React Native Patterns

- Are `FlatList` / `ScrollView` used appropriately? (`FlatList` for long dynamic lists, `ScrollView` for short static content)
- Do `FlatList` items have stable `keyExtractor` functions (not array index)?
- Are `useCallback` / `useMemo` used where renders could be expensive?
- Is `useFocusEffect` used (instead of `useEffect`) for data that should refresh on tab focus?
- Are there any inline function definitions inside JSX that create new references on every render for expensive children?
- Is image loading handled gracefully (placeholder, error state)?

---

## 6. State & Data

- Is local UI state (`useState`) kept minimal — only what can't be derived?
- Are async operations guarded against unmounted-component updates?
- Is the loading state shown for any operation that can take >200ms?
- Are error states surfaced to the user (not silently swallowed)?

---

## 7. TypeScript

- Are all props typed (no `any` on component props, route, navigation)?
- Are navigation props using `NativeStackScreenProps` / `BottomTabScreenProps` with the correct param list?
- Are event handler parameters typed (not `(e: any)`)?

---

## Output Format

Organise your findings under these headings. Only include headings where issues exist.

### Critical
Issues that break functionality, cause crashes, or violate the design system in a user-visible way.

### Design
Visual inconsistencies, hardcoded tokens, off-brand choices.

### Accessibility
Missing labels, low contrast, inadequate touch targets.

### Code Quality
TypeScript gaps, React anti-patterns, avoidable re-renders.

### Looks Good
Brief note on what's well done — keep it short.

Be specific: include the line number and the exact fix for each finding.
