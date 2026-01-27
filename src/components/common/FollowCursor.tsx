import { useEffect, useRef } from "react"
import useCursor from "@/lib/cursor/useCursor.tsx"
import { lerp } from "@/lib/math.ts"

const FollowCursor = () => {
  const cursor = useCursor()
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number

    const tick = () => {
      const el = dotRef.current
      if (el) {
        const elPosition = el.getBoundingClientRect()
        const cursorPosition = cursor.getPosition()
        setTimeout(() => {
          el.style.top = `${lerp(elPosition.y, cursorPosition.y, 0.5) - 2.5}px`
          el.style.left = `${lerp(elPosition.x, cursorPosition.x, 0.5) - 2.5}px`
        }, 100)
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
        position: "absolute",
        top: 0,
        left: 0,
        width: 10,
        height: 10,
        borderRadius: 999,
        background: "white",
        pointerEvents: "none",
      }}
    />
  )
}

export default FollowCursor
