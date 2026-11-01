import 'matter-js';

declare module 'matter-js' {
  /** Present at runtime (Matter binds it to `wheel`), missing from the published typings. */
  interface Mouse {
    mousewheel: (event: WheelEvent) => void;
  }
}
