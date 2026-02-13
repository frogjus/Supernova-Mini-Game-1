# SUPERNOVA Art Direction Bible — Princessy x Edgy Pixel Pop

## 0) Visual Audit (Current Build)

### Inconsistencies Found
- Palette drift: many ad-hoc hex values in code without a controlled token hierarchy.
- Mixed outline behavior: some sprites/UI blocks use implied outlines, others are fill-only.
- UI geometry mismatch: bars, pills, and cards mix rounded modern shapes with pixel blocks.
- Motif mismatch: social/zine motifs are strong, but princess/edgy motifs are not systematized.
- Typography hierarchy is uneven between HUD, boss bars, and overlays.
- State communication occasionally relies on color without shape/pattern backup.

### Refactor Goal
Unify everything under one **pixel-logic UI + sprite language** that is:
1. **Princessy** (hearts, tiaras, ribbons, lace trims, gem chips),
2. **Edgy** (spikes, caution cuts, chrome trims, neon/glitch danger accents),
3. **Legible first** at gameplay resolution.

---

## 1) Style DNA Extracted from References

### Palette DNA
- Dominant: soft pinks, blush, lilac, violet, cream.
- Secondary: cool cyan/chrome glints for contrast and “edgy tech”.
- Danger accents: hot magenta / warning red with dark backplates.
- Readability anchors: deep navy-charcoal backgrounds + high-value foreground text.

### Typography Vibe
- Pixel-display vibe for labels and micro UI.
- Clean sans for body readability.
- Decorative display use only for titles/boss cards.

### UI Geometry
- Pixel-window framing, stacked rectangles, 90° corners first.
- Softness via internal heart/ribbon chips (not blurry rounded corners).
- Buttons are chunky, center-aligned, high-contrast labels.

### Icon + Motif Language
- Hearts, keys, crowns, ribbons, tiny wings, gem droplets.
- Bandage/cross motifs and caution-strip accents for edgy utility.
- Small icon packs must read at 16x16.

### Line Weight + Shading
- Pixel outlines: 1px outer outline, selective internal lines.
- Shading: mostly flat + 2-tone, optional 3rd tone for hero sprites.
- Anti-aliasing: **none by default**.

### Animation Feel
- Snappy 2–6 frame loops.
- Decorative sparkles and glitch pops for feedback.
- Telegraphs should use shape + motion + color together.

---

## 2) Pixel Logic (Non-Negotiable)

- Base gameplay pixel density: **320x240 world, 3x UI scale**.
- Outline policy:
  - Characters: 1px darkest local tone.
  - Enemies: 1px silhouette-first outline.
  - UI icons: 1px outline on 16x16 or 24x24 grid.
- Shading policy:
  - Default: flat + shadow tone.
  - Hero moments: optional highlight tone.
- AA policy: off for sprites/UI primitives.

---

## 3) Palette Rules

See `TOKENS.json` for source of truth.

### Usage Rules
- Never introduce un-tokenized random colors.
- Every combat state must use both color + shape/pattern:
  - heal = mint + plus/heart,
  - damage = rose-red + crack/slash,
  - cooldown = dim overlay + radial/vertical wipe,
  - warning = hot stripe chip + icon.

### Contrast Rules
- UI text always on solid/semi-solid backplate.
- Minimum HUD text contrast target: 4.5:1 equivalent intent.
- Never place text directly over noisy VFX/background without plate.

---

## 4) Character Art Rules

### Per-Character Silhouette Specs (from reference images)

#### Miho 🦊 — Fox-Princess Striker
- **Hair**: Golden blonde twin-tails with volumetric fox-ear points at crown. Hair mass is the largest read — ear tips extend 3-4px above head.
- **Accessories**: Heart-shaped gloves, fox-ear headband with pink tips, golden tail accents (visible during cast/ultimate).
- **Outfit**: Pink/magenta idol outfit with gold trim. Belt sparkle at waist. Skirt with gradient to darker pink.
- **Silhouette key**: Tall ear points + wide twin-tail spread = instant recognition at 16px.
- **Reference**: `refs/character/Warudo_2026-01-06`, `refs/character/미호.png`

#### Sohee 🦋 — Guardian Ballerina
- **Hair**: Long straight blue hair with side part, falls past shoulders. Subtle bow/ribbon accent at crown.
- **Accessories**: Butterfly-wing cape contour visible in idle, layered skirt edges.
- **Outfit**: Green jacket over white blouse (ref: `supernova ep5 06.png`). Skirt layers in teal/blue tones.
- **Silhouette key**: Straight vertical hair lines + cape width = calm, grounded read.
- **Reference**: `refs/character/supernova ep5 06.png`, `refs/character/소희.png`

