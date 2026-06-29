'use client'

import { useEffect, useRef } from 'react'

type Node = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  accent: boolean
  age: number
  ttl: number
}

type NetworkBgProps = {
  /** Pixels² per node. Lower = denser. Default 9000. */
  density?: number
  /** Force the "on dark background" color palette (light dots/lines on dark). */
  dark?: boolean
  /** Whether to slowly rotate the whole field. Default true. */
  rotate?: boolean
  /** Max distance for two nodes to be linked. Default 220. */
  linkDistance?: number
}

export function NetworkBg({
  density = 9000,
  dark: forceDark = false,
  rotate = true,
  linkDistance = 220,
}: NetworkBgProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Live scroll value — read every frame so coloring can react without remounting
  const scrollRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let nodes: Node[] = []
    let raf = 0
    let angle = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function makeNode(existing: Node[] = []): Node {
      // "Best candidate" sampling: try a few random positions, keep the one
      // farthest from existing nodes. Naturally fills empty space.
      const samples = 8
      let bestX = Math.random() * width
      let bestY = Math.random() * height
      let bestDist = -1
      for (let s = 0; s < samples; s++) {
        const x = Math.random() * width
        const y = Math.random() * height
        let minSq = Infinity
        for (let k = 0; k < existing.length; k++) {
          const dx = existing[k].x - x
          const dy = existing[k].y - y
          const d = dx * dx + dy * dy
          if (d < minSq) minSq = d
        }
        if (minSq > bestDist) {
          bestDist = minSq
          bestX = x
          bestY = y
        }
      }
      return {
        x: bestX,
        y: bestY,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 1 + Math.random() * 3.2,
        accent: Math.random() < 0.13,
        age: 0,
        ttl: 480 + Math.floor(Math.random() * 1440),
      }
    }

    function resize() {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const target = Math.min(140, Math.floor((width * height) / density))
      nodes = []
      for (let i = 0; i < target; i++) nodes.push(makeNode(nodes))
    }

    // 0 = light background, 1 = dark background — matches the hero vertical gradient.
    // As the page scrolls, the area now covered by the dark nav backdrop should
    // be treated as dark too, otherwise dots disappear under the backdrop.
    function darknessAt(y: number) {
      if (forceDark) return 1
      const t = y / height
      let base: number
      if (t < 0.28) base = (t / 0.28) * 0.4
      else if (t < 0.54) base = 0.4 + ((t - 0.28) / 0.26) * 0.6
      else base = 1
      // Smooth boost based on scroll so coloring follows the visual context.
      const scrollBoost = Math.min(1, scrollRef.current / 220)
      return base + (1 - base) * scrollBoost
    }

    // Smoothly blend the line/dot color between dark-on-light and light-on-dark.
    function strokeColor(dark: number, alpha: number) {
      // dark 0 -> deep navy; dark 1 -> near white
      const r = Math.round(25 + (230 - 25) * dark)
      const g = Math.round(35 + (235 - 35) * dark)
      const b = Math.round(55 + (245 - 55) * dark)
      return `rgba(${r},${g},${b},${alpha})`
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)
      if (!reduced && rotate) angle += 0.0005

      const cx = width * 0.6
      const cy = height * 0.4
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)

      const positions: { x: number; y: number; alpha: number }[] = new Array(
        nodes.length,
      )
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        if (!reduced) {
          n.x += n.vx
          n.y += n.vy
          // Horizontal: wrap around the screen edges (torus). A node leaving
          // the right side re-enters from the left, keeping the field continuous.
          if (n.x < 0) n.x += width
          else if (n.x > width) n.x -= width
          // Vertical: still bounce — there's no continuation above/below the hero.
          if (n.y < 0 || n.y > height) n.vy *= -1
          n.age++
        }
        let alpha = 1
        if (n.age < 60) alpha = n.age / 60
        else if (n.age > n.ttl - 120) alpha = Math.max(0, (n.ttl - n.age) / 120)

        const dx = n.x - cx
        const dy = n.y - cy
        positions[i] = {
          x: dx * cosA - dy * sinA + cx,
          y: dx * sinA + dy * cosA + cy,
          alpha,
        }
      }

      const maxDist = linkDistance

      for (let i = 0; i < nodes.length; i++) {
        const a = positions[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = positions[j]
          // Try the direct connection plus the two horizontal wraps; pick the
          // shortest. If the shortest crosses an edge, draw two mirrored
          // segments so the line visually exits one side and re-enters the other.
          let bestOffset = 0
          let bestDx = a.x - b.x
          let bestDist = Math.hypot(bestDx, a.y - b.y)
          for (const off of [-width, width]) {
            const dx = a.x - (b.x + off)
            const d = Math.hypot(dx, a.y - b.y)
            if (d < bestDist) {
              bestDist = d
              bestOffset = off
              bestDx = dx
            }
          }
          if (bestDist < maxDist) {
            const t = 1 - bestDist / maxDist
            const lineAlpha = t * t * Math.min(a.alpha, b.alpha) * 1.05
            const dark = darknessAt((a.y + b.y) / 2)
            ctx.strokeStyle = strokeColor(dark, lineAlpha)
            ctx.lineWidth = 1.1
            if (bestOffset === 0) {
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            } else {
              // Two segments: one starting in-bounds and exiting toward the
              // virtual wrapped partner, the other ending in-bounds coming
              // from the opposite virtual side. Canvas clipping takes care
              // of the rest — visually the line wraps around.
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x + bestOffset, b.y)
              ctx.stroke()
              ctx.beginPath()
              ctx.moveTo(a.x - bestOffset, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            }
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const p = positions[i]
        const dark = darknessAt(p.y)
        ctx.beginPath()
        ctx.arc(p.x, p.y, n.size, 0, Math.PI * 2)
        ctx.fillStyle = n.accent
          ? `rgba(59,130,246,${p.alpha})`
          : strokeColor(dark, 0.95 * p.alpha)
        ctx.fill()
      }

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].age >= nodes[i].ttl) nodes[i] = makeNode(nodes)
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [density, forceDark, rotate, linkDistance])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
    />
  )
}
