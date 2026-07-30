# Handoff: Class Hero — Luxury Monochrome App

## Overview
A complete visual redesign + interaction spec for **Class Hero** (school-parent app: feeds, reminders, canteen, photo consent, teacher gifts, messaging). Art direction borrows from luxury fashion houses (monochrome, hairline rules, Didone display type, generous negative space, hard-cropped imagery) while all interaction patterns follow Instagram conventions: a feed, a stories rail with a timed full-screen viewer, a 3-up photo grid, and a five-tab bottom bar.

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these designs in the target codebase's environment** (the existing Class Hero app — a Lovable/React project at class-hero-hub.lovable.app) using its established patterns and libraries. If rebuilding fresh, React + Tailwind or similar is appropriate; keep the exact values below.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy tone and interactions are final intent. Recreate pixel-perfectly. The grey image blocks are intentional placeholders for real photography (the prototype uses drag-and-drop slots); everything else is finished design.

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| Ink | `#0E0E0E` | Text, active states, primary buttons, story viewer bg |
| Graphite | `#4A4844` | Body text |
| Ash | `#8C8781` | Meta text, inactive tabs/labels |
| Faint | `#C9C4BC` | Placeholder / empty-state text |
| Bone | `#F4F1EC` | Image placeholder fill, chat bubbles (theirs), in-basket rows, avatars |
| Paper | `#FFFFFF` | Screen background |
| Hairline | `rgba(14,14,14,.14)` | All rules/dividers (`.1` for lighter within-screen rows) |
| Fern | `#2F5D4A` | Consent granted (light bg) |
| Oxide | `#8A2B2B` | Restricted / urgent (light bg) |
| Brass | `#B8964F` | Due today / money (light bg) |
| Fern (dark bg) | `#8FB49F` | Story accent — memories |
| Oxide (dark bg) | `#C46A6A` | Story accent — alerts |
| Brass (dark bg) | `#D8B871` | Story accent — specials/sales |

Color appears **only as a 1–2px line**, never a fill. No shadows, no gradients (single exception: white fade under type on full-bleed image cards), no rounded cards. Only circles (avatars, toggle knob) and the toggle track have border-radius.

### Typography
- **Display:** Bodoni Moda 400 (placeholder for a licensed Didone). Weights above 400 never used.
- **UI:** Jost 200/300/400 (placeholder for a licensed light grotesque).
- Scale:
  - Display: Bodoni 56–62/0.9–0.95, letter-spacing −1% to −2%, often ALL CAPS ("TOMORROW", "CANTEEN", "THE VAULT")
  - Title: Bodoni 30–44/1.1
  - Card title: Bodoni 24–34/1.1
  - Label: Jost 400 10–11px, uppercase, letter-spacing .26–.32em
  - Body: Jost 300 14–15px / 1.7
  - Meta: Jost 300 11–12px, letter-spacing .1em, Ash
  - Micro (tab labels): Jost 8–9px, uppercase, .18em

### Spacing
4-base scale: 4, 8, 12, 20, 32, 48, 72. Screen margin **20px** (text and rules; imagery ignores it and bleeds full-width). 48px between unrelated blocks, 12px within a block. Vault/profile grids: 3 columns, **1px gutters**, edge-to-edge.

### Motion
- Screen change: 240ms fade + 8px rise
- Story viewer open: 380ms curtain from bottom
- Consent reveal: 600ms blur 18px→0
- Easing everywhere: `cubic-bezier(.2,.7,.2,1)`. No spring/bounce/overshoot.

### Icons
1px hairline strokes, 20–22px box, squared terminals, no fills, no duotone. Active = Ink, inactive = Ash. Never scale above 24px.

### Voice
Sparse, formal, telegraphic: "LIBRARY. TOMORROW.", "Nothing else", "Withheld". No exclamation marks, no emoji, no encouragement copy.

## Screens / Views
All screens live in `Class Hero — App Mockups.dc.html` (device: 402×874). Bottom tab bar on all screens except Onboarding and while a story is open.

### Tab bar (global)
White, hairline top rule, padding 18px 22px 30px (home-indicator clearance). Five items, 52px wide each: Feed (framed rect icon), Community (people+broadcast), **Add** (plus glyph inside a 34px 1px-bordered square — the couture accent), Canteen (fork/knife), Profile (person). Icon 21px + 8px uppercase label beneath, gap 7px. Active ink / inactive ash.

### 1. Onboarding / Access
Centered Bodoni wordmark "CLASS HERO" 40px + tagline label "SCHOOL, QUIETLY HANDLED". Hairline. Two underline fields (label 9px uppercase ash over 16px light value): School, Invitation code. Bottom: full-width ink button "REQUEST ACCESS" (19px padding, 11px/.3em uppercase white) + tertiary text link. No illustration.

### 2. Feed (default)
- Header: 19px Bodoni "CLASS HERO" centered, .14em tracking; chat icon right; hairline below.
- **Stories rail**: horizontal row of 58px bone circles each holding a Bodoni monogram (N, C, U, 3, I, O) with 9px uppercase label. Unseen = 1px ink border + 1px ink outline offset 4px; seen = single hairline border, ash label. Tapping opens the Story Viewer (does NOT navigate).
- Posts separated by hairlines: (a) school post — uppercase source + age, Bodoni title 30px, body, then full-bleed 4:5 image, then action row "SAVE · DIARY · REPLY" (10px/.26em uppercase); (b) text-only post — Bodoni 34px set large, no card dressing; (c) canteen post with 1:1 full-bleed image.

