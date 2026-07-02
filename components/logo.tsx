import Image from 'next/image'
import { cn } from '@/lib/utils'

// The two PNGs place the SYNTRA wordmark at different vertical offsets inside
// their canvases (black ≈ 57% down, white ≈ 40% down). At any zoom that ~17%
// canvas gap becomes a visible jump on screen. We derive a per-variant
// vertical nudge from `height * zoom` so the compensation stays correct at
// any size, and the cross-fade reads as a color swap instead of a jump.
export function Logo({
  className,
  scrolled = false,
  width = 360,
  height = 80,
  zoom = 3.6,
  align = 'center',
}: {
  className?: string
  scrolled?: boolean
  width?: number
  height?: number
  zoom?: number
  align?: 'left' | 'center'
}) {
  // Visible pixel gap between the two wordmarks' vertical centers, empirically
  // ~14% of the scaled image height. Applied only to the white variant.
  const WHITE_Y_FACTOR = 0.14
  const whiteOffsetY = Math.round(height * zoom * WHITE_Y_FACTOR)

  // The source PNGs carry ~14% empty space on their left edge before the "S".
  // When `align='left'` we pull the image back by that padding so the wordmark
  // itself, not the canvas, hugs the container's left edge.
  const LEFT_PADDING_FACTOR = 0.14
  const alignOffsetX =
    align === 'left' ? -Math.round(height * zoom * LEFT_PADDING_FACTOR) : 0

  const originX = align === 'left' ? '0%' : '50%'
  const objectX = align === 'left' ? '0%' : '50%'

  const variants = [
    {
      src: '/logo_transparent_black.png',
      alt: 'Syntra Systems',
      shown: !scrolled,
      offsetY: 0,
    },
    {
      src: '/logo_transparent_white.png',
      alt: '',
      shown: scrolled,
      offsetY: whiteOffsetY,
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
            objectPosition: `${objectX} 50%`,
            transform: `translate(${alignOffsetX}px, ${v.offsetY}px) scale(${zoom})`,
            transformOrigin: `${originX} 50%`,
          }}
        />
      ))}
    </span>
  )
}
