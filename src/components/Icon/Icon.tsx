import { iconComponents, iconSizes } from './icons'
import type { IconName, IconSize } from './icons'

export interface IconProps {
  /** A name this kit defines. Unknown names are a compile error. */
  name: IconName
  /** Matches the type scale. Defaults to `md` (20px). */
  size?: IconSize
  /** 2 by default; 1.5 reads better at `xl` for decorative use. */
  strokeWidth?: number
  className?: string
  /**
   * Describes the icon for assistive technology, and is what makes it a
   * meaningful image rather than decoration. Leave it off inside a button or
   * link that already has a label — otherwise the label is announced twice.
   */
  title?: string
}

/**
 * The only way this kit draws an icon.
 *
 * No app imports an icon library directly, so swapping libraries later is
 * `icons.ts` rather than a thousand edits; `npm run lint` fails a direct
 * `lucide-react` import anywhere outside this folder.
 *
 * Colour always comes from `currentColor`. An icon never sets its own colour,
 * so it inherits from the text around it and every theme and token works
 * without the icon knowing they exist.
 */
export function Icon({ name, size = 'md', strokeWidth = 2, className, title }: IconProps) {
  const Glyph = iconComponents[name]
  const decorative = title === undefined

  return (
    <Glyph
      size={iconSizes[size]}
      strokeWidth={strokeWidth}
      className={className}
      // A decorative icon is hidden outright rather than given an empty label:
      // an icon-only button takes its name from the button, and announcing the
      // icon as well reads the same thing twice.
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : 'img'}
      aria-label={title}
      focusable="false"
    />
  )
}

/**
 * One valid set of props for the blind install test, which renders every export
 * with no knowledge of their types. Without it, `name` arrives undefined and the
 * component fails for a reason that has nothing to do with packaging — and
 * skipping it instead would drop the one component whose real risk is an
 * undeclared dependency on the icon library.
 */
Icon.sampleProps = { name: 'mic' } satisfies IconProps
