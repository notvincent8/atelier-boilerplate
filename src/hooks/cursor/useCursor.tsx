import { useEffect, useMemo, useRef } from "react"
import type { Cursor } from "@/hooks/cursor/types.ts"

const useCursor = () => {
  const posRef = useRef<Cursor>({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      posRef.current.x = e.clientX
      posRef.current.y = e.clientY
    }

    globalThis.addEventListener("pointermove", onMove)
    return () => globalThis.removeEventListener("pointermove", onMove)
  }, [])

  return useMemo(() => {
    return {
      getPosition: () => posRef.current,
    }
  }, [])
}

export default useCursor
