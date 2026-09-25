import { UEMark, UOMark } from './marks'
import type { MarkProps } from './marks'

export type BrandProduct = 'unityevolv' | 'unityofis' | 'ofiskit'
export type BrandSize = 'sm' | 'md' | 'lg'

interface ProductBrand {
  mark: (props: MarkProps) => React.ReactElement
  /** The word in the secondary tone. */
  first: string
  /** The word in the primary tone. It butts against the first, with no space. */
  second: string
  /** What a screen reader announces, and how the product is written down. */
  name: string
}

/**
 * Every product the kit knows how to brand.
 *
 * Adding one is a row here and nothing else. `ofiskit` deliberately shares the
 * UO mark: the engine carries the product's mark rather than earning its own.
 */
const products: Record<BrandProduct, ProductBrand> = {
  unityevolv: { mark: UEMark, first: 'Unity', second: 'Evolv', name: 'UnityEvolv' },
  unityofis: { mark: UOMark, first: 'Unity', second: 'Ofis', name: 'UnityOfis' },
  ofiskit: { mark: UOMark, first: 'ofis', second: 'kit', name: 'ofiskit' },
}

/**
 * Mark height in pixels, with the text size that sits beside it.
 *
 * Class names are written out in full because Tailwind scans built files as
 * static text; a size assembled from a variable would produce no CSS.
 */
const sizes: Record<BrandSize, { mark: number; text: string }> = {
  sm: { mark: 24, text: 'text-base' },
  md: { mark: 30, text: 'text-xl' },
  lg: { mark: 40, text: 'text-3xl' },
}

export interface BrandProps {
  /** Which product's identity to render. */
  product: BrandProduct
  /** Wraps the brand in a link. Without it, it renders as a labelled image. */
  href?: string
  /** Mark height: `sm` 24px, `md` 30px, `lg` 40px. The name scales with it. */
  size?: BrandSize
  /** Just the mark, for collapsed sidebars and tight headers. */
  markOnly?: boolean
  className?: string
}

/**
 * A UnityEvolv product's identity: the monogram, then the product name split
 * across two tones, the way unityevolv.com writes it.
 *
 * The two-tone split is decoration, not information. The link or span carries
 * the whole product name as its accessible name and the pieces are hidden, so
 * a screen reader announces "UnityOfis" once rather than spelling out two
 * fragments — and the mark stays silent rather than repeating it.
 *
 * Both tones come from the theme, so light mode gets the deepened shades and
 * dark mode the brand values without this component knowing either exists.
 */
export function Brand({ product, href, size = 'md', markOnly = false, className }: BrandProps) {
  const { mark: Mark, first, second, name } = products[product]
  const { mark: markHeight, text } = sizes[size]

  const content = (
    <>
      <Mark height={markHeight} />
      {markOnly ? null : (
        // Hidden because the wrapper is already named. Without this a screen
        // reader can read the two spans as separate words.
        <span
          aria-hidden="true"
          className={[text, 'font-semibold tracking-tight leading-none'].join(' ')}
        >
          <span className="text-secondary">{first}</span>
          <span className="text-primary">{second}</span>
        </span>
      )}
    </>
  )

  const shared = {
    className: ['inline-flex items-center gap-2 no-underline', className]
      .filter(Boolean)
      .join(' '),
    'aria-label': name,
  }

  if (href) {
    return (
      <a href={href} {...shared}>
        {content}
      </a>
    )
  }

  // role="img" so the aria-label names something. A bare span with a label is
  // ignored by most screen readers.
  return (
    <span role="img" {...shared}>
      {content}
    </span>
  )
}

/**
 * One valid set of props for the blind install test, which renders every
 * export with no knowledge of their types.
 */
Brand.sampleProps = { product: 'unityevolv' } satisfies BrandProps
