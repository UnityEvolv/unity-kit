import { useId, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, ReactNode } from 'react'
import { Alert } from '../Alert'
import { Button } from '../Button'
import { Field } from '../Field'
import type { FieldProps } from '../Field'
import { Icon } from '../Icon'
import { Progress } from '../Progress'

export type DropzoneRejectionReason = 'type' | 'size' | 'count'

export interface DropzoneRejection {
  file: File
  reason: DropzoneRejectionReason
  /** Ready to show: "report.exe is not an accepted type." */
  message: string
}

export interface DropzoneProps extends Pick<
  FieldProps,
  'label' | 'help' | 'error' | 'required' | 'disabled' | 'id'
> {
  /** The selected files. Controlled; leave off to let the dropzone hold them. */
  files?: File[]
  onChange?: (files: File[]) => void
  /** Called with what was refused and why, after the inline errors are shown. */
  onReject?: (rejections: DropzoneRejection[]) => void
  /** Several at once. Off, a new file replaces the old one. */
  multiple?: boolean
  /**
   * Same syntax as the input attribute: a comma-separated list of MIME types
   * (`image/*`, `application/pdf`) and extensions (`.csv`). It also filters
   * dropped files, which the attribute alone never does.
   */
  accept?: string
  /** Bytes. */
  maxSize?: number
  /** Counting files already selected. Only meaningful with `multiple`. */
  maxFiles?: number
  /**
   * Upload progress per file, 0–100, keyed by `fileKey(file)`. The kit
   * draws the bar; whoever is uploading owns the number.
   */
  progress?: Record<string, number>
  /** An upload failure per file, keyed by `fileKey(file)`, shown under its row. */
  fileErrors?: Record<string, ReactNode>
  /** Replaces the prompt inside the target. */
  children?: ReactNode
  className?: string
}

/**
 * A stable key for a `File`, since two objects for the same file are not
 * equal and a `File` has no id. Name, size and modification time together
 * are as close as the platform gets.
 */
