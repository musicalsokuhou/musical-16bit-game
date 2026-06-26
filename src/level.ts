export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface NoteSpec {
  x: number;
  y: number;
}

export interface Checkpoint {
  x: number;
  y: number;
  index: number;
}

export const GROUND_Y = 150;
export const CHECKPOINT_DISTANCE = 900;
export const MAX_DIFFICULTY_TIER = 4;
export const LOOKAHEAD = 400;
export const DESPAWN_BEHIND = 300;

function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export class LevelGenerator {
  private frontierX = 0;
  private frontierY = GROUND_Y;
  private nextCheckpointAt = CHECKPOINT_DISTANCE;
  private checkpointIndex = 0;

  reset(): Rect {
    const start: Rect = { x: 0, y: GROUND_Y, w: 220, h: 30 };
    this.frontierX = start.x + start.w;
    this.frontierY = start.y;
    this.nextCheckpointAt = CHECKPOINT_DISTANCE;
    this.checkpointIndex = 0;
    return start;
  }

  private tierAt(x: number): number {
    return Math.min(MAX_DIFFICULTY_TIER, Math.floor(x / (CHECKPOINT_DISTANCE * 1.5)));
  }

  generateUntil(targetX: number): { platforms: Rect[]; notes: NoteSpec[]; checkpoints: Checkpoint[] } {
    const platforms: Rect[] = [];
    const notes: NoteSpec[] = [];
    const checkpoints: Checkpoint[] = [];

    while (this.frontierX < targetX) {
      const tier = this.tierAt(this.frontierX);
      const goingUp = Math.random() < 0.5;

      // Gaps stay well within the player's max jump range (~73px at a perfectly
      // timed takeoff); kept far below that ceiling since real input rarely jumps
      // exactly at the edge. Upward jumps get a tighter cap (less air time before
      // reaching a higher platform).
      const gap = goingUp ? randRange(18, 22 + tier * 2) : randRange(20, 32 + tier * 3);
      const elevationMag = 8 + tier * 4;
      const deltaY = goingUp ? -randRange(8, elevationMag) : randRange(8, elevationMag);
      const nextY = Math.max(70, Math.min(GROUND_Y, this.frontierY + deltaY));

      const width = randRange(220 - tier * 18, 260 - tier * 18);
      const height = nextY >= GROUND_Y ? 30 : 14;

      const platform: Rect = { x: this.frontierX + gap, y: nextY, w: width, h: height };
      platforms.push(platform);

      if (Math.random() < 0.7) {
        notes.push({ x: platform.x + width / 2 - 2, y: platform.y - 28 });
      }

      this.frontierX = platform.x + platform.w;
      this.frontierY = platform.y;

      if (this.frontierX >= this.nextCheckpointAt) {
        this.checkpointIndex += 1;
        checkpoints.push({ x: platform.x + width / 2, y: platform.y, index: this.checkpointIndex });
        this.nextCheckpointAt += CHECKPOINT_DISTANCE;
      }
    }

    return { platforms, notes, checkpoints };
  }
}
