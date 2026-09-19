import { useId } from 'react'
import type { ReactNode } from 'react'

/**
 * Every control in the kit is measured in one of daisyUI's two units:
 * `--size-field` for inputs, selects and textareas, `--size-selector` for
 * checkboxes, radios and toggles. Both are stated in the generated theme, so
 * a control's height comes from the brand rather than from the library's
 * fallback, and the size names below are the same four everywhere.
 */
export type FieldSize = 'xs' | 'sm' | 'md' | 'lg'

/** The props a `Field` hands its control, already wired. */
export interface FieldControlProps {
  id: string
  'aria-describedby': string | undefined
  'aria-invalid': true | undefined
  required: boolean | undefined
  disabled: boolean | undefined
}

export interface FieldProps {
  /** Above the control, or beside it when `orientation` is `inline`. */
  label?: ReactNode
  /** The rule, in advance. Stays visible when there is also an error. */
  help?: ReactNode
  /** The violation. Its presence is what makes the field invalid. */
  error?: ReactNode
  /** Marks the control `required` and puts an asterisk on the label. */
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  /** `inline` puts the control before the label, for the checkbox family. */
  orientation?: 'stacked' | 'inline'
  /**
   * `fieldset` for a group of controls — a set of radios, a row of
   * checkboxes. The label becomes a `legend`, which is the only thing that
   * names a group, and `disabled` then disables every control inside it.
   */
  as?: 'div' | 'fieldset'
  /** Overrides the generated control id, for a consumer that manages its own. */
  id?: string
  className?: string
  /**
   * The control. As a function it receives the wiring — id, describedby,
   * invalid, required, disabled — which is how a control this kit does not
   * ship gets the same treatment as one it does.
   */
  children: ReactNode | ((control: FieldControlProps) => ReactNode)
}

/** Label text tracks the control it names. */
const labelText: Record<FieldSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
}

/** Help and error sit one step quieter than the label. */
const messageText: Record<FieldSize, string> = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
}

const present = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== ''

/**
 * The wrapper every form control in the kit renders through: label, help
 * text, error message and required marker, wired to the control so the
 * relationship is in the markup rather than in the layout.
 *
 * **Help stays visible when there is an error.** Help usually states the rule
 * and the error states the violation; hiding the rule at the moment it is
 * broken is backwards. Both are referenced by `aria-describedby`, in that
 * order.
 *
 * The error carries `role="alert"`, so a message that appears after a submit
 * is announced even when focus has not moved to the field. A form that moves
 * focus to its first invalid control — which it should — will hear it twice
 * in some screen readers; that is a better failure than silence.
 */
export function Field({
  label,
  help,
  error,
  required = false,
  disabled = false,
  size = 'md',
  orientation = 'stacked',
  as = 'div',
  id,
  className,
  children,
}: FieldProps) {
  const generated = useId()
  const controlId = id ?? `${generated}control`
  const helpId = `${generated}help`
  const errorId = `${generated}error`

  const hasHelp = present(help)
  const invalid = present(error)

  const describedBy =
    [hasHelp ? helpId : undefined, invalid ? errorId : undefined].filter(Boolean).join(' ') ||
    undefined

  const control: FieldControlProps = {
    id: controlId,
    'aria-describedby': describedBy,
    'aria-invalid': invalid || undefined,
    required: required || undefined,
    // A disabled fieldset disables its contents natively, so passing it down
    // as well would only duplicate what the browser already does.
    disabled: (as === 'fieldset' ? undefined : disabled) || undefined,
  }

  const rendered = typeof children === 'function' ? children(control) : children

  const marker = required ? (
    // The asterisk is decoration. `required` on the control is what a screen
    // reader announces, so reading "star" as well would say it twice.
    <span aria-hidden="true" className="ml-0.5 text-error">
      *
    </span>
  ) : null

  const messages = (
    <>
      {hasHelp ? (
        <p id={helpId} className={[messageText[size], 'text-muted'].join(' ')}>
          {help}
        </p>
      ) : null}
      {invalid ? (
        <p id={errorId} role="alert" className={[messageText[size], 'text-error'].join(' ')}>
          {error}
        </p>
      ) : null}
    </>
  )

  const shell = ['flex w-full flex-col gap-1.5', className ?? ''].join(' ').trim()

  if (orientation === 'inline') {
    return (
      <div className={shell}>
        {/* The label wraps the control rather than pointing at it: one element
            to click, and no `for` to fall out of step with the id. */}
        <label className="inline-flex w-fit cursor-pointer items-center gap-2">
          {rendered}
          {present(label) ? (
            <span className={[labelText[size], 'text-base-content'].join(' ')}>
              {label}
              {marker}
            </span>
          ) : null}
        </label>
        {messages}
      </div>
    )
  }

  if (as === 'fieldset') {
    return (
      <fieldset
        className={shell}
        disabled={disabled || undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      >
        {present(label) ? (
          <legend className={[labelText[size], 'font-medium text-base-content'].join(' ')}>
            {label}
            {marker}
          </legend>
        ) : null}
        {rendered}
        {messages}
      </fieldset>
    )
  }

  return (
    <div className={shell}>
      {present(label) ? (
        <label
          htmlFor={controlId}
          className={[labelText[size], 'font-medium text-base-content'].join(' ')}
        >
          {label}
          {marker}
        </label>
      ) : null}
      {rendered}
      {messages}
    </div>
  )
}
