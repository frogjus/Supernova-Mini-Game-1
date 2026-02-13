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

---

## 9) Heart Health Bar

### Anatomy
- Row of 7x6 pixel hearts replacing rectangular HP bar.
- Each heart represents 2 HP.
- Cap display at 10 hearts; show numeric overflow if maxHP > 20.

### Heart States
- **Filled**: Full pink fill (`#FF93C8`) with white highlight pixel at top-left lobe.
- **Half**: Left half filled (`#FF6BA0`), right half empty.
- **Empty**: Dark fill (`#3A2C62`) with outline visible.
- **Outline**: Faint outline only (`#A694C7`), used for max HP indicators beyond current.

### Color Shifts by Health %
- Normal (>50%): Standard pink fill.
- Warning (25-50%): Orange-tinted fill (`#FFB347`).
- Danger (<25%): Red pulsing fill (`#FF4C7D`), 0.15 sine pulse on alpha.

### Layout
- Position: top-left HUD zone, after identity plate.
- Hearts spaced 1px apart horizontally.
- XP bar remains below as-is.

---

## 10) Boss Arena Backdrop

### Arena Types (6)
| Arena | Floor Tint | Accent | Pattern |
|-------|-----------|--------|---------|
| Neon Newsroom | `#1A0A1A` | Hot pink | Scrolling headline text fragments |
| Data Cathedral | `#0A0A1A` | Data blue | Grid lines, binary rain dots |
| Broken Stage Set | `#1A1008` | Amber | Broken spotlight circles |
| Mirror Hall | `#0E0E1A` | Chrome silver | Reflection line symmetry |
| Floating Chat Abyss | `#0A0A14` | Deep purple | Floating chat bubble outlines |
| Fractured Throne | `#0A0008` | Void purple | Crack lines radiating from center |

### Activation
- Set when boss spawns, cleared when boss dies.
- Floor tiles shift to arena tint color.
- Subtle fog overlay at arena accent alpha 0.04.

---

## 11) Ultimate Charge Meter

### Anatomy
- Vertical bar or circular gauge adjacent to skill rail.
- Fills from 0-100% based on kills + damage + combos.
- Glow effect when full (ready to fire).

### Visual States
- Charging: Lilac fill rising.
- Ready: Full bar with pulsing glow + crown icon at top.
- Active: Draining with bright flash.

### Position
- Right side of bottom skill rail, or integrated as ring around character portrait.

---

## 12) Chapter Transition Card

### Anatomy
- Full-screen scrim overlay.
- Centered panel with chapter number, title, and beat text.
- 3-second display with fade-in/fade-out.

### Layout
- Chapter number: small pixel text label.
- Title: Large editorial serif, white.
- Beat text: Medium sans, muted color.
- Decorative ribbon strips at top and bottom of card.

### Timing
- Appears when chapter threshold time is reached.
- 180 frame total display (3 seconds at 60fps).
- First 30 frames: fade in. Last 30 frames: fade out.
