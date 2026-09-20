import { createContext, useContext, useState } from 'react'
import type { HTMLAttributes } from 'react'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * The kit's presence vocabulary. Consuming apps map their own states onto
 * these four rather than the kit growing a fifth for every product.
 */
export type AvatarStatus = 'online' | 'busy' | 'away' | 'offline'

/** Set by `AvatarGroup`, so a group sizes and rings its avatars at once. */
export const AvatarGroupContext = createContext<{ size: AvatarSize } | null>(null)

/**
 * Box, text and dot per size, so a caller never picks any of the three.
 *
 * `overlap` is on the group rather than the avatar, but it lives here because
 * an overlap that does not track the avatar's size either swallows the face or
 * leaves a gap.
 */
export const avatarSizes: Record<
  AvatarSize,
  { box: string; text: string; dot: string; overlap: string }
> = {
  xs: { box: 'size-6', text: 'text-xs', dot: 'size-2', overlap: '-space-x-1' },
  sm: { box: 'size-8', text: 'text-xs', dot: 'size-2.5', overlap: '-space-x-2' },
  md: { box: 'size-10', text: 'text-sm', dot: 'size-3', overlap: '-space-x-2' },
  lg: { box: 'size-12', text: 'text-base', dot: 'size-3.5', overlap: '-space-x-3' },
  xl: { box: 'size-16', text: 'text-xl', dot: 'size-4', overlap: '-space-x-4' },
}

/**
 * Six identity tints, written out in full because Tailwind scans built files
 * as static text. They come from the generated theme, where each is checked
 * against its own ink for AA — the initials are text, so WCAG 1.4.3 applies.
 *
 * Six rather than a rainbow: the palette is two hues, and a seventh colour
 * that is neither violet nor teal would be the third hue UKIT-29 removed.
 * Each hue appears twice, vivid and muted, which buys separation from
 * lightness rather than from a new colour.
 */
const tints = [
  'bg-avatar-1 text-avatar-ink-vivid',
  'bg-avatar-2 text-avatar-ink-muted',
  'bg-avatar-3 text-avatar-ink-vivid',
  'bg-avatar-4 text-avatar-ink-muted',
  'bg-avatar-5 text-avatar-ink-vivid',
  'bg-avatar-6 text-avatar-ink-muted',
]

const statusFill: Record<AvatarStatus, string> = {
  online: 'bg-success',
  busy: 'bg-error',
  away: 'bg-warning',
  offline: 'bg-base-300',
}

const statusWord: Record<AvatarStatus, string> = {
  online: 'online',
  busy: 'busy',
  away: 'away',
  offline: 'offline',
}

/**
 * Same name, same colour, every time and in every app — which is the whole
 * point of deriving it rather than storing it. A plain multiply-and-add hash
 * over the code points: it does not need to resist anything, only to be
 * stable and to spread short names evenly.
 */
export const tintIndexFor = (name: string) => {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.codePointAt(0)!) >>> 0
  return hash % tints.length
}

/**
 * First letter of the first and last word. `Array.from` rather than
 * `charAt`, so a name starting outside the basic plane is not cut in half.
 */
export const initialsFor = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = Array.from(words[0])[0] ?? ''
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Who this is. Required: it is the alt text, the fallback and the colour. */
  name: string
  /** Falls back to initials if absent, and also if the image fails to load. */
  src?: string
  /** Defaults to `md`, or to the size of the `AvatarGroup` around it. */
  size?: AvatarSize
  status?: AvatarStatus
  /** What the status announces, when `online` is not the word the app uses. */
  statusLabel?: string
}

/**
 * A person, as a picture or as their initials.
 *
 * No daisyUI classes here. daisyUI ships `avatar-online` and `avatar-offline`
 * and nothing for busy or away, so half the states would be its dot and half
 * would be ours — two sizes, two positions, one inconsistency. Four states
 * drawn the same way is simpler than two borrowed and two invented.
 *
 * **Status is never colour alone.** WCAG 1.4.1. The dot is `aria-hidden` and
 * the word goes into the accessible name, so the avatar reads as
 * "Sasha Kim, online" rather than as a green circle nobody can see.
 */
export function Avatar({
  name,
  src,
  size,
  status,
  statusLabel,
  className,
  ...props
}: AvatarProps) {
  const group = useContext(AvatarGroupContext)
  const resolved = size ?? group?.size ?? 'md'
  const { box, text, dot } = avatarSizes[resolved]

  // Remembering which src failed, rather than a bare boolean, is what lets a
  // new src try again without an effect to reset the flag.
  const [failedSrc, setFailedSrc] = useState<string>()
  const showImage = src !== undefined && failedSrc !== src

  // In a group the avatars overlap, so each needs a rim in the page colour to
  // read as a separate face rather than a smear.
  const rim = group === null ? '' : 'ring-2 ring-base-100'

  return (
    <span className={['relative inline-flex shrink-0', className ?? ''].join(' ').trim()} {...props}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          className={[box, rim, 'rounded-full object-cover'].join(' ')}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span
          className={[
            box,
            text,
            rim,
            tints[tintIndexFor(name)],
            'inline-flex select-none items-center justify-center rounded-full font-semibold',
          ].join(' ')}
        >
          <span aria-hidden="true">{initialsFor(name)}</span>
          <span className="sr-only">{name}</span>
        </span>
      )}

      {status === undefined ? null : (
        <>
          <span className="sr-only">, {statusLabel ?? statusWord[status]}</span>
          <span
            aria-hidden="true"
            className={[
              dot,
              statusFill[status],
              'absolute bottom-0 right-0 rounded-full ring-2 ring-base-100',
            ].join(' ')}
          />
        </>
      )}
    </span>
  )
}

/** One valid set of props for the blind install test. */
Avatar.sampleProps = { name: 'Sasha Kim', status: 'online' } satisfies AvatarProps
