import { getRewardPool } from '../data/cards.js';
import { playSound } from '../audio.js';

function pickRandom(pool, count) {
  const copy = pool.slice();
  const picked = [];
  while (picked.length < count && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(i, 1)[0]);
  }
  return picked;
}

export function renderReward(app, { goldEarned = 0, relicWon = null, onPick, onSkip }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'reward-screen';

  const choices = pickRandom(getRewardPool(), 3);

  screen.innerHTML = `
    <div class="reward-title text-outline">Choose a Card</div>
    ${goldEarned ? `<div class="reward-gold">💰 +${goldEarned} gold</div>` : ''}
    ${relicWon ? `<div class="reward-relic">${relicWon.icon} <strong>${relicWon.name}</strong> — ${relicWon.description}</div>` : ''}
    <div class="reward-cards" id="reward-cards"></div>
    <button class="btn btn-red" id="btn-skip">Skip</button>
  `;
  app.appendChild(screen);

  if (goldEarned) setTimeout(() => playSound('coin'), 100);
  if (relicWon) setTimeout(() => playSound('relic'), 250);

  const cardsEl = screen.querySelector('#reward-cards');
  for (const card of choices) {
    const cardEl = document.createElement('div');
    cardEl.className = `card reward-card rarity-${card.rarity} type-${card.type}`;
    cardEl.innerHTML = `
      <div class="card-cost">${card.cost}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-art">${card.icon}</div>
      <div class="card-desc">${card.description}</div>
      <div class="card-archetype">${card.archetype}</div>
    `;
    cardEl.addEventListener('click', () => {
      playSound('cardPlay');
      onPick(card.id);
    });
    cardsEl.appendChild(cardEl);
  }

  screen.querySelector('#btn-skip').addEventListener('click', () => {
    playSound('click');
    onSkip();
  });
}
