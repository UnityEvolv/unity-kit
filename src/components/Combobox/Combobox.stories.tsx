import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Combobox } from './Combobox'
import type { ComboboxOption, ComboboxProps } from './Combobox'
import { Avatar } from '../Avatar'

interface Person extends ComboboxOption {
  email: string
  status: 'online' | 'busy' | 'away' | 'offline'
}

const people: Person[] = [
  { value: 'sasha', label: 'Sasha Kim', email: 'sasha@unityevolv.example', status: 'online' },
  { value: 'jo', label: 'Jo Ortega', email: 'jo@unityevolv.example', status: 'busy' },
  { value: 'amir', label: 'Amir Haddad', email: 'amir@unityevolv.example', status: 'away' },
  { value: 'lena', label: 'Lena Fischer', email: 'lena@unityevolv.example', status: 'offline' },
  { value: 'tomo', label: 'Tomo Ishikawa', email: 'tomo@unityevolv.example', status: 'online' },
  { value: 'priya', label: 'Priya Nair', email: 'priya@unityevolv.example', status: 'online' },
  {
    value: 'diego',
    label: 'Diego Alves',
    email: 'diego@unityevolv.example',
    status: 'offline',
    disabled: true,
  },
]

const cities: ComboboxOption[] = [
  'Amsterdam',
  'Auckland',
  'Bangalore',
  'Berlin',
  'Buenos Aires',
  'Cape Town',
  'Chicago',
  'Dublin',
  'Helsinki',
  'Lisbon',
  'Madrid',
  'Melbourne',
  'Mumbai',
  'Nairobi',
  'Oslo',
  'Paris',
  'Seoul',
  'Singapore',
  'Stockholm',
  'Tokyo',
  'Toronto',
  'Warsaw',
].map((city) => ({ value: city.toLowerCase(), label: city }))

/**
 * Storybook cannot instantiate a generic component, and a discriminated
 * union of props leaves its args typed as never. The stories go through a
 * wrapper with a plain, single-shape props type.
 */
interface StoryArgs {
  label: string
  placeholder?: string
  help?: string
  options: Person[]
  size?: 'xs' | 'sm' | 'md' | 'lg'
  renderOption?: ComboboxProps<Person>['renderOption']
}

const PersonCombobox = (props: StoryArgs) => <Combobox {...props} />

const meta = {
  title: 'Forms/Combobox',
  component: PersonCombobox,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
  args: { label: 'Person', placeholder: 'Type a name', options: people },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PersonCombobox>

export default meta
type Story = StoryObj<typeof meta>

const Single = (args: StoryArgs) => {
  const [value, setValue] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-3">
      <Combobox {...args} multiple={false} value={value} onChange={setValue} />
      <p className="text-sm text-muted">value: {value ?? 'null'}</p>
    </div>
  )
}

const Multi = (args: StoryArgs) => {
  const [value, setValue] = useState<string[]>(['sasha'])
  return (
    <div className="flex flex-col gap-3">
      <Combobox {...args} multiple value={value} onChange={setValue} />
      <p className="text-sm text-muted">value: {JSON.stringify(value)}</p>
    </div>
  )
}

export const SingleSync: Story = { render: (args) => <Single {...args} /> }

export const MultiSync: Story = {
  args: { help: 'Backspace on an empty input removes the last person.' },
  render: (args) => <Multi {...args} />,
}

/** Avatar plus a secondary line, from the caller's own option type. */
export const CustomOption: Story = {
  render: (args) => (
    <Multi
      {...args}
      renderOption={(person) => (
        <span className="flex items-center gap-2">
          <Avatar name={person.label} size="xs" status={person.status} />
          <span className="min-w-0">
            <span className="block truncate">{person.label}</span>
            <span className="block truncate text-xs text-muted">{person.email}</span>
          </span>
        </span>
      )}
    />
  ),
}

/**
 * Fetch-on-type. With `onSearch` the kit does no filtering: the caller gets
 * the query, flips `loading`, and swaps `options` when results arrive.
 */
const AsyncExample = () => {
  const [options, setOptions] = useState<ComboboxOption[]>([])
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState<string | null>(null)
  const search = (query: string) => {
    setLoading(true)
    setTimeout(() => {
      setOptions(cities.filter((city) => city.label.toLowerCase().includes(query.toLowerCase())))
      setLoading(false)
    }, 600)
  }
  return (
    <Combobox
      label="City"
      placeholder="Search cities"
      options={options}
      onSearch={search}
      loading={loading}
      value={value}
      onChange={setValue}
      emptyMessage="No city by that name"
    />
  )
}

export const Async: Story = { render: () => <AsyncExample /> }

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Combobox label="Required" options={people} required />
      <Combobox label="With error" options={people} error="Pick someone" />
      <Combobox label="Disabled" options={people} disabled value="jo" />
      <Combobox label="Small" options={people} size="sm" multiple defaultValue={['sasha', 'jo']} />
    </div>
  ),
}
