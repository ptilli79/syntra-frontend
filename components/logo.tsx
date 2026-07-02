import Image from 'next/image'
import { cn } from '@/lib/utils'

// The two PNGs place the SYNTRA wordmark at different vertical offsets inside
// their canvases (black ≈ 57% down, white ≈ 40% down). At zoom 3.6 that ~17%
// canvas gap becomes a ~40 px jump on screen. Each variant carries its own
// post-scale vertical nudge so both wordmarks converge on the same pixel and
// the cross-fade reads as a color swap instead of a position jump.
export function Logo({
  className,
  scrolled = false,
  width = 360,
  height = 80,
  zoom = 3.6,
}: {
  className?: string
  scrolled?: boolean
  width?: number
  height?: number
  zoom?: number
}) {
  const variants = [
    {
      src: '/logo_transparent_black.png',
      alt: 'Syntra Systems',
      shown: !scrolled,
      // Reference position — the hero already looks right.
      offsetY: 0,
    },
    {
      src: '/logo_transparent_white.png',
      alt: '',
      shown: scrolled,
      // Wordmark sits higher inside its canvas → push it back down so it lands
      // on top of where the black one was.
      offsetY: 40,
    },
  ] as const

  return (
    <span
      className={cn('relative inline-block overflow-hidden', className)}
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
          className={cn(
            'object-contain transition-opacity duration-300',
            v.shown ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            objectPosition: '50% 50%',
            transform: `translateY(${v.offsetY}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
          }}
        />
      ))}
    </span>
  )
}
