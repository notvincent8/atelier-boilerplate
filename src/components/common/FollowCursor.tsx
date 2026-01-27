import { useEffect, useRef } from "react"
import useCursor from "@/lib/cursor/useCursor.tsx"
import { lerp } from "@/lib/math.ts"

const EASE = 0.12

const FollowCursor = () => {
  const cursor = useCursor()
  const dotRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let raf: number

    const tick = () => {
      const el = dotRef.current
      if (el) {
        const target = cursor.getPosition()
        pos.current.x = lerp(pos.current.x, target.x, EASE)
        pos.current.y = lerp(pos.current.y, target.y, EASE)
        el.style.transform = `translate3d(${pos.current.x - 5}px, ${pos.current.y - 5}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [cursor])

  return (
    <div
      ref={dotRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 10,
        height: 10,
        borderRadius: 999,
        background: "white",
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  )
}

export default FollowCursor
