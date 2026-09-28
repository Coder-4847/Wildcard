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
import { renderTutorial } from './ui/tutorial.js';
import { renderSettings, applySettingsToDocument } from './ui/settings.js';
import { hasSeenTutorial, markTutorialSeen } from './engine/settings.js';
import {
  createRun, getNode, completeNode, applyGold, addCardToDeck, removeCardFromDeck,
  upgradeCardInDeck, healPercent, setPlayerHp, battleParamsForNode, randomGold,
  addRelic, pickRandomUnownedRelic, getRelicBattleModifiers, getGoldMultiplier,
  getHealOnWinPct, applyEventEffects,
} from './engine/run.js';

const app = document.getElementById('app');
let run = null;

// Every screen switch routes through here so transitions apply uniformly without
// touching each ui/*.js file: fade #app out, swap its content, fade back in.
const TRANSITION_MS = 150;
function show(renderFn) {
  app.classList.add('screen-fade-out');
  setTimeout(() => {
    renderFn();
    app.classList.remove('screen-fade-out');
  }, TRANSITION_MS);
}

function showTitle() {
  run = null;
  show(() => renderTitle(app, {
    onContinueRun: (savedRun) => { run = savedRun; showMap(); },
    onNewRun: () => { run = createRun(); showMap(); },
    onHowToPlay: () => showTutorial(showTitle),
    onSettings: () => showSettings(showTitle),
  }));
}

function showTutorial(onDone) {
  show(() => renderTutorial(app, { onDone }));
}

function showSettings(onBack) {
  show(() => renderSettings(app, { onBack }));
}

function showMap() {
  if (run.status === 'won' || run.status === 'lost') {
    showRunSummary();
    return;
  }
  show(() => renderMap(app, {
    run,
    onEnterNode: (nodeId) => enterNode(nodeId),
    onOpenDeck: () => showDeckView(),
    onSettings: () => showSettings(showMap),
  }));
}

function showDeckView() {
  show(() => renderDeckView(app, { deck: run.deck, relics: run.relics, onBack: () => showMap() }));
}

function enterNode(nodeId) {
  const node = getNode(run, nodeId);
  if (node.type === 'rest') {
    show(() => renderRest(app, {
      run,
      onHeal: () => { healPercent(run, 0.3); completeNode(run, nodeId); showMap(); },
      onUpgrade: (deckIndex) => { upgradeCardInDeck(run, deckIndex); completeNode(run, nodeId); showMap(); },
    }));
    return;
  }
  if (node.type === 'shop') {
    show(() => renderShop(app, {
      run,
      onBuyCard: (cardId, price) => { applyGold(run, -price); addCardToDeck(run, cardId); },
      onRemoveCard: (deckIndex, price) => { applyGold(run, -price); removeCardFromDeck(run, deckIndex); },
      onLeave: () => { completeNode(run, nodeId); showMap(); },
    }));
    return;
  }
  if (node.type === 'event') {
    show(() => renderEvent(app, {
      run,
      onChoose: (effects) => {
        applyEventEffects(run, effects);
        completeNode(run, nodeId);
        showMap();
      },
    }));
    return;
  }
  // fight, elite, boss
  const params = battleParamsForNode(run, node);
  const goldEarned = Math.round(randomGold(params.goldReward) * getGoldMultiplier(run));
  const relicMods = getRelicBattleModifiers(run);
  show(() => renderBattle(app, {
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
          show(() => renderReward(app, {
            goldEarned, relicWon,
            onPick: (cardId) => { addCardToDeck(run, cardId); showActTransition(actBefore); },
            onSkip: () => showActTransition(actBefore),
          }));
        } else if (node.type === 'boss') {
          showMap(); // run.status is now 'won'; showMap redirects to the summary
        } else {
          show(() => renderReward(app, {
            goldEarned, relicWon,
            onPick: (cardId) => { addCardToDeck(run, cardId); showMap(); },
            onSkip: () => showMap(),
          }));
        }
      } else {
        showMap(); // run.status is now 'lost'; showMap redirects to the summary
      }
    },
  }));
}

function showActTransition(completedAct) {
  show(() => renderActTransition(app, {
    completedAct,
    nextAct: run.act,
    onContinue: () => showMap(),
  }));
}

function showRunSummary() {
  const won = run.status === 'won';
  show(() => renderRunSummary(app, {
    run,
    won,
    onNewRun: () => { run = createRun(); showMap(); },
  }));
}

applySettingsToDocument();
if (hasSeenTutorial()) {
  showTitle();
} else {
  markTutorialSeen();
  renderTutorial(app, { onDone: showTitle });
}
