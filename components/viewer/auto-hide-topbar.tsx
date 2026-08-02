"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AutoHideTopbarProps {
  title?: string
  subtitle?: string
  plantName?: string
}

export function AutoHideTopbar({ title, subtitle, plantName }: AutoHideTopbarProps) {
  const [visible, setVisible] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scheduleHide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(false), 3000)
  }

  useEffect(() => {
    const handleMove = () => {
      setVisible(true)
      scheduleHide()
    }
    window.addEventListener("mousemove", handleMove)
    window.addEventListener("scroll", handleMove)
    scheduleHide()
    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("scroll", handleMove)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b px-4 h-14 flex items-center shadow-sm transition-transform duration-300",
        visible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold text-sm truncate">{title}</div>}
        {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
        {!title && plantName && (
          <div className="font-semibold text-sm truncate">{plantName}</div>
        )}
      </div>
    </div>
  )
}
