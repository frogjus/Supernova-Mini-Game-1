# Screen Specifications — Princess Goth UI System

This document specifies the wireframe and component layout for every screen in SUPERNOVA.

---

## Screen Overview

| Screen | State ID | Description |
|--------|----------|-------------|
| Landing | TITLE | Main menu with start, continue, settings |
| Character Select | SELECT | Pick your idol |
| Playing | PLAYING | Main gameplay |
| Level Up | LEVELUP | Skill upgrade selection |
| Pause | PAUSED | Resume, settings, quit |
| Game Over | GAMEOVER | Run summary |
| Victory | VICTORY | Boss chest + run complete |
| Settings | SETTINGS | Audio, controls, accessibility |
| Charm Inventory | CHARMS | View collected charms |
| Boss Intro | (overlay) | Boss name + threat preview |

---

## 1. Landing Page (TITLE)

### Layout
```
┌─────────────────────────────────────────────────────┐
│  [SUPERNOVA LOGO]          [SETTINGS] [CREDITS]    │
│                                                     │
│   ╔═══════════════════════════════╗                 │
│   ║     "STAGE SURVIVORS"        ║  ← Tagline      │
│   ║     Princess Goth Style       ║                 │
│   ╚═══════════════════════════════╝                 │
│                                                     │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│   │  START  │  │CONTINUE │  │  QUIT   │            │
│   └─────────┘  └─────────┘  └─────────┘            │
│                                                     │
│   ┌─────────────────────────────────────────┐       │
│   │     INTRO SLIDES (3-5 cards)           │       │
│   │     "The stage-network fractures..."    │       │
│   └─────────────────────────────────────────┘       │
│                                                     │
│              [VERSION 1.0.0]                        │
└─────────────────────────────────────────────────────┘
```

### Components
- **Logo**: Crown + glitch effect, centered top
- **Tagline Panel**: Ribbon-decorated panel with serif text
- **CTA Buttons**: Large (140x30), pink fill, white text
  - START: Primary, center
  - CONTINUE: Secondary (if save exists)
  - QUIT: Tertiary, muted
- **Intro Slides**: Scrolling cards with story snippets
- **Settings/Credits**: Small icons, top-right

