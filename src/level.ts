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

export const GROUND_Y = 150;
export const LEVEL_WIDTH = 1400;
export const GOAL_X = 1340;

export const platforms: Rect[] = [
  { x: 0, y: GROUND_Y, w: 260, h: 30 },
  { x: 320, y: GROUND_Y, w: 180, h: 30 },
  { x: 560, y: 120, w: 90, h: 14 },
  { x: 700, y: GROUND_Y, w: 160, h: 30 },
  { x: 920, y: 100, w: 80, h: 14 },
  { x: 1040, y: GROUND_Y, w: 120, h: 30 },
  { x: 1220, y: 130, w: 180, h: 14 },
];

export const noteSpecs: NoteSpec[] = [
  { x: 120, y: 120 },
  { x: 360, y: 170 },
  { x: 590, y: 90 },
  { x: 740, y: 120 },
  { x: 950, y: 70 },
  { x: 1080, y: 120 },
  { x: 1260, y: 100 },
];
