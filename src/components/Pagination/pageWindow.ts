/** A gap in the page list, standing in for the pages between its neighbours. */
export const ELLIPSIS = 'ellipsis'

export type PageWindowItem = number | typeof ELLIPSIS

const range = (from: number, to: number) =>
  Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index)

/**
 * Which page numbers to show for a given page: the first and last
 * `boundaries` pages, the current page with `siblings` on each side, and an
 * ellipsis wherever pages are skipped.
 *
 * The window has a constant width. When the current page is near an edge the
 * slack moves to the other side rather than disappearing, so the row of
 * buttons does not change length as the user pages and nothing under the
 * cursor jumps. An ellipsis is only used where it hides two or more pages;
 * a gap of one page shows the page, since the ellipsis would take the same
 * room and say less.
 */
export function pageWindow(
  page: number,
  pageCount: number,
  siblings = 1,
  boundaries = 1,
): PageWindowItem[] {
  const total = Math.max(0, Math.floor(pageCount))
  const width = 2 * boundaries + 2 * siblings + 3
  if (total <= width) return range(1, total) as PageWindowItem[]

  const current = Math.min(Math.max(1, Math.floor(page)), total)
  const leftEdge = boundaries + 1
  const rightEdge = total - boundaries

  // Room the middle block takes, so an edge can borrow it.
  const middle = 2 * siblings + 1

  const nearStart = current - siblings <= leftEdge + 1
  const nearEnd = current + siblings >= rightEdge - 1

  if (nearStart) {
    // Everything from the first page up to where the ellipsis begins.
    const upTo = boundaries + middle + 1
    return [...range(1, upTo), ELLIPSIS, ...range(rightEdge + 1, total)]
  }

  if (nearEnd) {
    const from = total - boundaries - middle
    return [...range(1, boundaries), ELLIPSIS, ...range(from, total)]
  }

  return [
    ...range(1, boundaries),
    ELLIPSIS,
    ...range(current - siblings, current + siblings),
    ELLIPSIS,
    ...range(rightEdge + 1, total),
  ]
}
