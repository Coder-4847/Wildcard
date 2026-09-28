import { renderTitle } from './ui/title.js';
import { renderBattle } from './ui/battle.js';
import { buildStarterDeck } from './data/cards.js';

const app = document.getElementById('app');

function showTitle() {
  renderTitle(app, { onStartBattle: showBattle });
}

function showBattle() {
  renderBattle(app, {
    deckIds: buildStarterDeck(),
    enemyId: 'slime',
    onExit: showTitle,
  });
}

showTitle();
