import { getCard } from '../data/cards.js';
import { getRelic } from '../data/relics.js';
import { playSound } from '../audio.js';

export function renderRunSummary(app, { run, won, onNewRun }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'overlay-screen run-summary-screen';
  playSound(won ? 'win' : 'lose');
  const floorsReached = run.visitedNodeIds.length;
  screen.innerHTML = `
    <div class="overlay-title ${won ? 'win' : 'lose'} text-outline">${won ? 'VICTORY!' : 'RUN OVER'}</div>
    ${won ? '<div class="rest-choice-sub">You cleared all 3 Acts of WILDCARD!</div>' : ''}
    <div class="run-summary-stats">
      <div class="summary-row"><span>Act reached</span><span>${run.act}</span></div>
      <div class="summary-row"><span>Floors reached</span><span>${floorsReached}</span></div>
      <div class="summary-row"><span>Final deck size</span><span>${run.deck.length}</span></div>
      <div class="summary-row"><span>Relics found</span><span>${run.relics.length}</span></div>
      <div class="summary-row"><span>Gold</span><span>${run.gold}</span></div>
    </div>
    <button class="btn btn-blue" id="btn-show-deck">Show Deck & Relics</button>
    <div class="summary-detail" id="summary-detail"></div>
    <button class="btn ${won ? 'btn-green' : 'btn-red'}" id="btn-new-run">New Run</button>
  `;
  app.appendChild(screen);

  const detail = screen.querySelector('#summary-detail');
  screen.querySelector('#btn-show-deck').addEventListener('click', (e) => {
    playSound('click');
    const open = detail.classList.toggle('show');
    e.target.textContent = open ? 'Hide Deck & Relics' : 'Show Deck & Relics';
    if (open && !detail.dataset.built) {
      detail.dataset.built = '1';
      if (run.relics.length) {
        const relicGrid = document.createElement('div');
        relicGrid.className = 'relic-grid';
        for (const relicId of run.relics) {
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
        detail.appendChild(relicGrid);
      }
      const deckGrid = document.createElement('div');
      deckGrid.className = 'deck-grid';
      for (const cardId of run.deck) {
        const card = getCard(cardId);
        const cardEl = document.createElement('div');
        cardEl.className = `card rarity-${card.rarity} type-${card.type}${card.upgraded ? ' card-upgraded' : ''}`;
        cardEl.innerHTML = `
          <div class="card-cost">${card.cost}</div>
          <div class="card-name">${card.name}</div>
          <div class="card-art">${card.icon}</div>
          <div class="card-desc">${card.description}</div>
        `;
        deckGrid.appendChild(cardEl);
      }
      detail.appendChild(deckGrid);
    }
  });

  screen.querySelector('#btn-new-run').addEventListener('click', () => {
    playSound('click');
    onNewRun();
  });
}
