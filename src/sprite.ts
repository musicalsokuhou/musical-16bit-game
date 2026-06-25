export type Palette = Record<string, string>;

/** Pixel-grid sprite: each row is a string, each char an index into the palette ("." = transparent). */
export class Sprite {
  readonly width: number;
  readonly height: number;

  constructor(
    private readonly rows: string[],
    private readonly palette: Palette,
  ) {
    this.height = rows.length;
    this.width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1, flipX = false): void {
    for (let row = 0; row < this.rows.length; row++) {
      const line = this.rows[row];
      for (let col = 0; col < line.length; col++) {
        const code = line[col];
        if (code === ".") continue;
        const color = this.palette[code];
        if (!color) continue;
        const drawCol = flipX ? line.length - 1 - col : col;
        ctx.fillStyle = color;
        ctx.fillRect(x + drawCol * scale, y + row * scale, scale, scale);
      }
    }
  }
}
