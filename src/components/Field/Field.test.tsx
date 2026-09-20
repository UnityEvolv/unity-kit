import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Field } from './Field'

/** A control the kit does not ship, wired only by what `Field` hands it. */
const Probe = () => (
  <Field label="Email">{(control) => <input type="email" {...control} />}</Field>
)

describe('Field', () => {
  it('ties the label to the control', () => {
    render(<Probe />)
    expect(screen.getByLabelText('Email')).toBeInstanceOf(HTMLInputElement)
  })

  it('renders the control alone when there is nothing to say about it', () => {
    render(<Field>{(control) => <input {...control} />}</Field>)
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby')
  })

  it('accepts a plain child, for a control that needs no wiring', () => {
    render(
      <Field label="Colour">
        <span>swatch</span>
      </Field>,
    )
    expect(screen.getByText('swatch')).toBeInTheDocument()
  })

  describe('help text', () => {
    it('is described by, not merely near, the control', () => {
      render(
        <Field label="Password" help="At least 12 characters.">
          {(control) => <input {...control} />}
        </Field>,
      )
      expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
        'At least 12 characters.',
      )
    })
  })

  describe('error', () => {
    it('marks the control invalid', () => {
      render(
        <Field label="Email" error="That address is already in use.">
          {(control) => <input {...control} />}
        </Field>,
      )
      expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    })

    it('is announced when it appears, not only when the field is reached', () => {
      render(
        <Field label="Email" error="That address is already in use.">
          {(control) => <input {...control} />}
        </Field>,
      )
      expect(screen.getByRole('alert')).toHaveTextContent('That address is already in use.')
    })

    it('leaves the control valid when there is none', () => {
      render(<Probe />)
      expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid')
    })

    it('treats an empty string as no error, not as a nameless one', () => {
      render(
        <Field label="Email" error="">
          {(control) => <input {...control} />}
        </Field>,
      )
      expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    /**
     * Help usually states the rule and the error states the violation, so
     * hiding the rule at the moment it is broken is backwards.
     */
    it('keeps the help text, and describes the control with both', () => {
      render(
        <Field label="Password" help="At least 12 characters." error="Too short.">
          {(control) => <input {...control} />}
        </Field>,
      )
      expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
        'At least 12 characters. Too short.',
      )
    })
  })

  describe('required', () => {
    it('says so on the control, which is what gets announced', () => {
      render(
        <Field label="Email" required>
          {(control) => <input {...control} />}
        </Field>,
      )
      expect(screen.getByRole('textbox')).toBeRequired()
    })

    /**
     * The asterisk is decoration, and `aria-hidden` keeps it out of the
     * accessible name — so the field is still announced as "Email" rather
     * than "Email star". Note that `getByLabelText` matches raw text and
     * would disagree; the accessible name is the thing that is spoken.
     */
    it('marks the label without putting the mark into the name', () => {
      render(
        <Field label="Email" required>
          {(control) => <input {...control} />}
        </Field>,
      )
      expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getByRole('textbox')).toHaveAccessibleName('Email')
    })
  })

  it('passes disabled down to the control', () => {
    render(
      <Field label="Email" disabled>
        {(control) => <input {...control} />}
      </Field>,
    )
    expect(screen.getByLabelText('Email')).toBeDisabled()
  })

  describe('as a fieldset, for a group of controls', () => {
    it('names the group with a legend', () => {
      render(
        <Field as="fieldset" label="Notify me about">
          <input type="checkbox" aria-label="Mentions" />
        </Field>,
      )
      expect(screen.getByRole('group', { name: 'Notify me about' })).toBeInTheDocument()
    })

    it('lets the browser disable the whole group', () => {
      render(
        <Field as="fieldset" label="Notify me about" disabled>
          <input type="checkbox" aria-label="Mentions" />
        </Field>,
      )
      expect(screen.getByLabelText('Mentions')).toBeDisabled()
    })

    it('does not also disable each control, which the fieldset already did', () => {
      render(
        <Field as="fieldset" label="Choices" disabled>
          {(control) => <input type="checkbox" aria-label="One" {...control} />}
        </Field>,
      )
      expect(screen.getByLabelText('One')).not.toHaveAttribute('disabled')
    })

    it('describes the group, since there is no single control to describe', () => {
      render(
        <Field as="fieldset" label="Choices" help="Pick as many as you like.">
          <input type="checkbox" aria-label="One" />
        </Field>,
      )
      expect(screen.getByRole('group')).toHaveAccessibleDescription('Pick as many as you like.')
    })
  })

  describe('inline, for the checkbox family', () => {
    it('wraps the control so the text is part of the hit area', () => {
      const { container } = render(
        <Field label="Remember me" orientation="inline">
          {(control) => <input type="checkbox" {...control} />}
        </Field>,
      )
      expect(container.querySelector('label > input')).toBeInTheDocument()
    })

    it('still names the control', () => {
      render(
        <Field label="Remember me" orientation="inline">
          {(control) => <input type="checkbox" {...control} />}
        </Field>,
      )
      expect(screen.getByLabelText('Remember me')).toBeInstanceOf(HTMLInputElement)
    })
  })

  it('lets a consumer bring its own id', () => {
    render(
      <Field label="Email" id="signup-email">
        {(control) => <input {...control} />}
      </Field>,
    )
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'signup-email')
  })

  it('gives two fields on one page different ids', () => {
    render(
      <>
        <Field label="First">{(control) => <input {...control} />}</Field>
        <Field label="Second">{(control) => <input {...control} />}</Field>
      </>,
    )
    expect(screen.getByLabelText('First').id).not.toBe(screen.getByLabelText('Second').id)
  })
})
