// === Constants ===

const MAP_W = 5359;
const MAP_H = 3869;
const FULL_MIN_X = -91;
const FULL_MIN_Y = -120;
const BASE_W1 = 37;
const BASE_W2 = 38;
const COL_SPLIT = 41;
const CAL = { offX: 0, offY: 0, scaleX: 1.055, cellH: 23 };

const COST_TIERS = [
  { max: 25, cost: 1 },
  { max: 50, cost: 2 },
  { max: 75, cost: 3 },
  { max: 100, cost: 4 },
  { max: Infinity, cost: 5 },
];

// Dungeon entrances (source: dotrofus.com/donjons — Dofus Rétro 1.29)
const DUNGEONS = [
  { id: 'incarnam', name: "Donjon d'Incarnam", boss: 'Milimilou', x: 6, y: 5, level: 10 },
  { id: 'ensable', name: 'Donjon ensablé', boss: "Mob l'Éponge", x: 13, y: -28, level: 20 },
  { id: 'champs', name: 'Donjon des Champs', boss: 'Tournesol Affamé', x: 7, y: -25, level: 20 },
  { id: 'bouftous', name: 'Donjon des Bouftous', boss: 'Bouftou Royal', x: 2, y: -34, level: 25 },
  { id: 'rats-amakna', name: "Donjon des Rats du Château d'Amakna", boss: 'Sphincter Cell', x: 6, y: -9, level: 160 },
  { id: 'craqueleurs', name: 'Donjon des Craqueleurs', boss: 'Craqueleur Légendaire', x: -3, y: -7, level: 50 },
  { id: 'larves', name: 'Donjon des Larves', boss: 'Shin Larve', x: -2, y: -5, level: 60 },
  { id: 'abraknydes', name: 'Donjon des Abraknydes', boss: 'Abraknyde Ancestral', x: -9, y: -14, level: 90 },
  { id: 'chene-mou', name: 'Donjon du Chêne Mou', boss: 'Chêne Mou', x: -9, y: -14, level: 160 },
  { id: 'familiers', name: 'Sanctuaire des Familiers', boss: 'Familiers', x: -7, y: -1, level: 1 },
  { id: 'tofu-royal', name: 'Donjon du Tofu Royal', boss: 'Tofu Royal', x: 5, y: 6, level: 120 },
  { id: 'tofus', name: 'Donjon des Tofus', boss: 'Batofu', x: 5, y: 6, level: 40 },
  { id: 'squelettes', name: 'Donjon des Squelettes', boss: 'Chafer', x: 10, y: 15, level: 40 },
  { id: 'forgerons', name: 'Donjon des Forgerons', boss: 'Coffre des Forgerons', x: 13, y: 21, level: 40 },
  { id: 'scarafeuilles', name: 'Donjon des Scarafeuilles', boss: 'Scarabosse Doré', x: 1, y: 26, level: 50 },
  { id: 'dragoeufs', name: 'Sanctuaire des Dragoeufs', boss: 'Crocabulia', x: -3, y: 24, level: 120 },
  { id: 'dragon-cochon', name: 'Antre du Dragon Cochon', boss: 'Dragon Cochon', x: -1, y: 33, level: 100 },
  { id: 'bworks', name: 'Donjon des Bworks', boss: 'Bworkette', x: -5, y: 10, level: 50 },
  { id: 'fungus', name: 'Donjon Fungus', boss: 'Ougah', x: -18, y: 28, level: 190 },
  { id: 'rats-brakmar', name: 'Donjon des Rats de Brâkmar', boss: 'Rat Noir', x: -26, y: 31, level: 110 },
  { id: 'rats-bonta', name: 'Donjon des Rats de Bonta', boss: 'Rat Blanc', x: -35, y: -59, level: 110 },
  { id: 'bworker', name: 'Donjon du Bworker', boss: 'Bworker', x: -21, y: 12, level: 190 },
  { id: 'canides', name: 'Donjon des Canidés', boss: 'Meulou', x: -24, y: 1, level: 100 },
  { id: 'skeunk', name: 'Repaire de Skeunk', boss: 'Skeunk', x: -20, y: 10, level: 120 },
  { id: 'koulosse', name: 'Donjon du Koulosse', boss: 'Koulosse', x: -17, y: 8, level: 100 },
  { id: 'blops', name: 'Donjon des Blops', boss: 'Blops Royaux', x: -25, y: -17, level: 60 },
  { id: 'corbac', name: 'Donjon du Maître Corbac', boss: 'Maître Corbac', x: -20, y: -62, level: 100 },
  { id: 'nowel', name: 'Donjon de Nowel', boss: 'Sapik', x: -63, y: -100, level: 60 },
  { id: 'minotoror', name: 'Labyrinthe du Minotoror', boss: 'Minotoror', x: -42, y: -17, level: 120 },
  { id: 'minotot', name: 'Labyrinthe du Minotot', boss: 'Minotot', x: -42, y: -17, level: 180 },
  { id: 'kralamoure', name: 'Antre du Kralamoure Géant', boss: 'Kralamoure Géant', x: -60, y: -8, level: 190 },
  { id: 'otomai', name: "Arche d'Otomaï", boss: 'Gourlo le Terrible', x: -55, y: -4, level: 90 },
  { id: 'rasboul', name: 'Goulet du Rasboul', boss: 'Silf le Rasboul Majeur', x: -51, y: 9, level: 110 },
  { id: 'hesque', name: 'Grotte Hesque', boss: 'Corailleur Magistral', x: -59, y: 15, level: 60 },
  { id: 'kimbo', name: 'Canopée du Kimbo', boss: 'Kimbo', x: -54, y: 16, level: 170 },
  { id: 'tynril', name: 'Laboratoire du Tynril', boss: 'Tynril', x: -53, y: 20, level: 140 },
  { id: 'moon', name: 'Donjon de Moon', boss: 'Moon', x: 31, y: 8, level: 100 },
  { id: 'wabbit', name: 'Donjon Wabbit', boss: 'Wa Wabbit', x: 24, y: -13, level: 160 },
  { id: 'bulbes', name: 'Donjon des Bulbes', boss: 'Bulbig', x: 19, y: -22, level: 40 },
  { id: 'pandikazes', name: 'Repaire des Pandikazes', boss: 'Maître Pandore', x: 18, y: -36, level: 120 },
  { id: 'kitsounes', name: 'Donjon des Kitsounes', boss: 'Tanukouï San', x: 32, y: -38, level: 150 },
  { id: 'firefoux', name: 'Donjon des Firefoux', boss: 'Péki Péki', x: 28, y: -52, level: 190 },
];

