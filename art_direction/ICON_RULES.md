# Icon Rules — Pixel UI

## Grid
- Primary HUD icons: 16x16.
- Menu/selection icons: 24x24.
- Keep motif centered and readable at 1x scale.

## Stroke + Fill
- 1px outer outline (dark local tone).
- Fill uses max 2 tones (+ optional 1 highlight pixel cluster).
- No anti-aliased curves; stair-step diagonals only.

## Corner + Curves
- Corners are stepped pixel corners.
- Rounded look achieved via pixel corner removal, not vector smoothing.

## Motif Set (Allowed)
- Hearts, crowns, ribbons, keys, wings, gem chips, sparkle stars.
- Edgy accents: tiny spikes, slash marks, glitch fragments.

## Skill Icon Assignments

### Active Skills (16 total)
| Skill | Icon | Colors |
|-------|------|--------|
| Fox Fire | flame | #ff8844 / #ffcc66 |
| Nine-Tail Sweep | fox | #f7e065 / #fff0a0 |
| Charm Lock | sparkle | #ff66aa / #ffaadd |
| Mirror Step | bolt | #ddaaff / #eeddff |
| Heart Wave | heart | #ff6688 / #ffaacc |
| Daydream Field | sparkle | #aaccff / #ddeeff |
| Empathy Link | bolt | #ff88cc / #ffbbee |
| Rose Filter | heart | #ffaa44 / #ffdd88 |
| Star Beam | beam | #ffdd44 / #ffee88 |
| Data Scan | beam | #44aaff / #88ccff |
| Algorithm Burst | bolt | #88ff88 / #bbffbb |
| Overclock | bolt | #ff8844 / #ffbb88 |
| Aura Shield | shield | #88ccff / #bbddff |
| Breakthrough | star | #ffdd44 / #ffee88 |
| Quiet Strength | star | #aaddff / #ddeeff |
| Butterfly Effect | butterfly | #bb88ff / #ddbbff |

### Utility Skills (4 total)
| Skill | Icon | Colors |
|-------|------|--------|
| Velvet Dodge | ribbon | #ff66aa / #ffaacc |
| Float Step | wing | #ffaa44 / #ffcc88 |
| Phase Slide | bolt | #88ff88 / #bbffbb |
| Guard Step | shield | #88ccff / #aaddff |

### Ultimate Skills (4 total)
| Skill | Icon | Colors |
|-------|------|--------|
| Throne of Nine | crown | #ffd700 / #fff0a0 |
| Inner World | heart | #ffbbdd / #ffddef |
| Viral Code | sparkle | #ff44aa / #ff88cc |
| Sanctuary Stage | shield | #88ccff / #bbddff |

### New Icon Types Needed
- **butterfly**: 16x16, symmetrical wings, rounded body center, 2-tone fill
- **ribbon**: 16x16, tied bow shape, trailing ends, soft curves via pixel stepping
- **key**: 16x16, heart-topped key shaft, 2 teeth at bottom
- **wing**: 16x16, single angel/butterfly wing, feather detail at edge
- **bandaid**: 16x16, cross/plus bandage shape, dot pattern fill
- **skull**: 16x16, cute rounded skull, heart-shaped eye sockets

## State Variants
- Default: standard fill + outline.
- Active: glow-adjacent color and subtle pulse.
- Cooldown: dimmed + wipe mask.
- Disabled: desaturated + reduced contrast.

## Accessibility Rule
Never rely solely on hue changes; state must also change by:
- overlay shape,
- icon fill amount,
- or pattern (stripe/hatch/pulse).