#### Sujin ⭐ — Precision Techno-Princess
- **Hair**: Sharp maroon/crimson bob cut, asymmetric fringe. Black bow accessory on one side.
- **Accessories**: Angular sleeve cuts, neon accent strips on outfit, chrome stud details.
- **Outfit**: Dark outfit (near-black with purple undertone), pink eye accents, yellow star motifs.
- **Silhouette key**: Compact head shape + angular shoulders = sharp, aggressive read.
- **Reference**: `refs/character/캐릭터등신대_SUPERNOVA.png`

#### Hyunju 🌙 — Dreamwave Empath
- **Hair**: Auburn/orange wavy twintails with volume. Star hair clip accent on right side.
- **Accessories**: Soft cape sleeves, star/moon motifs, ribbon ties on twintails.
- **Outfit**: Cream/warm white base with orange-peach accents. Teal/mint accessory highlights.
- **Silhouette key**: Wide wavy hair volume + star clip = warm, dynamic read.
- **Reference**: `refs/character/Warudo_2026-01-12`, `refs/character/캐릭터등신대_소희SUPERNOVA.png`

### Face/Eyes
- Big expressive eyes with clear upper lash line.
- Eye highlights used sparingly as focal points.
- Eye color is character-identity: Miho = pink, Sohee = teal, Sujin = blue, Hyunju = orange.

### Hair Rendering
- Chunked volume shapes + clear strand direction.
- Bright accent streaks allowed for identity.
- Hair outline uses darkened local tone (not pure black).

### Outfit Detailing
- Princess: bows, ribbons, frill bands, heart gems.
- Edgy: asymmetry panels, subtle straps, studs/spikes/chrome tags.
- Keep details clustered at focal zones (chest, belt, cuffs, headpiece).

---

## 5) UI Layout + Readability Rules

- HUD lanes:
  1) top-left identity + health,
  2) top-right macro metrics,
  3) center alerts (boss intro, quest card),
  4) bottom skill rail.
- Never exceed 2 border treatments per component.
- Busy motifs (lace/spikes) only on edges, never behind body text.
- Icon + label + state chip for crucial actions.

---

## 6) Lighting + FX Rules

- Base world lighting: low-key dark stage with bright character/UI accents.
- Character rim light: cool cyan or pink depending on role.

### Boss Telegraph Color Reservations

Each boss family has reserved telegraph colors to prevent confusion:

| Boss | Arena | Telegraph Primary | Telegraph Secondary | Glow |
|------|-------|------------------|-------------------|------|
| Queen of Clickbait | Neon Newsroom | `#FF44AA` (hot pink) | `#FFE38A` (gold) | `#FF79C6` |
| Mr. Algorithm | Data Cathedral | `#4488FF` (data blue) | `#89FFD1` (mint) | `#6DE6FF` |
| Director Cut | Broken Stage Set | `#FFB347` (spotlight amber) | `#FF4C7D` (danger red) | `#FFE38A` |
| Glass Prince | Mirror Hall | `#C8D6FF` (chrome silver) | `#B98CFF` (lilac) | `#E6D7FF` |
| Midnight Forum | Floating Chat Abyss | `#6A5AAA` (deep purple) | `#FF4FA3` (rose) | `#B98CFF` |
| The Disbander | Fractured Throne | `#443355` (void purple) | `#FF4C7D` (danger) | `#8F66FF` |

- Glitch highlight usage only for danger/ultimate moments.
- No two bosses share the same primary telegraph color.
- Arena floor tinting shifts to match boss family palette during encounters.

---

## 7) Do / Don’t

### Do
- Keep silhouettes readable first.
- Use tokenized colors and spacing.
- Keep iconography clean and consistent.
- Prioritize gameplay legibility over decoration.

### Don’t
- Don’t mix modern smooth UI with raw pixel UI in same component.
- Don’t place low-contrast pink text on light pink backgrounds.
- Don’t rely only on hue to convey game state.
- Don’t introduce new motifs that break princessy-edgy theme.

---

## 8) Resolution Targets

- Character gameplay sprite target: 16x20 to 24x28 base.
- Enemy mobs: 8x8 to 14x14.
- Elite/boss: 20x20+ with clean silhouette chunks.
- Icon grids: 16x16 (HUD), 24x24 (menus).

---

## 9) Final Cohesion Checklist

- [ ] Token palette only, no drift.
- [ ] Single outline/shading policy respected.
- [ ] UI readable at gameplay distance.
- [ ] Character style aligns with reference silhouette/face/hair language.
- [ ] Enemies and telegraphs are distinct at a glance.
- [ ] New content can be extended via data files.
