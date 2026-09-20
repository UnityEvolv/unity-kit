import { describe, expect, it } from 'vitest'
import { ELLIPSIS, pageWindow } from './pageWindow'

const E = ELLIPSIS

describe('pageWindow', () => {
  it('lists every page when they all fit', () => {
    expect(pageWindow(1, 1)).toEqual([1])
    expect(pageWindow(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('returns nothing for zero pages', () => {
    expect(pageWindow(1, 0)).toEqual([])
  })

  it('collapses the far end when the current page is near the start', () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, 3, 4, 5, E, 20])
    expect(pageWindow(3, 20)).toEqual([1, 2, 3, 4, 5, E, 20])
  })

  it('collapses the near end when the current page is near the finish', () => {
    expect(pageWindow(20, 20)).toEqual([1, E, 16, 17, 18, 19, 20])
    expect(pageWindow(18, 20)).toEqual([1, E, 16, 17, 18, 19, 20])
  })

  it('collapses both ends in the middle', () => {
    expect(pageWindow(10, 20)).toEqual([1, E, 9, 10, 11, E, 20])
  })

  it('never uses an ellipsis to hide a single page', () => {
    // Page 4: the gap between 1 and 3 would be one page, so 2 is shown instead.
    expect(pageWindow(4, 20)).toEqual([1, 2, 3, 4, 5, E, 20])
    expect(pageWindow(17, 20)).toEqual([1, E, 16, 17, 18, 19, 20])
  })

  it('keeps a constant width as the page moves', () => {
    const widths = new Set(Array.from({ length: 50 }, (_, i) => pageWindow(i + 1, 50).length))
    expect(widths).toEqual(new Set([7]))
  })

  it('honours siblings and boundaries', () => {
    expect(pageWindow(10, 30, 2, 2)).toEqual([1, 2, E, 8, 9, 10, 11, 12, E, 29, 30])
    expect(pageWindow(5, 30, 0, 1)).toEqual([1, E, 5, E, 30])
  })

  it('clamps a page outside the range', () => {
    expect(pageWindow(0, 20)).toEqual(pageWindow(1, 20))
    expect(pageWindow(99, 20)).toEqual(pageWindow(20, 20))
  })
})
