import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { Brand } from './Brand'
import type { BrandProduct, BrandSize } from './Brand'
import { UEMark, UOMark } from './marks'
import { Icon } from '../Icon'

const meta = {
  title: 'Brand/Brand',
  component: Brand,
  tags: ['autodocs'],
  argTypes: {
    product: { control: 'inline-radio', options: ['unityevolv', 'unityofis', 'ofiskit'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    markOnly: { control: 'boolean' },
    href: { control: 'text' },
  },
  args: { product: 'unityevolv', size: 'md' },
} satisfies Meta<typeof Brand>

export default meta
type Story = StoryObj<typeof meta>

const themes: Array<'light' | 'dark'> = ['light', 'dark']
const allProducts: BrandProduct[] = ['unityevolv', 'unityofis', 'ofiskit']
const allSizes: BrandSize[] = ['sm', 'md', 'lg']

function Panel({ theme, children }: { theme: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div
      data-theme={theme}
      className="flex-1 rounded-box border border-base-300 bg-base-100 p-6 text-base-content"
    >
      <h3 className="mb-4 text-lg font-semibold capitalize">{theme}</h3>
      {children}
    </div>
  )
}

export const Default: Story = {}

/**
 * The family side by side, which is the check that matters: the three should
 * read as one system, and `ofiskit` should carry the same mark as `unityofis`
 * rather than a third of its own.
 */
export const AllProducts: Story = {
  parameters: { themes: { disable: true } },
  render: () => (
    <div className="flex gap-4 p-4">
      {themes.map((theme) => (
        <Panel key={theme} theme={theme}>
          <div className="flex flex-col items-start gap-6">
            {allProducts.map((product) => (
              <Brand key={product} product={product} />
            ))}
          </div>
        </Panel>
      ))}
    </div>
  ),
}

/** Mark heights are 24, 30 and 40px; the name scales with them. */
export const Sizes: Story = {
  parameters: { themes: { disable: true } },
  render: () => (
    <div className="flex gap-4 p-4">
      {themes.map((theme) => (
        <Panel key={theme} theme={theme}>
          <div className="flex flex-col items-start gap-6">
            {allSizes.map((size) => (
              <div key={size} className="flex items-center gap-4">
                <code className="w-10 text-xs text-muted">{size}</code>
                <Brand product="unityofis" size={size} />
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  ),
}

/** For collapsed sidebars and tight headers. Still announced by product name. */
export const MarkOnly: Story = {
  parameters: { themes: { disable: true } },
  render: () => (
    <div className="flex gap-4 p-4">
      {themes.map((theme) => (
        <Panel key={theme} theme={theme}>
          <div className="flex items-center gap-8">
            {allProducts.map((product) => (
              <Brand key={product} product={product} markOnly />
            ))}
          </div>
        </Panel>
      ))}
    </div>
  ),
}

/**
 * What this is actually for. With an `href` the whole brand is one link named
 * after the product — not a link wrapping two separately announced fragments.
 */
export const InANavbar: Story = {
  parameters: { themes: { disable: true }, layout: 'fullscreen' },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      {themes.map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          className="rounded-box border border-base-300 bg-base-100 text-base-content"
        >
          <nav className="flex items-center gap-4 border-b border-base-300 px-4 py-3">
            <Brand product="unityofis" href="/" size="sm" />
            <span className="ml-auto flex items-center gap-2 text-sm">
              <Icon name="users" size="sm" />
              12 in the office
            </span>
            <button className="btn btn-primary btn-sm">
              <Icon name="video" size="sm" />
              Join
            </button>
          </nav>
          <div className="p-6 text-sm text-muted">Page content</div>
        </div>
      ))}
    </div>
  ),
}

/**
 * The marks on their own, exported for anywhere the wordmark is too much.
 * Favicons are generated from these per app at build time, not by this
 * component.
 */
export const Marks: Story = {
  parameters: { themes: { disable: true } },
  render: () => (
    <div className="flex gap-4 p-4">
      {themes.map((theme) => (
        <Panel key={theme} theme={theme}>
          <div className="flex items-end gap-8">
            <div className="flex flex-col items-center gap-2">
              <UEMark height={40} />
              <code className="text-xs text-muted">UEMark</code>
            </div>
            <div className="flex flex-col items-center gap-2">
              <UOMark height={40} />
              <code className="text-xs text-muted">UOMark</code>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  ),
}
