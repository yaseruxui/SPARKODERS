import {
  siFigma,
  siFlutter,
  siLaravel,
  siNextdotjs,
  siNodedotjs,
  siOpenai,
  siPostgresql,
  siReact,
  siShopify,
  siTypescript,
  siWordpress,
} from 'simple-icons';

/**
 * Brand marks for the hero tech strip, from Simple Icons (CC0). Only the icons listed here are
 * bundled; they are rendered on the server, so no icon code ships to the browser.
 */
export const techIcons = {
  siFigma,
  siFlutter,
  siLaravel,
  siNextdotjs,
  siNodedotjs,
  siOpenai,
  siPostgresql,
  siReact,
  siShopify,
  siTypescript,
  siWordpress,
} as const;

export type TechIconKey = keyof typeof techIcons;

/** Brand colour for hover, lifted when the brand colour is too dark to read on the ink background. */
export function readableBrandColor(hex: string): string {
  const value = Number.parseInt(hex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.35 ? 'var(--color-text)' : `#${hex}`;
}
