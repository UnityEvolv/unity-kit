import { useSyncExternalStore } from "react";

/**
 * The query the story names, and deliberately not a viewport width: a touch
 * laptop has a coarse primary pointer at any window size, and a desktop window
 * dragged narrow still has a mouse. `pointer` describes the input, which is
 * what decides whether a row of small cells can be read and hit.
 */
export const COARSE_POINTER_QUERY = "(pointer: coarse)";

const query = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(COARSE_POINTER_QUERY)
    : null;

const subscribe = (onChange: () => void) => {
  const list = query();
  if (list === null) return () => {};
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
};

const getSnapshot = () => query()?.matches ?? false;

/**
 * On the server there is no pointer to ask about. The table layout is the
 * answer that keeps the markup honest for the widest audience — a screen
 * reader gets real table semantics — and the client corrects it on hydration
 * without a layout flash that matters, since a coarse-pointer device is the
 * one repainting.
 */
const getServerSnapshot = () => false;

/**
 * Whether the primary pointer is coarse, kept live: docking a tablet to a
 * mouse, or a convertible folding into tablet mode, flips it without a reload.
 * Environments with no `matchMedia` (jsdom, SSR) report a fine pointer.
 */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
