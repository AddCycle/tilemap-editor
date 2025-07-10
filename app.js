import { Tile } from "./Objects/Tile.js";

const canvas = document.getElementById('content');
canvas.width = 1024;
canvas.height = 512;

const ctx = canvas.getContext('2d');

const TILE_SIZE = 32;
const tiles = [];
const tilemap = new Image();
tilemap.src = './assets/tilemap.png';
let hoverTile = null;
let currentTile = null;
const types = [];
let grass;
let water;
let wall;
let sand;

function drawGrid() {
  for (let i = 0; i < canvas.width; i++) {
    for (let j = 0; j < canvas.height; j++) {
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
    tiles.push({ x, y, type }); // TODO : add tile number (type)
  }
}

function preview(x,y,color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function reset() {
  ctx.fillStyle = 'black';
}

function clear() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

function processHover(hoverX, hoverY) {
  preview(hoverX, hoverY, 'gray');
  reset();
}

function processClick(clickX, clickY) {
  fill(clickX, clickY, currentTile?.type);
}

function drawTiles() {
  for (const tile of tiles) {
    getTileOfType(tile.type).draw(ctx, tile.x, tile.y);
  }
}

function draw() {
  clear();

  drawGrid();

  drawTiles();

  if (hoverTile) {
    processHover(hoverTile.x, hoverTile.y);
  }
}

function init() {
  initTiles();

  initButtons();
}

function applicationLoop() {
  draw();

  window.requestAnimationFrame(applicationLoop);
}

// Mouse variables
let isMouseDown = false;
let lastTileX = null;
let lastTileY = null;

// Simple Bresenham-like line algorithm for grid-based filling
function fillLine(x0, y0, x1, y1) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    fill(x0, y0, currentTile?.type);
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
  processClick(clickX, clickY);
});

canvas.addEventListener('mousemove', (e) => {
  const hoverX = Math.floor(e.offsetX / TILE_SIZE);
  const hoverY = Math.floor(e.offsetY / TILE_SIZE);
  if (isMouseDown) {
    if (hoverX !== lastTileX || hoverY !== lastTileY) {
      fillLine(lastTileX, lastTileY, hoverX, hoverY);
      lastTileX = hoverX;
      lastTileY = hoverY;
    }
  } else {
    hoverTile = {x: hoverX, y: hoverY}
  }
});

canvas.addEventListener('mouseup', (e) => {
  isMouseDown = false;
  lastTileX = null;
  lastTileY = null;
  console.log(tiles)
});

canvas.addEventListener('mouseleave', (e) => {
  hoverTile = null;
});

// TILES IMAGES
function initTiles() {
  grass = new Tile(tilemap, 0, 0);
  water = new Tile(tilemap, 1, 0);
  wall = new Tile(tilemap, 2, 0);
  sand = new Tile(tilemap, 3, 0);
  types.push(grass, water, wall, sand);
}

function initButtons() {
  const parent = document.querySelector('.tiles');
  parent.querySelector('#tile1').addEventListener('click', () => {
    currentTile = grass;
  });
  parent.querySelector('#tile2').addEventListener('click', () => {
    currentTile = water;
  });
  parent.querySelector('#tile3').addEventListener('click', () => {
    currentTile = wall;
  });
  parent.querySelector('#tile4').addEventListener('click', () => {
    currentTile = sand;
  });
}

tilemap.onload = () => {
  init();
  applicationLoop();
};