import { EVENTS } from '../data/events.js';
import { playSound } from '../audio.js';

function pickRandomEvent() {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
}

function isAffordable(run, choice) {
  const cost = choice.effects.find((e) => e.type === 'gold' && e.value < 0);
  return !cost || run.gold >= Math.abs(cost.value);
}

export function renderEvent(app, { run, onChoose }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'event-screen';
  const event = pickRandomEvent();

  screen.innerHTML = `
    <div class="event-icon">${event.icon}</div>
    <div class="event-title text-outline">${event.title}</div>
    <div class="event-text">${event.text}</div>
    <div class="event-choices" id="event-choices"></div>
  `;
  app.appendChild(screen);

  const choicesEl = screen.querySelector('#event-choices');
  for (const choice of event.choices) {
    const affordable = isAffordable(run, choice);
    const btn = document.createElement('button');
    btn.className = 'btn btn-blue event-choice-btn';
    btn.textContent = choice.label;
    btn.disabled = !affordable;
    btn.addEventListener('click', () => {
      if (!affordable) return;
      playSound('cardPlay');
      onChoose(choice.effects);
    });
    choicesEl.appendChild(btn);
  }
}
