"use client"

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FloatingActionButtonProps {
  icon?: ReactNode
  onClick?: () => void
  label?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  size?: "default" | "sm" | "lg"
  idleTimeout?: number
  draggable?: boolean
  className?: string
  disabled?: boolean
  children?: ReactNode
}

const positionClasses = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "top-right": "top-6 right-6",
  "top-left": "top-6 left-6",
}

const sizeClasses = {
  sm: "h-10 w-10 text-xs",
  default: "h-12 w-12 text-sm",
  lg: "h-14 w-14 text-base",
}

export function FloatingActionButton({
  icon,
  onClick,
  label,
  position = "bottom-right",
  size = "default",
  idleTimeout = 2000,
  draggable = false,
  className,
  disabled = false,
  children,
}: FloatingActionButtonProps) {
  const [visible, setVisible] = useState(true)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const draggingRef = useRef(false)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const show = useCallback(() => {
    setVisible(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(false), idleTimeout)
  }, [idleTimeout])

  useEffect(() => {
    timeoutRef.current = setTimeout(() => setVisible(false), idleTimeout)

    const handleMove = () => show()
    const handleScroll = () => show()

    window.addEventListener("mousemove", handleMove, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("scroll", handleScroll)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [idleTimeout, show])

  const initDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!draggable || disabled) return
      draggingRef.current = true
      setVisible(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      startRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }
    },
    [draggable, disabled],
  )

  const moveDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!draggingRef.current || !startRef.current) return
      const x = clientX - startRef.current.x
      const y = clientY - startRef.current.y
      setPos({ left: x, top: y })
    },
    [],
  )

  const endDrag = useCallback(() => {
    draggingRef.current = false
    startRef.current = null
  }, [])

  useEffect(() => {
    if (!draggable) return
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY)
    const onMouseUp = () => endDrag()
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [draggable, moveDrag, endDrag])

  const isDragging = draggingRef.current

  const inlineStyle = pos
    ? { left: pos.left, top: pos.top, right: "auto", bottom: "auto" }
    : undefined

  return (
    <Button
      ref={buttonRef}
      variant="fab"
      size="icon"
      className={cn(
        "fixed z-50 rounded-full",
        sizeClasses[size],
        positionClasses[position],
        draggable && "cursor-grab active:cursor-grabbing",
        visible ? "opacity-100" : "opacity-30",
        className
      )}
      style={inlineStyle}
      onMouseDown={(e) => initDrag(e.clientX, e.clientY)}
      onMouseEnter={() => show()}
      onMouseLeave={() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setVisible(false), 1000)
      }}
      onClick={(e) => {
        if (isDragging) {
          e.preventDefault()
          return
        }
        onClick?.()
      }}
      disabled={disabled}
      aria-label={label}
    >
      {children || icon}
    </Button>
  )
}
