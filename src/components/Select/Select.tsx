import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import type { SelectHTMLAttributes } from 'react'
import { Field } from '../Field'
import type { FieldProps } from '../Field'

const select = cva('select w-full', {
  variants: {
    size: { xs: 'select-xs', sm: 'select-sm', md: 'select-md', lg: 'select-lg' },
    invalid: { true: 'select-error', false: '' },
  },
  defaultVariants: { size: 'md', invalid: false },
})

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    Pick<FieldProps, 'label' | 'help' | 'error' | 'size'> {
  /**
   * The empty choice shown before anything is picked. It is `disabled`, so it
   * cannot be chosen back once the user has moved on, and it carries an empty
   * value so a required select fails validation while it is still selected.
   */
  placeholder?: string
}

/**
 * A native `<select>`, with options as children.
 *
 * Native on purpose: it is the only select that opens correctly on a phone,
 * survives zoom and works without JavaScript. A searchable, multi-select or
 * custom-rendered list is a different component with different behaviour —
 * that is UKIT-13's `Combobox`, not a prop on this one.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    help,
    error,
    size = 'md',
    placeholder,
    className,
    id,
    required,
    disabled,
    children,
    value,
    defaultValue,
    ...props
  },
  ref,
) {
  // A disabled option is skipped when the browser picks the initial
  // selection, so a placeholder on its own is never the one showing — the
  // select quietly opens on the first real choice instead, and the user has
  // "answered" a question they never saw. Starting the value empty is what
  // puts the placeholder on screen. Only when the caller has not said
  // otherwise: setting both `value` and `defaultValue` is a React warning.
  const startEmpty =
    placeholder !== undefined && value === undefined && defaultValue === undefined
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
        <select
          ref={ref}
          className={select({ size, invalid: control['aria-invalid'] === true, className })}
          value={value}
          defaultValue={startEmpty ? '' : defaultValue}
          {...control}
          {...props}
        >
          {placeholder === undefined ? null : (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
      )}
    </Field>
  )
})
