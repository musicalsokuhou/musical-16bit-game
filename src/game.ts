import { Input } from "./input";
import { Player, PLAYER_SPRITE } from "./entities/player";
import { MusicNote } from "./entities/note";
import { LevelGenerator, GROUND_Y, LOOKAHEAD, DESPAWN_BEHIND, type Rect, type Checkpoint } from "./level";

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;

export class Game {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly player: Player;
  private readonly generator = new LevelGenerator();

  private platforms: Rect[] = [];
  private notes: MusicNote[] = [];
  private checkpoints: Checkpoint[] = [];
  private passedCheckpoints = new Set<number>();
  private checkpointCount = 0;
  private checkpointToastUntil = 0;

  private respawnPlatform: Rect = { x: 0, y: GROUND_Y, w: 80, h: 30 };
  private respawnPoint = { x: 20, y: GROUND_Y - PLAYER_SPRITE.height };

  private score = 0;
  private lastTime = 0;
  private elapsed = 0;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly input: Input,
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;

    this.player = new Player(20, GROUND_Y - PLAYER_SPRITE.height);
    this.reset();
  }

  start(): void {
    requestAnimationFrame(this.loop);
  }

  private loop = (time: number): void => {
    const dt = this.lastTime ? Math.min((time - this.lastTime) / 1000, 1 / 30) : 0;
    this.lastTime = time;
    this.elapsed += dt;

    if (this.input.isRestartPressed()) {
      this.reset();
    }
    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop);
  };

  private reset(): void {
    const start = this.generator.reset();
    this.platforms = [start];
    this.notes = [];
    this.checkpoints = [];
    this.passedCheckpoints = new Set();
    this.checkpointCount = 0;
    this.checkpointToastUntil = 0;
    this.score = 0;
    this.respawnPlatform = { x: 0, y: GROUND_Y, w: 80, h: 30 };
    this.respawnPoint = { x: 20, y: GROUND_Y - PLAYER_SPRITE.height };
    this.player.respawn(this.respawnPoint.x, this.respawnPoint.y);
    this.extendLevel();
  }

  private update(dt: number): void {
    this.player.update(dt, this.input.isLeft(), this.input.isRight(), this.input.isJumpPressed(), this.collidablePlatforms());
    this.player.x = Math.max(0, this.player.x);

    if (this.player.y > VIEW_HEIGHT + 60) {
      this.player.respawn(this.respawnPoint.x, this.respawnPoint.y);
    }

    for (const note of this.notes) {
      if (!note.collected && intersects(this.player.bounds, note.bounds)) {
        note.collected = true;
        this.score += 1;
      }
    }

    this.checkCheckpoints();
    this.extendLevel();
    this.pruneLevel();
  }

  private checkCheckpoints(): void {
    for (const cp of this.checkpoints) {
      if (this.passedCheckpoints.has(cp.index) || this.player.x < cp.x) continue;
      this.passedCheckpoints.add(cp.index);
      this.checkpointCount = cp.index;
      this.respawnPlatform = { x: cp.x - 20, y: cp.y, w: 60, h: 30 };
      this.respawnPoint = { x: cp.x, y: cp.y - PLAYER_SPRITE.height };
      this.checkpointToastUntil = this.elapsed + 1.4;
    }
  }

  private collidablePlatforms(): Rect[] {
    return [...this.platforms, this.respawnPlatform];
  }

  private extendLevel(): void {
    const targetX = this.cameraX() + VIEW_WIDTH + LOOKAHEAD;
    const generated = this.generator.generateUntil(targetX);
    for (const p of generated.platforms) this.platforms.push(p);
    for (const n of generated.notes) this.notes.push(new MusicNote(n.x, n.y));
    for (const c of generated.checkpoints) this.checkpoints.push(c);
  }

  private pruneLevel(): void {
    const cutoff = this.cameraX() - DESPAWN_BEHIND;
    this.platforms = this.platforms.filter((p) => p.x + p.w >= cutoff);
    this.notes = this.notes.filter((n) => n.x >= cutoff);
  }

  private cameraX(): number {
    return Math.max(0, this.player.x - VIEW_WIDTH / 2);
  }

  private draw(): void {
    const ctx = this.ctx;
    const cameraX = this.cameraX();

    ctx.fillStyle = "#1b1030";
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    this.drawCurtains(cameraX);
    this.drawPlatforms(cameraX);
    this.drawCheckpoints(cameraX);
    for (const note of this.notes) note.draw(ctx, cameraX, this.elapsed);
    this.player.draw(ctx, cameraX);
    this.drawHud();
    this.drawCheckpointToast();
  }

  private drawCurtains(cameraX: number): void {
    const ctx = this.ctx;
    const parallax = cameraX * 0.3;
    ctx.fillStyle = "#5a1f33";
    for (let i = -1; i < 8; i++) {
      const x = i * 48 - (parallax % 48);
      ctx.fillRect(x, 0, 24, VIEW_HEIGHT);
    }
  }

  private drawPlatforms(cameraX: number): void {
    const ctx = this.ctx;
    for (const p of this.collidablePlatforms()) {
      ctx.fillStyle = "#caa24a";
      ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);
      ctx.fillStyle = "#8a6a2a";
      ctx.fillRect(p.x - cameraX, p.y, p.w, 4);
    }
  }

  private drawCheckpoints(cameraX: number): void {
    const ctx = this.ctx;
    for (const cp of this.checkpoints) {
      const x = cp.x - cameraX;
      if (x < -20 || x > VIEW_WIDTH + 20) continue;
      ctx.fillStyle = this.passedCheckpoints.has(cp.index) ? "#7fdca0" : "#ffe9a8";
      ctx.fillRect(x - 1, cp.y - 40, 2, 40);
      ctx.beginPath();
      ctx.moveTo(x + 1, cp.y - 40);
      ctx.lineTo(x + 14, cp.y - 34);
      ctx.lineTo(x + 1, cp.y - 28);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawHud(): void {
    const ctx = this.ctx;
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px monospace";
    ctx.textBaseline = "top";
    ctx.fillText(`♪ x ${this.score}`, 6, 6);
    ctx.fillText(`⛳ ${this.checkpointCount}`, 6, 18);
    ctx.fillText(`${Math.floor(this.player.x / 8)}m`, 6, 30);
  }

  private drawCheckpointToast(): void {
    if (this.elapsed >= this.checkpointToastUntil) return;
    const ctx = this.ctx;
    ctx.fillStyle = "#ffe9a8";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`CHECKPOINT ${this.checkpointCount}`, VIEW_WIDTH / 2, 50);
    ctx.textAlign = "left";
  }
}

function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
