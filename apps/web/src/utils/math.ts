export const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));

/** Maps `value` from [inMin, inMax] onto [0, 1], clamped. */
export const progressBetween = (value: number, inMin: number, inMax: number): number =>
  inMax === inMin ? 0 : clamp((value - inMin) / (inMax - inMin));

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;
