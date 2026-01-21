import { useCallback, useEffect, useRef, useSyncExternalStore } from "react"
import { CursorManager } from "./CursorManager"
import type { CursorState, CursorStyle } from "./types"

/**
 * React hook for accessing cursor state.
 * Automatically initializes CursorManager on first use.
 *
 * @returns Cursor state and control methods
 *
 * @example
 * function CustomCursor() {
 *   const { smoothPosition, isVisible } = useCursor()
 *
 *   return (
 *     <div
 *       style={{
 *         transform: `translate(${smoothPosition.x}px, ${smoothPosition.y}px)`,
 *         opacity: isVisible ? 1 : 0,
 *       }}
 *       className="custom-cursor"
 *     />
 *   )
 * }
 */
export function useCursor() {
  // Get a singleton instance (initializes if needed)
  const managerRef = useRef<CursorManager | null>(null)

  managerRef.current ??= CursorManager.getInstance();

  const manager = managerRef.current

  // Subscribe function for useSyncExternalStore
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return manager.subscribe(onStoreChange)
    },
    [manager],
  )

  // Snapshot function for useSyncExternalStore
  const getSnapshot = useCallback((): CursorState => {
    return manager.getState()
  }, [manager])

  // Server snapshot (for SSR)
  const getServerSnapshot = useCallback((): CursorState => {
    return {
      position: { x: 0, y: 0 },
      normalizedPosition: { x: 0, y: 0 },
      smoothPosition: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      isVisible: true,
      isInViewport: false,
      style: "default",
    }
  }, [])

  // Use React's built-in subscription hook
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Memoized control methods
  const hide = useCallback(() => manager.hide(), [manager])
  const show = useCallback(() => manager.show(), [manager])
  const setStyle = useCallback((style: CursorStyle) => manager.pushStyle(style), [manager])
  const resetStyle = useCallback(() => manager.popStyle(), [manager])
  const setLerpFactor = useCallback((factor: number) => manager.setLerpFactor(factor), [manager])

  return {
    // State
    ...state,

    // Methods
    /** Hides the cursor */
    hide,
    /** Shows the cursor */
    show,
    /** Sets cursor style (pushes to stack) */
    setStyle,
    /** Resets to previous cursor style (pops from stack) */
    resetStyle,
    /** Sets the lerp smoothing factor (0-1) */
    setLerpFactor,

    // Direct manager access for advanced use
    /** Direct access to CursorManager instance */
    manager,
  }
}

/**
 * Hook for adding hover cursor style to an element.
 * Returns a ref to attach to the target element.
 *
 * @param style - Cursor style to use on hover
 * @returns Ref to attach to the element
 *
 * @example
 * function Button() {
 *   const hoverRef = useCursorHover('pointer')
 *
 *   return <button ref={hoverRef}>Click me</button>
 * }
 *
 * @example
 * // With multiple styles
 * function DraggableItem() {
 *   const [isDragging, setIsDragging] = useState(false)
 *   const hoverRef = useCursorHover(isDragging ? 'grabbing' : 'grab')
 *
 *   return <div ref={hoverRef}>Drag me</div>
 * }
 */
export function useCursorHover<T extends HTMLElement = HTMLElement>(style: CursorStyle) {
  const ref = useRef<T>(null)
  const managerRef = useRef<CursorManager | null>(null)

  managerRef.current ??= CursorManager.getInstance();

  const manager = managerRef.current

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleEnter = () => {
      manager.pushStyle(style)
    }

    const handleLeave = () => {
      manager.popStyle()
    }

    element.addEventListener("mouseenter", handleEnter)
    element.addEventListener("mouseleave", handleLeave)

    return () => {
      element.removeEventListener("mouseenter", handleEnter)
      element.removeEventListener("mouseleave", handleLeave)
    }
  }, [manager, style])

  return ref
}

/**
 * Hook for hiding cursor while over an element.
 * Useful for custom cursor implementations.
 *
 * @returns Ref to attach to the element
 *
 * @example
 * function CanvasArea() {
 *   const hideRef = useCursorHide()
 *
 *   return (
 *     <div ref={hideRef}>
 *       <CustomCursor />
 *       <canvas />
 *     </div>
 *   )
 * }
 */
export function useCursorHide<T extends HTMLElement = HTMLElement>() {
  return useCursorHover<T>("none")
}

/**
 * Hook for temporarily hiding the cursor programmatically.
 * Automatically restores cursor on unmount.
 *
 *
 * @example
 * function VideoPlayer({ isPlaying }) {
 *   // Hide cursor after 3 seconds of video playback
 *   const [idle, setIdle] = useState(false)
 *
 *   useCursorVisibility(!isPlaying || !idle)
 *
 *   return <video />
 * }
 * @param shouldShow
 */
export function useCursorVisibility(shouldShow: boolean) {
  const managerRef = useRef<CursorManager | null>(null)

  managerRef.current ??= CursorManager.getInstance();

  const manager = managerRef.current

  useEffect(() => {
    if (shouldShow) {
      manager.show()
    } else {
      manager.hide()
    }

    return () => {
      // Restore cursor on unmount
      manager.show()
    }
  }, [manager, shouldShow])
}
