const TRACKED_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", " "]);

export type VirtualKey = "left" | "right" | "jump" | "restart";

export class Input {
  private down = new Set<string>();
  private virtual = new Set<VirtualKey>();

  constructor() {
    window.addEventListener("keydown", (e) => {
      if (TRACKED_KEYS.has(e.key)) e.preventDefault();
      this.down.add(e.key);
    });
    window.addEventListener("keyup", (e) => {
      this.down.delete(e.key);
    });
  }

  setVirtual(key: VirtualKey, active: boolean): void {
    if (active) this.virtual.add(key);
    else this.virtual.delete(key);
  }

  isLeft(): boolean {
    return this.down.has("ArrowLeft") || this.down.has("a") || this.down.has("A") || this.virtual.has("left");
  }

  isRight(): boolean {
    return this.down.has("ArrowRight") || this.down.has("d") || this.down.has("D") || this.virtual.has("right");
  }

  isJumpPressed(): boolean {
    return (
      this.down.has(" ") ||
      this.down.has("ArrowUp") ||
      this.down.has("w") ||
      this.down.has("W") ||
      this.virtual.has("jump")
    );
  }

  isRestartPressed(): boolean {
    return this.down.has("r") || this.down.has("R") || this.virtual.has("restart");
  }
}
