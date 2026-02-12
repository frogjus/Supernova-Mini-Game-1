# UI Component Specs — Princessy x Edgy Pixel System

## 1) Button

### Anatomy
- 1px outline, 2-tone fill, center icon optional.
- Top ribbon chip for emphasis states.

### Sizes
- Small: 64x20
- Medium: 96x24
- Large CTA: 140x30

### States
- Default: pink-lilac fill, high-contrast label.
- Hover: +focus glow + 1px inner highlight.
- Pressed: y+1px shift + darker fill.
- Disabled: desaturated + cooldown hatch.

---

## 2) Panel

### Anatomy
- Pixel rectangle base with lace corners.
- Optional spike notch on danger variants.
- Title strip with crown/heart motif chip.

### Usage
- Character card, story modal, stat cards, quest cards.

---

## 3) Modal

### Structure
- Scrim (`overlay.scrim`) + centered panel.
- Header tab + title + icon.
- Body copy on clean backplate.
- Footer actions with key prompts.

### Modal Types
- Quest / Story prompt
- Pause
- Boss intro (brief, animated)
- Inventory / upgrade modal

---

## 4) HUD

### Zones
1. Top-left: avatar tag + HP/XP read.
2. Top-right: timer + score/followers.
3. Mid-top: boss bar / alerts.
4. Bottom-center: skill rail.
5. Bottom-left: trend/reaction feed.

### Readability Rules
- Every text cluster sits on plate/chip.
- HP and XP bars must include shape/icon signals.
- Important alerts occupy dedicated center lane.

---

## 5) Dialog Bubble

- Pixel speech block + tail.
- Name tag chip on top-left.
- Max 2 lines in combat contexts.

---

## 6) Tooltip

- 8px internal padding equivalent.
- 1-line title + 1-line effect + optional cooldown.
- Appears near skill icon and never offscreen.

---

## 7) Inventory Card / Upgrade Card

### Anatomy
- 1px frame, icon tile (24x24), title, short desc, stat chip.

### States
- Default: neutral lilac panel.
- Hover: cyan focus edge + slight raise.
- Selected: crown ribbon stamp + persistent outline.
- Locked: muted text + hatch overlay.

---

## 8) Combat Feedback Components

- Damage indicator: rose-red slash + value text.
- Heal indicator: mint heart + value text.
- Cooldown overlay: dark wipe over icon + radial or vertical reveal.
- Boss intro card: 2-second center banner with threat line and zone callout.
