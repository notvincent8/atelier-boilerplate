import { useEffect, useRef, useState } from "react"
import type { Cursor } from "@/lib/cursor/types.ts"

export function useCursorSnapshot(throttleMs = 50) {
  const posRef = useRef<Cursor>({ x: 0, y: 0 })
  const [snapshot, setSnapshot] = useState<Cursor>({ x: 0, y: 0 })

  useEffect(() => {
    let timer: number | null = null

    const schedule = () => {
      if (timer !== null) return
      timer = globalThis.setTimeout(() => {
        timer = null

        setSnapshot({ ...posRef.current })
      }, throttleMs)
    }

    const onMove = (e: PointerEvent) => {
      posRef.current.x = e.clientX
      posRef.current.y = e.clientY
      schedule()
    }

    globalThis.addEventListener("pointermove", onMove)
    return () => {
      globalThis.removeEventListener("pointermove", onMove)
      if (timer !== null) globalThis.clearTimeout(timer)
    }
  }, [throttleMs])

  return snapshot
}
