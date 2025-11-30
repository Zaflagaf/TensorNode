import { Shortcut } from "../types";

export const SHORTCUTS: Shortcut[] = [
  { key: "c", ctrl: true, action: "copy" },
  { key: "v", ctrl: true, action: "paste" },
  { key: "x", ctrl: true, action: "cut" },
  { key: "g", action: "grid" },
  { key: "delete", action: "delete"},
  { key: "backspace", action: "delete"},
];