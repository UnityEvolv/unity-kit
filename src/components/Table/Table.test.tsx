import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Table } from './Table'
import type { TableColumn } from './Table'
import { COARSE_POINTER_QUERY } from './useCoarsePointer'

interface Room {
  id: number
  name: string
  seats: number
  status: string
}

const rooms: Room[] = [
  { id: 1, name: 'Reception', seats: 4, status: 'open' },
  { id: 2, name: 'Boardroom', seats: 12, status: 'busy' },
  { id: 3, name: 'Break room', seats: 8, status: 'open' },
]

const columns: TableColumn<Room>[] = [
  { key: 'name', header: 'Room', sortable: true },
  { key: 'seats', header: 'Seats', align: 'end', sortable: true },
  { key: 'status', header: 'Status', card: 'hidden' },
]

const rowKey = (room: Room) => room.id

/**
 * jsdom has no `matchMedia`, which the hook treats as a fine pointer. These
 * install one that answers the coarse-pointer query and can flip its answer,
 * firing the change listeners the way a docked tablet would.
 */
type Listener = (event: { matches: boolean }) => void
const listeners = new Set<Listener>()
let coarse = false

const installMatchMedia = () => {
  window.matchMedia = vi.fn((query: string) => ({
    get matches() {
      return query === COARSE_POINTER_QUERY && coarse
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

const setCoarse = (value: boolean) => {
  coarse = value
  listeners.forEach((listener) => listener({ matches: value }))
}

afterEach(() => {
  coarse = false
  listeners.clear()
  // @ts-expect-error jsdom has none, so put it back to none
  delete window.matchMedia
})

describe('Table', () => {
  describe('table layout', () => {
    it('renders a table from the column definition and rows', () => {
      render(<Table caption="Rooms" columns={columns} rows={rooms} rowKey={rowKey} />)
      const table = screen.getByRole('table', { name: 'Rooms' })
      expect(
        within(table)
          .getAllByRole('columnheader')
          .map((th) => th.textContent),
      ).toEqual(['Room', 'Seats', 'Status'])
      expect(within(table).getAllByRole('row')).toHaveLength(4)
      expect(screen.getByRole('cell', { name: 'Boardroom' })).toBeInTheDocument()
    })

    it('reads row[key] when a column has no cell renderer and uses cell when it has one', () => {
      render(
        <Table
          columns={[
            { key: 'seats', header: 'Seats' },
            {
              key: 'label',
              header: 'Label',
              cell: (room) => `${room.name} (${room.seats})`,
            },
          ]}
          rows={rooms.slice(0, 1)}
          rowKey={rowKey}
        />,
      )
      expect(screen.getByRole('cell', { name: '4' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: 'Reception (4)' })).toBeInTheDocument()
    })

    it('carries the daisyUI modifiers as full class names', () => {
      const { container } = render(
        <Table columns={columns} rows={rooms} rowKey={rowKey} zebra pinHeader size="sm" />,
      )
      expect(container.querySelector('table')).toHaveClass(
        'table',
        'table-zebra',
        'table-pin-rows',
        'table-sm',
      )
    })

    it('aligns a column to the end on request', () => {
      render(<Table columns={columns} rows={rooms} rowKey={rowKey} />)
      expect(screen.getByRole('columnheader', { name: 'Seats' })).toHaveClass('text-end')
      expect(screen.getByRole('cell', { name: '12' })).toHaveClass('text-end')
    })
  })

  describe('sorting', () => {
    it('marks the sorted column and only renders indicators', () => {
      const onSortChange = vi.fn()
      render(
        <Table
          columns={columns}
          rows={rooms}
          rowKey={rowKey}
          sort={{ key: 'seats', direction: 'desc' }}
          onSortChange={onSortChange}
        />,
      )
      expect(screen.getByRole('columnheader', { name: 'Seats' })).toHaveAttribute(
        'aria-sort',
        'descending',
      )
      expect(screen.getByRole('columnheader', { name: 'Room' })).toHaveAttribute(
        'aria-sort',
        'none',
      )
      expect(screen.getByRole('columnheader', { name: 'Status' })).not.toHaveAttribute('aria-sort')
      // Rows are rendered in the order given, whatever the sort says.
      const cells = screen.getAllByRole('cell').map((cell) => cell.textContent)
      expect(cells[0]).toBe('Reception')
    })

    it('asks for ascending first, then flips, and never sorts the rows itself', () => {
      const onSortChange = vi.fn()
      const { rerender } = render(
        <Table columns={columns} rows={rooms} rowKey={rowKey} onSortChange={onSortChange} />,
      )
      fireEvent.click(screen.getByRole('button', { name: 'Room' }))
      expect(onSortChange).toHaveBeenLastCalledWith({
        key: 'name',
        direction: 'asc',
      })

      rerender(
        <Table
          columns={columns}
          rows={rooms}
          rowKey={rowKey}
          sort={{ key: 'name', direction: 'asc' }}
          onSortChange={onSortChange}
        />,
      )
      fireEvent.click(screen.getByRole('button', { name: 'Room' }))
      expect(onSortChange).toHaveBeenLastCalledWith({
        key: 'name',
        direction: 'desc',
      })
    })

    it('renders no sort control on a column that is not sortable', () => {
      render(<Table columns={columns} rows={rooms} rowKey={rowKey} />)
      expect(screen.queryByRole('button', { name: 'Status' })).toBeNull()
    })
  })

  describe('states', () => {
    it('draws skeleton rows and marks the region busy while loading', () => {
      const { container } = render(
        <Table columns={columns} rows={[]} rowKey={rowKey} loading loadingRows={3} />,
      )
      expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true')
      expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
      expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0)
      // A skeleton is silent: no live region announces it a second time.
      expect(screen.queryByRole('status')).toBeNull()
    })

    it('shows the default nothing-here panel when there are no rows', () => {
      render(<Table columns={columns} rows={[]} rowKey={rowKey} />)
      expect(screen.getByText('Nothing to show')).toBeInTheDocument()
    })

    it('lets the caller replace the empty panel', () => {
      render(<Table columns={columns} rows={[]} rowKey={rowKey} empty={<p>No rooms yet</p>} />)
      expect(screen.getByText('No rooms yet')).toBeInTheDocument()
      expect(screen.queryByText('Nothing to show')).toBeNull()
    })

    it('shows an error alert with a retry button and no rows', () => {
      const onRetry = vi.fn()
      render(
        <Table
          columns={columns}
          rows={rooms}
          rowKey={rowKey}
          error="Service down"
          onRetry={onRetry}
        />,
      )
      expect(screen.getByRole('alert')).toHaveTextContent('Service down')
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
      expect(onRetry).toHaveBeenCalledOnce()
      expect(screen.queryByRole('cell', { name: 'Boardroom' })).toBeNull()
    })

    it('does not show the empty panel while loading', () => {
      render(<Table columns={columns} rows={[]} rowKey={rowKey} loading />)
      expect(screen.queryByText('Nothing to show')).toBeNull()
    })
  })

  describe('selection', () => {
    const selectable = (selected: number[], onSelectionChange = vi.fn()) => (
      <Table
        columns={columns}
        rows={rooms}
        rowKey={rowKey}
        selectable
        selected={selected}
        onSelectionChange={onSelectionChange}
      />
    )

    it('reports the full next selection and reflects the controlled one', () => {
      const onSelectionChange = vi.fn()
      render(selectable([2], onSelectionChange))
      expect(screen.getByRole('checkbox', { name: 'Boardroom' })).toBeChecked()
      expect(screen.getByRole('checkbox', { name: 'Reception' })).not.toBeChecked()
      fireEvent.click(screen.getByRole('checkbox', { name: 'Reception' }))
      expect(onSelectionChange).toHaveBeenLastCalledWith([2, 1])
      fireEvent.click(screen.getByRole('checkbox', { name: 'Boardroom' }))
      expect(onSelectionChange).toHaveBeenLastCalledWith([])
    })

    it('selects and clears every row from the header box, indeterminate in between', () => {
      const onSelectionChange = vi.fn()
      const { rerender } = render(selectable([2], onSelectionChange))
      const all = screen.getByRole('checkbox', {
        name: 'Select all rows',
      }) as HTMLInputElement
      expect(all.indeterminate).toBe(true)
      fireEvent.click(all)
      expect(onSelectionChange).toHaveBeenLastCalledWith([1, 2, 3])

      rerender(selectable([1, 2, 3], onSelectionChange))
      expect(all).toBeChecked()
      expect(all.indeterminate).toBe(false)
      fireEvent.click(all)
      expect(onSelectionChange).toHaveBeenLastCalledWith([])
    })

    it('names a checkbox from rowLabel when the title is not text', () => {
      render(
        <Table
          columns={[
            {
              key: 'name',
              header: 'Room',
              cell: (room) => <em>{room.name}</em>,
            },
          ]}
          rows={rooms.slice(0, 1)}
          rowKey={rowKey}
          selectable
          rowLabel={(room) => `Select ${room.name}`}
        />,
      )
      expect(screen.getByRole('checkbox', { name: 'Select Reception' })).toBeInTheDocument()
    })
  })

  describe('row click', () => {
    it('activates from a click anywhere on the row and from the title button', () => {
      const onRowClick = vi.fn()
      render(<Table columns={columns} rows={rooms} rowKey={rowKey} onRowClick={onRowClick} />)
      fireEvent.click(screen.getByRole('cell', { name: '12' }))
      expect(onRowClick).toHaveBeenLastCalledWith(rooms[1])
      fireEvent.click(screen.getByRole('button', { name: 'Reception' }))
      expect(onRowClick).toHaveBeenLastCalledWith(rooms[0])
      expect(onRowClick).toHaveBeenCalledTimes(2)
    })

    it('does not activate the row when its checkbox is toggled', () => {
      const onRowClick = vi.fn()
      render(
        <Table
          columns={columns}
          rows={rooms}
          rowKey={rowKey}
          onRowClick={onRowClick}
          selectable
          onSelectionChange={() => {}}
        />,
      )
      fireEvent.click(screen.getByRole('checkbox', { name: 'Reception' }))
      expect(onRowClick).not.toHaveBeenCalled()
    })

    it('renders no title button without onRowClick', () => {
      render(<Table columns={columns} rows={rooms} rowKey={rowKey} />)
      expect(screen.queryByRole('button', { name: 'Reception' })).toBeNull()
    })
  })

  describe('adaptive layout', () => {
    it('renders the table when the pointer is fine', () => {
      installMatchMedia()
      render(<Table caption="Rooms" columns={columns} rows={rooms} rowKey={rowKey} />)
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.queryByRole('list')).toBeNull()
    })

    it('renders cards when the pointer is coarse, and only cards', () => {
      installMatchMedia()
      setCoarse(true)
      render(<Table caption="Rooms" columns={columns} rows={rooms} rowKey={rowKey} />)
      expect(screen.queryByRole('table')).toBeNull()
      const list = screen.getByRole('list', { name: 'Rooms' })
      expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    })

    it('switches live when the pointer changes', () => {
      installMatchMedia()
      render(<Table columns={columns} rows={rooms} rowKey={rowKey} />)
      expect(screen.getByRole('table')).toBeInTheDocument()
      act(() => setCoarse(true))
      expect(screen.queryByRole('table')).toBeNull()
      expect(screen.getByRole('list')).toBeInTheDocument()
    })

    it('falls back to the table where matchMedia does not exist', () => {
      render(<Table columns={columns} rows={rooms} rowKey={rowKey} />)
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it.each([
      ['table', 'table'],
      ['cards', 'list'],
    ] as const)('layout=%s overrides the pointer', (layout, role) => {
      installMatchMedia()
      setCoarse(layout === 'table')
      render(<Table columns={columns} rows={rooms} rowKey={rowKey} layout={layout} />)
      expect(screen.getByRole(role)).toBeInTheDocument()
    })
  })

  describe('card layout', () => {
    const renderCards = (extra = {}) =>
      render(<Table columns={columns} rows={rooms} rowKey={rowKey} layout="cards" {...extra} />)

    it('uses the title column as the heading, labels body lines and drops hidden columns', () => {
      renderCards()
      const card = screen.getAllByRole('listitem')[1]
      expect(within(card).getByText('Boardroom')).toBeInTheDocument()
      expect(within(card).getByRole('term')).toHaveTextContent('Seats')
      expect(within(card).getByRole('definition')).toHaveTextContent('12')
      expect(within(card).queryByText('Status')).toBeNull()
      expect(within(card).queryByText('busy')).toBeNull()
    })

    it('takes the first column as the title when none claims it, and honours card: title', () => {
      render(
        <Table
          columns={[
            { key: 'seats', header: 'Seats' },
            { key: 'name', header: 'Room', card: 'title' },
          ]}
          rows={rooms.slice(0, 1)}
          rowKey={rowKey}
          layout="cards"
        />,
      )
      const card = screen.getByRole('listitem')
      expect(within(card).getByRole('term')).toHaveTextContent('Seats')
      expect(within(card).getByText('Reception')).toBeInTheDocument()
    })

    it('selects, activates and shows states the same way as the table', () => {
      const onRowClick = vi.fn()
      const onSelectionChange = vi.fn()
      renderCards({
        selectable: true,
        selected: [1],
        onSelectionChange,
        onRowClick,
      })
      expect(screen.getByRole('checkbox', { name: 'Reception' })).toBeChecked()
      fireEvent.click(screen.getByRole('checkbox', { name: 'Boardroom' }))
      expect(onSelectionChange).toHaveBeenLastCalledWith([1, 2])
      expect(onRowClick).not.toHaveBeenCalled()
      fireEvent.click(screen.getByRole('button', { name: 'Break room' }))
      expect(onRowClick).toHaveBeenLastCalledWith(rooms[2])
      fireEvent.click(within(screen.getAllByRole('listitem')[0]).getByRole('definition'))
      expect(onRowClick).toHaveBeenLastCalledWith(rooms[0])
    })

    it('shows loading, empty and error states in place of the cards', () => {
      const { container, rerender } = renderCards({
        loading: true,
        loadingRows: 2,
      })
      expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true')
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
      rerender(<Table columns={columns} rows={[]} rowKey={rowKey} layout="cards" />)
      expect(screen.getByText('Nothing to show')).toBeInTheDocument()
      rerender(<Table columns={columns} rows={rooms} rowKey={rowKey} layout="cards" error="Down" />)
      expect(screen.getByRole('alert')).toHaveTextContent('Down')
      expect(screen.queryByRole('list')).toBeNull()
    })
  })
})
