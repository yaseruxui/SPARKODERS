'use client';

import { useEffect } from 'react';

/** Marks the document as hydrated so scroll-reveal styles only hide content when JS can show it again. */
export function JsReady() {
  useEffect(() => {
    document.documentElement.classList.add('js-ready');
  }, []);
  return null;
}
