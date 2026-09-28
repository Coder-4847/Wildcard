# WILDCARD

A polished 2D deckbuilder roguelike (Slay the Spire-style) for phone and desktop browsers.

## Tech constraints
- Plain HTML, CSS and JavaScript (ES modules). No framework, no build step, no dependencies. Must run directly on GitHub Pages (open `index.html`, no server-side build).
- UI is built from DOM elements, not canvas, so text stays crisp.
- Touch-first, responsive, landscape primary, but must also work on desktop with mouse. Tap targets must be large enough for thumbs (min ~44px).
- Sound effects are synthesized with the Web Audio API (no audio files). See `audio.js`.
- Save the run and settings in `localStorage`.
- All content (cards, enemies, relics, events) is DATA in `data/*.js`. Adding a card means adding one object to `data/cards.js`, not writing new systems. Card effects are composed from a small set of reusable effect types executed by `engine/battle.js`.

## File layout
- `index.html` — single entry point, loads `main.js` as a module, holds the `#app` mount point and Google Fonts links.
- `css/style.css` — all styling. Deep blue-purple backgrounds, gold accents, red for attack, blue for block, green for healing. Thick dark outlines, rounded corners, glossy pressable buttons (lighter top edge, darker bottom edge). Heavy rounded display font for names/numbers with dark text outlines.
- `audio.js` — Web Audio synth helpers (`playSound(name)` style API). No audio files ever.
- `data/cards.js` — card definitions (id, name, cost, type, rarity, archetype, description, effects[], upgraded variant).
- `data/enemies.js` — enemy definitions (id, name, maxHp, intent pattern/AI).
- `data/relics.js` — (from M2+) relic definitions.
- `data/events.js` — (from M3+) mystery event definitions.
- `engine/battle.js` — battle state machine: draw/discard/energy, playing cards, effect execution, enemy AI turn resolution, statuses. Pure logic, no DOM.
- `engine/run.js` — (from M3+) run/map state, node graph, save/resume.
- `engine/map.js` — (from M3+) branching map generation.
- `ui/title.js` — title screen.
- `ui/battle.js` — renders the battle screen from `engine/battle.js` state and wires up taps/clicks.
- `main.js` — app entry point; simple screen router that mounts/unmounts screens into `#app`.

## Game design reference

### Battle
- Turn-based. Each player turn: draw 5 cards, gain 3 energy. Cards cost 0-3 energy. Unspent hand cards discard at end of turn. When the draw pile empties, the discard pile reshuffles into it.
- Enemies show their next action (intent) above their head, e.g. "Attack 12" or "Defend".
- Block absorbs damage and resets to 0 at the start of the block-owner's own turn.
- Statuses (exactly these 5, added in M2): Might (bonus damage dealt), Weak (deals less damage), Vulnerable (takes more damage), Bleed (damage at turn start, then decays), Ward (temporary extra block).
- Win by reducing all enemies to 0 HP. Lose at 0 HP.

### Character
One playable hero, "The Jester", with 3 archetypes (card pools, added in M2+):
- HEX: curses and damage-over-time (Bleed) that stack.
- RUSH: cheap cards, drawing, chaining many plays in one turn.
- GUARD: block, Ward, and counter-attacks.

### Cards
60 total including starters (Strike, Defend). ~18 per archetype plus a few neutral cards. Three rarities (common/uncommon/rare). Every card has an upgraded version.

### Map and run (M3+)
- 3 acts, each a branching map of ~8 floors ending in a boss (3 bosses total).
- Node types: fight, elite fight, rest, shop, mystery event.
- After each fight: choose 1 of 3 card rewards or skip, plus gold and occasional relics.
- 12 normal enemies, 3 elites, 3 bosses, each with distinct behavior.
- ~15 passive relics.
- Death ends the run and shows a run summary; restart in one tap.

## Milestones (budget-boxed, ~$100 total)
Work one milestone at a time, commit + push, then stop and report to the user before continuing. Do not add features from a later milestone early.
- M0 (~$2): skeleton, title screen. DONE.
- M1 (~$15): one playable battle vs one enemy with the starter deck (draw/discard, energy, block, intents, win/lose). DONE.
- M2 (~$15): 5 statuses, card effect system, 30 cards, 6 enemies, card reward screen.
- M3 (~$15): branching map, full Act 1 run loop, rest sites, basic shop, save/resume, first boss.
- M4 (~$15): content complete — 60 cards, all enemies, 3 acts, 3 bosses, relics, events, headless auto-play script for crash/balance testing.
- M5 (~$25): polish — animations, sound, screen shake, transitions, tutorial, settings, run summary, balance tuning.
- M6 (~$10): bug fixing, mobile testing fixes, final deployment.
