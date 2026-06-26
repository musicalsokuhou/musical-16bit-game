import { Sprite } from "../sprite";
import type { Rect } from "../level";

const PALETTE = {
  k: "#1a1a1a",
  s: "#f4c2a1",
  r: "#c43d4b",
  g: "#e8c547",
};

// 演者: シルクハット・蝶ネクタイ・燕尾服の脚
const SPRITE_ROWS = [
  "....kkkk.....",
  "....kkkk.....",
  "...kkkkkk....",
  "..kkkkkkkk...",
  "....ssss.....",
  "...ssssss....",
  "..ssssssss...",
  "..ss.rr.ss...",
  "..ssssssss...",
  "...gg..gg....",
  "...gg..gg....",
  "...gg..gg....",
  "..kkk..kkk...",
  "..kk....kk...",
];

export const PLAYER_SPRITE = new Sprite(SPRITE_ROWS, PALETTE);

const GRAVITY = 1500;
const JUMP_VELOCITY = -420;
const MOVE_SPEED = 130;

export class Player {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  onGround = false;
  facingLeft = false;

  private readonly startX: number;
  private readonly startY: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
  }

  get bounds(): Rect {
    return { x: this.x, y: this.y, w: PLAYER_SPRITE.width, h: PLAYER_SPRITE.height };
  }

  respawn(x: number = this.startX, y: number = this.startY): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }

  update(dt: number, left: boolean, right: boolean, jumpPressed: boolean, platforms: Rect[]): void {
    this.vx = 0;
    if (left) {
      this.vx = -MOVE_SPEED;
      this.facingLeft = true;
    }
    if (right) {
      this.vx = MOVE_SPEED;
      this.facingLeft = false;
    }

    if (jumpPressed && this.onGround) {
      this.vy = JUMP_VELOCITY;
      this.onGround = false;
    }

    this.vy += GRAVITY * dt;

    const prevBottom = this.y + PLAYER_SPRITE.height;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.onGround = false;

    for (const platform of platforms) {
      this.resolveLanding(platform, prevBottom);
    }
  }

  private resolveLanding(platform: Rect, prevBottom: number): void {
    const b = this.bounds;
    const overlapsX = b.x < platform.x + platform.w && b.x + b.w > platform.x;
    const overlapsY = b.y < platform.y + platform.h && b.y + b.h > platform.y;
    if (!overlapsX || !overlapsY) return;

    if (this.vy >= 0 && prevBottom <= platform.y + 6) {
      this.y = platform.y - PLAYER_SPRITE.height;
      this.vy = 0;
      this.onGround = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number): void {
    PLAYER_SPRITE.draw(ctx, Math.round(this.x - cameraX), Math.round(this.y), 1, this.facingLeft);
  }
}
