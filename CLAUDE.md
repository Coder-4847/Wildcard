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
- `data/cards.js` — 60 card definitions (id, name, cost, type, rarity, archetype, description, effects[]). `getCard('id+')` synthesizes the upgraded form generically (see below) — upgrades are not hand-authored per card.
- `data/enemies.js` — 18 enemy definitions (id, name, maxHp, intent pattern/AI, `tier`: 'normal'|'elite'|'boss', bosses also carry `act`). `getNormalEnemyPool()` / `getEliteEnemyPool()` / `getBossId(act)` are the map's enemy-selection helpers. Normal and elite are a shared roster reused across all 3 acts; `engine/run.js` scales them up per act.
- `data/relics.js` — 15 passive relics. Each is a handful of optional numeric fields (`maxHpBonus`, `energyBonus`, `drawBonus`, `startBlock`/`startMight`/`startWard`, `goldGainPct`, `healOnWinPct`) that `engine/run.js` sums across owned relics — adding a relic is one data entry, not new code.
- `data/events.js` — 9 mystery events, each 2-3 choices whose `effects` run through `engine/run.js`'s `applyEventEffects` (gold/hp/maxHp/addCard/addRandomCard/removeRandomCard/upgradeRandomCard/relic/randomRelic, any effect can carry `chance`).
- `engine/battle.js` — battle state machine: draw/discard/energy, playing cards, effect execution, enemy AI turn resolution, statuses. Pure logic, no DOM. `createBattle` takes `playerHp` (carried over between fights), `hpMultiplier`/`dmgMultiplier` (act/elite scaling, applied to a cloned pattern — never mutates base enemy data), and relic-driven `energyBonus`/`drawBonus`/`startBlock`/`startMight`/`startWard`.
- `engine/map.js` — pure branching-map generator (`generateAct()`): floors of lane-positioned nodes (fight/elite/rest/shop/event, forced fight on floor 0 and rest on the pre-boss floor) with guaranteed connectivity from every start node to the boss. No pixel coordinates — `ui/map.js` computes those.
- `engine/run.js` — run state: deck/gold/HP/relics/map progress across all 3 Acts, node resolution (`completeNode` — advances to the next Act's map on a non-final boss win, ends the run on the Act 3 boss), relic modifiers, and localStorage save/load (`saveRun`/`loadRun`/`clearRun`). Mid-fight progress is never saved — only completed nodes commit.
- `engine/settings.js` — small persisted settings blob (`muted`, `reduceMotion`, `seenTutorial`), separate from run state so it survives "New Run" and abandoned runs alike.
- `ui/title.js` — title screen; shows "Continue Run" when an active save exists, plus "How to Play" and a settings gear.
- `ui/battle.js` — renders the battle screen from `engine/battle.js` state and wires up taps/clicks; also drives the attacker-lunge, hit-flash, death-fade and staggered card-entrance animations off the same event stream.
- `ui/reward.js` — post-battle "choose 1 of 3 cards or skip" screen; also shows a relic-found banner (with a pop-in animation and sound) when one drops.
- `ui/map.js` — renders the branching map as inline SVG (nodes + connecting edges) with a persistent HUD (act, HP, gold, owned relic icons, settings gear).
- `ui/rest.js` — rest site: heal 30% max HP or permanently upgrade one deck card. A "Back" button returns from the card-upgrade grid to the choice buttons; a "Continue" escape hatch appears only in the (rare) case both options are unavailable, so the node can never soft-lock.
- `ui/shop.js` — basic shop: buy from 4 random cards (priced by rarity) or pay to remove a card from the deck.
- `ui/event.js` — mystery event screen: flavor text plus choice buttons, gold-cost choices disabled when unaffordable.
- `ui/deckView.js` — read-only deck + relics viewer, opened from the map HUD.
- `ui/actTransition.js` — brief "Act N Clear!" screen shown between Acts.
- `ui/runSummary.js` — end-of-run screen (Act 3 clear or death) with act/floors/deck size/relics/gold, a collapsible "Show Deck & Relics" detail view, and a "New Run" button.
- `ui/tutorial.js` — a few static slides covering energy/cards, block/intents, statuses and map icons. Auto-shown once on first-ever launch, replayable via "How to Play" on the title screen.
- `ui/settings.js` — sound mute and reduce-motion toggles; `applySettingsToDocument()` puts a `reduce-motion` class on `<html>` that CSS uses to shorten/disable non-essential animations.
- `main.js` — app entry point and screen router; owns the single `run` object and passes it to each screen. Every screen switch routes through a `show()` helper that fades `#app` out/in so transitions are uniform without touching each `ui/*.js` file, and suppresses pointer events for the fade's duration so a rapid double-tap can't double-fire a handler on the outgoing screen.
- `.nojekyll` — disables GitHub Pages' Jekyll processing for this plain static site.
- `tools/autoplay.mjs` — headless Node script (`node tools/autoplay.mjs [numRuns]`), no browser needed. Simulates full multi-act runs with a heuristic-but-random AI (block when under-blocked against a real incoming hit, otherwise attack) and random map/shop/rest/event choices, to catch crashes/hangs and print a balance report (win rate, avg floor/act reached, turns per battle, deaths by enemy and by act). Uses a tiny in-memory `localStorage` shim since it imports `engine/run.js` directly.

## Known scope notes for future milestones
- Battles are 1-vs-1 only (`state.enemy` is a single object, not an array). If a future milestone needs multi-enemy fights, `engine/battle.js` will need `state.enemies: []` and effect targeting will need to support picking a specific enemy — treat that as a deliberate refactor, not a patch.
- Balance, M5 pass: `tools/autoplay.mjs` at 200 runs currently shows ~4-6% clear rate for a non-strategic heuristic AI, with no single enemy causing more than ~30% of any Act's deaths (Act 1 and Act 2 bosses were both trimmed this milestone after the script showed them dominating — watch specifically for a boss whose kit self-applies Vulnerable then attacks, since Vulnerable's 1.5x lands on that same attack and easily hides 30-50% more real damage than the base numbers suggest). Re-run the script after any further numeric changes.
- No difficulty settings, meta-progression, or run seeding — every run is independently randomized with no carry-over between runs (matches the brief; flagging in case a future milestone wants seeded runs for testing).
- M6 mobile/bug-fixing notes for anyone extending this further:
  - `.hand-scroll` is horizontally scrollable (`overflow-x: auto`) with `justify-content: safe center`, not just `visible`, specifically so a full 5-card hand plus the energy orb and End Turn button can't push each other off-screen on narrow landscape phones (~667px and under). If you add more fixed-width elements to `.battle-bottom`, re-test at that width — the failure mode is the End Turn button getting clipped by `#app`'s `overflow: hidden`, which is easy to miss since it doesn't error, it just silently strands the player.
  - Any screen that offers two exclusive choices should treat "both currently unavailable" as a real state to design for — `ui/rest.js` is the pattern to copy (an escape hatch that only appears when needed, never a dead-end screen with no completable action).
  - `main.js`'s `show()` transition suppresses pointer events on `#app` during the fade specifically to prevent double-fires on stateful actions (buying, picking a reward, choosing an event option). Any new screen-to-screen transition should go through `show()` rather than calling a `render*` function directly, or it loses this protection.

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

### Map and run
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
- M4 (~$15): content complete — 60 cards, all enemies, 3 acts, 3 bosses, relics, events, headless auto-play script for crash/balance testing. DONE.
- M5 (~$25): polish — animations, sound, screen shake, transitions, tutorial, settings, run summary, balance tuning. DONE.
- M6 (~$10): bug fixing, mobile testing fixes, final deployment. DONE.
