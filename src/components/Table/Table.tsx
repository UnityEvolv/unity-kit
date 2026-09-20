import { useEffect, useRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, MouseEvent, ReactNode } from 'react'
import { Alert } from '../Alert'
import { Button } from '../Button'
import { Card } from '../Card'
import { EmptyState } from '../EmptyState'
import { Icon } from '../Icon'
import { Skeleton } from '../Skeleton'
import { useCoarsePointer } from './useCoarsePointer'

/**
 * Every class name appears here in full: Tailwind scans built files as static
 * text, so an assembled name produces no CSS and the table renders unstyled
 * with no error anywhere.
 *
 * `table-zebra` and `table-pin-rows` are pure CSS in daisyUI — the striping is
 * an `nth-child` rule and the pinned header is `position: sticky` on `thead`,
 * so neither needs a line of JS here. Pinning only shows inside a scrolling
 * ancestor with a bounded height, which is the consumer's container.
 */
const table = cva('table', {
  variants: {
    size: { xs: 'table-xs', sm: 'table-sm', md: 'table-md', lg: 'table-lg' },
    zebra: { true: 'table-zebra', false: '' },
    pinHeader: { true: 'table-pin-rows', false: '' },
  },
  defaultVariants: { size: 'md', zebra: false, pinHeader: false },
})

type TableVariants = VariantProps<typeof table>
export type TableSize = NonNullable<TableVariants['size']>

export type TableLayout = 'auto' | 'table' | 'cards'
export type TableColumnAlign = 'start' | 'end'
export type TableSortDirection = 'asc' | 'desc'
export type TableRowKey = string | number

/**
 * What a column becomes when the rows turn into cards. `title` is the card's
 * heading, `body` a labelled line beneath it, `hidden` left out — a status
 * icon that reads fine in a 40px cell is noise as a labelled line.
 */
export type TableCardRole = 'title' | 'body' | 'hidden'

export interface TableColumn<Row> {
  /** Stable identity, used for sort state and React keys. */
  key: string
  /** The column heading, and the label beside the value on a card. */
  header: ReactNode
  /**
   * Renders the cell. Defaults to reading `row[key]` when the key is a
   * property of the row, which covers the plain-text column without a lambda.
   */
  cell?: (row: Row) => ReactNode
  /** Numbers sit at the end so digits line up. Defaults to `start`. */
  align?: TableColumnAlign
  /** Draws a sort control in the heading. The component never sorts data itself. */
  sortable?: boolean
  /**
   * The column's job on a card. Defaults to `body`; when no column claims
   * `title`, the first column is the title so a card always has a heading.
   */
  card?: TableCardRole
}

export interface TableSort {
  key: string
  direction: TableSortDirection
}

export interface TableProps<Row> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> {
  columns: TableColumn<Row>[]
  /** Already fetched and already sorted. The component reads it and nothing more. */
  rows: Row[]
  /** A stable identity per row. Selection and React keys both depend on it. */
  rowKey: (row: Row) => TableRowKey
  /**
   * Names the table for assistive technology, in both layouts. Rendered as a
   * visually hidden caption on the table and as the label of the card list.
   */
  caption?: string
  /** `auto` follows the pointer; the other two pin a layout. Defaults to `auto`. */
  layout?: TableLayout
  size?: TableSize
  /** Stripes alternate rows. */
  zebra?: boolean
  /** Keeps the header in view while the table's container scrolls. */
  pinHeader?: boolean

  /** Draws skeleton rows in place of data and marks the region busy. */
  loading?: boolean
  /** How many skeleton rows `loading` draws. Defaults to 5. */
  loadingRows?: number
  /** Replaces the rows with an error alert. A node so the message can carry a link. */
  error?: ReactNode
  /** Adds a "Try again" button to the error alert. */
  onRetry?: () => void
  /** Replaces the default nothing-here panel when `rows` is empty. */
  empty?: ReactNode

  /**
   * Makes each row activatable. The title cell becomes a real button in both
   * layouts, so keyboard and screen reader users get the same action pointer
   * users get from clicking anywhere on the row.
   */
  onRowClick?: (row: Row) => void

  /** Draws a checkbox per row and a select-all in the header. */
  selectable?: boolean
  /** Keys of the selected rows. Controlled; the component holds no selection. */
  selected?: readonly TableRowKey[]
  /** Called with the full next selection. */
  onSelectionChange?: (selected: TableRowKey[]) => void
  /**
   * Names a row's checkbox. Defaults to the title column's text when it is a
   * string or number, otherwise to the row's position.
   */
  rowLabel?: (row: Row) => string

  /** The current sort, drawn as an indicator on the matching heading. */
  sort?: TableSort
  /** Called with the sort the user asked for. Sorting the rows is the caller's job. */
  onSortChange?: (sort: TableSort) => void
}

