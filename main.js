import { renderTitle } from './ui/title.js';
import { renderBattle } from './ui/battle.js';
import { renderReward } from './ui/reward.js';
import { renderMap } from './ui/map.js';
import { renderRest } from './ui/rest.js';
import { renderShop } from './ui/shop.js';
import { renderDeckView } from './ui/deckView.js';
import { renderRunSummary } from './ui/runSummary.js';
import {
  createRun, getNode, completeNode, applyGold, addCardToDeck, removeCardFromDeck,
  upgradeCardInDeck, healPercent, setPlayerHp, battleParamsForNode, randomGold,
} from './engine/run.js';

const app = document.getElementById('app');
let run = null;

function showTitle() {
  run = null;
  renderTitle(app, {
    onContinueRun: (savedRun) => { run = savedRun; showMap(); },
    onNewRun: () => { run = createRun(); showMap(); },
  });
}

function showMap() {
  if (run.status === 'won' || run.status === 'lost') {
    showRunSummary();
    return;
  }
  renderMap(app, {
    run,
    onEnterNode: (nodeId) => enterNode(nodeId),
    onOpenDeck: () => showDeckView(),
  });
}

function showDeckView() {
  renderDeckView(app, { deck: run.deck, onBack: () => showMap() });
}

function enterNode(nodeId) {
  const node = getNode(run, nodeId);
  if (node.type === 'rest') {
    renderRest(app, {
      run,
      onHeal: () => { healPercent(run, 0.3); completeNode(run, nodeId); showMap(); },
      onUpgrade: (deckIndex) => { upgradeCardInDeck(run, deckIndex); completeNode(run, nodeId); showMap(); },
    });
    return;
  }
  if (node.type === 'shop') {
    renderShop(app, {
      run,
      onBuyCard: (cardId, price) => { applyGold(run, -price); addCardToDeck(run, cardId); },
      onRemoveCard: (deckIndex, price) => { applyGold(run, -price); removeCardFromDeck(run, deckIndex); },
      onLeave: () => { completeNode(run, nodeId); showMap(); },
    });
    return;
  }
  // fight, elite, boss
  const params = battleParamsForNode(run, node);
  const goldEarned = randomGold(params.goldReward);
  renderBattle(app, {
    deckIds: run.deck,
    enemyId: params.enemyId,
    playerMaxHp: run.maxHp,
    playerHp: run.hp,
    hpMultiplier: params.hpMultiplier,
    dmgMultiplier: params.dmgMultiplier,
    onExit: (result, finalHp) => {
      setPlayerHp(run, finalHp);
      if (result === 'win') {
        applyGold(run, goldEarned);
        completeNode(run, nodeId);
        if (node.type === 'boss') {
          showMap(); // run.status is now 'won'; showMap redirects to the summary
        } else {
          renderReward(app, {
            goldEarned,
            onPick: (cardId) => { addCardToDeck(run, cardId); showMap(); },
            onSkip: () => showMap(),
          });
        }
      } else {
        showMap(); // run.status is now 'lost'; showMap redirects to the summary
      }
    },
  });
}

function showRunSummary() {
  const won = run.status === 'won';
  renderRunSummary(app, {
    run,
    won,
    onNewRun: () => { run = createRun(); showMap(); },
  });
}

showTitle();
