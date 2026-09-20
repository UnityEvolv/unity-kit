import * as RadixAccordion from '@radix-ui/react-accordion'
import type { ReactNode } from 'react'

export type AccordionVariant = 'arrow' | 'plus'

export interface AccordionItem {
  /** Stable identity, used for `value`. */
  value: string
  title: ReactNode
  content: ReactNode
  disabled?: boolean
}

interface AccordionBase {
  items: AccordionItem[]
  /** The marker at the end of each title. Defaults to `arrow`. */
  variant?: AccordionVariant
  /**
   * `h3` by default. Heading level depends on the page; a setup guide under
   * an `h2` wants `h3` here, a settings page section may want `h2`.
   */
  headingLevel?: 2 | 3 | 4
  className?: string
}

interface SingleAccordion extends AccordionBase {
  /** One section open at a time. The default. */
  type?: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** `false` keeps one section always open. Defaults to `true`. */
  collapsible?: boolean
}

interface MultipleAccordion extends AccordionBase {
  /** Any number open at once, for a settings page. */
  type: 'multiple'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type AccordionProps = SingleAccordion | MultipleAccordion

/**
 * Class names in full, as everywhere in the kit.
 *
 * daisyUI's `collapse` is a grid whose second row grows when the block is
 * open, and it reads "open" from a checked input, a focused `tabindex`, an
 * `[open]` details, or the `collapse-open` class. Radix keeps the state on a
 * `data-state` attribute, so `collapse-open` is applied through a Tailwind
 * data variant — the same trick as `Tabs`, and again one source of truth.
 * The arrow rotation is `collapse-arrow`'s own and keys off the same class.
 *
 * The item is `bordered` rather than daisyUI's default because a stack of
 * sections with no edges reads as one long page.
 */
const item: Record<AccordionVariant, string> = {
  arrow:
    'collapse collapse-arrow rounded-box border border-base-300 bg-base-100 data-[state=open]:collapse-open',
  plus: 'collapse collapse-plus rounded-box border border-base-300 bg-base-100 data-[state=open]:collapse-open',
}

const TRIGGER =
  'flex w-full items-center rounded-box text-start font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Sections that open and close: settings groups, a setup guide, an FAQ.
 *
 * Radix owns the behaviour — `aria-expanded` and `aria-controls` on each
 * trigger, arrow keys between triggers, Home and End, single or multiple
 * open, controlled or not — and daisyUI's `collapse` owns the look. Each
 * title is a real button inside a heading, so the page outline and the tab
 * order both work without any extra wiring.
 */
export function Accordion(props: AccordionProps) {
  const { items, variant = 'arrow', headingLevel = 3, className } = props
  const Heading = `h${headingLevel}` as const

  const list = items.map((entry) => (
    <RadixAccordion.Item
      key={entry.value}
      value={entry.value}
      disabled={entry.disabled}
      className={item[variant]}
    >
      <RadixAccordion.Header asChild>
        <Heading className="collapse-title p-0 text-base">
          <RadixAccordion.Trigger className={[TRIGGER, 'px-4 py-3'].join(' ')}>
            {entry.title}
          </RadixAccordion.Trigger>
        </Heading>
      </RadixAccordion.Header>
      <RadixAccordion.Content className="collapse-content text-sm">
        {entry.content}
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  ))

  const classes = ['flex flex-col gap-2', className ?? ''].join(' ').trim()

  if (props.type === 'multiple') {
    return (
      <RadixAccordion.Root
        type="multiple"
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        className={classes}
      >
        {list}
      </RadixAccordion.Root>
    )
  }

  return (
    <RadixAccordion.Root
      type="single"
      collapsible={props.collapsible ?? true}
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      className={classes}
    >
      {list}
    </RadixAccordion.Root>
  )
}

/** One valid set of props for the blind install test. */
Accordion.sampleProps = {
  items: [
    { value: 'audio', title: 'Audio', content: 'Microphone and speaker settings.' },
    { value: 'video', title: 'Video', content: 'Camera settings.' },
  ],
  defaultValue: 'audio',
} satisfies AccordionProps