const DEFAULT_LOADING_ROWS = 5

const cellAlign: Record<TableColumnAlign, string> = {
  start: 'text-start',
  end: 'text-end',
}

/** A raw `row[key]` read, so a plain text column needs no `cell` lambda. */
const readCell = <Row,>(row: Row, column: TableColumn<Row>): ReactNode => {
  if (column.cell) return column.cell(row)
  const value = (row as Record<string, unknown>)[column.key]
  return value === null || value === undefined ? null : String(value)
}

/** Where the first sort click goes, and how a repeat click flips it. */
const nextSort = (column: string, current: TableSort | undefined): TableSort => ({
  key: column,
  direction: current?.key === column && current.direction === 'asc' ? 'desc' : 'asc',
})

const ariaSort = (
  column: TableColumn<unknown>,
  sort: TableSort | undefined,
): 'ascending' | 'descending' | 'none' | undefined => {
  if (!column.sortable) return undefined
  if (sort?.key !== column.key) return 'none'
  return sort.direction === 'asc' ? 'ascending' : 'descending'
}

const sortIcon = (column: TableColumn<unknown>, sort: TableSort | undefined) =>
  sort?.key === column.key ? (sort.direction === 'asc' ? 'chevron-up' : 'chevron-down') : 'sort'

/** Which column heads a card: the one that asked, else the first. */
const titleColumnOf = <Row,>(columns: TableColumn<Row>[]) =>
  columns.find((column) => column.card === 'title') ?? columns[0]

/**
 * The select-all box is indeterminate while some but not all rows are
 * selected. `indeterminate` is a DOM property with no attribute, so it has
 * to be set through a ref after render.
 */
function SelectAll({
  count,
  total,
  onChange,
}: {
  count: number
  total: number
  onChange: (all: boolean) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const some = count > 0 && count < total
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = some
  }, [some])
  return (
    <input
      ref={ref}
      type="checkbox"
      className="checkbox checkbox-sm"
      aria-label="Select all rows"
      checked={total > 0 && count === total}
      disabled={total === 0}
      onChange={(event) => onChange(event.target.checked)}
    />
  )
}

/**
 * Tabular data from one column definition, drawn as a table for a mouse and
 * as a list of cards for a finger.
 *
 * The layout follows `(pointer: coarse)`, not the viewport: a touch laptop
 * gets cards at any window size and a narrow desktop window keeps its rows.
 * Only the active layout is rendered — both-and-hide would hand a screen
 * reader two copies of every row — so the switch is a JS media query rather
 * than CSS, and `layout` pins it for the cases the query gets wrong.
 *
 * It fetches nothing and sorts nothing. Rows arrive already sorted; a sort
 * click reports what the user asked for and the caller re-orders. That keeps
 * server-side sorting, cached pages and optimistic updates all the caller's,
 * where they already are.
 */
