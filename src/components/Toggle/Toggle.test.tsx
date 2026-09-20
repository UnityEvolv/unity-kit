import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('is named by its label', () => {
    render(<Toggle label="Join muted" />)
    expect(screen.getByRole('checkbox', { name: 'Join muted' })).toBeInTheDocument()
  })

  /**
   * It is a checkbox, not a `role="switch"`. The keyboard behaviour, the form
   * value and the announcement are all a checkbox's; only the drawing differs,
   * and a switch that behaved like a checkbox would be describing the picture.
   */
  it('is a checkbox underneath, because it is one', () => {
    render(<Toggle label="Join muted" />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('type', 'checkbox')
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('defaults to md', () => {
    render(<Toggle label="Join muted" />)
    expect(screen.getByRole('checkbox')).toHaveClass('toggle', 'toggle-md')
  })

  it.each([
    ['xs', 'toggle-xs'],
    ['sm', 'toggle-sm'],
    ['md', 'toggle-md'],
    ['lg', 'toggle-lg'],
  ] as const)('applies the full class name for size %s', (size, expected) => {
    render(<Toggle label="Join muted" size={size} />)
    expect(screen.getByRole('checkbox')).toHaveClass(expected)
  })

  it('flips when its label is clicked', async () => {
    render(<Toggle label="Join muted" />)
    await userEvent.click(screen.getByText('Join muted'))
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('describes itself with help text', () => {
    render(<Toggle label="Join muted" help="Takes effect the next time you join." />)
    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription(
      'Takes effect the next time you join.',
    )
  })

  it('forwards a ref', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Toggle label="Join muted" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
