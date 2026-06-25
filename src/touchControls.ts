import type { Input, VirtualKey } from "./input";

export function createTouchControls(input: Input): void {
  const container = document.createElement("div");
  container.className = "touch-controls";

  const dpad = document.createElement("div");
  dpad.className = "touch-dpad";
  dpad.append(makeButton("◀", "left", input), makeButton("▶", "right", input));

  const jump = makeButton("⤴", "jump", input);
  jump.classList.add("touch-jump");

  const restart = makeButton("↻", "restart", input);
  restart.classList.add("touch-restart");

  container.append(dpad, jump, restart);
  document.body.appendChild(container);
}

function makeButton(label: string, key: VirtualKey, input: Input): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = label;
  button.className = "touch-button";
  button.setAttribute("aria-label", key);

  const press = (e: Event) => {
    e.preventDefault();
    input.setVirtual(key, true);
  };
  const release = (e: Event) => {
    e.preventDefault();
    input.setVirtual(key, false);
  };

  button.addEventListener("touchstart", press, { passive: false });
  button.addEventListener("touchend", release);
  button.addEventListener("touchcancel", release);
  button.addEventListener("mousedown", press);
  button.addEventListener("mouseup", release);
  button.addEventListener("mouseleave", release);

  return button;
}
