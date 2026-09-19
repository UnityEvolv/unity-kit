import type { SVGProps } from 'react'

/**
 * The UnityEvolv monogram marks.
 *
 * PLACEHOLDER ARTWORK. These are geometric letterforms built to the right
 * proportions and colour split, not the real logo — unityevolv.com ships its
 * mark as `logo.png`, and a raster file cannot be traced into something
 * faithful. Replace the paths with the real vector artwork when it is
 * available; nothing outside this file needs to change, because `Brand`
 * only ever asks for a mark at a height.
 *
 * Two-tone on purpose: the first letter takes `secondary` and the second
 * `primary`, the same split the wordmark uses, so the mark and the name read
 * as one object. Both come from the theme, so `data-theme` switches them
 * without this component knowing the themes exist.
 *
 * Always `aria-hidden`: the accessible name lives on the link or span that
 * wraps the mark, so announcing it here would repeat the product name.
 */
export interface MarkProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  /** Rendered height in pixels. Width follows the aspect ratio. */
  height?: number
}

const VIEWBOX_WIDTH = 36
const VIEWBOX_HEIGHT = 22

function Mark({ height = 30, children, ...props }: MarkProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      width={Math.round((height * VIEWBOX_WIDTH) / VIEWBOX_HEIGHT)}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      fill="none"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

/** The U shared by every mark, in the secondary tone. */
function U() {
  return (
    <g className="text-secondary" stroke="currentColor">
      <path d="M3 3v10a6 6 0 0 0 12 0V3" />
    </g>
  )
}

/** UnityEvolv. */
export function UEMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <U />
      <g className="text-primary" stroke="currentColor">
        <path d="M21 3h12" />
        <path d="M21 11h9" />
        <path d="M21 19h12" />
        <path d="M21 3v16" />
      </g>
    </Mark>
  )
}

/** unityofis, and ofiskit, which shares the product's mark. */
export function UOMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <U />
      <g className="text-primary" stroke="currentColor">
        <circle cx="27" cy="11" r="8" />
      </g>
    </Mark>
  )
}
