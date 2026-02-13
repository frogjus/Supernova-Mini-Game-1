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

## 5a) Mob Sprite Specs (10 types)

| ID | Name | Size | Silhouette | Palette Cue | Notes |
|----|------|------|-----------|-------------|-------|
| flash_stalker | Flash Stalker | 8x10 | Hunched lens-head | Slate + red LED blink | Camera flash VFX on attack |
| tabloid_runner | Tabloid Runner | 10x10 | Paper stack cape | Newsprint gray + magenta | Boomerang page projectile |
| comment_wasp | Comment Wasp | 8x8 | Winged chat bubble | Violet + acid pink | Zigzag flight path |
| gatekeeper_knight | Gatekeeper Knight | 12x12 | Shield icon block | Lilac armor + dark core | Front-facing shield pixel block |
| fancam_leech | Fancam Leech | 9x9 | Floating lens orb | Cyan rim + black center | Tether beam connects to player |
| spoiler_imp | Spoiler Imp | 8x9 | Jagged paper imp | Rose + ink black | Burst packet cross shape |
| doomscroll_slug | Doomscroll Slug | 12x8 | Long blob with phone glow | Desat purple + neon text | Leaves trail tiles |
| leak_rat | Leak Rat | 8x8 | Small hooded rodent | Gray + pink eyes | Hop animation on attack |
| echo_fan | Echo Fan | 10x11 | Speaker backpack | Teal + magenta | Shockwave ring VFX |
| receipt_hunter | Receipt Hunter | 11x12 | Long coat + note spear | Sepia + crimson | Thrust/jab attack frame |

All mob sprites use 3-color palette encoding: 1=outline (darkest), 2=fill (body), 3=highlight (accent).

## 5b) Elite Sprite Specs (5 types)

| ID | Name | Size | Mechanic | Silhouette |
|----|------|------|----------|-----------|
| paparazzi_rig | Paparazzi Rig | 14x18 | Multi-flash barrage | Camera mech with tripod legs |
| trending_executor | Trending Executor | 14x16 | Marks hottest target | Hooded figure with trending arrow |
| archive_warden | Archive Warden | 16x18 | Zone denial (deletes pickups) | Filing cabinet golem |
| reply_hydra | Reply Hydra | 14x16 | Splits on hit | Multi-headed chat bubble mass |
| blacklist_duelist | Blacklist Duelist | 14x18 | Telegraphed dash chains | Cloaked figure with X-mark blade |

Elite sprites use 14x14 to 18x18 range. Palette: outline + primary + accent + optional glow pixel.

## 5c) Boss Sprite Specs (6 types)

| ID | Name | Size | Arena Theme | Key Visual |
|----|------|------|-------------|-----------|
| queen_of_clickbait | Queen of Clickbait | 24x24 | Neon Newsroom | Crown of headlines, pink neon glow |
| mr_algorithm | Mr. Algorithm | 22x22 | Data Cathedral | Grid-face, data stream cape |
| director_cut | Director Cut | 24x24 | Broken Stage Set | Spotlight head, clapboard body |
| glass_prince | Glass Prince | 20x20 | Mirror Hall | Reflective chrome body, crown shard |
| midnight_forum | Midnight Forum | 26x26 | Floating Chat Abyss | Amorphous chat bubble mass |
| the_disbander | The Disbander | 32x32 | Fractured Throne | Fracture-crown, void cape, largest boss |

Boss sprites use 20x20 to 32x32 range. Each has unique silhouette readable at game resolution.

## 5d) Skill VFX Specs

Each skill has a `motif` that maps to a visual shape:

| Motif | Shape | Size | Usage |
|-------|-------|------|-------|
| flame hearts | Flickering pixel flame with heart core | 3x4 per flame | Fox Fire projectile |
| crescent tails | Arc sweep lines radiating from player | radius 28-48px | Nine-Tail Sweep |
| pink sigil | Rotating circle with cross marks | 16x16 | Charm Lock root indicator |
| glitch afterimages | Fading player silhouettes along dash path | 16x20 each | Mirror Step dash trail |
| circular heart pulse | Expanding ring of heart shapes | radius 20-60px | Heart Wave |
| cloud hearts | Floating hearts with cloud wisps | 8x8 each | Daydream Field |
| ribbon lines | Connecting lines between linked enemies | 1px wide | Empathy Link |
| soft lens frame | Circular blur frame overlay | radius 30-50px | Rose Filter debuff zone |
| laser lance | Thin bright line with glow | 2px wide, length 40-80px | Star Beam |
| target frame | Bracket corners around marked enemy | 4px corner marks | Data Scan |
| binary petals | Scattered 0/1 digits in petal pattern | 6x6 spread | Algorithm Burst |
| glitch crown | Crown shape with glitch distortion | 12x12 | Overclock activation |
| heart wing barrier | Heart-shaped shield with wing extensions | 14x14 | Aura Shield orb |
| crown charge line | Forward dash trail with crown motif | 4px wide | Breakthrough |
| stacking sigils | Layered glyph marks on character | 8x8 per layer | Quiet Strength buff |
| wing shatter | Butterfly wing fragments expanding outward | 6x6 each | Butterfly Effect pop |

## 5e) Boss Telegraph Visualization Specs

| Telegraph | Shape | Color Source | Timing |
|-----------|-------|-------------|--------|
| headline_slash | Horizontal line sweep | Queen of Clickbait primary | 45 frame warn |
| camera_cone | Cone wedge from boss | Queen of Clickbait accent | 40 frame warn |
| grid_lock | Rectangular grid overlay | Mr. Algorithm primary | 50 frame warn |
| ranking_beam | Vertical beam column | Mr. Algorithm accent | 35 frame warn |
| spotlight_snipe | Circle target on player | Director Cut primary | 40 frame warn |
| mirror_clone | Ghost copies at positions | Glass Prince primary | 45 frame warn |
| shard_rain | Falling shard indicators | Glass Prince accent | 50 frame warn |
| vote_circle | Expanding circle zone | Midnight Forum primary | 45 frame warn |
| thread_chain | Line connections between points | Midnight Forum accent | 40 frame warn |
| phase_tear | Irregular void shape | The Disbander primary | 50 frame warn |
| void_wedge | Wide cone from boss | The Disbander accent | 55 frame warn |

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
