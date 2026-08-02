"use client"

import { cn } from "@/lib/utils"

interface MobileIndicatorProps {
  currentIndex: number
  totalCount: number
}

export function MobileIndicator({
  currentIndex,
  totalCount,
}: MobileIndicatorProps) {
  if (totalCount <= 1) return null

  return (
    <div
      className="flex items-center justify-center gap-2"
      style={{
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
      }}
    >
      {Array.from({ length: totalCount }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full",
            i === currentIndex
              ? "bg-black w-2.5 h-2.5"
              : "bg-black/25 w-2 h-2",
          )}
        />
      ))}
    </div>
  )
}
