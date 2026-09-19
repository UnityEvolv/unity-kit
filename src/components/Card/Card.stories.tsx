import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './Card'
import type { CardVariant } from './Card'
import { Badge } from '../Badge'
import { Button } from '../Button'

const meta = {
  title: 'Primitives/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['bordered', 'elevated', 'interactive'],
      description:
        'interactive is bordered plus a hover and a focus ring. Giving the card an href turns those on whichever variant is chosen.',
    },
    mediaPosition: { control: 'inline-radio', options: ['top', 'bottom', 'side'] },
    href: { control: 'text' },
  },
  args: { children: 'Six seats, a whiteboard and a door that closes.' },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

const variants: CardVariant[] = ['bordered', 'elevated', 'interactive']

/** A placeholder for whatever the app puts in the media slot. */
const Plan = () => (
  <div className="flex h-32 w-full items-center justify-center bg-base-300 text-xs">
    floor plan
  </div>
)

export const Default: Story = {
  render: (args) => <Card {...args} className="w-80" header="Reception" />,
}

/** Check this in both themes; it is the fastest way to spot a token regression. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-4">
      {variants.map((variant) => (
        <Card key={variant} {...args} variant={variant} className="w-72" header={variant} />
      ))}
    </div>
  ),
}

/**
 * The header is daisyUI's title row, so a title and a marker sit at opposite
 * ends without the consumer laying them out. Pass a heading element if the
 * card titles a section — the level depends on the page, so the kit does not
 * choose it.
 */
export const HeaderAndFooter: Story = {
  render: (args) => (
    <Card
      {...args}
      className="w-96"
      header={
        <>
          <h3>Reception</h3>
          <Badge size="sm" variant="secondary" icon="users">
            4 here
          </Badge>
        </>
      }
      footer={
        <>
          <Button variant="ghost" size="sm">
            Details
          </Button>
          <Button size="sm" icon="video">
            Join
          </Button>
        </>
      }
    />
  ),
}

export const Media: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-4">
      <Card {...args} className="w-72" header="Media on top" media={<Plan />} />
      <Card
        {...args}
        className="w-72"
        header="Media below"
        media={<Plan />}
        mediaPosition="bottom"
      />
      <Card
        {...args}
        className="w-[28rem]"
        header="Media alongside"
        media={<div className="h-full w-32 bg-base-300" />}
        mediaPosition="side"
      />
    </div>
  ),
}

/**
 * An anchor, so the whole card is focusable and activates from the keyboard
 * without this component hand-rolling either. On a client-side router, use
 * `variant="interactive"` and supply the router's own link instead — the kit
 * will not import one.
 */
export const AsLink: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-4">
      <Card {...args} className="w-72" href="#reception" header="A link" />
      <Card
        {...args}
        className="w-72"
        href="#reception"
        variant="elevated"
        header="A raised link"
      />
    </div>
  ),
}

/**
 * What a card is actually for. Charts are deliberately not in the kit: the app
 * renders its own inside a card, which is why the body is a plain slot.
 */
export const InContext: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <Card
        header={
          <>
            <h3>Calls this week</h3>
            <Badge size="sm" variant="ghost" outline>
              live
            </Badge>
          </>
        }
      >
        <div className="flex h-40 items-center justify-center rounded-box bg-base-200 text-xs text-muted">
          the app renders its own chart here
        </div>
      </Card>
      <Card
        variant="interactive"
        header={<h3>Focus room</h3>}
        footer={
          <Button size="sm" variant="ghost" icon="lock">
            Lock
          </Button>
        }
      >
        Quiet by default. Knock to be let in.
      </Card>
    </div>
  ),
}
