# SUPERNOVA Art Direction Bible — Princess Goth Edition

## Theme: Princessy x Edgy Cyber-Fairytale

This document defines the visual language for SUPERNOVA. All assets, UI, and game elements must adhere to these rules.

---

## 1. Visual DNA — Princess Goth

### The Two Sides

**Princess (Light)**
- Tiaras, crowns, ribbons, lace, hearts, gems
- Soft pastels: pink, lilac, mint, cream
- Flowing lines, frills, elegant curves

**Goth (Edge)**
- Spikes, thorns, chrome trims, neon/glitch accents
- Dark tones: void navy, charcoal, deep purple
- Sharp angles, caution stripes, industrial motifs

### Combined Aesthetic
- Tiaras WITH chrome trim
- Hearts WITH spike accents
- Ribbons WITH glitch effects
- Lace patterns WITH neon highlights

---

## 2. Palette Constraints (SOURCE OF TRUTH)

All colors MUST come from `TOKENS.json`. Never use ad-hoc hex values.

### Background Layer
- Void: `#0A0A14` — deepest darkness
- Stage: `#111126` — gameplay background
- Panel: `#1A1630` — UI panels
- Panel Alt: `#241B3F` — elevated surfaces

### Surface Layer
- Card: `#2F2352` — content containers
- Card Soft: `#3A2C62` — hover states
- Chip: `#4A3774` — buttons/tags
- Chrome: `#C8D6FF` — metallic accents

### Text Layer
- Primary: `#FFF6FF` — headings, important
- Secondary: `#D6C5F3` — body text
- Muted: `#A694C7` — hints, disabled
- Inverse: `#1A1230` — dark text on light

### Brand Colors
- Pink: `#FF79C6` — primary action, love
- Rose: `#FF4FA3` — danger, passion
- Lilac: `#B98CFF` — magic, rare
- Violet: `#8F66FF` — tech, data
- Mint: `#89FFD1` — heal, success
- Cyan: `#6DE6FF` — glitch, electric

### Status Colors
- Success: `#77F7BF` — positive
- Heal: `#89FFD1` — HP recovery
- Danger: `#FF4C7D` — damage, warning
- Warning: `#FFB347` — caution
- Info: `#78C7FF` — neutral info
- Cooldown: `#7A6B99` — disabled state

### Motif Colors
- Heart: `#FF93C8` — love, health
- Crown: `#FFE38A` — royalty, boss
- Ribbon: `#FF8FCF` — cute, charm
- Lace: `#E6D7FF` — elegant, soft
- Spike: `#A7A0C8` — danger, edgy
- Glitch: `#46D8FF` — tech, ultimate

---

## 3. Pixel Logic (Non-Negotiable)

### Resolution Targets
- World: 320x240 pixels
- UI Scale: 3x (960x720 canvas)
- Character sprites: 16x20 base
- Enemy sprites: 8x8 to 16x16
- Icons: 16x16 grid

### Outline Policy
- 1px dark outline on ALL sprites
- Use darkest local tone for outline
- No anti-aliasing (crisp pixels only)

### Shading Policy
- Default: flat + 1 shadow tone
- Hero sprites: flat + shadow + highlight
- Maximum 3 tones per sprite

### Anti-Aliasing
- **NONE** for sprites and UI primitives
- Exception: smooth gradients in backgrounds only

---

## 4. Typography

### Font Families (loaded from Google Fonts)
- **Display**: DM Serif Display — titles, boss names, headlines
- **Body**: Inter — readable body text, tooltips
- **Pixel**: Press Start 2P — HUD labels, retro elements

### Size Hierarchy
- Pixel XS: 8px — micro labels
- Pixel SM: 10px — HUD elements
- Pixel MD: 12px — important labels
- Body: scales 10-16px — readability
- Display: scales 24-82px — impact

### Text Rendering Rules
- Integer positions only (no subpixels)
- High contrast minimum (4.5:1)
- Never place text directly on busy backgrounds
- Use solid backplates for text legibility

---

## 5. UI Component Specifications

### Buttons
- Sizes: Small (64x20), Medium (96x24), Large (140x30)
- States: default, hover (glow), pressed (dark), disabled (hatch)
- Must have ribbon accent for primary actions

### Panels
- Lace corner decorations (princess)
- Optional spike notches for danger variants
- Title strip with crown/heart motif chip

### Modals
- Scrim overlay: `rgba(8, 8, 16, 0.78)`
- Centered panel with header/body/footer
- Boss intros: 2-second animated banner

### HUD Zones
1. **Top-Left**: Avatar tag + HP bar + XP bar
2. **Top-Right**: Timer + Score + Followers
3. **Center-Top**: Boss HP bar (when active)
4. **Bottom-Center**: Skill rail (4 abilities)
5. **Bottom-Left**: Reactions/trends feed

