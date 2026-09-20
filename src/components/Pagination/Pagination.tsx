import type { HTMLAttributes } from 'react'
import { Button } from '../Button'
import type { ButtonSize } from '../Button'
import { ELLIPSIS, pageWindow } from './pageWindow'

export type PaginationSize = ButtonSize

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** The current page, counted from 1. Controlled. */
  page: number
  /** How many pages there are. Derived from `total` and `pageSize` when omitted. */
  pageCount?: number
  onPageChange: (page: number) => void
  /** Total item count. Turns on the "Showing X to Y of Z" summary with `pageSize`. */
  total?: number
  /** Items per page. Needed for the summary, and for `pageCount` when that is omitted. */
  pageSize?: number
  /** Choices for the page-size selector. Rendered only when given. */
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  /** Previous, next and a "Page X of Y" reading, for a narrow strip. */
  compact?: boolean
  /** Pages shown either side of the current one. Defaults to 1. */
  siblings?: number
  /** Pages always shown at each end. Defaults to 1. */
  boundaries?: number
  size?: PaginationSize
  /** Names the landmark. Defaults to "Pagination"; give each one on a page its own. */
  label?: string
}

const textSize: Record<PaginationSize, string> = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

const selectSize: Record<PaginationSize, string> = {
  xs: 'select select-xs w-auto',
  sm: 'select select-sm w-auto',
  md: 'select select-sm w-auto',
  lg: 'select select-md w-auto',
}

/**
 * Page controls for a long list. Controlled throughout: the caller owns
 * `page` and `pageSize`, slices or fetches accordingly, and hands the result
 * to whatever sits above — usually `Table`, though nothing here depends on it.
 *
 * It is a `nav` landmark, so a screen reader user can jump to it, and the
 * current page is a button marked `aria-current="page"` rather than a span:
 * it keeps its place in the tab order, so arrowing through the row does not
 * skip over where you are.
 *
 * daisyUI's `join` fuses the buttons into one strip; the page-window logic —
 * which numbers to show and where the gaps go — is the kit's own, in
 * `pageWindow.ts`, so it can be tested without rendering anything.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  compact = false,
  siblings = 1,
  boundaries = 1,
  size = 'md',
  label = 'Pagination',
  className,
  ...props
}: PaginationProps) {
  const derivedCount =
    pageCount ?? (total !== undefined && pageSize ? Math.ceil(total / pageSize) : 1)
  const last = Math.max(1, derivedCount)
  const current = Math.min(Math.max(1, page), last)

  const summary =
    total !== undefined && pageSize
      ? total === 0
        ? 'No items'
        : `Showing ${(current - 1) * pageSize + 1} to ${Math.min(current * pageSize, total)} of ${total}`
      : null

  const go = (next: number) => {
    if (next !== current && next >= 1 && next <= last) onPageChange(next)
  }

  const items = compact ? [] : pageWindow(current, last, siblings, boundaries)

  return (
    <nav
      aria-label={label}
      className={['flex flex-wrap items-center justify-between gap-4', className ?? '']
        .join(' ')
        .trim()}
      {...props}
    >
      {summary === null ? null : (
        <p className={[textSize[size], 'text-muted'].join(' ')}>{summary}</p>
      )}

      <div className="join">
        <Button
          variant="ghost"
          size={size}
          icon="chevron-left"
          aria-label="Previous page"
          className="join-item"
          disabled={current <= 1}
          onClick={() => go(current - 1)}
        />
        {compact ? (
          <span
            aria-current="page"
            className={[
              'join-item flex items-center border border-base-300 px-3',
              textSize[size],
            ].join(' ')}
          >
            Page {current} of {last}
          </span>
        ) : (
          items.map((item, index) => {
            if (item === ELLIPSIS) {
              return (
                <Button
                  key={`${ELLIPSIS}-${index}`}
                  variant="ghost"
                  size={size}
                  className="join-item"
                  disabled
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  …
                </Button>
              )
            }
            const number = item
            return (
              <Button
                key={number}
                variant={number === current ? 'primary' : 'ghost'}
                size={size}
                className="join-item"
                aria-current={number === current ? 'page' : undefined}
                aria-label={`Page ${number}`}
                onClick={() => go(number)}
              >
                {number}
              </Button>
            )
          })
        )}
        <Button
          variant="ghost"
          size={size}
          icon="chevron-right"
          aria-label="Next page"
          className="join-item"
          disabled={current >= last}
          onClick={() => go(current + 1)}
        />
      </div>

      {pageSizeOptions === undefined ? null : (
        <label className={['flex items-center gap-2', textSize[size]].join(' ')}>
          Rows per page
          <select
            className={selectSize[size]}
            value={pageSize}
            onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      )}
    </nav>
  )
}

/**
 * One valid set of props for the blind install test, which renders every
 * export with no knowledge of their types. Includes the summary and the
 * page-size selector so their class names are checked too.
 */
Pagination.sampleProps = {
  page: 3,
  total: 145,
  pageSize: 10,
  pageSizeOptions: [10, 25, 50],
  onPageChange: () => {},
} satisfies PaginationProps
