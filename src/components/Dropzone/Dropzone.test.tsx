import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Dropzone, accepts, fileKey, formatBytes } from './Dropzone'

const make = (name: string, size = 10, type = 'text/plain') =>
  new File([new Uint8Array(size)], name, { type, lastModified: 1 })

const zone = () => screen.getByRole('button', { name: /Attachments/ })
const input = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement

const drop = (target: HTMLElement, files: File[]) =>
  fireEvent.drop(target, { dataTransfer: { files, types: ['Files'] } })

describe('helpers', () => {
  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(20 * 1024 * 1024)).toBe('20 MB')
  })

  it('matches accept by extension, wildcard and exact type', () => {
    expect(accepts(make('a.csv', 1, 'text/csv'), '.csv')).toBe(true)
    expect(accepts(make('a.CSV', 1, 'text/csv'), '.csv')).toBe(true)
    expect(accepts(make('a.png', 1, 'image/png'), 'image/*')).toBe(true)
    expect(accepts(make('a.pdf', 1, 'application/pdf'), 'application/pdf, .csv')).toBe(true)
    expect(accepts(make('a.exe', 1, 'application/octet-stream'), 'image/*,.pdf')).toBe(false)
    expect(accepts(make('a.exe', 1, ''), undefined)).toBe(true)
  })

  it('keys a file by name, size and modification time', () => {
    expect(fileKey(make('a.txt', 3))).toBe('a.txt:3:1')
  })
})

describe('Dropzone', () => {
  it('is a labelled, focusable button with a hidden file input', () => {
    const { container } = render(<Dropzone label="Attachments" accept=".pdf" maxSize={1024} />)
    expect(zone()).toHaveAccessibleName('Attachments')
    expect(zone()).toHaveTextContent('Drag a file here or browse')
    expect(zone()).toHaveTextContent('.pdf · up to 1 KB')
    expect(input(container)).toHaveAttribute('tabindex', '-1')
    expect(input(container)).toHaveAttribute('accept', '.pdf')
  })

  it('opens the picker from a click', async () => {
    const user = userEvent.setup()
    const { container } = render(<Dropzone label="Attachments" />)
    const click = vi.spyOn(input(container), 'click')
    await user.click(zone())
    expect(click).toHaveBeenCalledOnce()
  })

  it('takes files from the input and lists them with size and a remove control', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<Dropzone label="Attachments" multiple onChange={onChange} />)
    const a = make('notes.txt', 1536)
    const b = make('plan.txt', 20)
    await user.upload(input(container), [a, b])
    expect(onChange).toHaveBeenLastCalledWith([a, b])
    const list = screen.getByRole('list', { name: 'Selected files' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    expect(list).toHaveTextContent('notes.txt')
    expect(list).toHaveTextContent('1.5 KB')
    await user.click(screen.getByRole('button', { name: 'Remove notes.txt' }))
    expect(onChange).toHaveBeenLastCalledWith([b])
  })

  it('takes dropped files and shows the drag-over state meanwhile', () => {
    const onChange = vi.fn()
    render(<Dropzone label="Attachments" onChange={onChange} />)
    fireEvent.dragOver(zone(), { dataTransfer: { types: ['Files'] } })
    expect(zone()).toHaveClass('border-primary')
    const file = make('a.txt')
    drop(zone(), [file])
    expect(onChange).toHaveBeenCalledWith([file])
    expect(zone()).not.toHaveClass('border-primary')
  })

  it('replaces the file when not multiple', () => {
    const onChange = vi.fn()
    render(<Dropzone label="Attachments" files={[make('a.txt')]} onChange={onChange} />)
    const second = make('b.txt')
    drop(zone(), [second])
    expect(onChange).toHaveBeenCalledWith([second])
  })

  describe('rejections', () => {
    it('refuses a wrong type and says why, inline and to onReject', () => {
      const onChange = vi.fn()
      const onReject = vi.fn()
      render(
        <Dropzone label="Attachments" accept="image/*" onChange={onChange} onReject={onReject} />,
      )
      drop(zone(), [make('virus.exe', 5, 'application/octet-stream')])
      expect(onChange).not.toHaveBeenCalled()
      expect(screen.getByRole('alert')).toHaveTextContent('virus.exe is not an accepted type.')
      expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ reason: 'type' })])
      expect(zone()).toHaveClass('border-error')
    })

    it('refuses a file over maxSize with both sizes in the message', () => {
      render(<Dropzone label="Attachments" maxSize={1024} />)
      drop(zone(), [make('big.txt', 4096)])
      expect(screen.getByRole('alert')).toHaveTextContent('big.txt is 4 KB; the limit is 1 KB.')
    })

    it('keeps the good files and refuses the ones past maxFiles', () => {
      const onChange = vi.fn()
      render(
        <Dropzone
          label="Attachments"
          multiple
          maxFiles={2}
          files={[make('a.txt')]}
          onChange={onChange}
        />,
      )
      const b = make('b.txt')
      const c = make('c.txt')
      drop(zone(), [b, c])
      expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'a.txt' }), b])
      expect(screen.getByRole('alert')).toHaveTextContent('c.txt was skipped: at most 2 files.')
    })

    it('can be dismissed', async () => {
      const user = userEvent.setup()
      render(<Dropzone label="Attachments" accept=".pdf" />)
      drop(zone(), [make('a.txt')])
      await user.click(screen.getByRole('button', { name: 'Dismiss' }))
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  it('shows per-file progress, a done mark and a per-file error from props', () => {
    const a = make('a.txt')
    const b = make('b.txt')
    const c = make('c.txt')
    render(
      <Dropzone
        label="Attachments"
        multiple
        files={[a, b, c]}
        progress={{ [fileKey(a)]: 40, [fileKey(b)]: 100 }}
        fileErrors={{ [fileKey(c)]: 'Server refused it' }}
      />,
    )
    expect(screen.getByRole('progressbar', { name: 'Upload progress for a.txt' })).toHaveAttribute(
      'value',
      '40',
    )
    expect(screen.queryByRole('progressbar', { name: 'Upload progress for b.txt' })).toBeNull()
    expect(screen.getByRole('img', { name: 'Uploaded' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Server refused it')
  })

  it('is inert when disabled', () => {
    const onChange = vi.fn()
    render(<Dropzone label="Attachments" disabled onChange={onChange} />)
    expect(zone()).toBeDisabled()
    expect(zone()).toHaveClass('cursor-not-allowed')
    drop(zone(), [make('a.txt')])
    expect(onChange).not.toHaveBeenCalled()
  })

  it('wires the field error and help', () => {
    render(<Dropzone label="Attachments" help="PDF only" error="Add at least one file" />)
    expect(zone()).toHaveAttribute('aria-invalid', 'true')
    expect(zone()).toHaveAccessibleDescription('PDF only Add at least one file')
    expect(zone()).toHaveClass('border-error')
  })
})