export const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`

const UNITS = ['B', 'KB', 'MB', 'GB']

export const formatBytes = (bytes: number) => {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  // One decimal below 10, none above, and never a trailing ".0".
  const rounded = unit === 0 || value >= 10 ? Math.round(value) : Math.round(value * 10) / 10
  return `${rounded} ${UNITS[unit]}`
}

/** Does the file satisfy an `accept` list? Empty list accepts everything. */
export const accepts = (file: File, accept: string | undefined) => {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => {
      if (entry.startsWith('.')) return name.endsWith(entry)
      if (entry.endsWith('/*')) return type.startsWith(entry.slice(0, -1))
      return type === entry
    })
}

/**
 * Class names in full, as everywhere in the kit. daisyUI's `file-input`
 * styles the bare input and nothing else, so the target is the kit's own:
 * a dashed frame that answers to hover, keyboard focus, a file held over it,
 * an error and being disabled.
 */
type ZoneState = 'idle' | 'over' | 'error' | 'disabled'

const zone: Record<ZoneState, string> = {
  idle: 'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-box border-2 border-dashed border-base-300 bg-base-100 px-6 py-8 text-center text-sm text-base-content transition-colors hover:border-primary hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  over: 'flex w-full cursor-copy flex-col items-center justify-center gap-2 rounded-box border-2 border-dashed border-primary bg-base-200 px-6 py-8 text-center text-sm text-base-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  error:
    'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-box border-2 border-dashed border-error bg-base-100 px-6 py-8 text-center text-sm text-base-content hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  disabled:
    'flex w-full cursor-not-allowed flex-col items-center justify-center gap-2 rounded-box border-2 border-dashed border-base-300 bg-base-200 px-6 py-8 text-center text-sm text-muted opacity-60',
}

/**
 * A target to drop files on or click to browse. It collects files and
 * reports them; uploading, storage and retries are the consumer's, which is
 * why progress and per-file errors come in as props keyed by `fileKey`.
 *
 * The target is a real `<button>`: focusable, and Enter and Space open the
 * picker with no key handling of the kit's own. The `<input type="file">`
 * beside it is what actually opens the dialog and is hidden from the tab
 * order, since the button already stands in for it.
 *
 * Rejections are shown inline as an alert and also handed to `onReject`.
 * They are the dropzone's own state rather than the Field's `error`, which
 * stays for whatever the form has to say ("At least one file is required").
 */
export function Dropzone({
  files,
  onChange,
  onReject,
  multiple = false,
  accept,
  maxSize,
  maxFiles,
  progress = {},
  fileErrors = {},
  label,
  help,
  error,
  required,
  disabled,
  id,
  children,
  className,
}: DropzoneProps) {
  const [internal, setInternal] = useState<File[]>([])
  const selected = files ?? internal
  const [over, setOver] = useState(false)
  const [rejections, setRejections] = useState<DropzoneRejection[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const commit = (next: File[]) => {
    if (files === undefined) setInternal(next)
    onChange?.(next)
  }

  const take = (incoming: File[]) => {
    if (disabled || incoming.length === 0) return
    const refused: DropzoneRejection[] = []
    const kept: File[] = []
    const room = multiple ? (maxFiles ?? Infinity) - selected.length : 1
    for (const file of incoming) {
      if (!accepts(file, accept)) {
        refused.push({ file, reason: 'type', message: `${file.name} is not an accepted type.` })
      } else if (maxSize !== undefined && file.size > maxSize) {
        refused.push({
          file,
          reason: 'size',
          message: `${file.name} is ${formatBytes(file.size)}; the limit is ${formatBytes(maxSize)}.`,
        })
      } else if (kept.length >= room) {
        refused.push({
          file,
          reason: 'count',
          message: multiple
            ? `${file.name} was skipped: at most ${maxFiles} files.`
            : `${file.name} was skipped: one file only.`,
        })
      } else {
        kept.push(file)
      }
    }
    setRejections(refused)
    if (refused.length > 0) onReject?.(refused)
    if (kept.length > 0) commit(multiple ? [...selected, ...kept] : kept)
  }

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    take(Array.from(event.target.files ?? []))
    // Cleared so picking the same file again still fires a change.
    event.target.value = ''
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setOver(false)
    take(Array.from(event.dataTransfer?.files ?? []))
  }

  const remove = (key: string) => commit(selected.filter((file) => fileKey(file) !== key))

  const state: ZoneState = disabled
    ? 'disabled'
    : over
      ? 'over'
      : error || rejections.length > 0
        ? 'error'
        : 'idle'

  const hint = [
    accept
      ? accept
          .split(',')
          .map((entry) => entry.trim())
          .join(', ')
      : null,
    maxSize !== undefined ? `up to ${formatBytes(maxSize)}` : null,
    multiple && maxFiles !== undefined ? `at most ${maxFiles} files` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Field
      label={label}
      help={help}
      error={error}
      required={required}
      disabled={disabled}
      id={id}
      className={className}
    >
      {(control) => (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            id={control.id}
            aria-describedby={control['aria-describedby']}
            aria-invalid={control['aria-invalid']}
            disabled={disabled}
            className={zone[state]}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault()
              if (!disabled && !over) setOver(true)
            }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
          >
            {children ?? (
              <>
                <Icon name="upload" size="lg" className="text-muted" />
                <span>
                  <span className="font-medium">
                    {multiple ? 'Drag files here' : 'Drag a file here'}
                  </span>{' '}
                  or browse
                </span>
                {hint ? <span className="text-xs text-muted">{hint}</span> : null}
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            onChange={onInput}
          />

          {rejections.length > 0 ? (
            <Alert
              variant="danger"
              title="Some files were not added"
              onDismiss={() => setRejections([])}
            >
              <ul className="list-inside list-disc">
                {rejections.map((rejection, index) => (
                  <li key={index}>{rejection.message}</li>
                ))}
              </ul>
            </Alert>
          ) : null}

          {selected.length > 0 ? (
            <ul id={listId} aria-label="Selected files" className="flex flex-col gap-2">
              {selected.map((file) => {
                const key = fileKey(file)
                const value = progress[key]
                const failure = fileErrors[key]
                return (
                  <li
                    key={key}
                    className="flex flex-col gap-1 rounded-box border border-base-300 bg-base-100 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="file" size="sm" className="shrink-0 text-muted" />
                      <span className="min-w-0 flex-1 truncate">{file.name}</span>
                      <span className="shrink-0 text-xs text-muted">{formatBytes(file.size)}</span>
                      {value === 100 ? (
                        <Icon name="check" size="sm" title="Uploaded" className="text-success" />
                      ) : null}
                      <Button
                        variant="ghost"
                        size="xs"
                        icon="close"
                        aria-label={`Remove ${file.name}`}
                        disabled={disabled}
                        onClick={() => remove(key)}
                      />
                    </div>
                    {value !== undefined && value < 100 ? (
                      <Progress value={value} aria-label={`Upload progress for ${file.name}`} />
                    ) : null}
                    {failure === undefined ? null : (
                      <p role="alert" className="text-xs text-error">
                        {failure}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      )}
    </Field>
  )
}

/** One valid set of props for the blind install test. */
Dropzone.sampleProps = { label: 'Attachments', multiple: true } satisfies DropzoneProps
