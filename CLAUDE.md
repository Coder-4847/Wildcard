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
- `data/cards.js` — card definitions (id, name, cost, type, rarity, archetype, description, effects[]). `getCard('id+')` synthesizes the upgraded form generically (see below) — upgrades are not hand-authored per card.
- `data/enemies.js` — enemy definitions (id, name, maxHp, intent pattern/AI, `tier`, `eliteEligible`). `getNormalEnemyPool()` / `getEliteEnemyPool()` / `getBossId()` are the map's enemy-selection helpers.
- `data/relics.js` — (from M4) relic definitions.
- `data/events.js` — (from M4) mystery event definitions.
- `engine/battle.js` — battle state machine: draw/discard/energy, playing cards, effect execution, enemy AI turn resolution, statuses. Pure logic, no DOM. `createBattle` takes `playerHp` (carried over between fights) and `hpMultiplier`/`dmgMultiplier` (elite/boss scaling) without mutating the base enemy data.
- `engine/map.js` — pure branching-map generator (`generateAct()`): floors of lane-positioned nodes with guaranteed connectivity from every start node to the boss. No pixel coordinates — `ui/map.js` computes those.
- `engine/run.js` — run state: deck/gold/HP/map progress, node resolution (`completeNode`), and localStorage save/load (`saveRun`/`loadRun`/`clearRun`). Mid-fight progress is never saved — only completed nodes commit.
- `ui/title.js` — title screen; shows "Continue Run" when an active save exists.
- `ui/battle.js` — renders the battle screen from `engine/battle.js` state and wires up taps/clicks.
- `ui/reward.js` — post-battle "choose 1 of 3 cards or skip" screen.
- `ui/map.js` — renders the branching map as inline SVG (nodes + connecting edges) with a persistent HP/gold HUD.
- `ui/rest.js` — rest site: heal 30% max HP or permanently upgrade one deck card.
- `ui/shop.js` — basic shop: buy from 4 random cards (priced by rarity) or pay to remove a card from the deck.
- `ui/deckView.js` — read-only full-deck viewer, opened from the map HUD.
- `ui/runSummary.js` — end-of-run screen (Act clear or death) with floors reached / deck size / gold, and a "New Run" button.
- `main.js` — app entry point and screen router; owns the single `run` object and passes it to each screen.

## Known scope notes for future milestones
- Battles are 1-vs-1 only (`state.enemy` is a single object, not an array). If Act maps need multi-enemy fights, `engine/battle.js` will need `state.enemies: []` and effect targeting will need to support picking a specific enemy — treat that as a deliberate refactor, not a patch.
- Only Act 1 exists (`engine/map.js` always generates one act, `main.js`/`engine/run.js` have no act-transition logic). Acts 2-3 and their bosses are M4 work: `generateAct()` will need an act number to pick different boss/enemy pools, and `run.js` needs an "advance to next act" step instead of ending the run at the Act-1 boss.
- Elites reuse the 3 toughest normal enemies scaled up (`ELITE_HP_MULTIPLIER`/`ELITE_DMG_MULTIPLIER` in `engine/run.js`) rather than having dedicated elite data. Give elites their own `data/enemies.js` entries in M4 when the full 12/3/3 roster is built.
- Mystery events (the 5th node type from the design brief) are not implemented — `engine/map.js` only generates fight/elite/rest/shop/boss. Add `'event'` to the weighted type pool and `data/events.js` + `ui/event.js` in M4.
- Relics are not implemented yet; `run` has no relics field. Add it alongside `data/relics.js` in M4.

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
- M2 (~$15): 5 statuses, card effect system, 30 cards, 6 enemies, card reward screen. DONE.
- M3 (~$15): branching map, full Act 1 run loop, rest sites, basic shop, save/resume, first boss. DONE.
- M4 (~$15): content complete — 60 cards, all enemies, 3 acts, 3 bosses, relics, events, headless auto-play script for crash/balance testing.
- M5 (~$25): polish — animations, sound, screen shake, transitions, tutorial, settings, run summary, balance tuning.
- M6 (~$10): bug fixing, mobile testing fixes, final deployment.
