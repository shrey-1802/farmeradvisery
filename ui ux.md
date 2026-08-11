# Krishi Sahayak — Master UI/UX Design Prompt
### "Digital Krishi + Nature" — Light Theme Edition
*(Structural inspiration from reference dark-theme template, re-skinned for a warm, trustworthy, farmer-first light UI)*

---

## 0. HOW TO USE THIS PROMPT

This is a single, self-contained prompt you can paste into any AI design/build tool (Claude, v0, Lovable, Figma AI, Cursor, etc.) to generate the full Krishi Sahayak product. It merges two inputs:

1. **Reference template screenshot** — gave us the *structural DNA*: a pill-based location switcher, a trust badge, a bold two-line headline, a hero image of a real farmer in a field, and a prominent chat/search bar acting as the primary CTA.
2. **Core Design Direction doc** — gave us the *full 14-phase product spec* (landing → login → onboarding → dashboard → AI chat → disease scan → weather → farm map → schemes → expert help → profile → settings → PDF report).

The instruction below fuses both into ONE light-themed, green+beige visual system.

---

## 1. BRAND POSITIONING

**Product name:** Krishi Sahayak (कृषि सहायक — "Farming Companion")
**One-liner:** An AI-powered crop advisory platform that feels less like a SaaS dashboard and more like a trusted neighbor who understands farming.
**Emotional target:** Calm, dependable, dignified — never flashy, never condescending toward the farmer's intelligence.
**Anti-goal:** Do not let this look like a fintech or corporate analytics dashboard. No dense data grids, no dark glassmorphism, no aggressive gradients.

---

## 2. THEME CONVERSION — DARK REFERENCE → LIGHT "KRISHI + NATURE"

The reference screenshot uses a near-black canvas with a deep forest-green navbar and neon-green headline text. We keep its **layout logic** (pill nav, badge, two-line bold headline, split hero, chat-bar-as-CTA) but invert the palette entirely to a warm, sunlit, paper-like light theme.

| Reference element (dark) | Krishi Sahayak translation (light) |
|---|---|
| Near-black page background | Warm off-white / soft beige canvas |
| Forest-green navbar bar | Same forest green navbar — now the *anchor* of contrast on a light page |
| Neon/bright green headline | Deep forest-green headline on beige — still bold, but earthy not neon |
| Dark card with white text (chat box) | Cream/white card with soft shadow, dark-green text, sits *inside* the hero |
| Location pill (dark, green border) | Beige pill, green border, green icon — same shape language |
| "Official Digital Assistant" badge | Sunlight-amber badge on cream — softened, still a trust signal |
| Full-bleed photographic hero (farmer in field) | Keep exactly this — real farmer photography is the single best trust device on this page |

---

## 3. COLOR SYSTEM

Use CSS variables so theming stays consistent across all 14 phases.

```css
:root {
  /* Core greens — primary brand */
  --krishi-green-900: #1B3B2C;   /* navbar bg, headings, primary text-on-light */
  --krishi-green-700: #2F5D3A;   /* primary buttons, active states */
  --krishi-green-600: #3E7A4C;   /* hover, secondary buttons */
  --krishi-green-100: #E4EFE3;   /* soft green surface / chip bg */

  /* Beige / earth — surfaces */
  --krishi-beige-50:  #FBF8F1;   /* page background */
  --krishi-beige-100: #F4EEDF;   /* card background */
  --krishi-beige-200: #EAE1C9;   /* borders, dividers */
  --krishi-earth-500: #8C6B4F;   /* soil/earth accent, icons */

  /* Sunlight accent */
  --krishi-amber-400: #E8A93B;   /* badges, highlights, CTAs (secondary) */
  --krishi-amber-100: #FBEBCB;   /* badge background */

  /* Weather / sky accent */
  --krishi-sky-500: #4F8FBF;
  --krishi-sky-100: #E3EFF7;

  /* Status */
  --krishi-success: #3E7A4C;
  --krishi-warning: #D97706;     /* restrained amber-orange, not harsh red */
  --krishi-danger:  #B94A3C;     /* muted brick red — used sparingly */

  /* Text */
  --text-primary:   #1E2B22;
  --text-secondary: #5B6B5F;
  --text-on-green:  #FBF8F1;

  /* Shadow */
  --shadow-soft: 0 4px 16px rgba(27, 59, 44, 0.08);
  --shadow-card: 0 2px 10px rgba(27, 59, 44, 0.06);
}
```