export function Table<Row>({
  columns,
  rows,
  rowKey,
  caption,
  layout = 'auto',
  size = 'md',
  zebra = false,
  pinHeader = false,
  loading = false,
  loadingRows = DEFAULT_LOADING_ROWS,
  error,
  onRetry,
  empty,
  onRowClick,
  selectable = false,
  selected = [],
  onSelectionChange,
  rowLabel,
  sort,
  onSortChange,
  className,
  ...props
}: TableProps<Row>) {
  const coarse = useCoarsePointer()
  const cards = layout === 'cards' || (layout === 'auto' && coarse)
  const titleColumn = titleColumnOf(columns)
  const selectedSet = new Set<TableRowKey>(selected)
  const clickable = onRowClick !== undefined

  const labelFor = (row: Row, index: number) => {
    if (rowLabel) return rowLabel(row)
    const title = readCell(row, titleColumn)
    return typeof title === 'string' || typeof title === 'number'
      ? String(title)
      : `Row ${index + 1}`
  }

  const toggle = (key: TableRowKey, on: boolean) => {
    const next = new Set(selectedSet)
    if (on) next.add(key)
    else next.delete(key)
    onSelectionChange?.([...next])
  }

  const toggleAll = (on: boolean) => onSelectionChange?.(on ? rows.map(rowKey) : [])

  /**
   * A click anywhere on a row or card activates it, for pointer users. The
   * title is a real button for everyone else, and `stopPropagation` there
   * stops one press firing twice. A checkbox click is selection, not
   * activation, so it stops the row handler too.
   */
  const rowClick = (row: Row) => (event: MouseEvent) => {
    if (!onRowClick) return
    const target = event.target as HTMLElement
    if (target.closest('button, a, input, select, textarea, label')) return
    onRowClick(row)
  }

  const titleCell = (row: Row) => {
    const content = readCell(row, titleColumn)
    if (!onRowClick) return content
    return (
      <button
        type="button"
        className="link link-hover text-start font-medium text-base-content"
        onClick={() => onRowClick(row)}
      >
        {content}
      </button>
    )
  }

  const status = loading
    ? 'loading'
    : error !== undefined
      ? 'error'
      : rows.length === 0
        ? 'empty'
        : 'rows'

  const errorPanel =
    status === 'error' ? (
      <Alert
        variant="danger"
        title="Could not load"
        action={
          onRetry ? (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              Try again
            </Button>
          ) : undefined
        }
      >
        {error}
      </Alert>
    ) : null

  const emptyPanel = status === 'empty' ? (empty ?? <EmptyState title="Nothing to show" />) : null

  const skeletonRows = Array.from({ length: Math.max(1, loadingRows) }, (_, index) => index)

  const rootProps = { className, 'aria-busy': loading || undefined, ...props }

  if (cards) {
    return (
      <div {...rootProps}>
        {status === 'loading' ? (
          <ul className="flex flex-col gap-3" aria-label={caption}>
            {skeletonRows.map((index) => (
              <li key={index}>
                <Card>
                  <Skeleton shape="text" lines={3} />
                </Card>
              </li>
            ))}
          </ul>
        ) : status !== 'rows' ? (
          (errorPanel ?? emptyPanel)
        ) : (
          <ul className="flex flex-col gap-3" aria-label={caption}>
            {rows.map((row, index) => {
              const key = rowKey(row)
              const bodyColumns = columns.filter(
                (column) => column !== titleColumn && column.card !== 'hidden',
              )
              return (
                <li key={key}>
                  <Card
                    variant={clickable ? 'interactive' : 'bordered'}
                    onClick={rowClick(row)}
                    header={
                      <>
                        <span className="min-w-0 flex-1 truncate">{titleCell(row)}</span>
                        {selectable ? (
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            aria-label={labelFor(row, index)}
                            checked={selectedSet.has(key)}
                            onChange={(event) => toggle(key, event.target.checked)}
                          />
                        ) : null}
                      </>
                    }
                  >
                    {bodyColumns.length > 0 ? (
                      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                        {bodyColumns.map((column) => (
                          <div key={column.key} className="contents">
                            <dt className="text-muted">{column.header}</dt>
                            <dd className={cellAlign[column.align ?? 'start']}>
                              {readCell(row, column)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  const columnCount = columns.length + (selectable ? 1 : 0)

  return (
    <div {...rootProps}>
      <div className="overflow-x-auto">
        <table className={table({ size, zebra, pinHeader })}>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr>
              {selectable ? (
                <th scope="col" className="w-0">
                  <SelectAll count={selectedSet.size} total={rows.length} onChange={toggleAll} />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={ariaSort(column as TableColumn<unknown>, sort)}
                  className={cellAlign[column.align ?? 'start']}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => onSortChange?.(nextSort(column.key, sort))}
                    >
                      {column.header}
                      <Icon
                        name={sortIcon(column as TableColumn<unknown>, sort)}
                        size="xs"
                        className={sort?.key === column.key ? '' : 'opacity-50'}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {status === 'loading' ? (
              skeletonRows.map((index) => (
                <tr key={index}>
                  {selectable ? <td /> : null}
                  {columns.map((column) => (
                    <td key={column.key}>
                      <Skeleton shape="text" lines={1} />
                    </td>
                  ))}
                </tr>
              ))
            ) : status !== 'rows' ? (
              <tr>
                <td colSpan={columnCount} className="p-0">
                  {errorPanel ?? emptyPanel}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const key = rowKey(row)
                return (
                  <tr
                    key={key}
                    onClick={rowClick(row)}
                    aria-selected={selectable ? selectedSet.has(key) : undefined}
                    className={clickable ? 'cursor-pointer hover:bg-base-200' : undefined}
                  >
                    {selectable ? (
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          aria-label={labelFor(row, index)}
                          checked={selectedSet.has(key)}
                          onChange={(event) => toggle(key, event.target.checked)}
                        />
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td key={column.key} className={cellAlign[column.align ?? 'start']}>
                        {column === titleColumn ? titleCell(row) : readCell(row, column)}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * One valid set of props for the blind install test, which renders every
 * export with no knowledge of their types. Both `columns` and `rows` are
 * required, so without this the component fails for a reason that has nothing
 * to do with packaging. Selectable and sortable, so the checkbox and sort
 * indicator classes are rendered and checked too.
 */
Table.sampleProps = {
  caption: 'Rooms',
  columns: [
    { key: 'name', header: 'Room', sortable: true },
    { key: 'seats', header: 'Seats', align: 'end' },
  ],
  rows: [
    { name: 'Reception', seats: 4 },
    { name: 'Boardroom', seats: 12 },
  ],
  rowKey: (row: { name: string }) => row.name,
  selectable: true,
} satisfies TableProps<{ name: string; seats: number }>
