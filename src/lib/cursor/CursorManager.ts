import gsap from "gsap"
import { lerp } from "../math"
import type { CursorManagerOptions, CursorState, CursorStyle, CursorSubscriber, Position } from "./types"

/**
 * Singleton cursor manager for tracking mouse position and state.
 *
 * Features:
 * - Raw and smoothed (lerped) position tracking
 * - Normalized coordinates (-1 to 1)
 * - Velocity calculation
 * - Style stack for hover states
 * - GSAP ticker integration for smooth animations
 *
 * @example
 * // Get instance and start tracking
 * const cursor = CursorManager.getInstance()
 *
 * // Subscribe to updates
 * const unsubscribe = cursor.subscribe((state) => {
 *   customCursor.style.transform = `translate(${state.smoothPosition.x}px, ${state.smoothPosition.y}px)`
 * })
 *
 * // Change cursor style
 * cursor.pushStyle('pointer')
 * cursor.popStyle()
 *
 * // Cleanup
 * unsubscribe()
 */
export class CursorManager {
  private static instance: CursorManager | null = null

  // State
  private readonly _position: Position = { x: 0, y: 0 }
  private readonly _smoothPosition: Position = { x: 0, y: 0 }
  private readonly _velocity: Position = { x: 0, y: 0 }
  private readonly _previousPosition: Position = { x: 0, y: 0 }
  private _isVisible: boolean = true
  private _isInViewport: boolean = false

  // Style stack for nested hover states
  private readonly _styleStack: CursorStyle[] = ["default"]

  // Options
  private _lerpFactor: number = 0.1

  // Subscribers
  private readonly _subscribers: Set<CursorSubscriber> = new Set()

  // Lifecycle
  private _isInitialized: boolean = false
  private readonly _boundHandleMouseMove: (e: MouseEvent) => void
  private readonly _boundHandleMouseEnter: () => void
  private readonly _boundHandleMouseLeave: () => void
  private readonly _boundUpdate: () => void

  private constructor(options: CursorManagerOptions = {}) {
    const { lerpFactor = 0.1, autoInit = true, initialStyle = "default" } = options

    this._lerpFactor = lerpFactor
    this._styleStack = [initialStyle]

    // Bind methods for event listeners
    this._boundHandleMouseMove = this._handleMouseMove.bind(this)
    this._boundHandleMouseEnter = this._handleMouseEnter.bind(this)
    this._boundHandleMouseLeave = this._handleMouseLeave.bind(this)
    this._boundUpdate = this._update.bind(this)

    if (autoInit) {
      this.init()
    }
  }

  /**
   * Gets the singleton instance of CursorManager.
   * Creates a new instance if one doesn't exist.
   * @param options - Options for initialization (only used on first call)
   */
  static getInstance(options?: CursorManagerOptions): CursorManager {
    CursorManager.instance ??= new CursorManager(options)
    return CursorManager.instance
  }

  /**
   * Destroys the singleton instance.
   * Call this when you need to completely reset the cursor manager.
   */
  static destroyInstance(): void {
    if (CursorManager.instance) {
      CursorManager.instance.destroy()
      CursorManager.instance = null
    }
  }

  /**
   * Initializes event listeners and GSAP ticker.
   * Called automatically unless autoInit is false.
   */
  init(): void {
    if (this._isInitialized || globalThis.window === undefined) return

    document.addEventListener("mousemove", this._boundHandleMouseMove)
    document.addEventListener("mouseenter", this._boundHandleMouseEnter)
    document.addEventListener("mouseleave", this._boundHandleMouseLeave)

    // Use GSAP ticker for smooth updates synced with animations
    gsap.ticker.add(this._boundUpdate)

    this._isInitialized = true
  }

  /**
   * Cleans up event listeners and GSAP ticker.
   * Call this when the cursor manager is no longer needed.
   */
  destroy(): void {
    if (!this._isInitialized) return

    document.removeEventListener("mousemove", this._boundHandleMouseMove)
    document.removeEventListener("mouseenter", this._boundHandleMouseEnter)
    document.removeEventListener("mouseleave", this._boundHandleMouseLeave)

    gsap.ticker.remove(this._boundUpdate)

    this._subscribers.clear()
    this._isInitialized = false
  }

  // ─── Event Handlers ────────────────────────────────────────────────────────

  private _handleMouseMove(e: MouseEvent): void {
    this._position.x = e.clientX
    this._position.y = e.clientY
    this._isInViewport = true
  }

  private _handleMouseEnter(): void {
    this._isInViewport = true
    this._isVisible = true
  }

  private _handleMouseLeave(): void {
    this._isInViewport = false
  }

  // ─── Update Loop ───────────────────────────────────────────────────────────

