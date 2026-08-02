"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TabIndicatorProps {
  currentIndex: number
  totalCount: number
  onPrev: () => void
  onNext: () => void
}

export function TabIndicator({
  currentIndex,
  totalCount,
  onPrev,
  onNext,
}: TabIndicatorProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => setShow(false), 2000)
    return () => clearTimeout(timer)
  }, [currentIndex])

  if (totalCount <= 1) return null

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-6 py-3 bg-transparent text-lg",
      )}
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: show ? 'translateX(-50%) scale(2)' : 'translateX(-50%) scale(1.2)',
        zIndex: 9999,
        transition: 'opacity 500ms ease-in-out, transform 500ms ease-in-out',
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="grid place-items-center rounded-lg hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {Array.from({ length: totalCount }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "px-1 font-medium",
i === currentIndex
	              ? "text-black font-normal"
              : "text-muted-foreground"
          )}
        >
          {i + 1}
        </span>
      ))}

      <button
        type="button"
        onClick={onNext}
        disabled={currentIndex === totalCount - 1}
        className="grid place-items-center rounded-lg hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
