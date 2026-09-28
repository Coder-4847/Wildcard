import { playSound } from '../audio.js';

export function renderRunSummary(app, { run, won, onNewRun }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'overlay-screen run-summary-screen';
  playSound(won ? 'win' : 'lose');
  const floorsReached = run.visitedNodeIds.length;
  screen.innerHTML = `
    <div class="overlay-title ${won ? 'win' : 'lose'} text-outline">${won ? 'ACT 1 CLEAR!' : 'RUN OVER'}</div>
    ${won ? '<div class="rest-choice-sub">More acts are coming in a future milestone.</div>' : ''}
    <div class="run-summary-stats">
      <div class="summary-row"><span>Floors reached</span><span>${floorsReached}</span></div>
      <div class="summary-row"><span>Final deck size</span><span>${run.deck.length}</span></div>
      <div class="summary-row"><span>Gold</span><span>${run.gold}</span></div>
    </div>
    <button class="btn ${won ? 'btn-green' : 'btn-red'}" id="btn-new-run">New Run</button>
  `;
  app.appendChild(screen);
  screen.querySelector('#btn-new-run').addEventListener('click', () => {
    playSound('click');
    onNewRun();
  });
}
