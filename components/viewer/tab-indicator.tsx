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
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-2xl bg-transparent shadow-xl text-lg transition-all duration-300",
        show
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      )}
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
              ? "text-primary font-semibold"
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
