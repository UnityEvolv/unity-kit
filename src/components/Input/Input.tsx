import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import type { InputHTMLAttributes } from 'react'
import { Field } from '../Field'
import type { FieldProps } from '../Field'

/**
 * Class names in full, as everywhere in the kit. daisyUI 5 has no
 * `input-bordered`: the border is on `.input` itself, and the old modifier
 * resolves to nothing at all — a name that compiles to no CSS and fails
 * silently.
 */
const input = cva('input w-full', {
  variants: {
    size: { xs: 'input-xs', sm: 'input-sm', md: 'input-md', lg: 'input-lg' },
    invalid: { true: 'input-error', false: '' },
  },
  defaultVariants: { size: 'md', invalid: false },
})

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Pick<FieldProps, 'label' | 'help' | 'error' | 'size'> {}

/**
 * A single-line text input, wrapped in the kit's `Field` so that label, help
 * text and error message are wired to it rather than merely near it.
 *
 * Uncontrolled by default and agnostic about form libraries: `ref`,
 * `defaultValue`, `name` and `onChange` all pass through untouched, so
 * react-hook-form's `register()` spreads onto it and a plain `<form>` reads
 * it by name.
 *
 * **Native `required` is deliberate.** It is what a screen reader announces,
 * and the asterisk is only decoration. A form that does its own validation
 * turns the browser's bubbles off with `noValidate` on the `<form>`, rather
 * than the field lying about whether an answer is needed.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, help, error, size = 'md', className, type = 'text', id, required, disabled, ...props },
  ref,
) {
  return (
    <Field
      label={label}
      help={help}
      error={error}
      size={size}
      required={required}
      disabled={disabled}
      id={id}
    >
      {(control) => (
        <input
          ref={ref}
          type={type}
          // Taken from the wiring rather than recomputed, so the red border
          // and `aria-invalid` cannot drift apart.
          className={input({ size, invalid: control['aria-invalid'] === true, className })}
          {...control}
          {...props}
        />
      )}
    </Field>
  )
})