**Dark mode variant** (per Phase 13 settings): invert to `--krishi-green-900` as background, `--krishi-beige-50` as text, keep amber accent identical — dark mode should feel like "farm at dusk," not "black SaaS panel."

---

## 4. TYPOGRAPHY

- **Headings:** A humanist rounded-serif-adjacent or friendly geometric sans — e.g. **Poppins SemiBold/Bold** or **Fraunces** for hero headlines (adds warmth/craft), **Inter / Poppins** for everything else.
- **Body:** **Inter** or **Noto Sans** — Noto Sans is critical because it must render Hindi (Devanagari) and Gujarati scripts cleanly for the language switcher.
- **Scale (mobile-first, generous for low-vision rural users):**
  - H1 (hero): 32–40px, bold
  - H2 (section): 24–28px, semibold
  - Body: 16–18px minimum — never below 16px anywhere
  - Button label: 16–18px, medium/semibold
  - Caption/meta: 14px minimum
- **Line height:** 1.5–1.6 for body, 1.2–1.3 for headings.
- Multi-script fallback stack: `'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Gujarati', Inter, sans-serif`.

---

## 5. LAYOUT & SPACING SYSTEM

- **Grid:** 12-col desktop, 8-col tablet, 4-col mobile. Max content width 1280px, generous side padding (24px mobile, 64px+ desktop).
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 (px) — nothing cramped. Rural/outdoor usage means fat-finger tolerance matters.
- **Corner radius:** 16–20px on cards, 12px on inputs, 999px (full pill) on badges/tags/chips — mirrors the pill shapes seen in the reference nav.
- **Shadows:** soft, diffused, warm-tinted (never pure black) — `--shadow-soft` / `--shadow-card` above.
- **Touch targets:** minimum 48×48px on all interactive elements, mobile especially.

---

## 6. NAVIGATION SYSTEM (directly adapted from reference)

### Desktop Top Nav
A solid forest-green (`--krishi-green-900`) bar, full width, sticky on scroll — exactly like the reference's navbar band, but now sitting on a beige page instead of black.

Left to right:
1. Logo mark (leaf icon in rounded green-100 tile) + "Krishi Sahayak" wordmark in white
2. **Location pill** — beige/cream pill, green border, pin icon + district name + chevron (e.g. "📍 Palakkad ▾") — tappable to change location, exactly the pattern in the reference
3. Nav links (beige/white text on green): Dashboard · My Farm · Crop Advisory · Disease Scanner · Weather · Government Schemes · Expert Help · AI Assistant
4. Language selector pill (🌐 English ▾)
5. Profile pill/avatar (rounded, green outline)

Active nav item: underline or filled amber pill.

### Mobile Bottom Nav
Fixed bottom bar, beige background, 5 icons with labels: **Home · My Farm · Scan · AI · Profile**. Active icon in filled green pill; inactive in muted earth-gray. Floating circular **AI assistant button** (amber, leaf/chat icon) anchored above the bottom nav on scroll, mirroring the reference's persistent-assistant feel.

---

## 7. LANDING PAGE (Phase 1) — Hero, re-themed from reference

**Layout:** Split hero, same bones as the reference screenshot — left column text+CTA+chat bar, right column full-bleed photographic image — but now on a light beige canvas.

