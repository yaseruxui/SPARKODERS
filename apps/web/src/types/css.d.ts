import 'react';

declare module 'react' {
  /** Allows typed CSS custom properties in `style`, e.g. `style={{ '--i': 2 }}`. */
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
