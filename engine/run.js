// Run state: the map, deck, gold, HP and relics that persist between fights across all 3 Acts.
// Saved to localStorage after every change so the run can resume after a refresh.
// Mid-fight progress is intentionally NOT saved — a node only commits its effects
// (gold, deck changes, HP loss) once its encounter resolves.

import { generateAct } from './map.js';
import { buildStarterDeck, isUpgraded, getRewardPool } from '../data/cards.js';
import { getNormalEnemyPool, getEliteEnemyPool, getBossId } from '../data/enemies.js';
import { RELICS, getRelic } from '../data/relics.js';

const SAVE_KEY = 'wildcard_run_v1';
export const START_GOLD = 50;
export const START_MAX_HP = 70;
export const TOTAL_ACTS = 3;

export function createRun() {
  const map = generateAct();
  const run = {
    act: 1,
    deck: buildStarterDeck(),
    gold: START_GOLD,
    hp: START_MAX_HP,
    maxHp: START_MAX_HP,
    relics: [],
    map,
    currentNodeId: null,
    visitedNodeIds: [],
    availableNodeIds: map.startNodeIds.slice(),
    status: 'active', // 'active' | 'won' | 'lost'
  };
  saveRun(run);
  return run;
}

export function saveRun(run) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(run));
  } catch (e) { /* localStorage unavailable; run just won't persist */ }
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const run = JSON.parse(raw);
    if (!run || run.status !== 'active') return null;
    return run;
  } catch (e) {
    return null;
  }
}

export function clearRun() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
}

export function getNode(run, nodeId) {
  return run.map.nodes[nodeId];
}

export function isNodeAvailable(run, nodeId) {
  return run.availableNodeIds.includes(nodeId);
}

// Marks a node resolved and advances the run. Completing the Act boss either starts the
// next Act's map (deck/gold/hp/relics carry over) or, on Act 3, wins the whole run.
export function completeNode(run, nodeId) {
  run.visitedNodeIds.push(nodeId);
  run.currentNodeId = nodeId;
  const node = run.map.nodes[nodeId];

  if (node.type === 'boss') {
    if (run.act < TOTAL_ACTS) {
      run.act += 1;
      run.map = generateAct();
      run.currentNodeId = null;
      run.visitedNodeIds = [];
      run.availableNodeIds = run.map.startNodeIds.slice();
    } else {
      run.status = 'won';
      run.availableNodeIds = [];
    }
  } else {
    run.availableNodeIds = node.next.slice();
  }
  saveRun(run);
}

export function applyGold(run, amount) {
  run.gold = Math.max(0, run.gold + amount);
  saveRun(run);
}

export function addCardToDeck(run, cardId) {
  run.deck.push(cardId);
  saveRun(run);
}

export function removeCardFromDeck(run, deckIndex) {
  run.deck.splice(deckIndex, 1);
  saveRun(run);
}

export function upgradeCardInDeck(run, deckIndex) {
  const id = run.deck[deckIndex];
  if (!id.endsWith('+')) run.deck[deckIndex] = `${id}+`;
  saveRun(run);
}

export function healPercent(run, pct) {
  run.hp = Math.min(run.maxHp, run.hp + Math.round(run.maxHp * pct));
  saveRun(run);
}

export function setPlayerHp(run, hp) {
  run.hp = Math.max(0, Math.min(run.maxHp, hp));
  if (run.hp <= 0) run.status = 'lost';
  saveRun(run);
}