const DUNGEON_BY_ID = Object.fromEntries(DUNGEONS.map((d) => [d.id, d]));

const TEMPLES = [
  { subareaId: 13, name: 'Féca' },
  { subareaId: 14, name: 'Osamodas' },
  { subareaId: 15, name: 'Enutrof' },
  { subareaId: 16, name: 'Sram' },
  { subareaId: 17, name: 'Xélor' },
  { subareaId: 18, name: 'Ecaflip' },
  { subareaId: 19, name: 'Iop' },
  { subareaId: 20, name: 'Crâ' },
  { subareaId: 21, name: 'Sadida' },
  { subareaId: 26, name: 'Eniripsa' },
  { subareaId: 41, name: 'Sacrieur' },
  // Pandawa temple has no dedicated subarea; entrance in the Amakna forest
  { subareaId: null, name: 'Pandawa', key: 'pandawa', x: 5, y: 20 },
];

// Class emblems drawn on the temple badges (24x24 viewBox)
const TEMPLE_GLYPHS = {
  Féca: '<path d="M12 2.5l7.5 3v5.5c0 5-3.2 8.6-7.5 10.5C7.7 19.6 4.5 16 4.5 11V5.5z"/><path class="g-line" d="M12 6v11M8 10.5h8"/>',
  Osamodas: '<ellipse cx="12" cy="15.5" rx="4.6" ry="4"/><circle cx="5.6" cy="10.4" r="2.1"/><circle cx="9.3" cy="6.4" r="2.2"/><circle cx="14.7" cy="6.4" r="2.2"/><circle cx="18.4" cy="10.4" r="2.1"/>',
  Enutrof: '<path d="M9 3.5h6l-1.8 3.2c3.8 1 6.8 4.8 6.8 8.6 0 3.3-3.2 5.2-8 5.2s-8-1.9-8-5.2c0-3.8 3-7.6 6.8-8.6z"/><path class="g-line" d="M9.5 6.7h5"/><circle class="g-dark" cx="12" cy="14.5" r="2.4"/>',
  Sram: '<path d="M12 3c4.7 0 8 3.2 8 7.4 0 2.6-1.3 4.4-3 5.4V19a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19v-3.2c-1.7-1-3-2.8-3-5.4C4 6.2 7.3 3 12 3z"/><circle class="g-dark" cx="8.8" cy="10.8" r="2"/><circle class="g-dark" cx="15.2" cy="10.8" r="2"/><path class="g-line" d="M10.5 17.5v3M13.5 17.5v3"/>',
  Xélor: '<path d="M5.5 2.5h13v2.2l-5 7.3 5 7.3v2.2h-13v-2.2l5-7.3-5-7.3z"/><path class="g-dark" d="M8.5 5h7l-3.5 5zM12 15.5l3.8 4h-7.6z"/>',
  Ecaflip: '<rect x="4.5" y="4.5" width="15" height="15" rx="3" transform="rotate(12 12 12)"/><circle class="g-dark" cx="8.7" cy="8.2" r="1.5"/><circle class="g-dark" cx="12" cy="12" r="1.5"/><circle class="g-dark" cx="15.3" cy="15.8" r="1.5"/>',
  Iop: '<path d="M20.5 3.5l-.6 3.4-8.4 8.4-2.8-2.8 8.4-8.4z"/><path d="M5.6 11.6l6.8 6.8-1.6 1.6-2-1.4-2.6 2.6-2.4-2.4 2.6-2.6-1.4-2z"/>',
  Crâ: '<path d="M4.3 18.3L16.2 6.4l1.4 1.4L5.7 19.7z"/><path d="M21 3l-1.6 6.6-5-5z"/><path d="M2.5 17.5l2.4-.6 2.2 2.2-.6 2.4-1.4-1.4-1.6 1.6-1.6-1.6 1.6-1.6z"/>',
  Sadida: '<path d="M4.5 19.5C4.5 10.5 10.5 4 20 4c0 9.5-6.5 15.5-15.5 15.5z"/><path class="g-line" d="M4.5 19.5L15 9M9 15l-.5-4M12 12l3 .5"/>',
  Eniripsa: '<path d="M12 20.5S3.5 15.2 3.5 9.2A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.5 2.2c0 6-8.5 11.3-8.5 11.3z"/><path class="g-line" d="M12 10v6M9 13h6"/>',
  Sacrieur: '<path d="M12 2.5c3.3 5.2 6.5 8.5 6.5 12.5a6.5 6.5 0 0 1-13 0c0-4 3.2-7.3 6.5-12.5z"/><path class="g-line" d="M9 15.5a3 3 0 0 0 2.5 2.8"/>',
  Pandawa: '<path d="M10 2.5h4v2.6h-.6v1.6c1.6.6 2.6 1.9 2.6 3.4 0 1.1-.5 2-1.3 2.7 2.4.9 4 3 4 5.4 0 2.6-3.2 4-6.7 4s-6.7-1.4-6.7-4c0-2.4 1.6-4.5 4-5.4-.8-.7-1.3-1.6-1.3-2.7 0-1.5 1-2.8 2.6-3.4V5.1H10z"/><path class="g-line" d="M7.7 15.5h8.6"/>',
};

