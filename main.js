import { renderTitle } from './ui/title.js';
import { renderBattle } from './ui/battle.js';
import { renderReward } from './ui/reward.js';
import { renderEnemySelect } from './ui/enemySelect.js';
import { buildStarterDeck } from './data/cards.js';

const app = document.getElementById('app');

let currentDeck = buildStarterDeck();

function showTitle() {
  currentDeck = buildStarterDeck();
  renderTitle(app, { onStartBattle: showEnemySelect });
}

function showEnemySelect() {
  renderEnemySelect(app, {
    deckIds: currentDeck,
    onPickEnemy: (enemyId) => showBattle(enemyId),
  });
}

function showBattle(enemyId) {
  renderBattle(app, {
    deckIds: currentDeck,
    enemyId,
    onExit: (result) => {
      if (result === 'win') {
        showReward();
      } else {
        showTitle();
      }
    },
  });
}

function showReward() {
  renderReward(app, {
    onPick: (cardId) => {
      currentDeck = [...currentDeck, cardId];
      showEnemySelect();
    },
    onSkip: () => showEnemySelect(),
  });
}

showTitle();
