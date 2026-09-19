import type { HTMLAttributes, ReactNode } from 'react'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

/**
 * Which element carries the title. `p` by default, because heading level
 * depends on where the panel sits and a component that guessed `h3` would
 * skip levels on half the pages it appeared on.
 *
 * It is an element name rather than a node for a reason HTML enforces: a
 * heading cannot live inside a paragraph, so `title={<h2>…</h2>}` renders
 * invalid markup that React warns about and browsers silently reshape. Naming
 * the element lets the page decide the level without that trap.
 */
export type EmptyStateTitleAs = 'p' | 'h2' | 'h3' | 'h4'

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * An icon name from the kit, drawn in a quiet disc above the title. A name
   * rather than a node, for the reason every other component in the kit takes
   * one: the caller should not be choosing an icon size.
   */
  icon?: IconName
  /** One line saying what is not here. Required — a blank panel explains nothing. */
  title: ReactNode
  /** The element the title renders as. Defaults to `p`. */
  titleAs?: EmptyStateTitleAs
  /** A sentence on why, or what to do about it. */
  description?: ReactNode
  /** The way out: usually a `Button`, sometimes two. */
  action?: ReactNode
}

/**
 * The nothing-here state: an empty inbox, a search with no matches, a room
 * with no one in it.
 *
 * The kit's own composition — daisyUI has no equivalent — and the one piece of
 * UKIT-19 that is not a loading state. It sits beside them because a screen
 * that waits well and then shows a bare white rectangle has not finished the
 * job it started.
 */
export function EmptyState({
  icon,
  title,
  titleAs: TitleTag = 'p',
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className ?? '',
      ]
        .join(' ')
        .trim()}
      {...props}
    >
      {icon === undefined ? null : (
        <span className="flex size-12 items-center justify-center rounded-full bg-base-200 text-muted">
          <Icon name={icon} size="lg" />
        </span>
      )}
      <TitleTag className="text-base font-semibold text-base-content">{title}</TitleTag>
      {description === undefined ? null : (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      )}
      {action === undefined ? null : (
        <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>
      )}
    </div>
  )
}

/**
 * One valid set of props for the blind install test, which renders every
 * export with no knowledge of their types. `title` is required, so without
 * this the component fails for a reason that has nothing to do with packaging.
 */
EmptyState.sampleProps = { title: 'Nothing here yet' } satisfies EmptyStateProps