### 3. Story Viewer (signature #1)
Full-screen ink overlay sliding up from bottom (curtain, 380ms), inset **below the status bar** (top: 56px).
- Segmented progress bars top: 1.5px tracks `rgba(255,255,255,.28)`, white fill; active segment fills over **6.5s** then auto-advances.
- Header: 32px translucent monogram circle, author (9px uppercase white), age, "CLOSE" right.
- Content bottom-anchored: accent line (26×2px) + eyebrow (9px/.32em uppercase, accent color), Bodoni title 38px white, body 14px `rgba(255,255,255,.62)` max-width 300px. Optional 4:5 image area above (dark placeholder `#1A1A1A`).
- Footer: outlined button "VIEW FULL POST" (only for public posts; closes viewer → feed) + hint line.
- **Gestures**: tap right ⅔ = next card, tap left ⅓ = previous; swipe left/right (>45px) = next/previous group; swipe down (>70px) = close; end of all stories = return to feed. Timer pauses while pointer is down. Group content: School alerts, Canteen specials/cut-off, Uniform Shop sale countdown, class reminders, per-child consented memories.
- Rings on the rail flip to "seen" as groups are viewed.

### 4. Tomorrow
"CLOSE" left, "BOTH CHILDREN" right. Bodoni "TOMORROW" 62px caps + date label. Four hairline rows: uppercase item + 34×2px status line right (oxide/brass/neutral) + one-line detail. Ends with centered faint label "NOTHING ELSE".

### 5. Community
Bodoni "Community" 30px. Segmented control (equal thirds, active has 1px ink underline): Messages / Notices / Gifts. Message rows: 44px bone circle, uppercase name + age, 13px preview. Gift row shows a brass status line instead of age.

### 6. Chat thread
Back / centered uppercase title. Date divider label. Their bubbles: bone, squared, 16×18px padding, left, max 290px, sender label above. Yours: ink/white, right-aligned. Composer: hairline top, "Message" faint + "SEND" label.

### 7. Composer ("Add")
Cancel / NEW POST / Share header. Faint Bodoni prompt "Paste the newsletter." + explanation. "DETECTED · THREE ITEMS" label, checklist rows: 15px square checkbox (filled ink = selected), uppercase title + 13px detail. Attach row: 64px image slot + dashed "+" square. Outlined button "ADD TWO TO DIARY".

### 8. Canteen
Bodoni "CANTEEN" 44px caps + child/balance label. Day strip Mon–Fri (equal fifths, active = ink fill/white text). Sections "HOT", "COLD & SWEET". Menu rows: item 15px light + allergen 11px ash; price 13px; 22px square stepper (+ outlined; count = ink fill). In-basket rows get bone background. Footer: ink bar "ORDER · TUESDAY — $5.00" + "CUT-OFF 8.30AM" label.

### 9. Profile
Family label + hamburger. Child switcher: 66px circles (active = double ink ring; "+" dashed to add). Bodoni name 36px + class label. Three stat columns divided by hairlines (Bodoni number 24px + label): Diary / Vault / Replies. Settings rows: Photo consent (shows Granted/Withheld in fern/oxide → Vault), Medical, Canteen account. Then 3-up 1px-gutter photo grid.

### 10. Vault (signature #2)
Back / count. Bodoni "THE VAULT" 48px + promise copy. Consent panel between hairlines: "PHOTO CONSENT" + custom toggle (52×26px, 1px ink border, radius 13px; knob 18px circle; off = white track/ink knob left, on = ink track/white knob right, 300ms) + explanation line that rewrites with state.
- **Consent OFF (default)**: 3-up grid under `blur(18px)` with a single white plate "WITHHELD" centered.
- **Consent ON**: blur animates to 0 over 600ms.
- Below: channel ledger rows (Yearbook / Class page → Granted-fern or Withheld-oxide; Social media → always "NEVER" oxide).
- Grid tiles open the child's story group in the viewer.

### 11. Teacher gift
Back / "ANONYMOUS". Eyebrow + Bodoni "Mrs Alder" 44px. Bodoni "$240" + "OF $480 · 12 OF 24"; 2px progress rule (ink on hairline, 50%). Contributor ledger rows. Outlined "CONTRIBUTE $20" + closing date label.

## State Management
- `screen` (10 values), `consent: boolean` (per child in production; default **false**)
- Stories: `groupIndex`, `itemIndex`, `progress 0–1` (interval-driven, 6.5s/card), `seenGroupIds[]` (persist per user)
- Canteen basket, gift fund progress, unread message state — wire to real backend.
- Production consent must actually gate image delivery server-side; the blur is the UI expression, not the mechanism.

## Assets
No brand assets used. Fonts via Google Fonts (Bodoni Moda, Jost) — swap for licensed equivalents if desired. All imagery = placeholder slots awaiting real photography.

## Screenshots
`screenshots/` contains one capture per screen state (01-access … 12-teacher-gift), including the story viewer open, and the Vault in both withheld (blurred) and granted states. Captures show the design in an iOS frame with annotation panels either side; the phone is the spec.

## Files
- `Class Hero — App Mockups.dc.html` — all 10 screens + story viewer + consent interaction (template = markup, `class Component` = behavior; inline styles carry exact values)
- `Class Hero — Design System.dc.html` — tokens, principles, components, motion, voice reference sheet
- `Class Hero — Variations.dc.html` — explored alternatives (kept: 1a strict monochrome, 1d editorial feed card, 1g hairline tab bar, 1j Didone display, 1m blur veil vault)
- `ios-frame.jsx`, `image-slot.js` — prototype scaffolding only; do not port
