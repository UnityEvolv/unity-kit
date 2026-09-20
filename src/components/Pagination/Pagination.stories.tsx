import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pagination } from './Pagination'
import type { PaginationProps } from './Pagination'

const meta = {
  title: 'Data/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    compact: { control: 'boolean' },
    siblings: { control: { type: 'number', min: 0, max: 3 } },
    boundaries: { control: { type: 'number', min: 0, max: 3 } },
  },
  args: { page: 1, pageCount: 10, onPageChange: () => {} },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

/** The caller owns the page; the kit reports the one asked for. */
const Controlled = (args: PaginationProps) => {
  const [page, setPage] = useState(args.page)
  const [pageSize, setPageSize] = useState(args.pageSize ?? 10)
  return (
    <Pagination
      {...args}
      page={page}
      pageSize={args.pageSize === undefined ? undefined : pageSize}
      onPageChange={setPage}
      onPageSizeChange={(next) => {
        setPageSize(next)
        setPage(1)
      }}
    />
  )
}

export const Small: Story = {
  args: { pageCount: 5 },
  render: (args) => <Controlled {...args} />,
}

/** Two ellipses in the middle; the row keeps the same width from page 1 to 50. */
export const Large: Story = {
  args: { page: 25, pageCount: 50 },
  render: (args) => <Controlled {...args} />,
}

export const FirstPage: Story = { args: { page: 1, pageCount: 50 } }

export const LastPage: Story = { args: { page: 50, pageCount: 50 } }

/** Total and page size derive the page count and turn on the summary. */
export const WithSummaryAndPageSize: Story = {
  args: {
    page: 3,
    pageCount: undefined,
    total: 145,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50],
  },
  render: (args) => <Controlled {...args} />,
}

/** Previous, next and a reading of where you are, for a strip with no room. */
export const Compact: Story = {
  args: { page: 7, pageCount: 20, compact: true },
  render: (args) => (
    <div className="w-64">
      <Controlled {...args} />
    </div>
  ),
}

export const WiderWindow: Story = {
  args: { page: 15, pageCount: 40, siblings: 2, boundaries: 2 },
  render: (args) => <Controlled {...args} />,
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Pagination key={size} {...args} page={3} pageCount={10} size={size} />
      ))}
    </div>
  ),
}
