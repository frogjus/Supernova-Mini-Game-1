# Sprite + Animation Specs

## 1) Character Sprite Sheets

### Base Resolution Targets
- Standard idol: 16x20 or 20x24.
- Boss-like playable skin variants: up to 24x28.

### Sheet Layout (per character)
- Idle: 4 frames
- Run: 6 frames
- Hit reaction: 2 frames
- Cast: 4 frames
- Ultimate: 6 frames
- Downed/KO: 2 frames

Suggested grid:
- Rows = states
- Columns = frame progression

## 2) Frame Timing
- Idle: 8–10 fps
- Run: 10–12 fps
- Cast: 8 fps
- Ultimate burst: variable (12 fps with hold frames)

## 3) Shading + Outline
- 1px outline, no AA.
- Flat + 2-tone default, 3-tone allowed on face/hair focal areas.
- Keep highlights clustered and consistent with light direction.

## 4) Character Identity Markers
- Distinct hair silhouette and accessory read in first 1 second.
- Face/eye expression readable even in reduced sprite size.
- Outfit details concentrated at head/chest/waist for fast recognition.

## 5) Enemy Sprite Specs
- Mob size range: 8x8 to 14x14.
- Elite size range: 14x14 to 18x18.
- Boss size range: 20x20 to 36x36.
- Telegraph prep frames required for all high-damage attacks.

## 6) VFX Sprite Specs
- Hit sparks: 8x8
- Heal hearts: 8x8
- Crown core drops: 10x10
- Ultimate bursts: 16x16 and 24x24 layered sprites

## 7) Telegraph Shape Language
- Circle pulse = AoE danger.
- Cone wedges = directional attacks.
- Spike line = charge dash path.
- Heart shield ring = protection/heal zone.
- Glitch petals = corruption fields.

## 8) Export Rules
- Transparent background PNG.
- Naming: `<type>_<name>_<action>_f##.png`
- Example: `idol_miho_cast_f03.png`
