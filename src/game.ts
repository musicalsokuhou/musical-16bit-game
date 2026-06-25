import { Input } from "./input";
import { Player } from "./entities/player";
import { MusicNote } from "./entities/note";
import { platforms, noteSpecs, LEVEL_WIDTH, GROUND_Y, GOAL_X, type Rect } from "./level";

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 180;

type GameState = "playing" | "win";

export class Game {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly player: Player;
  private readonly notes: MusicNote[];

  private score = 0;
  private state: GameState = "playing";
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

    this.player = new Player(20, GROUND_Y - 14);
    this.notes = noteSpecs.map((n) => new MusicNote(n.x, n.y));
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
    if (this.state === "playing") {
      this.update(dt);
    }
    this.draw();

    requestAnimationFrame(this.loop);
  };

  private reset(): void {
    this.player.respawn();
    this.notes.forEach((n) => (n.collected = false));
    this.score = 0;
    this.state = "playing";
  }

  private update(dt: number): void {
    this.player.update(dt, this.input.isLeft(), this.input.isRight(), this.input.isJumpPressed(), platforms);
    this.player.x = Math.max(0, Math.min(this.player.x, LEVEL_WIDTH));

    if (this.player.y > VIEW_HEIGHT + 60) {
      this.player.respawn();
    }

    for (const note of this.notes) {
      if (!note.collected && intersects(this.player.bounds, note.bounds)) {
        note.collected = true;
        this.score += 1;
      }
    }

    if (this.player.x >= GOAL_X) {
      this.state = "win";
    }
  }

  private cameraX(): number {
    const raw = this.player.x - VIEW_WIDTH / 2;
    return Math.max(0, Math.min(raw, LEVEL_WIDTH - VIEW_WIDTH));
  }

  private draw(): void {
    const ctx = this.ctx;
    const cameraX = this.cameraX();

    ctx.fillStyle = "#1b1030";
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    this.drawCurtains(cameraX);
    this.drawPlatforms(cameraX);
    this.drawGoal(cameraX);
    for (const note of this.notes) note.draw(ctx, cameraX, this.elapsed);
    this.player.draw(ctx, cameraX);
    this.drawHud();

    if (this.state === "win") this.drawWinOverlay();
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
    for (const p of platforms) {
      ctx.fillStyle = "#caa24a";
      ctx.fillRect(p.x - cameraX, p.y, p.w, p.h);
      ctx.fillStyle = "#8a6a2a";
      ctx.fillRect(p.x - cameraX, p.y, p.w, 4);
    }
  }

  private drawGoal(cameraX: number): void {
    const ctx = this.ctx;
    const x = GOAL_X - cameraX;
    ctx.fillStyle = "#ffe9a8";
    ctx.beginPath();
    ctx.ellipse(x + 10, GROUND_Y - 60, 30, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a2e6e";
    ctx.fillRect(x, GROUND_Y - 90, 4, 90);
  }

  private drawHud(): void {
    const ctx = this.ctx;
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px monospace";
    ctx.textBaseline = "top";
    ctx.fillText(`♪ x ${this.score} / ${this.notes.length}`, 6, 6);
  }

  private drawWinOverlay(): void {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.fillStyle = "#ffe9a8";
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    ctx.fillText("BRAVO!", VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 10);
    ctx.font = "10px monospace";
    ctx.fillText("R / ↻ to take another bow", VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 10);
    ctx.textAlign = "left";
  }
}

function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