const TEMPLE_SUBAREA_IDS = new Set(
  TEMPLES.filter((t) => t.subareaId !== null).map((t) => t.subareaId)
);

// === Pre-computed grid positions ===

const baseColX = [];
let pos = 0;
for (let col = 0; col < 130; col++) {
  baseColX.push(pos);
  pos += col < COL_SPLIT ? BASE_W1 : BASE_W2;
}

// === State ===

let cells = [];
let subareaNames = {};
let unlockedSubareas = new Set(JSON.parse(localStorage.getItem('cartdof_unlocked') || '[]'));
let unlockedTemples = new Set(JSON.parse(localStorage.getItem('cartdof_temples_v2') || '[]'));
let autres = JSON.parse(localStorage.getItem('cartdof_autres') || '[]');
let unlockedDonjons = loadDonjons();
let totalPoints = parseInt(localStorage.getItem('cartdof_points') || '0');

let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let hasMoved = false;
let currentHoverSubarea = null;
let currentHoverCell = null;

const cellsBySubarea = {};
const cellsByCoord = {};
let cellElements = [];
let markerElements = [];

// === DOM refs ===

const mapGrid = document.getElementById('mapGrid');
const mapContainer = document.getElementById('mapContainer');
const statsEl = document.getElementById('stats');
const tooltipEl = document.getElementById('tooltip');

// === Points system ===

function getCostForNth(n) {
  for (const tier of COST_TIERS) {
    if (n <= tier.max) return tier.cost;
  }
  return 5;
}

function getTotalSpent(count) {
  let total = 0;
  for (let i = 1; i <= count; i++) total += getCostForNth(i);
  return total;
}

function getAffordableUnlocks(points, alreadyUnlocked) {
  let remaining = points - getTotalSpent(alreadyUnlocked);
  let extra = 0;
  let next = alreadyUnlocked + 1;
  while (remaining >= getCostForNth(next)) {
    remaining -= getCostForNth(next);
    extra++;
    next++;
  }
  return { extra, remaining };
}

function getTotalUnlocked() {
  return unlockedSubareas.size + unlockedDonjons.size + unlockedTemples.size + autres.length;
}

// === Dungeon helpers ===

