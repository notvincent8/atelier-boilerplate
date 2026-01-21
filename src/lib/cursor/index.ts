/**
 * Cursor management system with React integration.
 *
 * @example
 * // In a React component
 * import { useCursor, useCursorHover } from '@/lib/cursor'
 *
 * function App() {
 *   const { smoothPosition, isVisible } = useCursor()
 *   const buttonRef = useCursorHover('pointer')
 *
 *   return (
 *     <>
 *       <CustomCursor position={smoothPosition} visible={isVisible} />
 *       <button ref={buttonRef}>Hover me</button>
 *     </>
 *   )
 * }
 *
 * @example
 * // Direct manager access (for GSAP/Three.js)
 * import { CursorManager } from '@/lib/cursor'
 *
 * const cursor = CursorManager.getInstance()
 * cursor.subscribe((state) => {
 *   // Use in animation loop
 *   mesh.rotation.x = state.normalizedPosition.y * 0.5
 * })
 */

export { CursorManager } from "./CursorManager"
export type { CursorManagerOptions, CursorState, CursorStyle, NormalizedPosition, Position, Velocity } from "./types"
export { useCursor, useCursorHide, useCursorHover, useCursorVisibility } from "./useCursor"