---

## 6. Motif Library

### Princess Motifs
| Motif | Symbol | Usage |
|-------|--------|-------|
| Crown | 👑 | Bosses, rarity, achievement |
| Heart | ♥ | Health, love, healing |
| Ribbon | 🎀 | Charms, cute items |
| Lace | ∿ | Borders, decorations |
| Gem | 💎 | Rares, collectibles |
| Star | ★ | Skill points, upgrades |

### Goth/Edgy Motifs
| Motif | Symbol | Usage |
|-------|--------|-------|
| Spike | ⚡ | Danger, damage, warning |
| Thorn | 🌵 | Curses, debuffs |
| Chrome | ⬡ | Tech, bosses |
| Glitch | ▦ | Ultimate, special effects |
| Skull | 💀 | Death, Game Over |
| Chain | ⛓️ | Locked, bound |

### Combined Examples
- Crown + Spike = Boss danger indicator
- Heart + Glitch = Critical heal effect
- Ribbon + Chrome = Charm item frame

---

## 7. Background Themes

Each stage has a unique visual identity within the Princess Goth theme:

### Stage 1: Neon Lobby
- Primary: `#111126` with `#FF79C6` neon signs
- Parallax: Far city silhouette, mid crowd shapes
- Ambience: Pink/cyan gradient wash

### Stage 2: Mall of Mirrors
- Primary: `#1A1630` with `#B98CFF` mirror reflections
- Parallax: Infinite mirror corridor effect
- Ambience: Shimmer particles

### Stage 3: Broadcast Ruins
- Primary: `#0A0A14` with static/glitch effects
- Parallax: Broken TV screens, antenna silhouettes
- Ambience: RGB color separation pulses

### Stage 4: Archive Understage
- Primary: `#1A1630` with `#89FFD1` data streams
- Parallax: Filing cabinet towers, paper storm
- Ambience: Floating data particles

### Stage 5: Crownline Citadel
- Primary: `#0A0A14` with `#FFE38A` crown lights
- Parallax: Throne room pillars, chandelier fragments
- Ambience: Golden sparkles, royal banners

---

## 8. Enemy Telegraph System

### Visual Language
- **Charge-up**: Shape pulses + color shift to warning
- **Projectile**: Distinct silhouette + trail color
- **Area**: Dotted circle outline + danger color fill

### Telegraph Timing
- Fast attacks: 0.3-0.5s warning
- Medium attacks: 0.8-1.2s warning
- Slow/big attacks: 1.5-2.0s warning

### Color Coding
- Melee: Rose `#FF4FA3`
- Ranged: Cyan `#6DE6FF`
- Area: Warning `#FFB347`
- Boss: Crown `#FFE38A`

---

## 9. Do / Don't

### DO
- Use tokenized colors from TOKENS.json
- Keep silhouettes readable at 16px height
- Use shape + color together for states
- Apply lace corners to panels
- Add spike accents for danger elements

### DON'T
- Mix smooth rounded UI with pixel UI
- Place low-contrast pink on light backgrounds
- Use color alone to convey state
- Add un-tokenized decoration
- Break pixel grid alignment

---

## 10. Animation Guidelines

### Frame Rates
- Idle: 8-10 fps
- Walk: 6-8 fps
- Attack: 10-12 fps
- Hit: 12-15 fps (snappy)
- Death: 8 fps (impactful)

### VFX Timing
- Damage numbers: 0.5s fade
- Heal particles: 1s drift
- Projectiles: match enemy attack speed
- Screen shake: 0.2s max

### Telegraph Animations
- Pulse: 2-3 beats before attack
- Charge: buildup with increasing opacity
- Lock-on: target frame + color shift

---

## 11. Content Organization

### Data Files
- `/content/game_content.json` — Characters, enemies, stages
- `/content/stages.json` — Stage definitions, backgrounds
- `/content/enemies.json` — Enemy roster with patterns
- `/content/charms.json` — Passive charm definitions
- `/content/stories.json` — Story beats, lore cards

### Asset Folders
- `/art/sprites/characters/` — Player sprites
- `/art/sprites/enemies/` — Enemy sprites
- `/art/sprites/vfx/` — Particle effects
- `/art/ui/` — UI elements, icons

---

## 12. Acceptance Checklist

- [ ] All colors from TOKENS.json only
- [ ] 1px outlines on all sprites
- [ ] No anti-aliasing on game elements
- [ ] Pixel font renders crisply at integer positions
- [ ] UI readable at gameplay distance
- [ ] Enemy telegraphs visible for 0.5s+ minimum
- [ ] Backgrounds don't obscure gameplay entities
- [ ] Boss chest UI shows 3 charm options clearly
- [ ] Charms have rarity indicators (color + icon)
- [ ] Stage progression feels distinct per stage