### Visual Style
- Background: Void (#0A0A14) with animated pink/cyan wash
- Buttons: Lace corners, spike accents on hover
- Text: Display serif for title, pixel for buttons

---

## 2. Character Select (SELECT)

### Layout
```
┌─────────────────────────────────────────────────────┐
│  SUPERNOVA ZINE          ISSUE #1 of 4              │
├─────────────────────────────────────────────────────┤
│                                                     │
│   ┌──────────────────────┐  ┌─────┐ ┌─────┐        │
│   │                      │  │miho │ │hyun │        │
│   │   [SELECTED HERO]    │  └─────┘ └─────┘        │
│   │   MIHO               │                         │
│   │   The Gumiho         │  ┌─────┐ ┌─────┐        │
│   │   #FoxQueen          │  │sujin│ │sohee│        │
│   │   "My flames..."     │  └─────┘ └─────┘        │
│   │                      │                         │
│   │   [STATS]            │                         │
│   │   SPD: ★★★☆☆        │                         │
│   │   ATK: ★★★★☆        │                         │
│   │   HP:  ★★★☆☆        │                         │
│   └──────────────────────┘                         │
│                                                     │
│   ← PREV    [CONFIRM]    NEXT →                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Components
- **Selected Hero Panel**: Large portrait, left side
  - Character name (serif, large)
  - Title (italic serif)
  - Hashtag (muted)
  - Quote (pull quote style)
  - Stats with star indicators
- **Thumbnails**: 3 smaller character portraits, right side
  - Click to select
  - Selected has focus glow
- **Navigation**: Previous/Next arrows + Confirm button

### Visual Style
- Character portrait: Rotated cutout with tape
- Stats: Crown icons for filled, outline for empty
- Thumbnails: Overlapping, different rotations

---

## 3. In-Game HUD (PLAYING)

### Layout
```
┌─────────────────────────────────────────────────────┐
│ [AVATAR] HP ████████░░  XP ██████░░░░  │ TIME 12:34 │
│                                               FANS  │
│                                               12.5K  │
├─────────────────────────────────────────────────────┤
│                                                     │
│                   [GAME WORLD]                     │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [SKILL 1] [SKILL 2] [SKILL 3] [ULTIMATE]          │
│   Q        W        E           R                  │
├─────────────────────────────────────────────────────┤
│ [TRENDING: "slay literally"]          [CHARMS +]  │
└─────────────────────────────────────────────────────┘
```

### Components

**Top-Left Zone**
- Avatar: 24x24 sprite + border
- HP Bar: Heart icon + pink fill + white outline
- XP Bar: Star icon + lilac fill

**Top-Right Zone**
- Timer: Pixel font, MM:SS format
- Followers: Heart icon + number (K format)

**Center-Top Zone** (when boss active)
- Boss Name: Crown text
- Boss HP: Large bar with boss portrait
- Danger indicator: Spike accents

**Bottom-Center Zone**
- Skill Rail: 4 ability slots
- Each slot: 48x48 icon + cooldown overlay
- Keybind hint below each

**Bottom-Left Zone**
- Trending text: Scrolling social comments
- Charm count: Heart chip with number

### Visual Style
- All text on solid backplates
- HP bar: Heart chip shape
- Skills: Icon + border glow on ready
- Cooldown: Dark wipe + radial reveal

---

## 4. Pause Menu (PAUSED)

### Layout
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         ┌─────────────────────────┐                │
│         │     ≋ PAUSED ≋           │                │
│         │                         │                │
│         │   [RESUME]              │                │
│         │                         │                │
│         │   [CHARMS]              │                │
│         │                         │                │
│         │   [SETTINGS]            │                │
│         │                         │                │
│         │   [QUIT TO TITLE]      │                │
│         │                         │                │
│         └─────────────────────────┘                │
│                                                     │
│         Press ESC or SPACE to resume               │
└─────────────────────────────────────────────────────┘
```

### Components
- **Scrim**: Semi-transparent dark overlay
- **Pause Panel**: Centered, lace corners
- **Menu Items**: Medium buttons, stacked
  - RESUME: Primary (pink)
  - CHARMS: Secondary (shows count)
  - SETTINGS: Secondary
  - QUIT: Danger (rose)

### Visual Style
- Panel: Pink glow border
- Selected item: Focus glow + highlight
- Keyboard hints: Small pixel text

---

## 5. Level Up (LEVELUP)

### Layout
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         ┌─────────────────────────┐                │
│         │    ★ LEVEL UP! ★         │                │
│         │       LEVEL 5           │                │
│         │                         │                │
│         │  [SKILL 1]  [SKILL 2]  │                │
│         │   +Damage    +Speed     │                │
│         │                         │                │
│         │  [SKILL 3]  [SKILL 4]  │                │
│         │    +Range     +New      │                │
│         │                         │                │
│         └─────────────────────────┘                │
│                                                     │
│         Choose 1 of 4 upgrades                    │
└─────────────────────────────────────────────────────┘
```

### Components
- **Header**: Crown icon + "LEVEL UP" + level number
- **Upgrade Cards**: 2x2 grid
  - Icon (32x32)
  - Name (serif)
  - Description (sans, muted)
  - Current → New stat
- **Selection**: Click or 1-4 keys

### Visual Style
- Cards: Card surface with hover glow
- Selected: Crown ribbon stamp
- Background: Scrim with particle effects

---

## 6. Game Over (GAMEOVER)

### Layout
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         ┌─────────────────────────┐                │
│         │      💀 GAME OVER 💀    │                │
│         │                         │                │
│         │   Stage Reached: 3      │                │
│         │   Time Survived: 5:23   │                │
│         │   Enemies Defeated: 127 │                │
│         │   Bosses Defeated: 1    │                │
│         │   Max Combo: 24         │                │
│         │   Fans Gained: 45.2K    │                │
│         │   Charms Collected: 5   │                │
│         │                         │                │
│         │   [TRY AGAIN]           │                │
│         │   [QUIT]                │                │
│         └─────────────────────────┘                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Components
- **Header**: Skull icon + "GAME OVER" in rose
- **Stats Panel**: Run summary
  - Stage reached
  - Time survived
  - Enemies defeated
  - Bosses defeated
  - Max combo
  - Fans gained
  - Charms collected
- **Actions**: TRY AGAIN (primary), QUIT (secondary)

### Visual Style
- Header: Danger glow, spike decorations
- Stats: Chip-style rows with icons
- Buttons: Large CTA style

---

## 7. Victory / Boss Chest (VICTORY)

### Layout
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         ┌─────────────────────────┐                │
│         │   ★ BOSS DEFEATED ★    │                │
│         │                         │                │
│         │   Choose Your Reward    │                │
│         │                         │                │
│         │  ┌─────┐ ┌─────┐ ┌─────┐│                │
│         │  │CHARM│ │CHARM│ │CHARM││                │
│         │  │  1  │ │  2  │ │  3  ││                │
│         │  └─────┘ └─────┘ └─────┘│                │
│         │                         │                │
│         │   [SKIP REWARD]         │                │
│         └─────────────────────────┘                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Components
- **Header**: Crown icon + "BOSS DEFEATED"
- **Charm Cards**: 3 options, horizontal
  - Rarity border (common/rare/epic)
  - Icon (24x24)
  - Name
  - Description
  - Tags (crown, thorn, glitch, idol)
- **Skip Button**: Muted, secondary

### Visual Style
- Rarity Colors:
  - Common: Lilac border
  - Rare: Cyan border + glow
  - Epic: Gold/crown border + sparkle
- Cards: Hover raises + focus glow

---

## 8. Settings Page (SETTINGS)

### Layout
```
┌─────────────────────────────────────────────────────┐
│  SETTINGS                         [X] CLOSE        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  AUDIO                                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ Music Volume    [████████░░] 80%            │   │
│  │ SFX Volume     [██████░░░░] 60%             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  CONTROLS                                           │
│  ┌─────────────────────────────────────────────┐   │
│  │ Move: WASD / Arrow Keys                     │   │
│  │ Skills: Q W E R                             │   │
│  │ Pause: ESC                                  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ACCESSIBILITY                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ [ ] High Contrast Mode                      │   │
│  │ [ ] Reduce Motion                           │   │
│  │ [ ] Larger Text                            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  DISPLAY                                           │
│  ┌─────────────────────────────────────────────┐   │
│  │ Pixel Scaling: [2x] [3x] [4x]               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Components
- **Sections**: Audio, Controls, Accessibility, Display
- **Sliders**: Chip track + handle
- **Toggles**: Checkbox with princess/goth style
- **Scaling**: Button group for 2x/3x/4x

### Visual Style
- Section headers: Ribbon chips
- Sliders: Pink fill, chrome handle
- Active toggle: Crown checkmark

---

## 9. Charm Inventory (CHARMS)

### Layout
```
┌─────────────────────────────────────────────────────┐
│  CHARMS                    [+FILTER] [X] CLOSE     │
│  Collected: 12/30                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────┐   │
│  │ ★ Fox Crown  │ │ ♥ Healing    │ │ ⚡ Speed │   │
│  │ [EPIC]       │ │ [RARE]       │ │ [COMMON] │   │
│  │ +15% ATK     │ │ +5 HP/s      │ │ +10% SPD │   │
│  └──────────────┘ └──────────────┘ └──────────┘   │
│                                                     │
│  ┌──────────────┐ ┌──────────────┐                │
│  │ ◇ Thorn      │ │ ▣ Shield     │                │
│  │ [COMMON]     │ │ [RARE]       │                │
│  │ +5% DEF      │ │ +20% Shield  │                │
│  └──────────────┘ └──────────────┘                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Components
- **Header**: Title + collected count + filter + close
- **Charm Grid**: 3-column responsive
- **Charm Card**:
  - Icon (24x24)
  - Name
  - Rarity badge (★/♥/◆/◇)
  - Effect description

### Visual Style
- Rarity Badges:
  - Common: Lilac ◇
  - Rare: Cyan ♥
  - Epic: Gold ★
- Cards: Hover shows full description

---

## 10. Boss Intro Overlay

### Layout
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         ╔═══════════════════════════════╗           │
│         ║     ⚠ WARNING ⚠               ║           │
│         ║                               ║           │
│         ║     QUEEN OF CLICKBAIT       ║           │
│         ║     Level 10 Boss            ║           │
│         ║                               ║           │
│         ║   "Every crown has a         ║           │
│         ║    scandal."                  ║           │
│         ╚═══════════════════════════════╝           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Components
- **Warning Banner**: Spike borders, warning color
- **Boss Name**: Large serif, crown color
- **Boss Level**: Pixel text
- **Intro Quote**: Italic serif in bubble
- **Portrait**: Large boss sprite (if available)

### Timing
- Display: 2 seconds
- Animation: Fade in → hold → fade out

### Visual Style
- Warning: Rose + spike decorations
- Name: Crown glow effect
- Quote: Speech bubble with ribbon tail

---

## Common UI Components

### Button States
| State | Visual |
|-------|--------|
| Default | Pink fill, white text |
| Hover | +inner highlight + focus glow |
| Pressed | y+1px, darker fill |
| Disabled | Muted + hatch overlay |

### Panel Styles
| Type | Features |
|------|----------|
| Standard | Lace corners |
| Danger | Spike notches |
| Boss | Chrome border + warning stripe |

### Text Backplates
- Small: 4px padding, chip background
- Medium: 8px padding, panel background
- Large: 12px padding, elevated surface

---

## Acceptance Criteria

- [ ] All screens use consistent tokenized palette
- [ ] Text is readable against backgrounds
- [ ] Pixel font renders at integer positions
- [ ] Hover/focus states work on all interactive elements
- [ ] Boss intro displays for 2 seconds
- [ ] Charm cards show rarity clearly
- [ ] Settings sliders are draggable
- [ ] Pause menu accessible during gameplay
