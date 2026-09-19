import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import type { TextareaHTMLAttributes } from 'react'
import { Field } from '../Field'
import type { WithSampleProps } from '../sampleProps'
import type { FieldProps } from '../Field'

const textarea = cva('textarea w-full', {
  variants: {
    size: { xs: 'textarea-xs', sm: 'textarea-sm', md: 'textarea-md', lg: 'textarea-lg' },
    invalid: { true: 'textarea-error', false: '' },
  },
  defaultVariants: { size: 'md', invalid: false },
})

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size' | 'children'>,
    Pick<FieldProps, 'label' | 'help' | 'error' | 'size'> {}

/**
 * Multi-line text, with the same label, help and error wiring as `Input`.
 *
 * `rows` defaults to 3 rather than the browser's 2, which is too short to
 * read as "write a few sentences here". It stays a plain prop, so a consumer
 * can set it or let CSS take over.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, help, error, size = 'md', className, rows = 3, id, required, disabled, ...props },
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
        <textarea
          ref={ref}
          rows={rows}
          className={textarea({ size, invalid: control['aria-invalid'] === true, className })}
          {...control}
          {...props}
        />
      )}
    </Field>
  )
}) as WithSampleProps<TextareaProps, HTMLTextAreaElement>

/**
 * One valid set of props for the blind install test, which renders every
 * export with no knowledge of their types. Declaring it also stops the test
 * passing children, which a control like this cannot take.
 */
Textarea.sampleProps = { label: 'Label' }
