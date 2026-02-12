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
