#!/usr/bin/env node
// Headless auto-play: simulates many full runs with random (but not brain-dead) card
// play and random map/event/shop/rest choices, to catch crashes and surface obvious
// balance problems (win rate, average floor reached, runaway turn counts, etc).
//
// Usage: node tools/autoplay.mjs [numRuns]
// Runs in plain Node — no browser, no build step — using a tiny in-memory localStorage
// shim since engine/run.js persists there.

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { createRun, getNode, completeNode, applyGold, addCardToDeck, removeCardFromDeck,
  upgradeCardInDeck, healPercent, setPlayerHp, battleParamsForNode, randomGold,
  addRelic, pickRandomUnownedRelic, getRelicBattleModifiers, getGoldMultiplier,
  getHealOnWinPct, applyEventEffects } = await import('../engine/run.js');
const { createBattle, playCard, endPlayerTurn } = await import('../engine/battle.js');
const { getCard, getRewardPool, isUpgraded } = await import('../data/cards.js');
const { EVENTS } = await import('../data/events.js');

const NUM_RUNS = Number(process.argv[2]) || 30;
const MAX_NODES_PER_RUN = 60; // guards against an infinite-loop map bug
const MAX_TURNS_PER_BATTLE = 150; // guards against a stalemate/infinite-loop battle bug

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function incomingDamage(enemy) {
  if (!enemy.intent) return 0;
  return enemy.intent.effects
    .filter((e) => e.type === 'damage' && e.target === 'opponent')
    .reduce((sum, e) => sum + e.value * (e.hits || 1), 0);
}

// Not a full solver — just enough heuristic (block when a real hit is incoming and
// under-blocked, otherwise attack) that battles are a meaningful balance signal rather
// than pure noise, while still keeping some randomness to stress-test odd card orders.
function chooseCard(state, playable) {
  if (Math.random() < 0.1) return pick(playable);
  const threat = incomingDamage(state.enemy) - (state.player.block + state.player.statuses.ward);
  const withCards = playable.map((c) => ({ c, card: getCard(c.id) }));
  if (threat > 0) {
    const blockers = withCards.filter(({ card }) => card.effects.some((e) => e.type === 'block' && e.target === 'self'));
    if (blockers.length) return pick(blockers).c;
  }
  const attackers = withCards.filter(({ card }) => card.effects.some((e) => e.type === 'damage' && e.target === 'opponent'));
  if (attackers.length) return pick(attackers).c;
  return pick(playable);
}

function simulateBattle(battleArgs) {
  const { state, events } = createBattle(battleArgs);
  let allEvents = events.length;
  let turns = 0;
  while (!state.outcome && turns < MAX_TURNS_PER_BATTLE) {
    const playable = state.player.hand.filter((c) => getCard(c.id).cost <= state.player.energy);
    if (playable.length > 0 && Math.random() < 0.9) {
      const evts = playCard(state, chooseCard(state, playable).uid);
      allEvents += evts.length;
    } else {
      const evts = endPlayerTurn(state);
      allEvents += evts.length;
      turns += 1;
    }
  }
  if (!state.outcome) {
    throw new Error(`battle did not resolve within ${MAX_TURNS_PER_BATTLE} turns (possible stalemate/infinite loop)`);
  }
  return { state, turns, allEvents };
}

function simulateShop(run) {
  // buy 0-2 affordable cards, maybe remove one, then leave
  for (let i = 0; i < 2; i++) {
    const pool = getRewardPool();
    const card = pick(pool);
    const price = { common: 45, uncommon: 65, rare: 95 }[card.rarity];
    if (run.gold >= price && Math.random() < 0.5) {
      applyGold(run, -price);
      addCardToDeck(run, card.id);
    }
  }
  if (run.gold >= 60 && run.deck.length > 5 && Math.random() < 0.3) {
    applyGold(run, -60);
    removeCardFromDeck(run, Math.floor(Math.random() * run.deck.length));
  }
}

function simulateRest(run) {
  const upgradable = run.deck.map((id, i) => i).filter((i) => !isUpgraded(run.deck[i]));
  if (run.hp < run.maxHp && (upgradable.length === 0 || Math.random() < 0.5)) {
    healPercent(run, 0.3);
  } else if (upgradable.length > 0) {
    upgradeCardInDeck(run, pick(upgradable));
  } else {
    healPercent(run, 0.3);
  }
}

function simulateEvent(run) {
  const event = pick(EVENTS);
  const choice = pick(event.choices);
  applyEventEffects(run, choice.effects);
}

