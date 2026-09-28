import { isNodeAvailable } from '../engine/run.js';
import { getRelic } from '../data/relics.js';
import { playSound } from '../audio.js';

const LANE_WIDTH = 140;
const FLOOR_HEIGHT = 110;
const PAD = 60;

const TYPE_META = {
  fight: { icon: '⚔️', cls: 'node-fight' },
  elite: { icon: '💀', cls: 'node-elite' },
  rest: { icon: '🔥', cls: 'node-rest' },
  shop: { icon: '💰', cls: 'node-shop' },
  event: { icon: '❓', cls: 'node-event' },
  boss: { icon: '🎩', cls: 'node-boss' },
};

function nodeX(node) {
  return PAD + node.lane * LANE_WIDTH;
}
function nodeY(node, maxFloor) {
  return PAD + (maxFloor - node.floor) * FLOOR_HEIGHT;
}

export function renderMap(app, { run, onEnterNode, onOpenDeck, onSettings }) {
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'map-screen';

  const maxFloor = run.map.floors.length - 1;
  const width = PAD * 2 + (4 - 1) * LANE_WIDTH;
  const height = PAD * 2 + maxFloor * FLOOR_HEIGHT;

  let svg = `<svg id="map-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;

  // edges
  for (const node of Object.values(run.map.nodes)) {
    for (const nextId of node.next) {
      const next = run.map.nodes[nextId];
      const visited = run.visitedNodeIds.includes(node.id) && run.visitedNodeIds.includes(nextId);
      const active = run.visitedNodeIds.includes(node.id) && isNodeAvailable(run, nextId);
      const cls = visited ? 'edge-visited' : active ? 'edge-active' : 'edge-dim';
      svg += `<line class="map-edge ${cls}" x1="${nodeX(node)}" y1="${nodeY(node, maxFloor)}" x2="${nodeX(next)}" y2="${nodeY(next, maxFloor)}" />`;
    }
  }

  // nodes
  for (const node of Object.values(run.map.nodes)) {
    const meta = TYPE_META[node.type];
    const visited = run.visitedNodeIds.includes(node.id);
    const available = isNodeAvailable(run, node.id);
    const isCurrent = run.currentNodeId === node.id;
    const state = visited ? 'visited' : available ? 'available' : 'locked';
    const r = node.type === 'boss' ? 34 : 26;
    svg += `
      <g class="map-node ${meta.cls} state-${state}${isCurrent ? ' current' : ''}" data-node-id="${node.id}" transform="translate(${nodeX(node)},${nodeY(node, maxFloor)})">
        <ellipse class="node-shadow" cx="2" cy="${r * 0.75}" rx="${r * 0.85}" ry="${r * 0.3}" />
        <circle r="${r + 5}" class="node-ring" />
        <circle r="${r}" class="node-circle" />
        <text class="node-icon" text-anchor="middle" dominant-baseline="central">${meta.icon}</text>
      </g>`;
  }

  svg += '</svg>';

  const relicIcons = run.relics.map((id) => `<span class="hud-relic-icon" title="${getRelic(id).name}">${getRelic(id).icon}</span>`).join('');

  screen.innerHTML = `
    <div class="run-hud">
      <div class="hud-stat hud-act">Act ${run.act}</div>
      <div class="hud-stat hud-hp">❤️ ${run.hp}/${run.maxHp}</div>
      <div class="hud-stat hud-gold">💰 ${run.gold}</div>
      ${relicIcons ? `<div class="hud-relics">${relicIcons}</div>` : ''}
      <div class="hud-actions">
        <button class="btn btn-blue hud-deck-btn" id="btn-hud-deck">Deck (${run.deck.length})</button>
        <button class="icon-btn hud-settings-btn" id="btn-hud-settings" title="Settings">⚙️</button>
      </div>
    </div>
    <div class="map-scroll" id="map-scroll">${svg}</div>
  `;
  app.appendChild(screen);

  const mapScroll = screen.querySelector('#map-scroll');
  for (const g of screen.querySelectorAll('.map-node.state-available')) {
    g.addEventListener('click', () => {
      playSound('click');
      onEnterNode(g.dataset.nodeId);
    });
  }
  screen.querySelector('#btn-hud-deck').addEventListener('click', () => {
    playSound('click');
    onOpenDeck();
  });
  screen.querySelector('#btn-hud-settings').addEventListener('click', () => {
    playSound('click');
    onSettings();
  });

  // scroll to the player's current position (floor 0 is at the bottom)
  requestAnimationFrame(() => {
    mapScroll.scrollTop = mapScroll.scrollHeight;
  });
}
