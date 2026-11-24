export const MOTION_OK = "(prefers-reduced-motion: no-preference)"

export const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
