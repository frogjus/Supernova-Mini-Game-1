# Asset Inventory

## Existing Assets (In-Code)

### Character Sprites
- **idol_miho** — 16x20 pixel sprite, hex-encoded in game.js (SPRITE_HAIR + SPRITE_BODY)
- **idol_hyunju** — 16x20 pixel sprite, hex-encoded in game.js
- **idol_sujin** — 16x20 pixel sprite, hex-encoded in game.js
- **idol_sohee** — 16x20 pixel sprite, hex-encoded in game.js

### Pixel Icons (16x16, in PIXEL_ICONS atlas)
- heart, crown, flame, star, shield, beam, fox, music, sparkle, bolt

### UI Components (procedural in game.js)
- drawPixelPanel — lace-corner panel with optional ribbon/spikes
- drawHeartChip — pink chip with heart prefix
- drawGemChip — diamond-shaped level indicator
- drawCommentBubble — social comment speech block
- drawReactionBar — emoji reaction row
- drawPullQuote — editorial italic quote with bar
- drawCutout — irregular clipped rectangle
- drawTape — rotated translucent tape strip
- drawHighlight — highlighter underline accent
- drawSticker — rotated emoji blob
- drawShareRow — SAVE/SHARE/REMIX button row

### SFX (procedural via Web Audio)
- hit, kill, levelUp, pickup, playerHit, select, start, gameOver
- foxFire, heartWave, starBeam, shieldUp, fanChant, bossSpawn, bossKill

## Needed Assets (Phase 3+)

### New Pixel Icons (16x16)
| Asset | Category | Status | Priority |
|-------|----------|--------|----------|
| butterfly icon | UI icon | needed | P1 |
| ribbon icon | UI icon | needed | P1 |
| key icon | UI icon | needed | P2 |
| wing icon | UI icon | needed | P1 |
| bandaid icon | UI icon | needed | P2 |
| skull icon | UI icon | needed | P2 |

### Enemy Sprites (hex-encoded)
| Asset | Size | Status | Priority |
|-------|------|--------|----------|
| flash_stalker sprite | 8x10 | needed | P1 |
| tabloid_runner sprite | 10x10 | needed | P1 |
| comment_wasp sprite | 8x8 | needed | P1 |
| gatekeeper_knight sprite | 12x12 | needed | P1 |
| fancam_leech sprite | 9x9 | needed | P1 |
| spoiler_imp sprite | 8x9 | needed | P1 |
| doomscroll_slug sprite | 12x8 | needed | P1 |
| leak_rat sprite | 8x8 | needed | P1 |
| echo_fan sprite | 10x11 | needed | P1 |
| receipt_hunter sprite | 11x12 | needed | P1 |

### Elite Sprites (hex-encoded)
| Asset | Size | Status | Priority |
|-------|------|--------|----------|
| paparazzi_rig sprite | 14x18 | needed | P1 |
| trending_executor sprite | 14x16 | needed | P1 |
| archive_warden sprite | 16x18 | needed | P1 |
| reply_hydra sprite | 14x16 | needed | P1 |
| blacklist_duelist sprite | 14x18 | needed | P1 |

### Boss Sprites (hex-encoded)
| Asset | Size | Status | Priority |
|-------|------|--------|----------|
| queen_of_clickbait sprite | 24x24 | needed | P1 |
| mr_algorithm sprite | 22x22 | needed | P1 |
| director_cut sprite | 24x24 | needed | P1 |
| glass_prince sprite | 20x20 | needed | P1 |
| midnight_forum sprite | 26x26 | needed | P1 |
| the_disbander sprite | 32x32 | needed | P1 |

### VFX Assets
| Asset | Category | Status | Priority |
|-------|----------|--------|----------|
| Skill motif VFX shapes | VFX | needed | P2 |
| Boss telegraph shapes (11 types) | VFX | needed | P1 |
| Arena floor patterns (6 types) | Background | needed | P2 |
| Chapter transition card frame | UI | needed | P2 |
| Ultimate charge meter | UI | needed | P2 |
| Heart HP bar (7x6 heart shape) | UI | needed | P1 |

## Reference Sets
- Character references: see `refs/character/` — Miho, Sohee, Sujin, Hyunju standee/booth/episode refs
- UI references: see `refs/ui/` — pixel heart UI, retro pink panels, gothic-cute mood boards
