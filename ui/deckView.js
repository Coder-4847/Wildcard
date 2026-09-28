import { getCard } from '../data/cards.js';
import { playSound } from '../audio.js';

export function renderDeckView(app, { deck, onBack }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'deck-view-screen';
  screen.innerHTML = `
    <div class="select-title text-outline">Your Deck (${deck.length})</div>
    <div class="deck-grid" id="deck-grid"></div>
    <button class="btn btn-red" id="btn-back">Back</button>
  `;
  app.appendChild(screen);

  const grid = screen.querySelector('#deck-grid');
  for (const cardId of deck) {
    const card = getCard(cardId);
    const cardEl = document.createElement('div');
    cardEl.className = `card rarity-${card.rarity}${card.upgraded ? ' card-upgraded' : ''}`;
    cardEl.innerHTML = `
      <div class="card-cost">${card.cost}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-art">${card.icon}</div>
      <div class="card-desc">${card.description}</div>
    `;
    grid.appendChild(cardEl);
  }

  screen.querySelector('#btn-back').addEventListener('click', () => {
    playSound('click');
    onBack();
  });
}
