import type { ReactNode } from 'react'
import { Icon } from '../Icon'

export type StepStatus = 'upcoming' | 'current' | 'complete' | 'error'
export type StepperOrientation = 'horizontal' | 'vertical' | 'responsive'

export interface Step {
  /** Stable identity, used for keys and for `errorSteps`. */
  key: string
  label: ReactNode
  /** A quieter line under the label. */
  description?: ReactNode
}

export interface StepperProps {
  steps: Step[]
  /** Index of the current step. Everything before it is complete, after it upcoming. */
  current: number
  /** Keys of steps that failed validation. Overrides complete or current. */
  errorSteps?: string[]
  /**
   * `responsive` (the default) is vertical below `sm` and horizontal above,
   * which is the story's "sensible default"; the other two pin it.
   */
  orientation?: StepperOrientation
  /**
   * Makes completed steps (and steps in error) buttons. Upcoming steps stay
   * plain unless `allowUpcoming` says otherwise — a linear flow should not
   * offer a jump past the gate.
   */
  onStepClick?: (index: number) => void
  allowUpcoming?: boolean
  /** Names the list for assistive technology. Defaults to "Progress". */
  label?: string
  className?: string
}

/**
 * Class names in full, as everywhere in the kit. daisyUI's `steps` draws the
 * connectors and numbered discs with CSS counters; `step-primary` colours a
 * step and its connector from the previous one, `step-error` the same in red.
 * The disc's content comes from a `step-icon` child when there is one, so a
 * complete step shows a check and an error step a mark rather than a number
 * — the state is never colour alone (WCAG 1.4.1).
 */
const orientationClass: Record<StepperOrientation, string> = {
  horizontal: 'steps steps-horizontal w-full',
  vertical: 'steps steps-vertical',
  responsive: 'steps steps-vertical sm:steps-horizontal sm:w-full',
}

const stepClass: Record<StepStatus, string> = {
  upcoming: 'step',
  current: 'step step-primary',
  complete: 'step step-primary',
  error: 'step step-error',
}

/** What a screen reader hears after the label, since the disc is CSS. */
const spoken: Record<StepStatus, string | null> = {
  upcoming: 'not started',
  current: null,
  complete: 'complete',
  error: 'has an error',
}

export const statusOf = (
  index: number,
  current: number,
  key: string,
  errorSteps: readonly string[] = [],
): StepStatus => {
  if (errorSteps.includes(key)) return 'error'
  if (index < current) return 'complete'
  if (index === current) return 'current'
  return 'upcoming'
}

/**
 * Where you are in a multi-step flow, and how far there is to go.
 *
 * An ordered list, because the steps are ordered and a screen reader then
 * announces "step 2 of 5" for free; the current step carries
 * `aria-current="step"`. The kit draws the indicator and nothing else — what
 * a step contains is `Wizard`'s or the consumer's.
 */
export function Stepper({
  steps,
  current,
  errorSteps = [],
  orientation = 'responsive',
  onStepClick,
  allowUpcoming = false,
  label = 'Progress',
  className,
}: StepperProps) {
  return (
    <ol
      aria-label={label}
      className={[orientationClass[orientation], className ?? ''].join(' ').trim()}
    >
      {steps.map((step, index) => {
        const status = statusOf(index, current, step.key, errorSteps)
        const clickable =
          onStepClick !== undefined &&
          status !== 'current' &&
          (status !== 'upcoming' || allowUpcoming)
        const text = (
          <>
            <span className={status === 'current' ? 'font-semibold' : undefined}>{step.label}</span>
            {spoken[status] === null ? null : <span className="sr-only">, {spoken[status]}</span>}
            {step.description === undefined ? null : (
              <span className="block text-xs text-muted">{step.description}</span>
            )}
          </>
        )
        return (
          <li
            key={step.key}
            className={stepClass[status]}
            aria-current={status === 'current' ? 'step' : undefined}
          >
            {status === 'complete' ? (
              <span className="step-icon">
                <Icon name="check" size="xs" />
              </span>
            ) : status === 'error' ? (
              <span className="step-icon">
                <Icon name="close" size="xs" />
              </span>
            ) : null}
            {clickable ? (
              <button
                type="button"
                className="rounded-field text-sm hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                onClick={() => onStepClick(index)}
              >
                {text}
              </button>
            ) : (
              <span className="text-sm">{text}</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** One valid set of props for the blind install test. */
Stepper.sampleProps = {
  steps: [
    { key: 'account', label: 'Account' },
    { key: 'team', label: 'Team' },
    { key: 'done', label: 'Done' },
  ],
  current: 1,
} satisfies StepperProps