export function pickRandomUnownedRelic(run) {
  const pool = RELICS.filter((r) => !run.relics.includes(r.id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function addRelic(run, relicId) {
  if (run.relics.includes(relicId)) return;
  const relic = getRelic(relicId);
  run.relics.push(relicId);
  if (relic.maxHpBonus) {
    run.maxHp += relic.maxHpBonus;
    run.hp += relic.maxHpBonus;
  }
  saveRun(run);
}

// Live per-battle bonuses summed from every owned relic (maxHpBonus is applied once at
// acquisition in addRelic, not summed here).
export function getRelicBattleModifiers(run) {
  const mods = { energyBonus: 0, drawBonus: 0, startBlock: 0, startMight: 0, startWard: 0 };
  for (const id of run.relics) {
    const relic = getRelic(id);
    mods.energyBonus += relic.energyBonus || 0;
    mods.drawBonus += relic.drawBonus || 0;
    mods.startBlock += relic.startBlock || 0;
    mods.startMight += relic.startMight || 0;
    mods.startWard += relic.startWard || 0;
  }
  return mods;
}

export function getGoldMultiplier(run) {
  let mult = 1;
  for (const id of run.relics) mult += getRelic(id).goldGainPct || 0;
  return mult;
}

export function getHealOnWinPct(run) {
  let pct = 0;
  for (const id of run.relics) pct += getRelic(id).healOnWinPct || 0;
  return pct;
}

// Act-over-act difficulty scaling applied to normal and elite fights (bosses are already
// individually tuned per act and are not scaled further).
function actHpMultiplier(act) { return 1 + (act - 1) * 0.25; }
function actDmgMultiplier(act) { return 1 + (act - 1) * 0.15; }

// Returns { enemyId, hpMultiplier, dmgMultiplier, goldReward: [min, max], relicChance } for a node.
export function battleParamsForNode(run, node) {
  if (node.type === 'boss') {
    return { enemyId: getBossId(run.act), hpMultiplier: 1, dmgMultiplier: 1, goldReward: [40, 60], relicChance: 1 };
  }
  if (node.type === 'elite') {
    const pool = getEliteEnemyPool();
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return {
      enemyId: pick.id, hpMultiplier: actHpMultiplier(run.act), dmgMultiplier: actDmgMultiplier(run.act),
      goldReward: [25, 40], relicChance: 1,
    };
  }
  const pool = getNormalEnemyPool();
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return {
    enemyId: pick.id, hpMultiplier: actHpMultiplier(run.act), dmgMultiplier: actDmgMultiplier(run.act),
    goldReward: [10, 20], relicChance: 0.15,
  };
}

export function randomGold([min, max]) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// Generic executor for mystery-event choice effects (run-level, not battle-level).
// { type: 'gold', value } | { type: 'hp', value } | { type: 'maxHp', value }
// { type: 'addCard', cardId } | { type: 'addRandomCard', rarity? } | { type: 'removeRandomCard' } | { type: 'upgradeRandomCard' }
// { type: 'relic', relicId } | { type: 'randomRelic' }
// Any effect may carry `chance` (0-1) to only sometimes apply.
export function applyEventEffects(run, effects) {
  for (const effect of effects) {
    if (effect.chance !== undefined && Math.random() >= effect.chance) continue;
    if (effect.type === 'gold') {
      applyGold(run, effect.value);
    } else if (effect.type === 'hp') {
      setPlayerHp(run, run.hp + effect.value);
    } else if (effect.type === 'maxHp') {
      run.maxHp += effect.value;
      run.hp = Math.min(run.maxHp, run.hp + Math.max(0, effect.value));
      saveRun(run);
    } else if (effect.type === 'addCard') {
      addCardToDeck(run, effect.cardId);
    } else if (effect.type === 'addRandomCard') {
      const pool = getRewardPool().filter((c) => !effect.rarity || c.rarity === effect.rarity);
      if (pool.length > 0) addCardToDeck(run, pool[Math.floor(Math.random() * pool.length)].id);
    } else if (effect.type === 'removeRandomCard') {
      if (run.deck.length > 0) removeCardFromDeck(run, Math.floor(Math.random() * run.deck.length));
    } else if (effect.type === 'upgradeRandomCard') {
      const candidates = run.deck.map((id, i) => i).filter((i) => !isUpgraded(run.deck[i]));
      if (candidates.length > 0) upgradeCardInDeck(run, candidates[Math.floor(Math.random() * candidates.length)]);
    } else if (effect.type === 'relic') {
      addRelic(run, effect.relicId);
    } else if (effect.type === 'randomRelic') {
      const pick = pickRandomUnownedRelic(run);
      if (pick) addRelic(run, pick.id);
    }
  }
}
