// Branching map generation for one Act. Pure data — no DOM, no pixel coordinates.
// A map is { nodes: {id: Node}, floors: [[id,...], ...], startNodeIds: [id,...], bossNodeId }
// Node: { id, floor, lane, type, next: [id,...], prev: [id,...] }

const LANES = 4;
const REGULAR_FLOORS = 7; // floor 0 = entry, floor REGULAR_FLOORS-1 = forced rest before boss
const BOSS_FLOOR = REGULAR_FLOORS;

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickLanes(count) {
  const lanes = [...Array(LANES).keys()];
  for (let i = lanes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
  }
  return lanes.slice(0, count).sort((a, b) => a - b);
}

function weightedType() {
  const roll = Math.random();
  if (roll < 0.55) return 'fight';
  if (roll < 0.70) return 'elite';
  if (roll < 0.85) return 'rest';
  return 'shop';
}

export function generateAct() {
  const nodes = {};
  const floors = [];

  for (let floor = 0; floor < REGULAR_FLOORS; floor++) {
    let count;
    let forcedType = null;
    if (floor === 0) { count = 3; forcedType = 'fight'; }
    else if (floor === REGULAR_FLOORS - 1) { count = 2; forcedType = 'rest'; }
    else { count = randInt(3, 4); }

    const lanes = pickLanes(count);
    const ids = [];
    for (const lane of lanes) {
      const type = forcedType || weightedType();
      const id = `f${floor}-${lane}`;
      nodes[id] = { id, floor, lane, type, next: [], prev: [] };
      ids.push(id);
    }
    floors.push(ids);
  }

  // boss floor: single node
  const bossLane = Math.floor(LANES / 2);
  const bossId = `f${BOSS_FLOOR}-${bossLane}`;
  nodes[bossId] = { id: bossId, floor: BOSS_FLOOR, lane: bossLane, type: 'boss', next: [], prev: [] };
  floors.push([bossId]);

  // connect adjacent floors
  for (let floor = 0; floor < REGULAR_FLOORS; floor++) {
    const fromIds = floors[floor];
    const toIds = floors[floor + 1];
    const toNodes = toIds.map((id) => nodes[id]);

    for (const fromId of fromIds) {
      const from = nodes[fromId];
      let candidates = toNodes.filter((n) => Math.abs(n.lane - from.lane) <= 1);
      if (candidates.length === 0) candidates = toNodes;
      const edgeCount = Math.random() < 0.4 ? 2 : 1;
      const shuffled = candidates.slice().sort(() => Math.random() - 0.5);
      const chosen = shuffled.slice(0, Math.min(edgeCount, shuffled.length));
      for (const target of chosen) {
        if (!from.next.includes(target.id)) from.next.push(target.id);
        if (!target.prev.includes(from.id)) target.prev.push(from.id);
      }
    }

    // guarantee every node in the next floor is reachable
    for (const toNode of toNodes) {
      if (toNode.prev.length > 0) continue;
      let nearest = null;
      let nearestDist = Infinity;
      for (const fromId of fromIds) {
        const from = nodes[fromId];
        const dist = Math.abs(from.lane - toNode.lane);
        if (dist < nearestDist) { nearestDist = dist; nearest = from; }
      }
      if (nearest) {
        nearest.next.push(toNode.id);
        toNode.prev.push(nearest.id);
      }
    }
  }

  return {
    nodes,
    floors,
    startNodeIds: floors[0].slice(),
    bossNodeId: bossId,
  };
}
