// Battle engine: pure state + logic, no DOM. UI reads `state` and reacts to the
// `events` array returned by each action to drive animations/sound.

import { getCard } from '../data/cards.js';
import { getEnemy } from '../data/enemies.js';

const PLAYER_MAX_ENERGY = 3;
const CARDS_PER_DRAW = 5;

let uidCounter = 1;
function nextUid() {
  return uidCounter++;
}

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function computeIntent(enemy) {
  return enemy.pattern[enemy.patternIndex % enemy.pattern.length];
}

export function createBattle({ deckIds, playerMaxHp = 70, enemyId }) {
  const enemyData = getEnemy(enemyId);
  const state = {
    player: {
      maxHp: playerMaxHp,
      hp: playerMaxHp,
      block: 0,
      energy: PLAYER_MAX_ENERGY,
      energyMax: PLAYER_MAX_ENERGY,
      drawPile: shuffle(deckIds),
      hand: [],
      discard: [],
    },
    enemy: {
      id: enemyData.id,
      name: enemyData.name,
      icon: enemyData.icon,
      maxHp: enemyData.maxHp,
      hp: enemyData.maxHp,
      block: 0,
      pattern: enemyData.pattern,
      patternIndex: 0,
      intent: null,
    },
    turn: 'player',
    turnNumber: 0,
    outcome: null,
  };
  state.enemy.intent = computeIntent(state.enemy);
  const events = [];
  startPlayerTurn(state, events);
  return { state, events };
}

function drawCards(state, count, events) {
  const p = state.player;
  for (let i = 0; i < count; i++) {
    if (p.drawPile.length === 0) {
      if (p.discard.length === 0) break;
      p.drawPile = shuffle(p.discard);
      p.discard = [];
      events.push({ type: 'reshuffle' });
    }
    const cardId = p.drawPile.pop();
    p.hand.push({ uid: nextUid(), id: cardId });
    events.push({ type: 'draw', cardId });
  }
}

function startPlayerTurn(state, events) {
  state.turn = 'player';
  state.turnNumber += 1;
  state.player.block = 0;
  state.player.energy = state.player.energyMax;
  drawCards(state, CARDS_PER_DRAW, events);
  events.push({ type: 'turnStart', who: 'player' });
}

function applyEffect(effect, target, events, targetKey) {
  if (effect.type === 'damage') {
    let amount = effect.value;
    if (target.block > 0) {
      const absorbed = Math.min(target.block, amount);
      target.block -= absorbed;
      amount -= absorbed;
      if (absorbed > 0) events.push({ type: 'blockHit', target: targetKey, amount: absorbed });
    }
    if (amount > 0) {
      target.hp = Math.max(0, target.hp - amount);
      events.push({ type: 'damage', target: targetKey, amount });
    }
  } else if (effect.type === 'block') {
    target.block += effect.value;
    events.push({ type: 'block', target: targetKey, amount: effect.value });
  }
}

export function playCard(state, uid) {
  const events = [];
  if (state.turn !== 'player' || state.outcome) return events;
  const p = state.player;
  const handIndex = p.hand.findIndex((c) => c.uid === uid);
  if (handIndex === -1) return events;
  const instance = p.hand[handIndex];
  const card = getCard(instance.id);
  if (p.energy < card.cost) return events;

  p.energy -= card.cost;
  p.hand.splice(handIndex, 1);
  p.discard.push(instance.id);
  events.push({ type: 'play', cardId: card.id, uid });

  for (const effect of card.effects) {
    const target = effect.type === 'damage' ? state.enemy : p;
    const targetKey = effect.type === 'damage' ? 'enemy' : 'player';
    applyEffect(effect, target, events, targetKey);
  }

  checkOutcome(state, events);
  return events;
}

function runEnemyTurn(state, events) {
  const enemy = state.enemy;
  const p = state.player;
  const intent = enemy.intent;
  events.push({ type: 'turnStart', who: 'enemy' });

  if (intent.type === 'attack') {
    applyEffect({ type: 'damage', value: intent.value }, p, events, 'player');
  } else if (intent.type === 'defend') {
    applyEffect({ type: 'block', value: intent.value }, enemy, events, 'enemy');
  }

  checkOutcome(state, events);
  if (state.outcome) return;

  enemy.patternIndex += 1;
  enemy.intent = computeIntent(enemy);
}

export function endPlayerTurn(state) {
  const events = [];
  if (state.turn !== 'player' || state.outcome) return events;
  const p = state.player;
  events.push({ type: 'discardHand', count: p.hand.length });
  p.discard.push(...p.hand.map((c) => c.id));
  p.hand = [];

  state.turn = 'enemy';
  runEnemyTurn(state, events);
  if (!state.outcome) {
    startPlayerTurn(state, events);
  }
  return events;
}

function checkOutcome(state, events) {
  if (state.enemy.hp <= 0 && !state.outcome) {
    state.outcome = 'win';
    events.push({ type: 'outcome', result: 'win' });
  } else if (state.player.hp <= 0 && !state.outcome) {
    state.outcome = 'lose';
    events.push({ type: 'outcome', result: 'lose' });
  }
}

export function canPlayCard(state, uid) {
  if (state.turn !== 'player' || state.outcome) return false;
  const instance = state.player.hand.find((c) => c.uid === uid);
  if (!instance) return false;
  const card = getCard(instance.id);
  return state.player.energy >= card.cost;
}
