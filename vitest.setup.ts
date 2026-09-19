import '@testing-library/jest-dom/vitest'

/*
 * Radix's overlays position themselves with Floating UI, which measures the
 * trigger and the panel. jsdom implements neither `ResizeObserver` nor the
 * pointer-capture and scrolling methods Radix calls while opening a menu, and
 * the failure is a thrown TypeError rather than a wrong position — so an
 * overlay test fails for reasons that have nothing to do with the overlay.
 *
 * These stand in for the browser APIs jsdom omits. They deliberately report no
 * geometry: the tests here assert behaviour and markup, never where a panel
 * landed on screen, which is a question only a real browser can answer.
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

Element.prototype.hasPointerCapture ??= () => false
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.scrollIntoView ??= () => {}
