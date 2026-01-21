/**
 * Type definitions for the cursor management system.
 */

/** Available cursor styles */
export type CursorStyle = "default" | "pointer" | "grab" | "grabbing" | "none" | "text" | "crosshair" | "wait" | "move"

/** 2D position coordinates */
export interface Position {
  x: number
  y: number
}

/** Normalized position (-1 to 1 range, centered) */
export interface NormalizedPosition {
  /** -1 (left) to 1 (right) */
  x: number
  /** -1 (top) to 1 (bottom) */
  y: number
}

/** Cursor velocity (pixels per frame) */
export interface Velocity {
  x: number
  y: number
}

/** Complete cursor state snapshot */
export interface CursorState {
  /** Raw mouse position in pixels */
  position: Position
  /** Position normalized to -1 to 1 range */
  normalizedPosition: NormalizedPosition
  /** Smoothed position (for custom cursor element) */
  smoothPosition: Position
  /** Movement velocity */
  velocity: Velocity
  /** Whether cursor is visible */
  isVisible: boolean
  /** Whether cursor is inside the viewport */
  isInViewport: boolean
  /** Current cursor style */
  style: CursorStyle
}

/** Callback for cursor state updates */
export type CursorSubscriber = (state: CursorState) => void

/** Options for CursorManager initialization */
export interface CursorManagerOptions {
  /**
   * Lerp factor for smooth position (0-1).
   * Lower = smoother/slower, higher = snappier.
   * @default 0.1
   */
  lerpFactor?: number

  /**
   * Whether to automatically initialize on creation.
   * @default true
   */
  autoInit?: boolean

  /**
   * Initial cursor style.
   * @default 'default'
   */
  initialStyle?: CursorStyle
}
