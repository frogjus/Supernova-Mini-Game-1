# CLAUDE.md

## Project Overview

**SUPERNOVA: Stage Survivors** — A K-pop idol bullet-hell roguelike survival game built with vanilla JavaScript and HTML5 Canvas. Four idol characters (Miho, Hyunju, Sujin, Sohee) fight through a surreal "attention economy" themed campaign.

- **Live URL**: https://frogjus.github.io/Supernova-Mini-Game-1/
- **Theme**: Princess Goth (Princessy x Edgy Pixel Pop)

## Tech Stack

- Vanilla JavaScript (ES6+), HTML5 Canvas 2D — **zero dependencies**
- External JSON for game content (enemies, stages, charms, stories)
- GitHub Pages deployment via GitHub Actions
- No build step, no bundler, no npm packages

## Running Locally

```bash
python -m http.server 8080
# Open http://localhost:8080/
```

No build or install step is needed. The game is a static site.

## Deploying

Push to `main` triggers automatic GitHub Pages deployment via `.github/workflows/deploy-pages.yml`. Alternatively:

```bash
bash scripts/publish_pages.sh
```

## Testing

No automated test framework. Testing is manual playtesting in browser.

## Project Structure

```
index.html                  # Entry point — two canvas elements + font imports
game.js                     # All game logic (~4200 lines, monolithic)
content/
  game_content.js           # Async JSON loader + content helper functions
  game_content.json         # Story text, UI tokens, chapter data
  stages.json               # 10 world/stage definitions with parallax & difficulty
  enemies.json              # 39 enemy types (mobs, elites, bosses)
  charms.json               # Roguelike upgrade/charm system
  stories.json              # Dialogue, intros, character quotes
art_direction/              # Design system documentation
  TOKENS.json               # Color palette & design tokens (source of truth)
  STYLE.md                  # Princess Goth visual guidelines
  SCREEN_SPECS.md           # Resolution & layout specs
  SPRITE_SPECS.md           # Pixel art specifications
  ICON_RULES.md             # Icon design rules
  UI_COMPONENTS.md          # Component anatomy & states
  ASSET_LIST.md             # Asset inventory checklist
scripts/
  publish_pages.sh          # One-command GitHub Pages publisher
.github/workflows/
  deploy-pages.yml          # CI/CD pipeline
```

## Architecture

### Rendering
- **Two-layer canvas**: `gameCanvas` (320x240 world) + `uiCanvas` (960x720 UI, 3x scale)
- Pixel-perfect rendering — anti-aliasing disabled
- Immediate mode: clear and redraw every frame

### State Machine
Game state is a single `state` variable cycling through: `TITLE → SELECT → PLAYING → LEVELUP → BOSS_CHEST → CHARM_INVENTORY → GAMEOVER → PAUSED`

### Key Sections in game.js
| Lines (approx) | Section |
|---|---|
| 8–20 | Canvas setup & constants |
| 23–220 | UI color tokens, typography helpers, decorative draw functions |
| 236–695 | Pixel art sprites (hex-encoded), icon system, sprite caches |
| 943–1052 | Game state, player/enemy/projectile globals |
| 1087–1520 | Game mechanics (spawning, collision, XP, leveling) |
| 1523–1710 | Skill system (4 active + utility + ultimate per character) |
| 1862–2500 | Update functions (player, enemies, projectiles, particles) |
| 2506–3058 | Render functions (world, HUD, effects) |
| 3059–4128 | UI state screens (title, select, level-up, game over, charms) |
| 4129–4180 | Main game loop (`update()` → `draw()` → `requestAnimationFrame`) |

### Content System
All game data is loaded from JSON at startup via `content/game_content.js`:
- `getEnemyDef(id)` — look up enemy definitions
- `getCharmById(id)` — look up charm data
- `getStagesForChapter(chapter)` — get stages for a chapter

### Characters
1. **Miho** (Fox-princess) — Attack/damage focused
2. **Hyunju** (Dreamwave) — Support/control focused
3. **Sujin** (Techno-princess) — Precision/DPS focused
4. **Sohee** (Guardian ballerina) — Defense/support focused

Each has 4 active skills, 1 utility, 1 ultimate, and 2 passives.

## Code Style

- **Naming**: camelCase for functions/variables, ALL_CAPS for constants
- **Sections**: Delimited with `// === SECTION NAME ===` comments
- **No linter or formatter configured** — no ESLint, no Prettier
- **Semicolons**: Used consistently
- **Functions**: Prefixed by role — `draw*()`, `update*()`, `fire*()`, `get*()`
- **Sprites**: Hardcoded as hex-encoded pixel grids in `game.js`

## Design System

- **Color tokens**: Defined in `art_direction/TOKENS.json` (also hardcoded in game.js)
- **Fonts**: DM Serif Display (editorial), Inter (clean UI), Press Start 2P (pixel accents)
- **Pixel policy**: 1px dark outlines, flat + 1-2 shadow tones, no anti-aliasing
- **Character sprites**: 16x20px base; enemies: 8x8 to 16x16; icons: 16x16

## Key Constants

```javascript
const PW = 320, PH = 240;   // Pixel world dimensions
const UW = 960, UH = 720;   // UI canvas dimensions
const S = 3;                  // Scale factor
const MAX_PARTICLES = 200;
const MAX_PROJECTILES = 300;
const MAX_ENEMY_PROJECTILES = 100;
```
