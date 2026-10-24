export const SHEET_STEPS = ["peek", "half", "full"];

/** Height of each step, so the map can keep its focus point above the sheet. */
export function sheetHeight(step, viewport = globalThis.innerHeight ?? 800) {
  if (step === "peek") return 176;
  if (step === "half") return Math.round(viewport * 0.55);
  return viewport - 72;
}
