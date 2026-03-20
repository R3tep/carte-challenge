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
  { subareaId: null, name: 'Pandawa', key: 'pandawa' },
];

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
let donjons = JSON.parse(localStorage.getItem('cartdof_donjons') || '[]');
let unlockedTemples = new Set(JSON.parse(localStorage.getItem('cartdof_temples_v2') || '[]'));
let autres = JSON.parse(localStorage.getItem('cartdof_autres') || '[]');
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
  return unlockedSubareas.size + donjons.length + unlockedTemples.size + autres.length;
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
  localStorage.setItem('cartdof_donjons', JSON.stringify(donjons));
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

function applyPOIMarkers() {
  for (const el of cellElements) el.classList.remove('has-donjon');
  for (const d of donjons) {
    const el = cellsByCoord[d.x + ',' + d.y];
    if (el) el.classList.add('has-donjon');
  }
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
}

function applyTransform() {
  mapGrid.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
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
    ` · <span style="color:#dc3232">${donjons.length} DJ</span>` +
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
  $('sectionDonjons').classList.toggle('has-items', donjons.length > 0);
  $('sectionTemples').classList.toggle('has-items', true);
  $('sectionAutres').classList.toggle('has-items', autres.length > 0);
  $('sectionZones').classList.toggle('has-items', unlockedSubareas.size > 0);
  $('donjonCount').textContent = `${donjons.length} sur 42`;
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
  document.getElementById('donjonList').innerHTML = donjons.length
    ? donjons
        .map(
          (d) =>
            `<li class="poi-item donjon-item">
              <div><span class="poi-name">${d.name}</span> <span class="poi-coords">[${d.x}, ${d.y}]</span></div>
              <button class="poi-delete" data-x="${d.x}" data-y="${d.y}">&times;</button>
            </li>`
        )
        .join('')
    : '<li class="empty-msg">Aucun donjon ajouté</li>';

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

function addDonjon(name, x, y) {
  if (donjons.some((d) => d.x === x && d.y === y)) return;
  donjons.push({ name, x, y });
  savePOI();
  applyPOIMarkers();
  updateStats();
  renderPOILists();
}

function removeDonjon(x, y) {
  donjons = donjons.filter((d) => !(d.x === x && d.y === y));
  savePOI();
  applyPOIMarkers();
  updateStats();
  renderPOILists();
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
  const donjon = donjons.find((d) => d.x === gx && d.y === gy);
  if (donjon) {
    html += `<br><span class="donjon-info">Donjon: ${donjon.name}</span>`;
  }

  return html;
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
    donjons,
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
      donjons = data.donjons;
      unlockedTemples = new Set(data.temples || []);
      autres = data.autres || [];
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
    const cell = e.target.closest('.cell');
    if (cell) toggleSubarea(parseInt(cell.dataset.subarea));
  });

  // Map: hover tooltip
  mapGrid.addEventListener('mousemove', (e) => {
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

  // Donjon list: delete
  document.getElementById('donjonList').addEventListener('click', (e) => {
    const btn = e.target.closest('.poi-delete');
    if (btn) removeDonjon(parseInt(btn.dataset.x), parseInt(btn.dataset.y));
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

  // Add modal (donjons & autres)
  let modalType = null;
  const modalOverlay = document.getElementById('modalOverlay');
  const modalForm = document.getElementById('modalForm');
  const modalCoords = document.querySelector('#modalOverlay .coord-row');

  function openModal(type) {
    modalType = type;
    const cfg = {
      donjon: { label: 'Ajouter un donjon', color: 'donjon-color' },
      autre: { label: 'Ajouter une zone cachée', color: 'autre-color' },
    };
    document.getElementById('modalTitle').textContent = cfg[type].label;
    document.getElementById('modalTitle').className = 'modal-title ' + cfg[type].color;
    modalCoords.style.display = type === 'autre' ? 'none' : '';
    document.getElementById('modalX').required = type !== 'autre';
    document.getElementById('modalY').required = type !== 'autre';
    modalForm.reset();
    modalOverlay.hidden = false;
    document.getElementById('modalName').focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    modalType = null;
  }

  document.getElementById('addDonjonBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    openModal('donjon');
  });
  document.getElementById('addAutreBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    openModal('autre');
  });

  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('modalName').value.trim();
    if (!name) return;
    if (modalType === 'autre') {
      addAutre(name);
    } else {
      const x = parseInt(document.getElementById('modalX').value);
      const y = parseInt(document.getElementById('modalY').value);
      if (!isNaN(x) && !isNaN(y)) addDonjon(name, x, y);
    }
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
