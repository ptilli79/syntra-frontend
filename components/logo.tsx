import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * DEMO — PNG integration test.
 *
 * The image has a white background so we use mix-blend-multiply:
 *   • Scrolled nav (light bg)  → white pixels disappear, logo looks clean ✓
 *   • Unscrolled nav (dark bg) → white turns dark AND the blue A is killed ✗
 *
 * This proves why the designer must provide an SVG (or transparent-bg PNG)
 * for the transition to work correctly in both states.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-block overflow-hidden',
        className,
      )}
      style={{ width: 220, height: 56 }}
    >
      <Image
        src="/logo.png"
        alt="Syntra Systems"
        fill
        className="mix-blend-multiply object-cover"
        style={{ objectPosition: '50% 43%' }}
        priority
      />
    </span>
  )
}
