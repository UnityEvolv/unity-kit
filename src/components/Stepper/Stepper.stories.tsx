import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stepper } from './Stepper'
import { Wizard } from './Wizard'
import type { WizardApi } from './Wizard'
import { Button } from '../Button'
import { Input } from '../Input'
import { Checkbox } from '../Checkbox'

const steps = [
  { key: 'account', label: 'Account', description: 'Name and email' },
  { key: 'team', label: 'Team', description: 'Who is joining' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'done', label: 'Done' },
]

const meta = {
  title: 'Navigation/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'inline-radio', options: ['responsive', 'horizontal', 'vertical'] },
    current: { control: { type: 'number', min: 0, max: 3 } },
  },
  args: { steps, current: 1 },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

/** Resize below `sm`: the same list stands up vertically. */
export const Linear: Story = {}

/** Completed steps are buttons; the current and upcoming ones are not. */
const NonLinearExample = () => {
  const [current, setCurrent] = useState(2)
  return <Stepper steps={steps} current={current} onStepClick={setCurrent} />
}
export const NonLinear: Story = { render: () => <NonLinearExample /> }

export const AnyStepClickable: Story = {
  args: { current: 0, onStepClick: () => {}, allowUpcoming: true },
}

export const ErrorState: Story = { args: { current: 2, errorSteps: ['team'] } }

export const Vertical: Story = { args: { orientation: 'vertical' } }

/** The whole thing: a stepper with a memory, a validation gate and a footer. */
const WizardExample = () => {
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const gate = [name.trim().length > 0, true, agreed, true][index]

  if (finished) return <p className="text-sm">Setup complete. Welcome, {name}.</p>

  return (
    <Wizard
      index={index}
      onIndexChange={setIndex}
      canProceed={gate}
      onFinish={() => setFinished(true)}
      steps={[
        {
          key: 'account',
          label: 'Account',
          content: (
            <Input
              label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              help="Next unlocks once this is filled in."
              required
            />
          ),
        },
        {
          key: 'team',
          label: 'Team',
          content: (api: WizardApi) => (
            <div className="flex flex-col gap-3 text-sm">
              <p>Invite your team now, or skip and do it later.</p>
              <Button variant="secondary" size="sm" onClick={api.next}>
                Skip for now
              </Button>
            </div>
          ),
        },
        {
          key: 'rooms',
          label: 'Rooms',
          content: (
            <Checkbox
              label="Create the default rooms (Reception, Boardroom, Break room)"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
          ),
        },
        { key: 'done', label: 'Done', content: <p className="text-sm">Everything is ready.</p> },
      ]}
    />
  )
}

export const FullWizard: Story = {
  render: () => (
    <div className="w-[36rem] max-w-full">
      <WizardExample />
    </div>
  ),
}
