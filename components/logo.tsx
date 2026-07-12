import Image from 'next/image'
import { cn } from '@/lib/utils'

// Both wordmark PNGs are tightly cropped to the same canvas (verified identical
// dimensions), so the black↔white swap is a pure cross-fade — no vertical/left
// displacement compensation is needed.
export function Logo({
  className,
  scrolled = false,
  width = 360,
  height = 80,
  align = 'center',
}: {
  className?: string
  scrolled?: boolean
  width?: number
  height?: number
  align?: 'left' | 'center'
}) {
  const objectX = align === 'left' ? '0%' : '50%'

  // The network icon hangs below the wordmark, so object-contain centers the
  // whole graphic (2062×418) and the lettering reads slightly high. The image
  // fits by width in the nav, so the centering correction scales with `width`
  // (≈8px at width 360). Applied to BOTH variants, so the cross-fade stays clean.
  const nudgeY = Math.round(width * 0.022)

  const variants = [
    { src: '/logo_transparent_black.png', alt: 'Syntra Systems', shown: !scrolled },
    { src: '/logo_transparent_white.png', alt: '', shown: scrolled },
  ] as const

  return (
    <span
      className={cn('relative inline-block', className)}
      style={{ width, height }}
    >
      {variants.map((v) => (
        <Image
          key={v.src}
          src={v.src}
          alt={v.alt}
          aria-hidden={v.alt === '' || undefined}
          fill
          priority
          sizes={`${width}px`}
          className={cn(
            'object-contain transition-opacity duration-300',
            v.shown ? 'opacity-100' : 'opacity-0',
          )}
          style={{ objectPosition: `${objectX} 50%`, transform: `translateY(${nudgeY}px)` }}
        />
      ))}
    </span>
  )
}
