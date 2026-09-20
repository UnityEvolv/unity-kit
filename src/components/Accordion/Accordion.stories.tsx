import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion } from './Accordion'
import type { AccordionItem, AccordionVariant } from './Accordion'

const items: AccordionItem[] = [
  { value: 'audio', title: 'Audio', content: 'Choose a microphone and speakers, and test them.' },
  { value: 'video', title: 'Video', content: 'Choose a camera and a background.' },
  { value: 'notifications', title: 'Notifications', content: 'When and how to be told.' },
  { value: 'billing', title: 'Billing', content: 'Cards and invoices.', disabled: true },
]

/**
 * A discriminated union of props leaves Storybook's args typed as never, so
 * the stories go through a wrapper with one flat shape.
 */
interface StoryArgs {
  items: AccordionItem[]
  variant?: AccordionVariant
  headingLevel?: 2 | 3 | 4
  /** Several open at once. */
  multiple?: boolean
  /** Open at first. */
  open?: string[]
  /** Single mode only: `false` keeps one section always open. */
  collapsible?: boolean
}

const AccordionStory = ({ multiple, open = [], collapsible, ...rest }: StoryArgs) =>
  multiple ? (
    <Accordion {...rest} type="multiple" defaultValue={open} />
  ) : (
    <Accordion {...rest} type="single" defaultValue={open[0]} collapsible={collapsible} />
  )

const meta = {
  title: 'Navigation/Accordion',
  component: AccordionStory,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['arrow', 'plus'] },
    headingLevel: { control: 'inline-radio', options: [2, 3, 4] },
  },
  args: { items },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccordionStory>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = { args: { open: ['audio'] } }

export const AlwaysOneOpen: Story = { args: { open: ['audio'], collapsible: false } }

export const Multiple: Story = { args: { multiple: true, open: ['audio', 'video'] } }

export const Plus: Story = { args: { variant: 'plus', open: ['video'] } }
