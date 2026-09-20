import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '../Button'
import { Stepper } from './Stepper'
import type { Step, StepperOrientation } from './Stepper'

export interface WizardApi {
  /** Index of the active step. */
  index: number
  count: number
  isFirst: boolean
  isLast: boolean
  /** Whether Next is allowed right now. */
  canProceed: boolean
  next: () => void
  back: () => void
  goTo: (index: number) => void
}

export interface WizardStep extends Step {
  /** The step's body. A function receives the wizard's controls. */
  content: ReactNode | ((api: WizardApi) => ReactNode)
}

export interface WizardProps {
  steps: WizardStep[]
  /** The active step. Controlled; leave off to let the wizard hold it. */
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /**
   * The validation gate. `false` disables Next and blocks `next()` and any
   * jump forward, while Back still works — the current step is not done.
   */
  canProceed?: boolean
  /** Keys of steps that failed, shown in the indicator. */
  errorSteps?: string[]
  /**
   * `true` (the default) lets the indicator jump back to completed steps
   * only. `false` makes every step clickable, for a form that can be filled
   * in any order.
   */
  linear?: boolean
  /** Called when Next is pressed on the last step. */
  onFinish?: () => void
  /**
   * Replaces the default Back / Next footer. A function so the consumer's
   * buttons can call the same controls.
   */
  footer?: (api: WizardApi) => ReactNode
  backLabel?: string
  nextLabel?: string
  finishLabel?: string
  orientation?: StepperOrientation
  /** Names the step indicator. Defaults to "Progress". */
  label?: string
  className?: string
}

/**
 * A `Stepper` with a memory: it holds the active index, renders that step's
 * content and gives Back and Next something to do.
 *
 * It knows nothing about what a step contains. Content is the consumer's,
 * and so is validation — the wizard only honours `canProceed`, which is the
 * one thing it needs to keep a user from advancing past an unfinished step.
 * The controls are handed to content and footer as render-prop arguments
 * rather than through context, so a step can be a plain component with no
 * hook to import.
 */
export function Wizard({
  steps,
  index,
  defaultIndex = 0,
  onIndexChange,
  canProceed = true,
  errorSteps,
  linear = true,
  onFinish,
  footer,
  backLabel = 'Back',
  nextLabel = 'Next',
  finishLabel = 'Finish',
  orientation,
  label,
  className,
}: WizardProps) {
  const [internal, setInternal] = useState(defaultIndex)
  const active = Math.min(Math.max(0, index ?? internal), Math.max(0, steps.length - 1))
  const count = steps.length

  const goTo = (target: number) => {
    const clamped = Math.min(Math.max(0, target), count - 1)
    if (clamped === active) return
    // Forward past the gate is refused; backward is always allowed.
    if (clamped > active && !canProceed) return
    if (index === undefined) setInternal(clamped)
    onIndexChange?.(clamped)
  }

  const api: WizardApi = {
    index: active,
    count,
    isFirst: active === 0,
    isLast: active === count - 1,
    canProceed,
    goTo,
    back: () => goTo(active - 1),
    next: () => {
      if (!canProceed) return
      if (active === count - 1) onFinish?.()
      else goTo(active + 1)
    },
  }

  const step = steps[active]
  const body = typeof step?.content === 'function' ? step.content(api) : step?.content

  return (
    <div className={['flex flex-col gap-6', className ?? ''].join(' ').trim()}>
      <Stepper
        steps={steps}
        current={active}
        errorSteps={errorSteps}
        orientation={orientation}
        label={label}
        onStepClick={goTo}
        allowUpcoming={!linear}
      />
      <div
        role="region"
        aria-label={
          typeof step?.label === 'string'
            ? `Step ${active + 1} of ${count}: ${step.label}`
            : `Step ${active + 1} of ${count}`
        }
      >
        {body}
      </div>
      {footer ? (
        footer(api)
      ) : (
        <div className="flex justify-between gap-2">
          <Button variant="ghost" onClick={api.back} disabled={api.isFirst}>
            {backLabel}
          </Button>
          <Button onClick={api.next} disabled={!canProceed}>
            {api.isLast ? finishLabel : nextLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

/** One valid set of props for the blind install test. */
Wizard.sampleProps = {
  steps: [
    { key: 'account', label: 'Account', content: 'Account details' },
    { key: 'team', label: 'Team', content: 'Invite people' },
  ],
} satisfies WizardProps
