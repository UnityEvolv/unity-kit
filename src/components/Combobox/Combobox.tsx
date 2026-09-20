import { useId, useMemo, useRef, useState } from 'react'
import * as RadixPopover from '@radix-ui/react-popover'
import type { KeyboardEvent, ReactNode } from 'react'
import { Field } from '../Field'
import type { FieldProps, FieldSize } from '../Field'
import { Icon } from '../Icon'
import { PANEL } from '../Popover/Popover'
import { spinnerClass } from '../Spinner/Spinner'

/**
 * The least an option needs. Consumers extend it with whatever their option
 * renderer wants — an avatar URL, an email, a role — and get the extended
 * type back in `renderOption` and `onChange`.
 */
export interface ComboboxOption {
  value: string
  label: string
  /** A second, quieter line. The default renderer shows it. */
  description?: string
  disabled?: boolean
}

export interface ComboboxOptionState {
  selected: boolean
  active: boolean
}

interface ComboboxBase<Option extends ComboboxOption> extends Pick<
  FieldProps,
  'label' | 'help' | 'error' | 'size' | 'required' | 'disabled' | 'id'
> {
  /** What can be picked. Filtered here by label unless `onSearch` is given. */
  options: Option[]
  placeholder?: string
  /**
   * Called with what the user typed. When given, filtering is the caller's:
   * the list shows `options` as they are, so a fetch-on-type consumer can
   * swap them as results arrive. Also called with `''` when the list opens.
   */
  onSearch?: (query: string) => void
  /** Shows a spinner in the list while results are on their way. */
  loading?: boolean
  /** Replaces the default "No matches". */
  emptyMessage?: ReactNode
  /** Draws an option. Defaults to label plus description. */
  renderOption?: (option: Option, state: ComboboxOptionState) => ReactNode
  className?: string
  name?: string
}

interface SingleCombobox<Option extends ComboboxOption> extends ComboboxBase<Option> {
  multiple?: false
  value?: string | null
  defaultValue?: string | null
  onChange?: (value: string | null, option: Option | null) => void
}

interface MultiCombobox<Option extends ComboboxOption> extends ComboboxBase<Option> {
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onChange?: (value: string[], options: Option[]) => void
}

export type ComboboxProps<Option extends ComboboxOption = ComboboxOption> =
  SingleCombobox<Option> | MultiCombobox<Option>

/**
 * Class names in full, as everywhere in the kit. The outer box is daisyUI's
 * `input` so it matches every other field, with its fixed height released so
 * chips can wrap onto a second line.
 */
const box: Record<FieldSize, string> = {
  xs: 'input input-xs h-auto min-h-6 w-full flex-wrap gap-1 py-0.5',
  sm: 'input input-sm h-auto min-h-8 w-full flex-wrap gap-1 py-1',
  md: 'input input-md h-auto min-h-10 w-full flex-wrap gap-1 py-1',
  lg: 'input input-lg h-auto min-h-12 w-full flex-wrap gap-1.5 py-1.5',
}

const chip: Record<FieldSize, string> = {
  xs: 'badge badge-xs badge-neutral gap-0.5',
  sm: 'badge badge-sm badge-neutral gap-1',
  md: 'badge badge-sm badge-neutral gap-1',
  lg: 'badge badge-md badge-neutral gap-1',
}

const OPTION =
  'flex cursor-pointer items-center gap-2 rounded-field px-3 py-2 text-sm text-base-content data-[active=true]:bg-base-200 aria-disabled:cursor-not-allowed aria-disabled:opacity-50'

const asArray = (value: string | string[] | null | undefined): string[] =>
  value === null || value === undefined ? [] : Array.isArray(value) ? value : [value]

const matches = (option: ComboboxOption, query: string) =>
  option.label.toLowerCase().includes(query.trim().toLowerCase())

/**
 * A text input that filters a list, picking one option or several.
 *
 * The ARIA combobox pattern, done by hand: the input is the combobox, the
 * list is a listbox, and `aria-activedescendant` points at the highlighted
 * option while focus never leaves the input — which is why the arrow keys
 * move a highlight rather than the caret, and why Radix's popover is used
 * only for positioning. Its `Anchor` is used rather than its `Trigger`: a
 * trigger toggles on click and announces itself as opening a dialog, and
 * both are wrong for a field you type into.
 *
 * It holds no data. Options come in as props; with `onSearch` the filtering
 * is the caller's as well, so a fetch-on-type consumer swaps `options` as
 * results arrive and flips `loading` meanwhile.
 *
 * Replaces `Select` wherever the option count is unbounded. `Select` stays
 * for a short, fixed list — it is native, and native opens best on a phone.
 */
