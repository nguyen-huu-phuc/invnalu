"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TabIndicatorProps {
  currentIndex: number
  totalCount: number
}

export function TabIndicator({ currentIndex, totalCount }: TabIndicatorProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => setShow(false), 1500)
    return () => clearTimeout(timer)
  }, [currentIndex])

  if (totalCount <= 1) return null

  const label = `${currentIndex + 1} / ${totalCount}`

  return (
    <div
      className={cn(
        "fixed top-1/2 left-1/2 -translate-1/2 z-50 px-4 py-2 rounded-full bg-background/90 backdrop-blur-sm border shadow-lg text-sm font-medium transition-all duration-300",
        show ? "scale-100 opacity-100" : "scale-90 opacity-0"
      )}
    >
      {label}
    </div>
  )
}
