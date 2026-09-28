// Run state: the map, deck, gold and HP that persist between fights within an Act.
// Saved to localStorage after every change so the run can resume after a refresh.
// Mid-fight progress is intentionally NOT saved — a node only commits its effects
// (gold, deck changes, HP loss) once its encounter resolves.

import { generateAct } from './map.js';
import { buildStarterDeck } from '../data/cards.js';
import { getNormalEnemyPool, getEliteEnemyPool, getBossId } from '../data/enemies.js';

const SAVE_KEY = 'wildcard_run_v1';
export const START_GOLD = 50;
export const START_MAX_HP = 70;
export const ELITE_HP_MULTIPLIER = 1.5;
export const ELITE_DMG_MULTIPLIER = 1.25;

export function createRun() {
  const map = generateAct();
  const run = {
    act: 1,
    deck: buildStarterDeck(),
    gold: START_GOLD,
    hp: START_MAX_HP,
    maxHp: START_MAX_HP,
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

export function completeNode(run, nodeId) {
  run.visitedNodeIds.push(nodeId);
  run.currentNodeId = nodeId;
  const node = run.map.nodes[nodeId];
  if (node.type === 'boss') {
    run.status = 'won';
    run.availableNodeIds = [];
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

// Returns { enemyId, hpMultiplier, dmgMultiplier, goldReward: [min, max] } for a node.
export function battleParamsForNode(run, node) {
  if (node.type === 'boss') {
    return { enemyId: getBossId(), hpMultiplier: 1, dmgMultiplier: 1, goldReward: [40, 60] };
  }
  if (node.type === 'elite') {
    const pool = getEliteEnemyPool();
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return { enemyId: pick.id, hpMultiplier: ELITE_HP_MULTIPLIER, dmgMultiplier: ELITE_DMG_MULTIPLIER, goldReward: [25, 40] };
  }
  const pool = getNormalEnemyPool();
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { enemyId: pick.id, hpMultiplier: 1, dmgMultiplier: 1, goldReward: [10, 20] };
}

export function randomGold([min, max]) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
