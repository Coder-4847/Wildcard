import { renderTitle } from './ui/title.js';
import { renderBattle } from './ui/battle.js';
import { renderReward } from './ui/reward.js';
import { renderMap } from './ui/map.js';
import { renderRest } from './ui/rest.js';
import { renderShop } from './ui/shop.js';
import { renderEvent } from './ui/event.js';
import { renderDeckView } from './ui/deckView.js';
import { renderRunSummary } from './ui/runSummary.js';
import { renderActTransition } from './ui/actTransition.js';
import {
  createRun, getNode, completeNode, applyGold, addCardToDeck, removeCardFromDeck,
  upgradeCardInDeck, healPercent, setPlayerHp, battleParamsForNode, randomGold,
  addRelic, pickRandomUnownedRelic, getRelicBattleModifiers, getGoldMultiplier,
  getHealOnWinPct, applyEventEffects,
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
  renderDeckView(app, { deck: run.deck, relics: run.relics, onBack: () => showMap() });
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
  if (node.type === 'event') {
    renderEvent(app, {
      run,
      onChoose: (effects) => {
        applyEventEffects(run, effects);
        completeNode(run, nodeId);
        showMap();
      },
    });
    return;
  }
  // fight, elite, boss
  const params = battleParamsForNode(run, node);
  const goldEarned = Math.round(randomGold(params.goldReward) * getGoldMultiplier(run));
  const relicMods = getRelicBattleModifiers(run);
  renderBattle(app, {
    deckIds: run.deck,
    enemyId: params.enemyId,
    playerMaxHp: run.maxHp,
    playerHp: run.hp,
    hpMultiplier: params.hpMultiplier,
    dmgMultiplier: params.dmgMultiplier,
    ...relicMods,
    onExit: (result, finalHp) => {
      setPlayerHp(run, finalHp);
      if (result === 'win') {
        applyGold(run, goldEarned);
        const healPct = getHealOnWinPct(run);
        if (healPct > 0) healPercent(run, healPct);

        let relicWon = null;
        if (Math.random() < params.relicChance) {
          const relic = pickRandomUnownedRelic(run);
          if (relic) { addRelic(run, relic.id); relicWon = relic; }
        }

        const actBefore = run.act;
        completeNode(run, nodeId);

        if (node.type === 'boss' && run.status === 'active' && run.act > actBefore) {
          renderReward(app, {
            goldEarned, relicWon,
            onPick: (cardId) => { addCardToDeck(run, cardId); showActTransition(actBefore); },
            onSkip: () => showActTransition(actBefore),
          });
        } else if (node.type === 'boss') {
          showMap(); // run.status is now 'won'; showMap redirects to the summary
        } else {
          renderReward(app, {
            goldEarned, relicWon,
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

function showActTransition(completedAct) {
  renderActTransition(app, {
    completedAct,
    nextAct: run.act,
    onContinue: () => showMap(),
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
