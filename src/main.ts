import "./style.css";
import { Game } from "./game";
import { Input } from "./input";
import { createTouchControls } from "./touchControls";

const canvas = document.querySelector<HTMLCanvasElement>("#game");
if (!canvas) throw new Error("canvas element not found");

const input = new Input();
createTouchControls(input);

const game = new Game(canvas, input);
game.start();
