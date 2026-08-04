"use client"

import { useEffect, useRef } from "react"

export function useFullscreenOnTouch(enabled = true) {
  const triggeredRef = useRef(false)

  useEffect(() => {
    if (!enabled || triggeredRef.current) return

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0

    const isMobileOrTablet = window.innerWidth <= 1024

    if (!isTouchDevice || !isMobileOrTablet) return

    const requestFullscreen = async () => {
      if (triggeredRef.current) return
      triggeredRef.current = true

      try {
        const docEl = document.documentElement
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen()
        } else if ((docEl as any).webkitRequestFullscreen) {
          await (docEl as any).webkitRequestFullscreen()
        }
      } catch {
        triggeredRef.current = false
      }
    }

    const handleTouch = (e: TouchEvent) => {
      if (triggeredRef.current) return
      const target = e.target as HTMLElement | null
      if (!target || target.closest("a, button, input, textarea, select, [role='button']")) {
        return
      }
      requestFullscreen()
    }

    const handleClick = () => {
      if (triggeredRef.current) return
      requestFullscreen()
    }

    document.addEventListener("touchstart", handleTouch, { passive: true })
    document.addEventListener("click", handleClick, { once: true })

    return () => {
      document.removeEventListener("touchstart", handleTouch)
      document.removeEventListener("click", handleClick)
    }
  }, [enabled])
}