import { forwardRef, useCallback } from 'react'
import { cva } from 'class-variance-authority'
import type { InputHTMLAttributes, MutableRefObject } from 'react'
import { Field } from '../Field'
import type { WithSampleProps } from '../sampleProps'
import type { FieldProps } from '../Field'

const checkbox = cva('checkbox', {
  variants: {
    size: { xs: 'checkbox-xs', sm: 'checkbox-sm', md: 'checkbox-md', lg: 'checkbox-lg' },
    invalid: { true: 'checkbox-error', false: '' },
  },
  defaultVariants: { size: 'md', invalid: false },
})

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'children'>,
    Pick<FieldProps, 'label' | 'help' | 'error' | 'size'> {
  /**
   * Neither checked nor unchecked: a "select all" above a list where some
   * rows are picked. It is a DOM property rather than an attribute, so React
   * cannot set it from JSX and the ref below is the only way.
   */
  indeterminate?: boolean
}

/**
 * A checkbox with the kit's label, help and error wiring.
 *
 * The label sits beside the control and wraps it, so the text is part of the
 * hit area — a checkbox is small, and a label that only points at one leaves
 * most of the target unclickable.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    help,
    error,
    size = 'md',
    indeterminate = false,
    className,
    id,
    required,
    disabled,
    ...props
  },
  ref,
) {
  // One ref doing two jobs: setting the DOM property React cannot reach, and
  // passing the node on to whatever the caller gave us.
  const attach = useCallback(
    (node: HTMLInputElement | null) => {
      if (node !== null) node.indeterminate = indeterminate
      if (typeof ref === 'function') ref(node)
      else if (ref !== null) (ref as MutableRefObject<HTMLInputElement | null>).current = node
    },
    [ref, indeterminate],
  )

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
          ref={attach}
          type="checkbox"
          className={checkbox({ size, invalid: control['aria-invalid'] === true, className })}
          {...control}
          {...props}
        />
      )}
    </Field>
  )
}) as WithSampleProps<CheckboxProps, HTMLInputElement>

/**
 * One valid set of props for the blind install test, which renders every
 * export with no knowledge of their types. Declaring it also stops the test
 * passing children, which a control like this cannot take.
 */
Checkbox.sampleProps = { label: 'Label' }
