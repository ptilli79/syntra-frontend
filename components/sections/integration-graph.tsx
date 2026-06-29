'use client'

import { useEffect, useRef } from 'react'

// Clockwise from the top — the organized hub-and-spoke layout.
// Positions are percentages of the container (ellipse that fills the box).
const NODES = [
  { label: 'Email', a: -90 },
  { label: 'Calendar', a: -45 },
  { label: 'CRM', a: 0 },
  { label: 'Inventory', a: 45 },
  { label: 'Scheduling', a: 90 },
  { label: 'Messaging', a: 135 },
  { label: 'Reporting', a: 180 },
  { label: 'Payments', a: -135 },
]

const CENTER = { x: 50, y: 50 }

// Animation timeline (ms) — slow, deliberate assemble/disperse.
const SCATTER_HOLD = 1600
const ASSEMBLE = 8000
const ORGANIZED_HOLD = 5000
const DISPERSE = 6500
const CYCLE = SCATTER_HOLD + ASSEMBLE + ORGANIZED_HOLD + DISPERSE

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function randomScatter() {
  // A fresh random spread for each cycle so it feels alive.
  return NODES.map(() => ({
    x: 8 + Math.random() * 84,
    y: 8 + Math.random() * 84,
  }))
}

export function IntegrationGraph() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([])
  const hubRef = useRef<HTMLDivElement>(null)
  const beforeRef = useRef<HTMLSpanElement>(null)
  const afterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    let w = 0
    let h = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const rect = wrap.getBoundingClientRect()
      w = rect.width
      h = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const pct = (v: number, total: number) => (v / 100) * total

    // Organized positions in percent, computed from the LIVE pixel size so each
    // spoke leaves the hub at its true equal angle AND the same distance from
    // center — a true circle, not an ellipse — so the 8 spokes are visually
    // equidistant regardless of the container's aspect ratio.
    function computeOrganized() {
      const r = Math.min(w, h) * 0.42 // shared radius (px)
      return NODES.map((n) => {
        const rad = (n.a * Math.PI) / 180
        const dx = r * Math.cos(rad)
        const dy = r * Math.sin(rad)
        return {
          x: CENTER.x + (dx / w) * 100,
          y: CENTER.y + (dy / h) * 100,
        }
      })
    }

    // Draw a single frame given organization progress p (0 = scattered, 1 = organized).
    function render(scatter: Array<{ x: number; y: number }>, p: number) {
      const organized = computeOrganized()
      // Interpolated positions in percent.
      const pos = organized.map((org, i) => ({
        x: lerp(scatter[i].x, org.x, p),
        y: lerp(scatter[i].y, org.y, p),
      }))

      // --- Canvas lines ---
      ctx.clearRect(0, 0, w, h)
      const cx = pct(CENTER.x, w)
      const cy = pct(CENTER.y, h)

      // Web: node-to-node connections (faint, strengthen as organized).
      const webAlpha = 0.03 + 0.07 * p
      if (webAlpha > 0.01) {
        ctx.strokeStyle = `rgba(120, 150, 210, ${webAlpha})`
        ctx.lineWidth = 1
        for (let i = 0; i < pos.length; i++) {
          for (let j = i + 1; j < pos.length; j++) {
            ctx.beginPath()
            ctx.moveTo(pct(pos[i].x, w), pct(pos[i].y, h))
            ctx.lineTo(pct(pos[j].x, w), pct(pos[j].y, h))
            ctx.stroke()
          }
        }
      }

      // Spokes: center hub to each node (more visible as organized).
      const spokeAlpha = 0.05 + 0.4 * p
      ctx.strokeStyle = `rgba(74, 143, 255, ${spokeAlpha})`
      ctx.lineWidth = 1
      for (let i = 0; i < pos.length; i++) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(pct(pos[i].x, w), pct(pos[i].y, h))
        ctx.stroke()
      }

      // --- DOM nodes ---
      // Gray (scattered) -> blue (organized) for the dots.
      const r = Math.round(lerp(140, 74, p))
      const g = Math.round(lerp(150, 143, p))
      const b = Math.round(lerp(165, 255, p))
      for (let i = 0; i < pos.length; i++) {
        const el = nodeRefs.current[i]
        if (!el) continue
        el.style.left = `${pos[i].x}%`
        el.style.top = `${pos[i].y}%`
        const dot = el.firstElementChild as HTMLElement | null
        if (dot) {
          dot.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
          dot.style.boxShadow = `0 0 ${8 * p}px ${2 * p}px rgba(74,143,255,${0.5 * p})`
        }
      }

      // Center hub fades in as things organize.
      if (hubRef.current) {
        hubRef.current.style.opacity = `${smoothstep(0.35, 1, p)}`
      }

      // Before/After captions crossfade with the same progress value.
      if (beforeRef.current) {
        beforeRef.current.style.opacity = `${1 - smoothstep(0.2, 0.6, p)}`
      }
      if (afterRef.current) {
        afterRef.current.style.opacity = `${smoothstep(0.45, 0.85, p)}`
      }
    }

    if (reduce) {
      render(computeOrganized(), 1)
      return () => ro.disconnect()
    }

    let raf = 0
    let start = performance.now()
    let scatter = randomScatter()
    let disperseTargetPicked = false

    function frame(now: number) {
      const elapsed = now - start
      const t = elapsed % CYCLE

      // Pick the NEXT scatter layout at the moment disperse begins, so the
      // disperse animates from organized to those new positions and the
      // following assemble continues from them — no visible jump at the
      // cycle boundary.
      const inDisperse = t >= SCATTER_HOLD + ASSEMBLE + ORGANIZED_HOLD
      if (inDisperse && !disperseTargetPicked) {
        scatter = randomScatter()
        disperseTargetPicked = true
      } else if (!inDisperse) {
        disperseTargetPicked = false
      }

      let p: number
      if (t < SCATTER_HOLD) {
        p = 0
      } else if (t < SCATTER_HOLD + ASSEMBLE) {
        p = easeInOutCubic((t - SCATTER_HOLD) / ASSEMBLE)
      } else if (t < SCATTER_HOLD + ASSEMBLE + ORGANIZED_HOLD) {
        p = 1
      } else {
        const dt = (t - SCATTER_HOLD - ASSEMBLE - ORGANIZED_HOLD) / DISPERSE
        p = 1 - easeInOutCubic(dt)
      }

      render(scatter, p)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-3xl" aria-hidden="true">
      {/* Before/After captions — crossfade with the diagram's progress. */}
      <div className="relative mx-auto h-5 text-center font-heading text-[11px] uppercase tracking-[0.28em]">
        <span
          ref={beforeRef}
          className="absolute inset-x-0 top-0 text-muted-foreground transition-opacity"
        >
          Before · Tools running in fragments
        </span>
        <span
          ref={afterRef}
          className="absolute inset-x-0 top-0 text-primary transition-opacity"
          style={{ opacity: 0 }}
        >
          After · One synthesized system
        </span>
      </div>

      <div
        ref={wrapRef}
        className="relative mt-3 aspect-[4/3] w-full sm:aspect-[16/9]"
      >
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* Orbiting / scattering nodes.
            The wrapper's (left,top) is centered on the DOT (via -translate-1/2)
            so canvas spokes terminate exactly at the dot. The label is placed
            absolutely below the dot and does not affect the geometry. */}
        {NODES.map((n, i) => (
          <div
            key={n.label}
            ref={(el) => {
              nodeRefs.current[i] = el
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 will-change-[left,top]"
            style={{ left: '50%', top: '50%' }}
          >
            <span className="block size-2 rounded-full bg-primary" />
            <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap font-heading text-[11px] text-muted-foreground">
              {n.label}
            </span>
          </div>
        ))}

        {/* Center hub — the circle sits at the wrapper center so spokes
            terminate at the hub circle's true center. */}
        <div
          ref={hubRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: 0 }}
        >
          <div className="flex size-10 items-center justify-center rounded-full border border-primary/80 bg-background shadow-[0_0_10px_0px] shadow-primary/20">
            <span className="size-2 rounded-full bg-primary" />
          </div>
          <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap font-heading text-[11px] font-medium uppercase tracking-[0.5em] text-foreground [text-indent:0.5em]">
            Syntra
          </span>
        </div>
      </div>
    </div>
  )
}
