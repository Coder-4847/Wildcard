import { getCard } from '../data/cards.js';
import { getRelic } from '../data/relics.js';
import { playSound } from '../audio.js';

export function renderDeckView(app, { deck, relics = [], onBack }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'deck-view-screen';
  screen.innerHTML = `
    ${relics.length ? '<div class="select-title text-outline" style="font-size: 1.4rem;">Relics</div>' : ''}
    ${relics.length ? '<div class="relic-grid" id="relic-grid"></div>' : ''}
    <div class="select-title text-outline">Your Deck (${deck.length})</div>
    <div class="deck-grid" id="deck-grid"></div>
    <button class="btn btn-red" id="btn-back">Back</button>
  `;
  app.appendChild(screen);

  if (relics.length) {
    const relicGrid = screen.querySelector('#relic-grid');
    for (const relicId of relics) {
      const relic = getRelic(relicId);
      const relicEl = document.createElement('div');
      relicEl.className = 'relic-tile';
      relicEl.innerHTML = `
        <div class="relic-tile-icon">${relic.icon}</div>
        <div class="relic-tile-name">${relic.name}</div>
        <div class="relic-tile-desc">${relic.description}</div>
      `;
      relicGrid.appendChild(relicEl);
    }
  }

  const grid = screen.querySelector('#deck-grid');
  for (const cardId of deck) {
    const card = getCard(cardId);
    const cardEl = document.createElement('div');
    cardEl.className = `card rarity-${card.rarity} type-${card.type}${card.upgraded ? ' card-upgraded' : ''}`;
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