function simulateFight(run, node, stats) {
  const params = battleParamsForNode(run, node);
  const goldEarned = Math.round(randomGold(params.goldReward) * getGoldMultiplier(run));
  const relicMods = getRelicBattleModifiers(run);
  const { state, turns } = simulateBattle({
    deckIds: run.deck, enemyId: params.enemyId, playerMaxHp: run.maxHp, playerHp: run.hp,
    hpMultiplier: params.hpMultiplier, dmgMultiplier: params.dmgMultiplier, ...relicMods,
  });
  stats.battleTurns.push(turns);
  setPlayerHp(run, state.player.hp);

  if (state.outcome === 'win') {
    applyGold(run, goldEarned);
    const healPct = getHealOnWinPct(run);
    if (healPct > 0) healPercent(run, healPct);
    if (Math.random() < params.relicChance) {
      const relic = pickRandomUnownedRelic(run);
      if (relic) addRelic(run, relic.id);
    }
    if (Math.random() < 0.8) {
      const rewardCard = pick(getRewardPool());
      addCardToDeck(run, rewardCard.id);
    }
    return true;
  }
  stats.deaths[state.enemy.name] = (stats.deaths[state.enemy.name] || 0) + 1;
  return false;
}

function simulateRun(stats) {
  const run = createRun();
  let nodesVisited = 0;
  while (run.status === 'active' && nodesVisited < MAX_NODES_PER_RUN) {
    nodesVisited += 1;
    if (run.availableNodeIds.length === 0) {
      throw new Error('no available nodes while run is active (map generation bug)');
    }
    const nodeId = pick(run.availableNodeIds);
    const node = getNode(run, nodeId);

    if (node.type === 'rest') {
      simulateRest(run);
      completeNode(run, nodeId);
    } else if (node.type === 'shop') {
      simulateShop(run);
      completeNode(run, nodeId);
    } else if (node.type === 'event') {
      simulateEvent(run);
      completeNode(run, nodeId);
    } else {
      const won = simulateFight(run, node, stats);
      if (won) completeNode(run, nodeId);
      else break; // run.status is now 'lost'
    }
  }
  if (run.status === 'active') {
    throw new Error(`run exceeded ${MAX_NODES_PER_RUN} nodes without resolving (possible infinite loop)`);
  }
  return run;
}

function main() {
  const stats = {
    wins: 0, losses: 0, errors: [],
    actsReached: [], floorsReached: [], goldFinal: [], deckSizes: [], relicCounts: [],
    battleTurns: [], deaths: {},
  };

  for (let i = 0; i < NUM_RUNS; i++) {
    try {
      const run = simulateRun(stats);
      if (run.status === 'won') stats.wins += 1; else stats.losses += 1;
      stats.actsReached.push(run.act);
      stats.floorsReached.push(run.visitedNodeIds.length);
      stats.goldFinal.push(run.gold);
      stats.deckSizes.push(run.deck.length);
      stats.relicCounts.push(run.relics.length);
    } catch (err) {
      stats.errors.push(`run ${i}: ${err.message}\n${err.stack}`);
    }
  }

  const avg = (arr) => (arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'n/a');
  const max = (arr) => (arr.length ? Math.max(...arr) : 'n/a');

  console.log(`\n=== WILDCARD autoplay report (${NUM_RUNS} runs) ===`);
  console.log(`Wins (Act 3 clear): ${stats.wins}/${NUM_RUNS} (${((stats.wins / NUM_RUNS) * 100).toFixed(0)}%)`);
  console.log(`Losses: ${stats.losses}/${NUM_RUNS}`);
  console.log(`Crashes/hangs: ${stats.errors.length}`);
  console.log(`Avg act reached: ${avg(stats.actsReached)} (max ${max(stats.actsReached)})`);
  console.log(`Avg floors visited: ${avg(stats.floorsReached)} (max ${max(stats.floorsReached)})`);
  console.log(`Avg final gold: ${avg(stats.goldFinal)}`);
  console.log(`Avg final deck size: ${avg(stats.deckSizes)}`);
  console.log(`Avg relics found: ${avg(stats.relicCounts)}`);
  console.log(`Avg turns per battle: ${avg(stats.battleTurns)} (max ${max(stats.battleTurns)})`);

  const deathEntries = Object.entries(stats.deaths).sort((a, b) => b[1] - a[1]);
  if (deathEntries.length) {
    console.log('\nDeaths by enemy:');
    for (const [name, count] of deathEntries) console.log(`  ${name}: ${count}`);
  }

  if (stats.errors.length) {
    console.log('\n=== ERRORS ===');
    for (const e of stats.errors) console.log(e, '\n');
    process.exitCode = 1;
  } else {
    console.log('\nNo crashes or hangs across all runs.');
  }
}

main();
