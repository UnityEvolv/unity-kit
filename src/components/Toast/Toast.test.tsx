import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Toaster } from './Toaster'
import { toast } from './toast'

const toastElement = (text: string) =>
  screen.getByText(text).closest('[data-sonner-toast]') as HTMLElement

afterEach(() => {
  act(() => toast.dismiss())
})

describe('Toaster and toast', () => {
  it('shows a toast fired from outside React', async () => {
    render(<Toaster />)
    act(() => {
      toast('Saved')
    })
    expect(await screen.findByText('Saved')).toBeInTheDocument()
  })

  it.each([
    ['success', 'alert-success'],
    ['error', 'alert-error'],
    ['warning', 'alert-warning'],
    ['info', 'alert-info'],
  ] as const)('dresses %s as a daisyUI alert', async (kind, expected) => {
    render(<Toaster />)
    act(() => {
      toast[kind](`A ${kind} toast`)
    })
    const element = toastElement(
      await screen.findByText(`A ${kind} toast`).then((e) => e.textContent!),
    )
    expect(element).toHaveClass('alert', expected)
    expect(element).toHaveAttribute('data-styled', 'false')
    expect(element.querySelector('svg')).not.toBeNull()
  })

  it('renders a description and an action', async () => {
    const onClick = vi.fn()
    render(<Toaster />)
    act(() => {
      toast.success('Room created', {
        description: 'Reception is ready to use.',
        action: { label: 'Open', onClick },
      })
    })
    expect(await screen.findByText('Reception is ready to use.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('announces through a polite live region', async () => {
    const { container } = render(<Toaster />)
    act(() => {
      toast.info('Heads up')
    })
    await screen.findByText('Heads up')
    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull()
  })

  it('stacks several toasts', async () => {
    render(<Toaster />)
    act(() => {
      toast('One')
      toast('Two')
      toast('Three')
    })
    await screen.findByText('Three')
    expect(document.querySelectorAll('[data-sonner-toast]')).toHaveLength(3)
  })

  it('dismisses from the close button when asked for one', async () => {
    render(<Toaster closeButton />)
    act(() => {
      toast('Closable')
    })
    await screen.findByText('Closable')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    await waitFor(() => expect(screen.queryByText('Closable')).toBeNull())
  })

  it('dismisses in code by id and all at once', async () => {
    render(<Toaster />)
    let id: string | number = ''
    act(() => {
      id = toast('First')
      toast('Second')
    })
    await screen.findByText('Second')
    act(() => {
      toast.dismiss(id)
    })
    await waitFor(() => expect(screen.queryByText('First')).toBeNull())
    expect(screen.getByText('Second')).toBeInTheDocument()
    act(() => {
      toast.dismiss()
    })
    await waitFor(() => expect(screen.queryByText('Second')).toBeNull())
  })

  it('dismisses itself after the duration', async () => {
    vi.useFakeTimers()
    try {
      render(<Toaster duration={1000} />)
      act(() => {
        toast('Brief')
      })
      act(() => {
        vi.advanceTimersByTime(50)
      })
      expect(screen.getByText('Brief')).toBeInTheDocument()
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(screen.queryByText('Brief')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('updates a toast in place when the id is reused', async () => {
    render(<Toaster />)
    act(() => {
      toast.loading('Saving…', { id: 'save' })
    })
    await screen.findByText('Saving…')
    act(() => {
      toast.success('Saved', { id: 'save' })
    })
    await screen.findByText('Saved')
    expect(screen.queryByText('Saving…')).toBeNull()
    expect(document.querySelectorAll('[data-sonner-toast]')).toHaveLength(1)
  })
})