export function Combobox<Option extends ComboboxOption>(props: ComboboxProps<Option>) {
  const {
    options,
    placeholder,
    onSearch,
    loading = false,
    emptyMessage = 'No matches',
    renderOption,
    label,
    help,
    error,
    size = 'md',
    required,
    disabled,
    id,
    className,
    name,
  } = props
  const multiple = props.multiple === true

  const [internal, setInternal] = useState<string[]>(() => asArray(props.defaultValue))
  const controlled = props.value !== undefined
  const selected = controlled ? asArray(props.value) : internal

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  // Only a query the user typed filters the list. Opening on a selected value
  // shows that value in the input without hiding every other option.
  const [typed, setTyped] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const listId = `${useId()}-listbox`

  const byValue = useMemo(() => new Map(options.map((option) => [option.value, option])), [options])
  const selectedOptions = selected.map((value) => byValue.get(value)).filter(Boolean) as Option[]
  const single = !multiple ? (selectedOptions[0] ?? null) : null

  const visible = useMemo(
    () => (onSearch || !typed ? options : options.filter((option) => matches(option, query))),
    [onSearch, typed, options, query],
  )

  const commit = (next: string[]) => {
    if (!controlled) setInternal(next)
    if (props.multiple === true) {
      props.onChange?.(next, next.map((value) => byValue.get(value)).filter(Boolean) as Option[])
    } else {
      const value = next[0] ?? null
      props.onChange?.(value, value === null ? null : (byValue.get(value) ?? null))
    }
  }

  const show = () => {
    if (disabled || open) return
    setOpen(true)
    setTyped(false)
    setQuery('')
    setActive(null)
    onSearch?.('')
  }

  const hide = () => {
    setOpen(false)
    setTyped(false)
    setQuery('')
    setActive(null)
  }

  const pick = (option: Option) => {
    if (option.disabled) return
    if (multiple) {
      const has = selected.includes(option.value)
      commit(has ? selected.filter((value) => value !== option.value) : [...selected, option.value])
      setQuery('')
      setTyped(false)
      inputRef.current?.focus()
    } else {
      commit([option.value])
      hide()
    }
  }

  const remove = (value: string) => {
    commit(selected.filter((entry) => entry !== value))
    inputRef.current?.focus()
  }

  // The highlight falls back to the chosen option, then the first, whenever
  // the remembered one is not in the list — so it never points at nothing and
  // needs no effect to keep it honest.
  const enabled = visible.filter((option) => !option.disabled)
  const activeOption =
    enabled.find((option) => option.value === active) ??
    enabled.find((option) => selected.includes(option.value)) ??
    enabled[0] ??
    null

  const move = (step: number) => {
    if (enabled.length === 0) return
    const index = activeOption === null ? -1 : enabled.indexOf(activeOption)
    const next = Math.min(Math.max(0, index + step), enabled.length - 1)
    setActive(enabled[next].value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) show()
        else move(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) show()
        else move(-1)
        break
      case 'Home':
        if (!open) return
        event.preventDefault()
        move(-enabled.length)
        break
      case 'End':
        if (!open) return
        event.preventDefault()
        move(enabled.length)
        break
      case 'Enter':
        if (!open) return
        event.preventDefault()
        if (activeOption) pick(activeOption)
        break
      case 'Escape':
        if (!open) return
        event.preventDefault()
        hide()
        break
      case 'Tab':
        if (open) hide()
        break
      case 'Backspace':
        if (multiple && query === '' && selected.length > 0) remove(selected[selected.length - 1])
        break
    }
  }

  // The input shows the chosen label while closed; typing replaces it.
  const text = !multiple && !open ? (single?.label ?? '') : query
  const activeIndex = activeOption ? visible.indexOf(activeOption) : -1
  const optionId = (index: number) => `${listId}-${index}`

  return (
    <Field
      label={label}
      help={help}
      error={error}
      size={size}
      required={required}
      disabled={disabled}
      id={id}
      className={className}
    >
      {(control) => (
        <RadixPopover.Root
          open={open && !disabled}
          onOpenChange={(next) => (next ? show() : hide())}
        >
          <RadixPopover.Anchor asChild>
            <div
              ref={anchorRef}
              className={[box[size], control['aria-invalid'] === true ? 'input-error' : '']
                .join(' ')
                .trim()}
              onMouseDown={(event) => {
                // Clicking the box, not a chip button, puts the caret in the
                // input and opens the list, as clicking a select would.
                if (event.target === event.currentTarget) {
                  event.preventDefault()
                  inputRef.current?.focus()
                  show()
                }
              }}
            >
              {multiple
                ? selectedOptions.map((option) => (
                    <span key={option.value} className={chip[size]}>
                      {option.label}
                      <button
                        type="button"
                        className="rounded-full hover:opacity-70"
                        aria-label={`Remove ${option.label}`}
                        disabled={disabled}
                        onClick={() => remove(option.value)}
                      >
                        <Icon name="close" size="xs" />
                      </button>
                    </span>
                  ))
                : null}
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
                aria-autocomplete="list"
                aria-haspopup="listbox"
                autoComplete="off"
                className="min-w-16 flex-1 bg-transparent outline-none"
                placeholder={multiple && selected.length > 0 ? undefined : placeholder}
                value={text}
                onChange={(event) => {
                  if (!open) show()
                  setQuery(event.target.value)
                  setTyped(true)
                  onSearch?.(event.target.value)
                }}
                onClick={show}
                onKeyDown={onKeyDown}
                {...control}
              />
              {name === undefined
                ? null
                : selected.map((value) => (
                    <input key={value} type="hidden" name={name} value={value} />
                  ))}
            </div>
          </RadixPopover.Anchor>
          <RadixPopover.Portal>
            <RadixPopover.Content
              className={[PANEL, 'w-[var(--radix-popover-trigger-width)]'].join(' ')}
              side="bottom"
              align="start"
              sideOffset={4}
              collisionPadding={8}
              onOpenAutoFocus={(event) => event.preventDefault()}
              onCloseAutoFocus={(event) => event.preventDefault()}
              onInteractOutside={(event) => {
                // The input is outside the panel but is where the user is
                // typing; a click there must not close the list.
                if (anchorRef.current?.contains(event.target as Node)) event.preventDefault()
              }}
            >
              <ul
                id={listId}
                role="listbox"
                aria-multiselectable={multiple || undefined}
                aria-label={typeof label === 'string' ? label : undefined}
                className="max-h-64 overflow-y-auto p-1"
              >
                {visible.map((option, index) => {
                  const isSelected = selected.includes(option.value)
                  const isActive = option === activeOption
                  return (
                    <li
                      key={option.value}
                      id={optionId(index)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      data-active={isActive}
                      className={OPTION}
                      ref={
                        isActive ? (node) => node?.scrollIntoView({ block: 'nearest' }) : undefined
                      }
                      onMouseMove={() => {
                        if (!option.disabled && !isActive) setActive(option.value)
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => pick(option)}
                    >
                      <span className="min-w-0 flex-1">
                        {renderOption ? (
                          renderOption(option, { selected: isSelected, active: isActive })
                        ) : (
                          <>
                            <span className="block truncate">{option.label}</span>
                            {option.description === undefined ? null : (
                              <span className="block truncate text-xs text-muted">
                                {option.description}
                              </span>
                            )}
                          </>
                        )}
                      </span>
                      {isSelected ? <Icon name="check" size="sm" className="shrink-0" /> : null}
                    </li>
                  )
                })}
              </ul>
              {loading ? (
                <div role="status" className="flex items-center gap-2 px-3 py-2 text-sm text-muted">
                  <span className={spinnerClass('xs')} aria-hidden="true" />
                  Loading…
                </div>
              ) : visible.length === 0 ? (
                <div role="status" className="px-3 py-2 text-sm text-muted">
                  {emptyMessage}
                </div>
              ) : null}
            </RadixPopover.Content>
          </RadixPopover.Portal>
        </RadixPopover.Root>
      )}
    </Field>
  )
}

/**
 * One valid set of props for the blind install test, which renders every
 * export with no knowledge of their types. Declaring it also stops the test
 * passing children.
 */
Combobox.sampleProps = {
  label: 'Person',
  options: [
    { value: 'sasha', label: 'Sasha Kim' },
    { value: 'jo', label: 'Jo Ortega' },
  ],
} satisfies ComboboxProps
