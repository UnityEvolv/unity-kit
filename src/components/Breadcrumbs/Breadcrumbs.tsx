import type { ReactNode } from 'react'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

export interface BreadcrumbItem {
  label: ReactNode
  /** Where it goes. The last item usually has none: it is the page you are on. */
  href?: string
  icon?: IconName
}

/**
 * How a crumb with an `href` is rendered. The default is a plain anchor;
 * an app on a client-side router passes its own `Link` here, which is what
 * keeps this package free of any router import.
 */
export type RenderLink = (props: {
  href: string
  children: ReactNode
  className?: string
}) => ReactNode

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  renderLink?: RenderLink
  /** Names the landmark. Defaults to "Breadcrumb". */
  label?: string
  className?: string
}

const anchor: RenderLink = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
)

/**
 * Where you are, as the trail that got you here.
 *
 * daisyUI's `breadcrumbs` draws the separators with CSS, so the markup is a
 * plain list of links inside a `nav`. The last item carries
 * `aria-current="page"` and is not a link, which is both what the pattern
 * asks for and what stops a page linking to itself.
 */
export function Breadcrumbs({
  items,
  renderLink = anchor,
  label = 'Breadcrumb',
  className,
}: BreadcrumbsProps) {
  const last = items.length - 1
  return (
    <nav aria-label={label} className={['breadcrumbs text-sm', className ?? ''].join(' ').trim()}>
      <ul>
        {items.map((item, index) => {
          const content = (
            <>
              {item.icon === undefined ? null : <Icon name={item.icon} size="xs" />}
              {item.label}
            </>
          )
          const current = index === last
          return (
            <li key={index}>
              {current || item.href === undefined ? (
                <span
                  className="inline-flex items-center gap-1.5"
                  aria-current={current ? 'page' : undefined}
                >
                  {content}
                </span>
              ) : (
                renderLink({
                  href: item.href,
                  className: 'inline-flex items-center gap-1.5',
                  children: content,
                })
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** One valid set of props for the blind install test. */
Breadcrumbs.sampleProps = {
  items: [{ label: 'Home', href: '/' }, { label: 'Rooms', href: '/rooms' }, { label: 'Reception' }],
} satisfies BreadcrumbsProps
