import type { ForwardRefExoticComponent, RefAttributes } from 'react'

/**
 * The type of a `forwardRef` component that also carries `sampleProps`.
 *
 * `forwardRef` returns a type with no room for extra properties, so assigning
 * the static the blind install test looks for is a compile error without
 * this. Internal: the kit does not export it, because a consumer has no use
 * for `sampleProps` — it exists so a component can say how to render it when
 * nothing knows its types.
 */
export type WithSampleProps<Props, Element> = ForwardRefExoticComponent<
  Props & RefAttributes<Element>
> & {
  sampleProps: Props
}
