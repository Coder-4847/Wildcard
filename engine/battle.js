// Battle engine: pure state + logic, no DOM. UI reads `state` and reacts to the
// `events` array returned by each action to drive animations/sound.
//
// Effects (used by both cards and enemy intents) are small data objects:
//   { type: 'damage', value, target: 'self'|'opponent', hits?, scale? }
//   { type: 'block',  value, target: 'self'|'opponent', scale? }
//   { type: 'status', value, target: 'self'|'opponent', status: 'might'|'weak'|'vulnerable'|'bleed'|'ward' }
//   { type: 'draw',   value, target: 'self' }   // player only
//   { type: 'energy', value, target: 'self' }   // player only
// `target` is relative to whoever is acting (the card's player, or the enemy on its turn).
// `scale` (optional, on damage/block) adds bonus value from a live stat:
//   { source: 'opponentBleed'|'selfBlock'|'selfWard'|'cardsPlayedThisTurn', multiplier }

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

function freshStatuses() {
  return { might: 0, weak: 0, vulnerable: 0, bleed: 0, ward: 0 };
}

function computeIntent(enemy) {
  return enemy.pattern[enemy.patternIndex % enemy.pattern.length];
}

function scalePattern(pattern, dmgMultiplier) {
  if (dmgMultiplier === 1) return pattern;
  return pattern.map((intent) => ({
    effects: intent.effects.map((e) => (
      e.type === 'damage' ? { ...e, value: Math.round(e.value * dmgMultiplier) } : { ...e }
    )),
  }));
}

export function createBattle({ deckIds, playerMaxHp = 70, playerHp = null, enemyId, hpMultiplier = 1, dmgMultiplier = 1 }) {
  const enemyData = getEnemy(enemyId);
  const state = {
    player: {
      maxHp: playerMaxHp,
      hp: playerHp === null ? playerMaxHp : playerHp,
      block: 0,
      statuses: freshStatuses(),
      energy: PLAYER_MAX_ENERGY,
      energyMax: PLAYER_MAX_ENERGY,
      drawPile: shuffle(deckIds),
      hand: [],
      discard: [],
      cardsPlayedThisTurn: 0,
    },
    enemy: {
      id: enemyData.id,
      name: enemyData.name,
      icon: enemyData.icon,
      maxHp: Math.round(enemyData.maxHp * hpMultiplier),
      hp: Math.round(enemyData.maxHp * hpMultiplier),
      block: 0,
      statuses: freshStatuses(),
      pattern: scalePattern(enemyData.pattern, dmgMultiplier),
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

// Runs at the start of `unit`'s own turn: resets block, ticks Bleed (damage then
// decays), and decays Weak/Vulnerable by one stack. Might and Ward do not decay.
function tickStartOfTurn(unit, unitKey, events) {
  unit.block = 0;
  const st = unit.statuses;
  if (st.bleed > 0) {
    const amount = Math.min(unit.hp, st.bleed);
    unit.hp -= amount;
    events.push({ type: 'bleedTick', target: unitKey, amount });
    st.bleed -= 1;
  }
  if (st.weak > 0) st.weak -= 1;
  if (st.vulnerable > 0) st.vulnerable -= 1;
}

function getScaleValue(scale, ctx) {
  if (!scale) return 0;
  let base = 0;
  switch (scale.source) {
    case 'opponentBleed': base = ctx.opponent.statuses.bleed; break;
    case 'selfBlock': base = ctx.actor.block; break;
    case 'selfWard': base = ctx.actor.statuses.ward; break;
    case 'cardsPlayedThisTurn': base = ctx.state.player.cardsPlayedThisTurn; break;
    default: base = 0;
  }
  return base * (scale.multiplier || 1);
}

function dealDamage(amount, targetObj, targetKey, events) {
  let remaining = amount;
  if (remaining > 0 && targetObj.block > 0) {
    const absorbed = Math.min(targetObj.block, remaining);
    targetObj.block -= absorbed;
    remaining -= absorbed;
    if (absorbed > 0) events.push({ type: 'blockHit', target: targetKey, amount: absorbed });
  }
  if (remaining > 0 && targetObj.statuses.ward > 0) {
    const absorbed = Math.min(targetObj.statuses.ward, remaining);
    targetObj.statuses.ward -= absorbed;
    remaining -= absorbed;
    if (absorbed > 0) events.push({ type: 'wardHit', target: targetKey, amount: absorbed });
  }
  if (remaining > 0) {
    targetObj.hp = Math.max(0, targetObj.hp - remaining);
    events.push({ type: 'damage', target: targetKey, amount: remaining });
  }
}

function applyEffect(effect, ctx, events) {
  const isSelf = effect.target === 'self';
  const targetObj = isSelf ? ctx.actor : ctx.opponent;
  const targetKey = isSelf ? ctx.actorKey : ctx.opponentKey;

  if (effect.type === 'damage') {
    const hits = effect.hits || 1;
    for (let i = 0; i < hits; i++) {
      let amount = effect.value + getScaleValue(effect.scale, ctx);
      if (!isSelf) {
        amount += ctx.actor.statuses.might || 0;
        if (ctx.actor.statuses.weak > 0) amount = Math.floor(amount * 0.75);
      }
      if (targetObj.statuses.vulnerable > 0) amount = Math.floor(amount * 1.5);
      amount = Math.max(0, amount);
      dealDamage(amount, targetObj, targetKey, events);
    }
  } else if (effect.type === 'block') {
    const amount = effect.value + getScaleValue(effect.scale, ctx);
    targetObj.block += amount;
    events.push({ type: 'block', target: targetKey, amount });
  } else if (effect.type === 'status') {
    targetObj.statuses[effect.status] = (targetObj.statuses[effect.status] || 0) + effect.value;
    events.push({ type: 'status', target: targetKey, status: effect.status, amount: effect.value });
  } else if (effect.type === 'draw') {
    if (ctx.actorKey === 'player') drawCards(ctx.state, effect.value, events);
  } else if (effect.type === 'energy') {
    if (ctx.actorKey === 'player') {
      ctx.actor.energy += effect.value;
      events.push({ type: 'energyGain', amount: effect.value });
    }
  }
}

function startPlayerTurn(state, events) {
  state.turn = 'player';
  state.turnNumber += 1;
  tickStartOfTurn(state.player, 'player', events);
  checkOutcome(state, events);
  if (state.outcome) return;
  state.player.energy = state.player.energyMax;
  state.player.cardsPlayedThisTurn = 0;
  drawCards(state, CARDS_PER_DRAW, events);
  events.push({ type: 'turnStart', who: 'player' });
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
  p.cardsPlayedThisTurn += 1;
  events.push({ type: 'play', cardId: card.id, uid });

  const ctx = { actor: p, opponent: state.enemy, actorKey: 'player', opponentKey: 'enemy', state };
  for (const effect of card.effects) {
    applyEffect(effect, ctx, events);
    checkOutcome(state, events);
    if (state.outcome) break;
  }

  return events;
}

function runEnemyTurn(state, events) {
  const enemy = state.enemy;
  const p = state.player;
  tickStartOfTurn(enemy, 'enemy', events);
  checkOutcome(state, events);
  if (state.outcome) return;

  events.push({ type: 'turnStart', who: 'enemy' });
  const intent = enemy.intent;
  const ctx = { actor: enemy, opponent: p, actorKey: 'enemy', opponentKey: 'player', state };
  for (const effect of intent.effects) {
    applyEffect(effect, ctx, events);
    checkOutcome(state, events);
    if (state.outcome) return;
  }

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
