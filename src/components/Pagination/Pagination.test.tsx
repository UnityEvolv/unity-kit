import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

const noop = () => {}

const pageButtons = () =>
  within(screen.getByRole('navigation'))
    .getAllByRole('button')
    .map((button) => button.textContent)

describe('Pagination', () => {
  it('is a labelled navigation landmark', () => {
    render(<Pagination page={1} pageCount={3} onPageChange={noop} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
  })

  it('renders previous, the page window and next', () => {
    render(<Pagination page={10} pageCount={20} onPageChange={noop} />)
    expect(pageButtons()).toEqual(['', '1', '9', '10', '11', '20', ''])
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
  })

  it('marks the current page and keeps it focusable', () => {
    render(<Pagination page={2} pageCount={5} onPageChange={noop} />)
    const current = screen.getByRole('button', { name: 'Page 2' })
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current).toHaveClass('btn-primary')
    expect(current).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Page 3' })).not.toHaveAttribute('aria-current')
  })

  it('hides the ellipsis from assistive technology and the tab order', () => {
    const { container } = render(<Pagination page={10} pageCount={20} onPageChange={noop} />)
    const gaps = container.querySelectorAll('[aria-hidden="true"][tabindex="-1"]')
    expect(gaps).toHaveLength(2)
    expect(screen.queryByRole('button', { name: '…' })).toBeNull()
  })

  it('reports the page asked for and nothing when already there', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={2} pageCount={5} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Page 4' }))
    expect(onPageChange).toHaveBeenLastCalledWith(4)
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(3)
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(1)
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    expect(onPageChange).toHaveBeenCalledTimes(3)
  })

  it('disables previous on the first page and next on the last', () => {
    const { rerender } = render(<Pagination page={1} pageCount={5} onPageChange={noop} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
    rerender(<Pagination page={5} pageCount={5} onPageChange={noop} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('derives the page count from total and pageSize', () => {
    render(<Pagination page={1} total={45} pageSize={10} onPageChange={noop} />)
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Page 6' })).toBeNull()
  })

  it('shows a summary when it knows the total', () => {
    render(<Pagination page={3} total={45} pageSize={10} onPageChange={noop} />)
    expect(screen.getByText('Showing 21 to 30 of 45')).toBeInTheDocument()
  })

  it('caps the summary at the total on the last page and says so when empty', () => {
    const { rerender } = render(
      <Pagination page={5} total={45} pageSize={10} onPageChange={noop} />,
    )
    expect(screen.getByText('Showing 41 to 45 of 45')).toBeInTheDocument()
    rerender(<Pagination page={1} total={0} pageSize={10} onPageChange={noop} />)
    expect(screen.getByText('No items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('renders no summary without a total', () => {
    render(<Pagination page={1} pageCount={3} onPageChange={noop} />)
    expect(screen.queryByText(/Showing/)).toBeNull()
  })

  it('renders a labelled page-size selector only when options are given', () => {
    const { rerender } = render(<Pagination page={1} pageCount={3} onPageChange={noop} />)
    expect(screen.queryByRole('combobox')).toBeNull()
    const onPageSizeChange = vi.fn()
    rerender(
      <Pagination
        page={1}
        total={100}
        pageSize={25}
        pageSizeOptions={[10, 25, 50]}
        onPageSizeChange={onPageSizeChange}
        onPageChange={noop}
      />,
    )
    const select = screen.getByRole('combobox', { name: 'Rows per page' })
    expect(select).toHaveValue('25')
    fireEvent.change(select, { target: { value: '50' } })
    expect(onPageSizeChange).toHaveBeenCalledWith(50)
  })

  describe('compact', () => {
    it('shows previous, next and the current page only', () => {
      render(<Pagination page={7} pageCount={20} onPageChange={noop} compact />)
      expect(pageButtons()).toEqual(['', ''])
      expect(screen.getByText('Page 7 of 20')).toHaveAttribute('aria-current', 'page')
    })

    it('still pages with previous and next', () => {
      const onPageChange = vi.fn()
      render(<Pagination page={7} pageCount={20} onPageChange={onPageChange} compact />)
      fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
      expect(onPageChange).toHaveBeenCalledWith(8)
    })
  })

  it('clamps a page outside the range rather than rendering an impossible state', () => {
    render(<Pagination page={9} pageCount={3} onPageChange={noop} />)
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('sizes the buttons together', () => {
    render(<Pagination page={1} pageCount={3} onPageChange={noop} size="sm" />)
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveClass('btn-sm', 'join-item')
  })
})