1. **Trust badge** (top-left, above headline): amber-100 pill, amber-400 border, small shield/leaf icon + "Trusted by Farmers Across India" — softened version of the reference's "Official Digital Assistant" badge.
2. **Headline** (2-line, bold, forest-green on beige): **"Your Farm. Your Data. Smarter Decisions."** — large, 36–44px desktop.
3. **Subtitle** (text-secondary, 18px): "AI-powered crop advisory for better farming decisions."
4. **Primary CTA:** solid green-700 button, white text, pill/rounded-lg, "Get Started →"
5. **Secondary CTA:** ghost button, green border, green text, "Learn How It Works"
6. **Inline mini-chat card** (optional, echoing reference's embedded search bar): a cream card with soft shadow sitting just below the CTAs — placeholder text "Ask Krishi AI... e.g. Why are my wheat leaves turning yellow?" with mic + camera + send icons in green-700 — this doubles as a live product teaser right on the landing page.
7. **Right-side hero image:** full-bleed, rounded-corner (24px) photo of a real Indian farmer in a green field holding a phone/tablet, warm natural daylight grading (not the moody dark grading of the reference — bright, optimistic, golden-hour or fresh-morning light). Small floating location chip on the image itself (e.g. "📍 Central India Rice Bowl") for context, matching the reference's overlay chip.
8. **Feature strip** below hero: 6 icon-cards in a row (2×3 mobile), rounded-16px, beige-100 bg, green icon circle: 🌱 Personalized Crop Advisory · 🌦 Live Weather Intelligence · 📷 AI Disease Detection · 🤖 AI Farmer Assistant · 👨‍🌾 Expert Support · 🏛 Government Schemes.

---

## 8. LOGIN & OTP (Phase 2)

Centered card (max 420px) on beige canvas, generous whitespace, small farm illustration above the form (line-art style, green/earth tones, not photographic — keep this screen light and fast-loading).

- Title: "Welcome, Farmer 👋" — 24px semibold
- Mobile number input: large (56px height), rounded-12px, green focus ring
- CTA: full-width green-700 button "Send OTP"
- OTP screen: 6 individual boxes (48×56px each), auto-advance, green active border, amber success flash on correct entry
- "Resend OTP" (text link, green) · "Change number" (text link, muted) · "Verify & Continue" (primary button)

---

## 9. ONBOARDING WIZARD (Phase 3)

**Progress stepper** at top: 5 segments, filled green for completed, beige-200 for pending, amber for current — pill-shaped, horizontally scrollable on mobile.

Each step = single-focus full-height card, one question per screen, big touch targets, "Back / Continue" footer bar sticky at bottom (mobile).

- **Step 1 – Farmer Details:** name + mobile, simple text inputs
- **Step 2 – Farm Location:** pincode/state/district/village dropdowns + **"Use Current Location 📍"** button (amber-100 bg, location icon) → reveals a small embedded map preview card (rounded-16px, green pin marker) once resolved
- **Step 3 – Land Details:** oversized numeric stepper input for acreage, unit label "acres" fixed beside it
- **Step 4 – Soil Type:** 7 selectable illustrated cards in a 2-col (mobile) / 4-col (desktop) grid — each card: soil-texture icon/illustration, label, selected state = green-700 border + green-100 fill + check badge. Options: Black · Red · Alluvial · Sandy · Loamy · Other · Not Sure
- **Step 5 – Water Supply:** same card pattern for source (Canal/Tube Well/Bore Well/Rainwater/Other), followed by a 4-option reliability selector (Reliable/Seasonal/Limited/Rain dependent) shown as horizontal chip-toggle group.

---

## 10. CROP PLANNING (Phase 4)

- Crop selection: illustrated crop cards (photographic icon per crop — wheat, rice, maize, cotton, groundnut, other) in scrollable row/grid, green-bordered selected state.
- Acreage input: large numeric field.
- **Interactive farm layout map:** a soft beige/green top-down "field" canvas with a subtle compass rose (N/S/E/W labels in earth-tone) drawn in the corner. Farmer taps a region of the rectangle to assign a section; each assigned section renders as a color-coded block labeled with crop icon + name + acreage (e.g. "🌾 Wheat — 2.5 acres"). Tapping a block opens a bottom-sheet (mobile) / side-panel (desktop) with crop detail.

---

## 11. FARM DASHBOARD (Phase 5)

- **Header:** "Namaste, Ramesh 👋" (28px bold, green-900), with location + pincode as secondary line, notification bell (amber dot badge) and profile avatar top-right.
- **Weather card:** large cream card, sky-blue accent icons, big temperature (48px, "31°C"), condition text + icon ("Partly Cloudy"), 3-stat row (Humidity 62% · Wind 14 km/h · Rain chance 20%) as small icon+label pairs. If rain expected: amber warning strip at card bottom, icon + short text, never relying on color alone (always icon + label).
- **Daily Farm Advisory card:** the visual hero of the dashboard — green-100 background, leaf icon badge "🌱 Today's Farm Advisory," bold recommendation line ("Your wheat field may need irrigation tomorrow morning."), a 2-line reason + suggested-time row beneath in muted text, and a full-width "View Full Advisory →" button in green-700.
- **Quick Actions grid:** 6 large rounded-16px tap cards (2×3 mobile, 3×2 tablet, 6×1 desktop), each with a colored icon circle (green/sky/amber alternating) and label: 📷 Disease Scan · 🤖 Ask Krishi AI · 🌦 Weather · 🗺 My Farm · 🏛 Government Schemes · 👨‍🌾 Expert Help.

---

## 12. AI CHAT — "Krishi AI" (Phase 6)

- Chat header: green-900 bar, leaf-mascot avatar, "Krishi AI" name + small "Online · knows your farm" subtitle.
- AI bubbles: cream-100 bg, left-aligned, rounded-16px with small tail; user bubbles: green-700 bg, white text, right-aligned.
- Typing indicator: 3 soft-pulsing green dots.
- Input bar (sticky bottom): rounded-full field, mic icon (left), camera/attach icon, send button as filled amber-400 circle.
- **Suggested question chips** above input, horizontally scrollable, beige-100 pills with green text: "Should I irrigate today?" · "Is rain expected?" · "What is wrong with my crop?" · "Which fertilizer should I use?" · "Show my farm advisory."
- AI responses should visually reference farmer context (small inline chips inside the bubble showing e.g. "🌾 Wheat · 📍 Palakkad · 💧 Bore Well" when relevant) so the farmer sees *why* the AI answered a certain way.

---

## 13. CROP DISEASE DETECTION (Phase 7)

- Title "Crop Health Scanner 🌿," subtitle "Upload a clear photo of the affected crop."
- Large dashed-border upload zone (green-600 dashed, beige-50 fill), camera icon centered, "Take Photo" (primary, green-700) and "Upload Photo" (secondary, ghost) buttons side by side beneath.
- Scan-in-progress: subtle scanning-line animation over the uploaded image (green line sweeping top-to-bottom), loading label "Analyzing crop health..."
- **Results card:** "Analysis Complete" header, "Possible Issue: Leaf Spot" in bold, **confidence visualization** as a circular progress ring (82%, green fill, amber for <60%, red-muted for <40%) — never color alone, always paired with the % number and a text label like "High confidence."
- "What we found" — short plain-language paragraph.
- "Recommended Action" — numbered/bulleted safe guidance.
- Persistent amber-100 disclaimer strip: "⚠️ AI-generated guidance. For uncertain cases, consult an agricultural expert."
- Footer buttons: "Ask Expert" (ghost) · "Save Report" (primary).

---

## 14. LIVE WEATHER (Phase 8)

- Hero weather card same style as dashboard, larger.
- **Multi-day forecast strip:** horizontally scrollable day-cards (7 days), each: day label, weather icon, high/low temp, rain-drop icon + %.
- **Weather-Based Farm Advisory** list below: each item is a card with a weather icon on a colored circle (sky-blue for rain, earth-amber for wind, sun-amber for heat) + bold headline + advisory sentence, explicitly crop-tagged (small chip: "🌾 Wheat"). E.g. "🌧 Rain expected tomorrow — Consider postponing irrigation if soil moisture is adequate."

---

## 15. MY FARM MAP (Phase 9)

- Full interactive top-down field visualization (same visual language as Phase 4's planning map, now read-only + status-aware).
- Each section labeled with compass direction + crop icon + name + acreage + a small colored **status dot** (green = healthy/on-track, amber = advisory pending, red-muted = attention needed).
- Tap a section → bottom sheet / side panel with: Crop, Area, Soil, Water source, Current weather mini-card, Latest advisory, Disease history timeline (small icon-dot timeline).

---

## 16. GOVERNMENT SCHEMES (Phase 10)

- Grid of scheme cards (1-col mobile, 2–3 col desktop), each: government emblem-style icon (simple, not an official seal to avoid impersonation), scheme name (e.g. "PM-KISAN"), 1-line description, eligibility tag, benefit summary.
- Two buttons per card: "View Details" (ghost, opens expandable/modal with full eligibility + required documents list) and **"Apply on Official Portal →"** (primary, green-700, external-link icon clearly visible — must visually signal it leaves the app; add small caption "Redirects to official government website").
- No fake forms — enforced at the design level by never presenting scheme application fields inside the product.

---

## 17. EXPERT HELP (Phase 11)

- Low-confidence trigger banner: amber-100 card, "⚠️ Expert Recommended — We are not confident enough to provide a reliable answer," button "Connect with Agricultural Expert."
- Request form: Crop (dropdown) · Farm location (auto-filled) · Problem description (textarea) · Photo attachment (thumbnail preview) · AI analysis summary + confidence score (auto-pulled, read-only card).
- Status chip system: 🟡 "Waiting for Expert" (amber pill) → 🟢 "Expert Responded" (green pill).
- Expert response view: chat-like card thread, expert avatar + name/credentials badge, timestamp, response text, optional attached image/PDF.

---

## 18. FARMER PROFILE (Phase 12)

- Profile header card: avatar circle, name, location/district/pincode as meta row.
- Sectioned info cards: Farm Information (land size, soil type, water source), Crop Summary (table-like list: crop / area / section, each row tappable).
- Action buttons: "Edit Farm Details" · "Manage Crops" · "View Advisory History" — all ghost/outline style, stacked full-width on mobile.

---

## 19. SETTINGS (Phase 13)

- **Language:** segmented control / radio-card group — English · हिंदी · ગુજરાતી, English pre-selected.
- **Appearance:** two large toggle cards — ☀️ Light Mode (beige/green preview swatch) and 🌙 Dark Mode (green-900/beige-text preview swatch) — visually preview the theme inside the option card itself.
- **Notifications:** toggle-switch list (green-700 when on, beige-200 track when off) for Weather alerts, Crop advisories, Disease reports, Expert responses, Government scheme updates.

---

## 20. PDF ADVISORY REPORT (Phase 14)

- Clean, print-safe document preview: white/beige-50 background, forest-green header band with logo, farmer info block, then sectioned report (Farm Location, Land Area, Soil Type, Water Source, Current Crop, Weather Summary, Crop Advisory, Weather Alerts, Disease Detection Result, Recommendations, Expert Response).
- Footer action bar: "Download PDF" (primary) · "Share Report" (ghost) · dedicated **WhatsApp share button** (WhatsApp-green icon button, clearly separate from the app's own green so it reads as an external-share affordance, not a native action).

---

## 21. COMPONENT LIBRARY (build these as reusable primitives first)

Weather Card · Advisory Card · Crop Card · Farm Section Card · Scheme Card · Disease Result Card (with confidence ring) · Expert Request Card · AI Chat Bubble (2 variants) · Notification Card · Profile Card · Interactive Map Section · Progress Stepper · Upload Component (dashed dropzone) · Language Selector (pill/segmented) · Theme Selector (preview-swatch cards) · Status Dot/Chip (green/amber/red-muted) · Location Pill (from reference nav) · Trust Badge (from reference hero).

---

## 22. MOTION & INTERACTION

Keep everything subtle, slow, reassuring — 150–250ms ease-out transitions:
- Card hover: 2px lift + shadow deepen
- Button press: 96% scale, quick
- Weather icon transitions: gentle cross-fade
- Map section select: soft green glow pulse once
- Disease scan: top-to-bottom scanning line loop
- AI typing indicator: 3-dot stagger pulse
- Notification arrival: slide-down + fade, auto-settle
- Page transitions: fade + 8px slide, no dramatic slides/zooms

No parallax, no auto-playing background video, no aggressive scroll-jacking — this is a utility tool for people working outdoors on variable-quality connections and mid-range phones.

---

## 23. ACCESSIBILITY & INCLUSIVITY REQUIREMENTS

- WCAG AA minimum contrast for all text-on-color combinations (verify green-on-beige and white-on-green pairs specifically)
- Never encode meaning in color alone — always pair color with icon + text label (critical for disease confidence, weather warnings, status chips)
- Minimum 16px body text, 48px touch targets throughout
- Icons always labeled (no icon-only nav items except the well-established bottom-nav pattern, which still carries text labels)
- Plain-language copy — avoid technical/agronomic jargon; if a technical term is unavoidable, add a one-line plain-language gloss
- Full support for English / Hindi / Gujarati text rendering and RTL-safe component structure for future language additions
- Design for 3G/4G-constrained image loading: low-weight illustration SVGs for onboarding, compressed hero photography, skeleton loaders on cards while data resolves

---

## 24. RESPONSIVE BEHAVIOR SUMMARY

- **Mobile (< 768px):** primary experience. Single column, bottom nav, floating AI button, full-width cards, stacked forms, sticky action footers.
- **Tablet (768–1279px):** 2-column grids for cards/quick actions, side-drawer nav optional, map/detail split view.
- **Desktop (≥ 1280px):** full top nav from reference pattern, multi-column dashboards, side-panel details instead of bottom sheets, max content width 1280px centered with beige page margins.

---

## 25. ONE-PARAGRAPH SUMMARY PROMPT (drop-in version)

*"Design Krishi Sahayak, a light-themed, farmer-first AI crop advisory web app in a 'Digital Krishi + Nature' visual language: warm beige (#FBF8F1/#F4EEDF) surfaces, forest-green (#1B3B2C/#2F5D3A) primary UI and navbar, amber (#E8A93B) sunlight accents for badges/CTAs, and soft sky-blue (#4F8FBF) for weather — rounded 16–20px cards, soft warm shadows, large 16px+ typography, 48px+ touch targets, real photographic hero imagery of Indian farmers in daylight fields, illustrated soil/crop selector cards, and a persistent floating AI-chat button. Structure the top navigation as a solid green bar with a location pill, language pill, and profile pill (mirroring a reference dark-theme template's nav pattern, but reskinned light). Build the full 14-screen farmer journey — landing, OTP login, 5-step onboarding, crop planning with an interactive compass-oriented farm map, dashboard with weather + daily advisory cards, Krishi AI chat, AI disease scanner with confidence-ring results, live weather with crop-specific advisory, farm map, government schemes (external-portal links only, no fake forms), expert escalation flow, profile, settings (language/theme/notifications), and a shareable PDF advisory report — using calm, restrained motion and WCAG AA accessible, icon+text status signaling throughout."*

---
**File ready for use as a build/spec prompt in Claude, v0, Lovable, or Figma AI.**