function normalizeName(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

// Converts legacy saves ({ name, x, y } objects) into dungeon ids.
// Entries that match no known dungeon are moved to "autres" so no point is lost.
function migrateDonjons(list, autresList) {
  const ids = new Set();
  for (const item of list || []) {
    if (typeof item === 'string') {
      if (DUNGEON_BY_ID[item]) ids.add(item);
      continue;
    }
    const sameCoords = DUNGEONS.filter((d) => d.x === item.x && d.y === item.y && !ids.has(d.id));
    const byName = DUNGEONS.find((d) => normalizeName(d.name) === normalizeName(item.name || ''));
    const match =
      (byName && !ids.has(byName.id) && byName) ||
      sameCoords.find((d) => normalizeName(item.name || '').includes(normalizeName(d.boss))) ||
      sameCoords[0];
    if (match) ids.add(match.id);
    else autresList.push({ name: `${item.name} [${item.x}, ${item.y}]` });
  }
  return ids;
}

function loadDonjons() {
  const v2 = localStorage.getItem('cartdof_donjons_v2');
  if (v2) return new Set(JSON.parse(v2).filter((id) => DUNGEON_BY_ID[id]));
  const legacy = JSON.parse(localStorage.getItem('cartdof_donjons') || '[]');
  const ids = migrateDonjons(legacy, autres);
  localStorage.setItem('cartdof_donjons_v2', JSON.stringify([...ids]));
  localStorage.setItem('cartdof_autres', JSON.stringify(autres));
  localStorage.removeItem('cartdof_donjons');
  return ids;
}

function toggleDonjon(id) {
  if (!DUNGEON_BY_ID[id]) return;
  unlockedDonjons.has(id) ? unlockedDonjons.delete(id) : unlockedDonjons.add(id);
  savePOI();
  applyPOIMarkers();
  updateStats();
  renderPOILists();
}

// === Temple helpers ===

function getTempleKey(temple) {
  return temple.subareaId !== null ? temple.subareaId : temple.key;
}

function toggleTempleByKey(key) {
  if (unlockedTemples.has(key)) {
    unlockedTemples.delete(key);
  } else {
    unlockedTemples.add(key);
  }
  applyTempleMarkers();
  savePOI();
  updateStats();
  renderPOILists();
}

// === Persistence ===

function saveZones() {
  localStorage.setItem('cartdof_unlocked', JSON.stringify([...unlockedSubareas]));
}

function savePOI() {
  localStorage.setItem('cartdof_donjons_v2', JSON.stringify([...unlockedDonjons]));
  localStorage.setItem('cartdof_temples_v2', JSON.stringify([...unlockedTemples]));
  localStorage.setItem('cartdof_autres', JSON.stringify(autres));
}

// === Map rendering ===

function applyCalibration() {
  for (const el of cellElements) {
    const col = parseInt(el.dataset.gx) - FULL_MIN_X;
    const row = parseInt(el.dataset.gy) - FULL_MIN_Y;
    const colWidth = (col < COL_SPLIT ? BASE_W1 : BASE_W2) * CAL.scaleX;
    el.style.left = CAL.offX + baseColX[col] * CAL.scaleX + 'px';
    el.style.top = CAL.offY + row * CAL.cellH + 'px';
    el.style.width = colWidth + 'px';
    el.style.height = CAL.cellH + 'px';
  }
}

function getCellCenter(x, y) {
  const col = x - FULL_MIN_X;
  const row = y - FULL_MIN_Y;
  const colWidth = (col < COL_SPLIT ? BASE_W1 : BASE_W2) * CAL.scaleX;
  return {
    left: CAL.offX + baseColX[col] * CAL.scaleX + colWidth / 2,
    top: CAL.offY + row * CAL.cellH + CAL.cellH / 2,
  };
}

function getTemplePosition(temple) {
  if (temple.subareaId === null) return { x: temple.x, y: temple.y };
  const el = (cellsBySubarea[temple.subareaId] || [])[0];
  return el ? { x: parseInt(el.dataset.gx), y: parseInt(el.dataset.gy) } : null;
}

// Clickable dungeon / temple icons, laid out side by side when they share a map
function createMarkers() {
  const groups = {};
  const items = [
    ...DUNGEONS.map((d) => ({ type: 'donjon', key: d.id, x: d.x, y: d.y })),
    ...TEMPLES.map((t) => ({ type: 'temple', key: getTempleKey(t), name: t.name, ...getTemplePosition(t) })),
  ].filter((m) => m.x !== undefined);
  for (const m of items) (groups[m.x + ',' + m.y] ||= []).push(m);

  const fragment = document.createDocumentFragment();
  for (const group of Object.values(groups)) {
    group.forEach((m, i) => {
      const { left, top } = getCellCenter(m.x, m.y);
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `poi-marker ${m.type}-marker`;
      if (m.type === 'temple') {
        el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${TEMPLE_GLYPHS[m.name] || ''}</svg>`;
        el.setAttribute('aria-label', `Temple ${m.name}`);
      } else {
        el.setAttribute('aria-label', DUNGEON_BY_ID[m.key].name);
      }
      el.dataset.type = m.type;
      el.dataset.key = m.key;
      el.style.left = left + 'px';
      el.style.top = top + 'px';
      el.style.setProperty('--dx', i - (group.length - 1) / 2);
      fragment.appendChild(el);
      markerElements.push(el);
    });
  }
  mapGrid.appendChild(fragment);
}

function isMarkerUnlocked(el) {
  if (el.dataset.type === 'donjon') return unlockedDonjons.has(el.dataset.key);
  const raw = el.dataset.key;
  return unlockedTemples.has(isNaN(parseInt(raw)) ? raw : parseInt(raw));
}

function refreshMarkers() {
  for (const el of markerElements) el.classList.toggle('unlocked', isMarkerUnlocked(el));
}

function updateMarkerScale() {
  // Keep icons readable when zoomed out, without growing past their natural size when zoomed in
  mapGrid.style.setProperty('--marker-scale', Math.min(3, Math.max(1, 0.45 / scale)));
}

function applyPOIMarkers() {
  for (const el of cellElements) el.classList.remove('has-donjon');
  for (const id of unlockedDonjons) {
    const d = DUNGEON_BY_ID[id];
    const el = cellsByCoord[d.x + ',' + d.y];
    if (el) el.classList.add('has-donjon');
  }
  refreshMarkers();
}

function applyTempleMarkers() {
  for (const el of cellElements) el.classList.remove('has-temple');
  for (const t of TEMPLES) {
    if (t.subareaId !== null && unlockedTemples.has(t.subareaId)) {
      for (const el of cellsBySubarea[t.subareaId] || []) {
        el.classList.add('has-temple');
      }
    }
  }
  refreshMarkers();
}

function applyTransform() {
  mapGrid.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  updateMarkerScale();
}

function fitToScreen() {
  const padding = 20;
  const availW = mapContainer.clientWidth - padding * 2;
  const availH = mapContainer.clientHeight - padding * 2;
  scale = Math.min(availW / MAP_W, availH / MAP_H);
  offsetX = (mapContainer.clientWidth - MAP_W * scale) / 2;
  offsetY = (mapContainer.clientHeight - MAP_H * scale) / 2;
  applyTransform();
}

// === UI updates ===

function updateStats() {
  const total = Object.keys(cellsBySubarea).length;
  const unlocked = unlockedSubareas.size;
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  statsEl.innerHTML =
    `<span class="count">${unlocked}</span> / ${total} zones (${pct}%)` +
    ` · <span style="color:#dc3232">${unlockedDonjons.size} DJ</span>` +
    ` · <span style="color:#a050dc">${unlockedTemples.size} T</span>`;
  updatePointsInfo();
}

function updatePointsInfo() {
  const infoEl = document.getElementById('pointsInfo');
  const count = getTotalUnlocked();
  const { extra, remaining } = getAffordableUnlocks(totalPoints, count);

  if (totalPoints === 0) {
    infoEl.textContent = '';
    return;
  }

  const spent = getTotalSpent(count);
  if (spent > totalPoints) {
    const deficit = spent - totalPoints;
    infoEl.textContent = `Déficit de ${deficit} point${deficit > 1 ? 's' : ''} !`;
    infoEl.style.color = '#ff4444';
  } else if (extra > 0) {
    infoEl.textContent = `${extra} déblocage${extra > 1 ? 's' : ''} disponible${extra > 1 ? 's' : ''} (${remaining} pt restant${remaining > 1 ? 's' : ''})`;
    infoEl.style.color = '#4caf50';
  } else if (remaining > 0) {
    const nextCost = getCostForNth(count + 1);
    infoEl.textContent = `${remaining}/${nextCost} pts vers le prochain`;
    infoEl.style.color = '#ff8c00';
  } else {
    infoEl.textContent = 'Tous les points dépensés';
    infoEl.style.color = '#888';
  }
}

function updateSectionStates() {
  const $ = (id) => document.getElementById(id);
  $('sectionDonjons').classList.toggle('has-items', true);
  $('sectionTemples').classList.toggle('has-items', true);
  $('sectionAutres').classList.toggle('has-items', autres.length > 0);
  $('sectionZones').classList.toggle('has-items', unlockedSubareas.size > 0);
  $('donjonCount').textContent = `${unlockedDonjons.size} sur ${DUNGEONS.length}`;
  $('templeCount').textContent = `${unlockedTemples.size} sur ${TEMPLES.length}`;
  $('autreCount').textContent = autres.length
    ? `${autres.length} zone${autres.length > 1 ? 's' : ''}`
    : '';
}

// === List rendering ===

function renderZoneList() {
  const sorted = [...unlockedSubareas]
    .map((id) => ({
      id,
      name: subareaNames[id]?.subarea || 'Zone ' + id,
      area: subareaNames[id]?.area || '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  document.getElementById('zoneList').innerHTML = sorted.length
    ? sorted
        .map(
          (z) =>
            `<li class="poi-item zone-item">
              <div><span class="poi-name">${z.name}</span> <span class="poi-coords">${z.area}</span></div>
              <button class="poi-delete" data-subarea="${z.id}">&times;</button>
            </li>`
        )
        .join('')
    : '<li class="empty-msg">Cliquez sur la carte pour déverrouiller une zone</li>';
  updateSectionStates();
}

function renderPOILists() {
  document.getElementById('donjonList').innerHTML = [...DUNGEONS]
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
    .map(
      (d) =>
        `<li class="poi-item donjon-item">
          <label class="temple-check donjon-check">
            <input type="checkbox" data-donjon-id="${d.id}" ${unlockedDonjons.has(d.id) ? 'checked' : ''} />
            <span class="poi-name">${d.name}</span>
          </label>
          <span class="poi-coords" title="Niveau ${d.level}">[${d.x}, ${d.y}]</span>
        </li>`
    )
    .join('');

  document.getElementById('templeList').innerHTML = TEMPLES.map((t) => {
    const key = getTempleKey(t);
    return `<li class="poi-item temple-item">
      <label class="temple-check">
        <input type="checkbox" data-temple-key="${key}" ${unlockedTemples.has(key) ? 'checked' : ''} />
        <span class="poi-name">${t.name}</span>
      </label>
    </li>`;
  }).join('');

  document.getElementById('autreList').innerHTML = autres.length
    ? autres
        .map(
          (a, i) =>
            `<li class="poi-item autre-item">
              <div><span class="poi-name">${a.name}</span></div>
              <button class="poi-delete" data-index="${i}">&times;</button>
            </li>`
        )
        .join('')
    : '<li class="empty-msg">Aucune zone cachée ajoutée</li>';
  updateSectionStates();
}

// === Data mutations ===

function toggleSubarea(subareaId) {
  if (TEMPLE_SUBAREA_IDS.has(subareaId)) {
    toggleTempleByKey(subareaId);
    return;
  }
  const wasUnlocked = unlockedSubareas.has(subareaId);
  wasUnlocked ? unlockedSubareas.delete(subareaId) : unlockedSubareas.add(subareaId);
  for (const el of cellsBySubarea[subareaId] || []) {
    el.classList.toggle('unlocked', !wasUnlocked);
  }
  saveZones();
  updateStats();
  renderZoneList();
}

function addAutre(name) {
  autres.push({ name });
  savePOI();
  updateStats();
  renderPOILists();
}

function removeAutre(index) {
  autres.splice(index, 1);
  savePOI();
  updateStats();
  renderPOILists();
}

// === Tooltip ===

function buildTooltipHtml(cell, subareaId) {
  const name = subareaNames[subareaId];
  let html = '';

  if (name) {
    const status = unlockedSubareas.has(subareaId) ? ' (déverrouillée)' : '';
    html = `<span class="zone-name">${name.subarea}</span><br>${name.area}${status}`;
  }

  if (TEMPLE_SUBAREA_IDS.has(subareaId)) {
    const temple = TEMPLES.find((t) => t.subareaId === subareaId);
    const unlocked = unlockedTemples.has(getTempleKey(temple)) ? ' (déverrouillé)' : '';
    html += `<br><span class="temple-info">Temple ${temple.name}${unlocked}</span>`;
  }

  const gx = parseInt(cell.dataset.gx);
  const gy = parseInt(cell.dataset.gy);
  for (const d of DUNGEONS) {
    if (d.x === gx && d.y === gy) {
      const unlocked = unlockedDonjons.has(d.id) ? ' (déverrouillé)' : '';
      html += `<br><span class="donjon-info">Donjon : ${d.name}${unlocked}</span>`;
    }
  }

  return html;
}

function buildMarkerTooltipHtml(marker) {
  const unlocked = isMarkerUnlocked(marker);
  const status = unlocked
    ? '<span class="marker-status unlocked">Déverrouillé — cliquer pour retirer</span>'
    : `<span class="marker-status">Verrouillé — cliquer pour débloquer (${getCostForNth(getTotalUnlocked() + 1)} pt)</span>`;

  if (marker.dataset.type === 'donjon') {
    const d = DUNGEON_BY_ID[marker.dataset.key];
    return (
      `<span class="donjon-info">${d.name}</span><br>` +
      `Boss : ${d.boss} · Niv. ${d.level} · [${d.x}, ${d.y}]<br>${status}`
    );
  }
  const temple = TEMPLES.find((t) => String(getTempleKey(t)) === marker.dataset.key);
  const p = getTemplePosition(temple);
  return `<span class="temple-info">Temple ${temple.name}</span><br>[${p.x}, ${p.y}]<br>${status}`;
}

function clearHoverHighlight() {
  if (currentHoverSubarea !== null) {
    for (const el of cellsBySubarea[currentHoverSubarea] || []) {
      el.classList.remove('hover-highlight');
    }
  }
}

// === Export / Import ===

function exportSave() {
  const data = {
    zones: [...unlockedSubareas],
    donjons: [...unlockedDonjons],
    temples: [...unlockedTemples],
    autres,
    points: totalPoints,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cartdof-save.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importSave(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.zones || !data.donjons) {
        alert('Fichier invalide');
        return;
      }
      if (!confirm('Remplacer la progression actuelle ?')) return;

      unlockedSubareas = new Set(data.zones);
      unlockedTemples = new Set(data.temples || []);
      autres = data.autres || [];
      unlockedDonjons = migrateDonjons(data.donjons, autres);
      totalPoints = data.points || 0;

      document.getElementById('pointsField').value = totalPoints;
      saveZones();
      savePOI();
      localStorage.setItem('cartdof_points', totalPoints);

      for (const el of cellElements) {
        el.classList.toggle('unlocked', unlockedSubareas.has(parseInt(el.dataset.subarea)));
      }
      applyPOIMarkers();
      applyTempleMarkers();
      updateStats();
      renderPOILists();
      renderZoneList();
    } catch {
      alert('Erreur de lecture du fichier');
    }
  };
  reader.readAsText(file);
}

// === Events ===

function setupEvents() {
  // Sidebar collapse
  document.querySelectorAll('.sidebar-title').forEach((title) => {
    title.addEventListener('click', () => {
      title.closest('.sidebar-section').classList.toggle('collapsed');
    });
  });

  // Map: click to toggle
  mapGrid.addEventListener('mousedown', () => (hasMoved = false));
  mapGrid.addEventListener('click', (e) => {
    if (hasMoved) return;
    const marker = e.target.closest('.poi-marker');
    if (marker) {
      if (marker.dataset.type === 'donjon') toggleDonjon(marker.dataset.key);
      else {
        const raw = marker.dataset.key;
        toggleTempleByKey(isNaN(parseInt(raw)) ? raw : parseInt(raw));
      }
      tooltipEl.innerHTML = buildMarkerTooltipHtml(marker);
      return;
    }
    const cell = e.target.closest('.cell');
    if (cell) toggleSubarea(parseInt(cell.dataset.subarea));
  });

  // Map: hover tooltip
  mapGrid.addEventListener('mousemove', (e) => {
    const marker = e.target.closest('.poi-marker');
    if (marker) {
      if (marker === currentHoverCell) return;
      clearHoverHighlight();
      currentHoverSubarea = null;
      currentHoverCell = marker;
      tooltipEl.innerHTML = buildMarkerTooltipHtml(marker);
      tooltipEl.style.display = 'block';
      return;
    }
    const cell = e.target.closest('.cell');
    if (!cell) {
      if (currentHoverCell) {
        clearHoverHighlight();
        tooltipEl.style.display = 'none';
        currentHoverSubarea = null;
        currentHoverCell = null;
      }
      return;
    }
    if (cell === currentHoverCell) return;
    currentHoverCell = cell;
    const subareaId = parseInt(cell.dataset.subarea);

    if (subareaId !== currentHoverSubarea) {
      clearHoverHighlight();
      currentHoverSubarea = subareaId;
      for (const el of cellsBySubarea[subareaId] || []) el.classList.add('hover-highlight');
    }

    const html = buildTooltipHtml(cell, subareaId);
    if (html) {
      tooltipEl.innerHTML = html;
      tooltipEl.style.display = 'block';
    }
  });

  mapGrid.addEventListener('mouseleave', () => {
    clearHoverHighlight();
    tooltipEl.style.display = 'none';
    currentHoverSubarea = null;
    currentHoverCell = null;
  });

  // Map: pan & zoom
  window.addEventListener('mousemove', (e) => {
    if (tooltipEl.style.display === 'block') {
      tooltipEl.style.left = e.clientX + 15 + 'px';
      tooltipEl.style.top = e.clientY + 15 + 'px';
    }
    if (isDragging) {
      if (
        Math.abs(e.clientX - (dragStartX + offsetX)) > 3 ||
        Math.abs(e.clientY - (dragStartY + offsetY)) > 3
      ) {
        hasMoved = true;
      }
      offsetX = e.clientX - dragStartX;
      offsetY = e.clientY - dragStartY;
      applyTransform();
    }
  });

  mapContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    hasMoved = false;
    dragStartX = e.clientX - offsetX;
    dragStartY = e.clientY - offsetY;
  });

  window.addEventListener('mouseup', () => (isDragging = false));

  mapContainer.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = mapContainer.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const prev = scale;
      scale = Math.max(0.1, Math.min(10, scale * factor));
      offsetX = mx - ((mx - offsetX) / prev) * scale;
      offsetY = my - ((my - offsetY) / prev) * scale;
      applyTransform();
    },
    { passive: false }
  );

  // Rules modal
  const rulesOverlay = document.getElementById('rulesOverlay');
  document.getElementById('infoBtn').addEventListener('click', () => (rulesOverlay.hidden = false));
  document.getElementById('rulesClose').addEventListener('click', () => (rulesOverlay.hidden = true));
  document.getElementById('rulesCloseX').addEventListener('click', () => (rulesOverlay.hidden = true));
  rulesOverlay.addEventListener('click', (e) => {
    if (e.target === rulesOverlay) rulesOverlay.hidden = true;
  });

  // Export / Import
  const importFile = document.getElementById('importFile');
  document.getElementById('exportBtn').addEventListener('click', exportSave);
  document.getElementById('importBtn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    if (e.target.files[0]) importSave(e.target.files[0]);
    importFile.value = '';
  });

  // Clear all
  document.getElementById('clearBtn').addEventListener('click', () => {
    if (!confirm('Effacer toutes les zones déverrouillées ?')) return;
    unlockedSubareas.clear();
    for (const el of document.querySelectorAll('.cell.unlocked')) el.classList.remove('unlocked');
    saveZones();
    updateStats();
    renderZoneList();
  });

  // Zone list: delete
  document.getElementById('zoneList').addEventListener('click', (e) => {
    const btn = e.target.closest('.poi-delete');
    if (!btn) return;
    const id = parseInt(btn.dataset.subarea);
    unlockedSubareas.delete(id);
    for (const el of cellsBySubarea[id] || []) el.classList.remove('unlocked');
    saveZones();
    updateStats();
    renderZoneList();
  });

  // Donjon list: checkbox toggle
  document.getElementById('donjonList').addEventListener('change', (e) => {
    const cb = e.target.closest('input[data-donjon-id]');
    if (cb) toggleDonjon(cb.dataset.donjonId);
  });

  // Temple list: checkbox toggle
  document.getElementById('templeList').addEventListener('change', (e) => {
    const cb = e.target.closest('input[data-temple-key]');
    if (!cb) return;
    const raw = cb.dataset.templeKey;
    const num = parseInt(raw);
    toggleTempleByKey(isNaN(num) ? raw : num);
  });

  // Autre list: delete
  document.getElementById('autreList').addEventListener('click', (e) => {
    const btn = e.target.closest('.poi-delete');
    if (btn) removeAutre(parseInt(btn.dataset.index));
  });

  // Add modal (autres)
  const modalOverlay = document.getElementById('modalOverlay');
  const modalForm = document.getElementById('modalForm');

  function openModal() {
    modalForm.reset();
    modalOverlay.hidden = false;
    document.getElementById('modalName').focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
  }

  document.getElementById('addAutreBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    openModal();
  });

  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('modalName').value.trim();
    if (!name) return;
    addAutre(name);
    closeModal();
  });

  document.getElementById('modalCancel').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

// === Init ===

async function init() {
  const [cellsData, namesData] = await Promise.all([
    fetch('public/map-data.json').then((r) => r.json()),
    fetch('public/subarea-names.json').then((r) => r.json()),
  ]);

  cells = cellsData;
  subareaNames = namesData;
  mapGrid.style.width = MAP_W + 'px';
  mapGrid.style.height = MAP_H + 'px';

  const fragment = document.createDocumentFragment();
  for (const c of cells) {
    const el = document.createElement('div');
    el.className = 'cell';
    el.dataset.subarea = c.subarea;
    el.dataset.gx = c.x;
    el.dataset.gy = c.y;

    if (unlockedSubareas.has(c.subarea)) el.classList.add('unlocked');

    (cellsBySubarea[c.subarea] ||= []).push(el);
    cellsByCoord[c.x + ',' + c.y] = el;
    cellElements.push(el);
    fragment.appendChild(el);
  }
  mapGrid.appendChild(fragment);

  applyCalibration();
  createMarkers();
  applyPOIMarkers();
  applyTempleMarkers();
  fitToScreen();

  const pointsField = document.getElementById('pointsField');
  pointsField.value = totalPoints;
  pointsField.addEventListener('input', () => {
    totalPoints = parseInt(pointsField.value) || 0;
    localStorage.setItem('cartdof_points', totalPoints);
    updatePointsInfo();
  });

  updateStats();
  setupEvents();
  renderPOILists();
  renderZoneList();
}

init();
