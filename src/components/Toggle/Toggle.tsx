import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import type { InputHTMLAttributes } from 'react'
import { Field } from '../Field'
import type { WithSampleProps } from '../sampleProps'
import type { FieldProps } from '../Field'

const toggle = cva('toggle', {
  variants: {
    size: { xs: 'toggle-xs', sm: 'toggle-sm', md: 'toggle-md', lg: 'toggle-lg' },
    invalid: { true: 'toggle-error', false: '' },
  },
  defaultVariants: { size: 'md', invalid: false },
})

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'children'>,
    Pick<FieldProps, 'label' | 'help' | 'error' | 'size'> {}

/**
 * A setting that takes effect as soon as it is flipped.
 *
 * Still a checkbox underneath, because it is one: the same keyboard
 * behaviour, the same form value, the same announcement. Only the drawing is
 * different, and a `role="switch"` that behaved like a checkbox would be
 * describing the picture rather than the control.
 *
 * Use it where the change applies immediately. Where the answer is part of a
 * form that gets submitted, use `Checkbox` — a toggle beside a Save button
 * tells two different stories about when the change lands.
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { label, help, error, size = 'md', className, id, required, disabled, ...props },
  ref,
) {
  return (
    <Field
      label={label}
      help={help}
      error={error}
      size={size}
      orientation="inline"
      required={required}
      disabled={disabled}
      id={id}
    >
      {(control) => (
        <input
          ref={ref}
          type="checkbox"
          className={toggle({ size, invalid: control['aria-invalid'] === true, className })}
          {...control}
          {...props}
        />
      )}
    </Field>
  )
}) as WithSampleProps<ToggleProps, HTMLInputElement>

/**
 * One valid set of props for the blind install test, which renders every
 * export with no knowledge of their types. Declaring it also stops the test
 * passing children, which a control like this cannot take.
 */
Toggle.sampleProps = { label: 'Label' }
