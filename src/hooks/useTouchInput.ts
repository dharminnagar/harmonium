/**
 * Hook to handle touch input optimization
 * Prevents scrolling and zooming on keyboard area
 */

import { useEffect, RefObject } from 'react'

interface TouchInputProps {
  elementRef: RefObject<HTMLElement>
  enabled?: boolean
}

export function useTouchInput({ elementRef, enabled = true }: TouchInputProps) {
  useEffect(() => {
    if (!enabled || !elementRef.current) return

    const element = elementRef.current

    // Prevent default touch behaviors to avoid scrolling/zooming
    const handleTouchMove = (e: TouchEvent) => {
      // Allow scrolling outside the keyboard, but prevent within it
      if (e.target instanceof HTMLElement) {
        const isKeyboardElement =
          e.target.closest('[data-keyboard]') !== null ||
          e.target.hasAttribute('data-keyboard')
        if (isKeyboardElement) {
          e.preventDefault()
        }
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      // Prevent zoom on double-tap for keyboard elements
      if (e.target instanceof HTMLElement) {
        const isKeyboardElement =
          e.target.closest('[data-keyboard]') !== null ||
          e.target.hasAttribute('data-keyboard')
        if (isKeyboardElement && e.touches.length > 0) {
          e.preventDefault()
        }
      }
    }

    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchstart', handleTouchStart, { passive: false })

    return () => {
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchstart', handleTouchStart)
    }
  }, [elementRef, enabled])
}
