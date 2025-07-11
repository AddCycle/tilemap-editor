import { Tile } from "./Objects/Tile.js";

export var TILE_SIZE = 32;
var TILES_COUNT = 4;
const canvas = document.getElementById('content');
canvas.width = 1024;
canvas.height = 512;
var COLS = canvas.width / TILE_SIZE;
var ROWS = canvas.height / TILE_SIZE;

const ctx = canvas.getContext('2d');

const tiles = [];
const tilemap = new Image();
tilemap.src = './assets/tilemap.png';
let hoverTile = null;
let currentTile = null;
let eraseMode = false;
let areElementsHidden = false;
const types = [];

function drawGrid() {
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      ctx.strokeRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}

function getTileOfType(type) {
  return types[type];
}

function fill(x,y,type = 0) {
  getTileOfType(type).draw(ctx, x, y);

  if (!tiles.some(t => t.x === x && t.y === y)) {
    tiles.push({ x, y, type });
  }
}

function remove(x,y) {
  const index = tiles.findIndex(t => t.x === x && t.y === y);
  if (index !== -1) {
    tiles.splice(index, 1);
  }
}

function preview(x,y) {
  console.log(currentTile);
  currentTile?.draw(ctx, x, y);
}

function reset() {
  ctx.fillStyle = 'black';
}

function clear() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

function processHover(hoverX, hoverY) {
  preview(hoverX, hoverY);
  reset();
}

function processClick(clickX, clickY, type) {
  if (type === 0) {
    fill(clickX, clickY, currentTile?.type);
  } else if (type === 2) {
    console.log('right-click')
    eraseMode = true;
    remove(clickX, clickY);
  }
}

function drawTiles() {
  for (const tile of tiles) {
    console.log(tiles);
    getTileOfType(tile.type).draw(ctx, tile.x, tile.y);
  }
}

function draw() {
  clear();

  drawGrid();

  drawTiles();

  if (hoverTile) {
    console.log("hovering");
    processHover(hoverTile.x, hoverTile.y);
  }
}

function init() {
  console.log(tilemap);
  initTiles(tilemap?.width, tilemap?.height, TILES_COUNT, TILE_SIZE);

  initButtons();

  initOptions();
}

function applicationLoop() {
  draw();

  window.requestAnimationFrame(applicationLoop);
}

function createLevel() {
  const sortedTiles = [...tiles].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
  const level = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const tile = sortedTiles.find(t => t.x === x && t.y === y);
      level.push(tile || null); // fill empty spaces with null
    }
  }
  console.log(level);
  return level;
}

// save function (TO UNDERSTAND)
function saveLevel(level) {
  console.log("SAVED THE LEVEL")
  const a = document.createElement('a');
  let levelString = '';
  for (let y = 0; y < ROWS; y++) {
    const row = [];
    for (let x = 0; x < COLS; x++) {
      const tile = level[y * COLS + x];
      row.push(tile ? tile.type : -1);
    }
    levelString += row.join(' ') + '\n';
  }
  const blob = new Blob([levelString], {
    type: "text/plain",
  });

  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = `level-${COLS}-${ROWS}.txt`;
  a.style.display = 'none';
  document.body.append(a);

  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
}

// load function
function loadLevel(content) {
  tiles.length = 0; // Clear existing tiles

  const lines = content.trim().split('\n');
  for (let y = 0; y < lines.length; y++) {
    const types = lines[y].trim().split(/\s+/); // split every space
    for (let x = 0; x < types.length; x++) {
      const type = parseInt(types[x], 10);
      if (type >= 0) {
        tiles.push({ x, y, type });
      }
    }
  }

  console.log("Level loaded", tiles);
}

// Mouse variables
let isMouseDown = false;
let lastTileX = null;
let lastTileY = null;

// Simple Bresenham-like line algorithm for grid-based filling
function fillLine(x0, y0, x1, y1, ft = fill) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    ft(x0, y0, currentTile?.type);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}

canvas.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  hoverTile = null;
  const clickX = Math.floor(e.offsetX / TILE_SIZE);
  const clickY = Math.floor(e.offsetY / TILE_SIZE);
  lastTileX = clickX;
  lastTileY = clickY;
  processClick(clickX, clickY, e.button);
});

canvas.addEventListener('mousemove', (e) => {
  const hoverX = Math.floor(e.offsetX / TILE_SIZE);
  const hoverY = Math.floor(e.offsetY / TILE_SIZE);
  if (isMouseDown) {
    if (hoverX !== lastTileX || hoverY !== lastTileY) {
      if (eraseMode) {
        fillLine(lastTileX, lastTileY, hoverX, hoverY, remove);
      } else {
        fillLine(lastTileX, lastTileY, hoverX, hoverY);
      }
      lastTileX = hoverX;
      lastTileY = hoverY;
    }
  } else {
    hoverTile = {x: hoverX, y: hoverY}
  }
});

canvas.addEventListener('mouseup', (e) => {
  isMouseDown = false;
  eraseMode = false;
  lastTileX = null;
  lastTileY = null;
  console.log(tiles)
});

