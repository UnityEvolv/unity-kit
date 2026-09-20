import { Children } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { AvatarGroupContext, avatarSizes } from './Avatar'
import type { AvatarSize } from './Avatar'

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Sizes every avatar inside, so the group is set in one place. */
  size?: AvatarSize
  /** How many to show before the rest become a count. */
  max?: number
  children?: ReactNode
}

/**
 * A stack of overlapping avatars, with the remainder as a count.
 *
 * Size travels by context rather than by cloning the children. Cloning would
 * work until someone wrapped an avatar in a tooltip or a link, at which point
 * the clone lands on the wrapper and the size silently disappears.
 *
 * The overflow count is a number, not an avatar: it is not a person, it has
 * no name and no colour to derive, and drawing it as a face invites a click
 * that leads nowhere.
 */
export function AvatarGroup({ size = 'md', max, className, children, ...props }: AvatarGroupProps) {
  const people = Children.toArray(children)
  const limit = max === undefined ? people.length : Math.max(0, max)
  const shown = people.slice(0, limit)
  const rest = people.length - shown.length
  const { box, text, overlap } = avatarSizes[size]

  return (
    <AvatarGroupContext.Provider value={{ size }}>
      <div
        className={['flex items-center', overlap, className ?? ''].join(' ').trim()}
        {...props}
      >
        {shown}
        {rest > 0 ? (
          <span
            className={[
              box,
              text,
              'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-base-300 font-semibold text-base-content ring-2 ring-base-100',
            ].join(' ')}
          >
            <span aria-hidden="true">+{rest}</span>
            <span className="sr-only">{rest} more</span>
          </span>
        ) : null}
      </div>
    </AvatarGroupContext.Provider>
  )
}
