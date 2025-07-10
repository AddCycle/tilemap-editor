const TILE_SIZE = 32;

export class Tile {
  constructor(
    image,
    x,
    y,
  ) {
    this.image = image;
    this.position = {x, y};
    this.type = x + y;
  }

  draw(ctx, destX, destY) {
    ctx.drawImage(
      this.image,
      this.position.x * TILE_SIZE,
      this.position.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE,
      destX * TILE_SIZE,
      destY * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  }
}