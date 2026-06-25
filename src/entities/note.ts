import { Sprite } from "../sprite";
import type { Rect } from "../level";

const PALETTE = { g: "#e8c547", k: "#1a1a1a" };

const NOTE_SPRITE_ROWS = ["..kk.", ".kgk.", ".kgk.", ".kgk.", "kggkk", "kgggk", ".kkk."];

export const NOTE_SPRITE = new Sprite(NOTE_SPRITE_ROWS, PALETTE);

export class MusicNote {
  collected = false;

  constructor(
    readonly x: number,
    readonly baseY: number,
  ) {}

  get bounds(): Rect {
    return { x: this.x, y: this.baseY, w: NOTE_SPRITE.width, h: NOTE_SPRITE.height };
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, time: number): void {
    if (this.collected) return;
    const bob = Math.sin(time * 4 + this.x) * 3;
    NOTE_SPRITE.draw(ctx, Math.round(this.x - cameraX), Math.round(this.baseY + bob));
  }
}
