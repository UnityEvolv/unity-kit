import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dropzone, fileKey } from './Dropzone'
import type { DropzoneProps } from './Dropzone'

const meta = {
  title: 'Forms/Dropzone',
  component: Dropzone,
  tags: ['autodocs'],
  args: { label: 'Attachments' },
  decorators: [
    (Story) => (
      <div className="w-[28rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropzone>

export default meta
type Story = StoryObj<typeof meta>

/** The dropzone holds the files when `files` is left off. */
export const Single: Story = { args: { accept: 'application/pdf,.pdf', maxSize: 5 * 1024 * 1024 } }

export const Multiple: Story = {
  args: {
    multiple: true,
    accept: 'image/*',
    maxSize: 2 * 1024 * 1024,
    maxFiles: 4,
    help: 'Up to four images.',
  },
}

/** Drop or pick a .exe, a file over 100 KB, or a fifth file. */
export const RejectedFiles: Story = {
  args: { multiple: true, accept: 'image/*,.pdf', maxSize: 100 * 1024, maxFiles: 4 },
}

const sizeHint = (files: File[]) => files.map((file) => file.name).join(', ')

/**
 * The consumer uploads; the kit draws. Here a fake upload advances each
 * file's progress on a timer and fails one of them.
 */
const InProgressExample = (args: DropzoneProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const pending = files.filter((file) => progress[fileKey(file)] === undefined)
    if (pending.length === 0) return
    const timers = pending.map((file, index) => {
      const key = fileKey(file)
      let value = 0
      setProgress((p) => ({ ...p, [key]: 0 }))
      const timer = setInterval(() => {
        value += 20
        if (index === 1 && value >= 60) {
          clearInterval(timer)
          setProgress((p) => ({ ...p, [key]: 60 }))
          setFileErrors((e) => ({ ...e, [key]: 'The server refused this file.' }))
          return
        }
        setProgress((p) => ({ ...p, [key]: Math.min(100, value) }))
        if (value >= 100) clearInterval(timer)
      }, 400)
      return timer
    })
    return () => timers.forEach(clearInterval)
    // Only new files start a timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

  return (
    <div className="flex flex-col gap-2">
      <Dropzone
        {...args}
        multiple
        files={files}
        onChange={setFiles}
        progress={progress}
        fileErrors={fileErrors}
      />
      <p className="text-xs text-muted">
        {files.length ? `Selected: ${sizeHint(files)}` : 'Nothing yet'}
      </p>
    </div>
  )
}

export const InProgressUploads: Story = { render: (args) => <InProgressExample {...args} /> }

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Dropzone {...args} label="Idle" />
      <Dropzone {...args} label="Disabled" disabled />
      <Dropzone {...args} label="With error" error="Add at least one file" required />
      <Dropzone {...args} label="Custom prompt">
        <span className="text-sm">Drop the CSV export from your old system here.</span>
      </Dropzone>
    </div>
  ),
}