  private _update(): void {
    // Calculate velocity before updating smooth position
    this._velocity.x = this._position.x - this._previousPosition.x
    this._velocity.y = this._position.y - this._previousPosition.y

    // Store current position for next frame's velocity calculation
    this._previousPosition.x = this._position.x
    this._previousPosition.y = this._position.y

    // Lerp smooth position towards actual position
    this._smoothPosition.x = lerp(this._smoothPosition.x, this._position.x, this._lerpFactor)
    this._smoothPosition.y = lerp(this._smoothPosition.y, this._position.y, this._lerpFactor)

    // Notify subscribers
    this._notifySubscribers()
  }

  private _notifySubscribers(): void {
    if (this._subscribers.size === 0) return

    const state = this.getState()
    for (const subscriber of this._subscribers) {
      subscriber(state)
    }
  }

  // ─── Public Getters ────────────────────────────────────────────────────────

  /** Raw mouse position in pixels */
  get position(): Readonly<Position> {
    return this._position
  }

  /** Smoothed position for custom cursor elements */
  get smoothPosition(): Readonly<Position> {
    return this._smoothPosition
  }

  /** Position normalized to -1 to 1 range (centered at 0,0) */
  get normalizedPosition(): Readonly<Position> {
    if (globalThis.window === undefined) return { x: 0, y: 0 }

    return {
      x: (this._position.x / window.innerWidth) * 2 - 1,
      y: (this._position.y / window.innerHeight) * 2 - 1,
    }
  }

  /** Movement velocity in pixels per frame */
  get velocity(): Readonly<Position> {
    return this._velocity
  }

  /** Whether the cursor is visible */
  get isVisible(): boolean {
    return this._isVisible
  }

  /** Whether the cursor is inside the viewport */
  get isInViewport(): boolean {
    return this._isInViewport
  }

  /** Current cursor style (top of the style stack) */
  get style(): CursorStyle {
    return this._styleStack.at(-1) ?? "default"
  }

  /** Current lerp factor */
  get lerpFactor(): number {
    return this._lerpFactor
  }

  /**
   * Gets a complete snapshot of the cursor state.
   * Useful for passing to callbacks or storing.
   */
  getState(): CursorState {
    return {
      position: { ...this._position },
      normalizedPosition: { ...this.normalizedPosition },
      smoothPosition: { ...this._smoothPosition },
      velocity: { ...this._velocity },
      isVisible: this._isVisible,
      isInViewport: this._isInViewport,
      style: this.style,
    }
  }

  // ─── Public Methods ────────────────────────────────────────────────────────

  /**
   * Sets the lerp factor for smooth position interpolation.
   * @param factor - Value between 0 (very smooth) and 1 (instant)
   */
  setLerpFactor(factor: number): void {
    this._lerpFactor = Math.max(0.01, Math.min(1, factor))
  }

  /**
   * Hides the cursor by setting style to 'none'.
   * Use show() to restore previous style.
   */
  hide(): void {
    this._isVisible = false
    this.pushStyle("none")
    if (typeof document !== "undefined") {
      document.body.style.cursor = "none"
    }
  }

  /**
   * Shows the cursor by removing the 'none' style.
   */
  show(): void {
    this._isVisible = true
    // Remove any 'none' styles from stack
    while (this._styleStack.length > 1 && this.style === "none") {
      this.popStyle()
    }
    if (typeof document !== "undefined") {
      document.body.style.cursor = this.style
    }
  }

  /**
   * Pushes a cursor style onto the stack.
   * Use this for hover states that should be temporary.
   * @param style - Cursor style to push
   * @example
   * // On mouse enter
   * cursor.pushStyle('pointer')
   * // On mouse leave
   * cursor.popStyle()
   */
  pushStyle(style: CursorStyle): void {
    this._styleStack.push(style)
    if (typeof document !== "undefined") {
      document.body.style.cursor = style
    }
  }

  /**
   * Pops the current style from the stack.
   * Reverts to the previous style.
   * Will not pop the base style.
   */
  popStyle(): void {
    if (this._styleStack.length > 1) {
      this._styleStack.pop()
      if (typeof document !== "undefined") {
        document.body.style.cursor = this.style
      }
    }
  }

  /**
   * Sets the base cursor style (replaces bottom of stack).
   * @param style - New base style
   */
  setBaseStyle(style: CursorStyle): void {
    this._styleStack[0] = style
    if (this._styleStack.length === 1 && typeof document !== "undefined") {
      document.body.style.cursor = style
    }
  }

  /**
   * Subscribes to cursor state updates.
   * Called on every frame via GSAP ticker.
   * @param callback - Function called with cursor state
   * @returns Unsubscribe function
   * @example
   * const unsubscribe = cursor.subscribe((state) => {
   *   console.log(state.smoothPosition)
   * })
   * // Later: unsubscribe()
   */
  subscribe(callback: CursorSubscriber): () => void {
    this._subscribers.add(callback)

    // Immediately call with current state
    callback(this.getState())

    return () => {
      this._subscribers.delete(callback)
    }
  }

  /**
   * Immediately jumps smooth position to current position.
   * Useful when teleporting the cursor or resetting state.
   */
  snapToPosition(): void {
    this._smoothPosition.x = this._position.x
    this._smoothPosition.y = this._position.y
  }
}
