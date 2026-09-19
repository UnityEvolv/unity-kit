import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import type { InputHTMLAttributes } from 'react'
import { Field } from '../Field'
import type { FieldProps } from '../Field'
import type { WithSampleProps } from '../sampleProps'

const radio = cva('radio', {
  variants: {
    size: { xs: 'radio-xs', sm: 'radio-sm', md: 'radio-md', lg: 'radio-lg' },
    invalid: { true: 'radio-error', false: '' },
  },
  defaultVariants: { size: 'md', invalid: false },
})

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'name' | 'children'>,
    Pick<FieldProps, 'label' | 'help' | 'error' | 'size'> {
  /**
   * Required, because a radio without one is not a choice — it is a checkbox
   * that cannot be unchecked. The name is what makes a set of radios a set,
   * for the browser and for a screen reader alike, so the type asks for it
   * rather than letting it be forgotten.
   */
  name: string
}

/**
 * One choice out of several.
 *
 * A group of these needs a label of its own, which is what `Field` with
 * `as="fieldset"` is for: the legend names the question, and the radios
 * answer it. Without that a screen reader reads four unrelated options and
 * never says what they are options for.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
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
          type="radio"
          className={radio({ size, invalid: control['aria-invalid'] === true, className })}
          {...control}
          {...props}
        />
      )}
    </Field>
  )
}) as WithSampleProps<RadioProps, HTMLInputElement>

/**
 * One valid set of props for the blind install test, which renders every
 * export with no knowledge of their types. `name` is required here, and
 * declaring this also stops the test passing children, which a radio cannot
 * take.
 */
Radio.sampleProps = { name: 'sample', label: 'Label' }
