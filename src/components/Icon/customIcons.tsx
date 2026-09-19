import type { LucideProps } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * The icons Lucide does not have, or does not have in the right sense.
 *
 * Every attribute here matches what Lucide emits — 24x24 viewBox, no fill,
 * `currentColor` stroke, round caps and joins — so these sit beside Lucide
 * icons without looking foreign, and accept the same props so the name table
 * can hold both kinds without a special case.
 */
function Glyph({
  size = 24,
  strokeWidth = 2,
  children,
  ...props
}: LucideProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

/**
 * A fist beside a door. Lucide has no knock, and `door-closed` reads as
 * leaving a room rather than asking to come into one.
 */
export function Knock(props: LucideProps) {
  return (
    <Glyph {...props}>
      <rect x="15" y="2" width="7" height="20" rx="1" />
      <path d="M17.5 12h.01" />
      <path d="M3 13v-1a1.5 1.5 0 0 1 3 0v1" />
      <path d="M6 12v-1.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M9 12v-2a1.5 1.5 0 0 1 3 0v5a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
    </Glyph>
  )
}

/**
 * An open palm raised. Lucide's `hand` is a pointing hand, which reads as
 * "you" rather than "me".
 */
export function RaiseHand(props: LucideProps) {
  return (
    <Glyph {...props}>
      <path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M11 11V4.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M14 11V5.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M17 12v-.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-4.2-1.8L4 16.5a1.5 1.5 0 0 1 2.1-2.1L8 16" />
    </Glyph>
  )
}

/** An arrival desk with a bell on it. */
export function Reception(props: LucideProps) {
  return (
    <Glyph {...props}>
      <path d="M3 21h18" />
      <path d="M5 21v-6h14v6" />
      <path d="M9.5 15a2.5 2.5 0 0 1 5 0" />
      <path d="M12 12v-1.5" />
    </Glyph>
  )
}

/** A mug with steam, for the do-not-disturb room. */
export function BreakRoom(props: LucideProps) {
  return (
    <Glyph {...props}>
      <path d="M6 2c0 1 1 1 1 2s-1 1-1 2" />
      <path d="M10 2c0 1 1 1 1 2s-1 1-1 2" />
      <path d="M14 2c0 1 1 1 1 2s-1 1-1 2" />
      <path d="M3 9h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
      <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
    </Glyph>
  )
}

/** The room map, for switching offices. A floor plan rather than a building. */
export function Office(props: LucideProps) {
  return (
    <Glyph {...props}>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 10h7" />
      <path d="M10 3v18" />
      <path d="M10 15h11" />
    </Glyph>
  )
}

/** A plug, for the bring-your-own-provider pages. */
export function Provider(props: LucideProps) {
  return (
    <Glyph {...props}>
      <path d="M9 2v6" />
      <path d="M15 2v6" />
      <path d="M6 8h12v3a6 6 0 0 1-12 0z" />
      <path d="M12 17v5" />
    </Glyph>
  )
}