canvas.addEventListener('mouseleave', (e) => {
  hoverTile = null;
});

// prevents right-click window
canvas.addEventListener('contextmenu', event => event.preventDefault());

// TILES IMAGES
function initTiles(width, height, tilesNumber, tileSize = TILE_SIZE) { // maybe add the tileSize
  let RW = width / tileSize;
  let CL = height / tileSize;
  types.length = 0;
  for (let i = 0; i < RW; i++) {
    for (let j = 0; j < CL; j++) {
      const index = i * CL + j;
      if (index < tilesNumber) types.push(new Tile(tilemap, j, i));
    }
  }
  console.log(types)
  currentTile = types[0]; // default so can see preview grass now
}

function initOptions() {
  const options = document.getElementById('options');
  document.getElementById('optionWidth').addEventListener('input', (e) => {
    const val = e.target.value || 0;
    document.getElementById('opt-width').innerHTML = `Width : ${val}`;
    canvas.width = val * TILE_SIZE;
    COLS = canvas.width / TILE_SIZE;
  });
  document.getElementById('optionHeight').addEventListener('input', (e) => {
    const val = e.target.value || 0;
    document.getElementById('opt-height').innerHTML = `Height : ${val}`;
    canvas.height = val * TILE_SIZE;
    ROWS = canvas.width / TILE_SIZE;
  });
  document.getElementById('optionTileSize').addEventListener('input', (e) => {
    const val = e.target.value || 0;
    document.getElementById('opt-tilesize').innerHTML = `TileSize : ${val} (should match your tiles size)`;
    TILE_SIZE = val;
  });
  document.getElementById('tilemap-tiles').addEventListener('input', (e) => {
    const val = e.target.value || 0;
    document.getElementById('tilemap-tiles-info').innerHTML = `ACTUAL NON EMPTY TILES in your tilemap : ${val} (dev)`;
    TILES_COUNT = val;
  });
  document.getElementById('hide').addEventListener('input', (e) => {
    if (!areElementsHidden) {
      hideElements();
    } else {
      showElements();
    }
    areElementsHidden = !areElementsHidden;
    let state = areElementsHidden ? "HIDE" : "SHOW";
    document.getElementById('hide-info').innerHTML = `${state} ELEMENTS`;
  });
}

function resetButtons() {
  const parent = document.querySelector('.tiles');
  parent.querySelectorAll('.tile').forEach(b => b.remove()); // nuke old buttons

  types.forEach((_t, i) => {
    const btn = document.createElement('button');
    btn.id = `tile${i + 1}`;
    btn.className = 'tile';
    btn.addEventListener('click', () => {
      currentTile = types[i];
    });
    parent.appendChild(btn);
  });
}

function initButtons() {
  const parent = document.querySelector('.tiles');
  for (let i = 0; i < types.length; i++) {
    const btn = document.createElement('button');
    btn.id = `tile${i+1}`;
    btn.className = 'tile';
    btn.addEventListener('click', () => {
      console.log(`button${i+1} click : `)
      currentTile = types[i];
      console.log(currentTile)
    });
    parent.appendChild(btn);
  }

  // clear button
  parent.querySelector('#clear').addEventListener('click', () => {
    tiles.length = 0;
  });

  // save button
  parent.querySelector('#save').addEventListener('click', () => {
    const level = createLevel();
    saveLevel(level);
  });

  // load level button
  parent.querySelector('#triggerLoadLevel').addEventListener('click', () => {
    parent.querySelector('#loadLevel').click();
  });

  // load level actual logic
  parent.querySelector('#loadLevel').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      loadLevel(content);
    };
    reader.readAsText(file);
  });

  // load tilemap button
  parent.querySelector('#triggerLoadTileMap').addEventListener('click', () => {
    parent.querySelector('#loadTileMap').click();
  });

  // load tilemap actual logic
  parent.querySelector('#loadTileMap').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      tilemap.src = e.target.result;
      tilemap.onload = () => {
        initTiles(tilemap.width, tilemap.height, TILES_COUNT, TILE_SIZE);
        resetButtons();
        console.log('Tilemap image loaded!');
        draw(); // re-draw with new tilemap
      };
    };
    reader.readAsDataURL(file);
  });
}

tilemap.onload = () => {
  init();
  applicationLoop();
};

function hideElements() {
  document.getElementById('editor').style.display = 'none';
  document.getElementById('options').style.display = 'none';
  document.getElementById('tiles').style.display = 'none';
}

function showElements() {
  document.getElementById('editor').style.display = 'block';
  document.getElementById('options').style.display = 'block';
  document.getElementById('tiles').style.display = 'block';
}

// Some keys to hide the tools
window.addEventListener('keypress', (e) => {
  if (e.code === 'Space' || e.code === 'KeyH') {
    if (!areElementsHidden) {
      hideElements();
    } else {
      showElements();
    }
    areElementsHidden = !areElementsHidden;
  }
})