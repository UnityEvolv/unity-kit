import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Radio } from './Radio'
import { Field } from '../Field'

describe('Radio', () => {
  it('is named by its label', () => {
    render(<Radio name="notify" value="all" label="Everything" />)
    expect(screen.getByRole('radio', { name: 'Everything' })).toBeInTheDocument()
  })

  it('defaults to md', () => {
    render(<Radio name="notify" value="all" label="Everything" />)
    expect(screen.getByRole('radio')).toHaveClass('radio', 'radio-md')
  })

  it.each([
    ['xs', 'radio-xs'],
    ['sm', 'radio-sm'],
    ['md', 'radio-md'],
    ['lg', 'radio-lg'],
  ] as const)('applies the full class name for size %s', (size, expected) => {
    render(<Radio name="notify" value="all" label="Everything" size={size} />)
    expect(screen.getByRole('radio')).toHaveClass(expected)
  })

  /** The name is what makes a set of radios a set, which is why it is required. */
  it('lets only one of a name be chosen', async () => {
    render(
      <>
        <Radio name="notify" value="all" label="Everything" />
        <Radio name="notify" value="none" label="Nothing" />
      </>,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Everything' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Nothing' }))
    expect(screen.getByRole('radio', { name: 'Everything' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Nothing' })).toBeChecked()
  })

  /**
   * A set of radios needs a name of its own, or a screen reader reads three
   * unrelated options and never says what they are options for.
   */
  it('is grouped and named by a fieldset Field', () => {
    render(
      <Field as="fieldset" label="Notify me about" help="You can change this later.">
        <Radio name="notify" value="all" label="Everything" />
        <Radio name="notify" value="mentions" label="Mentions only" />
      </Field>,
    )
    const group = screen.getByRole('group', { name: 'Notify me about' })
    expect(group).toHaveAccessibleDescription('You can change this later.')
    expect(screen.getAllByRole('radio')).toHaveLength(2)
  })

  it('is disabled with the group', () => {
    render(
      <Field as="fieldset" label="Notify me about" disabled>
        <Radio name="notify" value="all" label="Everything" />
      </Field>,
    )
    expect(screen.getByRole('radio')).toBeDisabled()
  })

  it('shows, wires and colours an error in one prop', () => {
    render(<Radio name="notify" value="all" label="Everything" error="Pick one." />)
    const radio = screen.getByRole('radio')
    expect(radio).toHaveClass('radio-error')
    expect(radio).toHaveAttribute('aria-invalid', 'true')
    expect(radio).toHaveAccessibleDescription('Pick one.')
  })

  it('declares sample props the blind install test can render', () => {
    render(<Radio {...Radio.sampleProps} />)
    expect(screen.getByRole('radio')).toHaveAttribute('name', 'sample')
  })
})
