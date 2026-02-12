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

### Silhouette
- Instantly identifiable hair mass and accessory read.
- Outfit silhouettes must remain distinct at 16–32px tall gameplay read.

### Face/Eyes
- Big expressive eyes with clear upper lash line.
- Eye highlights used sparingly as focal points.

### Hair Rendering
- Chunked volume shapes + clear strand direction.
- Bright accent streaks allowed for identity.

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
- Boss telegraph colors reserved and consistent per boss family.
- Glitch highlight usage only for danger/ultimate moments.

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
