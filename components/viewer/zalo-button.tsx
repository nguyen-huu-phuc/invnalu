"use client"

import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ZaloButtonProps {
  href?: string
  className?: string
}

export function ZaloButton({
  href = "https://zalo.me/0559310193",
  className,
}: ZaloButtonProps) {
  const [paused, setPaused] = useState(false)
  const [blueDoneCount, setBlueDoneCount] = useState(0)

  const handleBlueEnd = useCallback(() => {
    setBlueDoneCount((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const onKeyDown = () => setPaused(true)
    const onKeyUp = () => setPaused(false)
    const onScroll = () => setPaused(true)
    const onMouseMove = () => setPaused(false)
    const onTouchStart = () => setPaused(true)
    const onTouchEnd = () => setPaused(false)

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [])

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col items-center gap-2",
        className
      )}
      style={{ bottom: "1rem", right: "1rem" }}
    >
      <span
        className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-green-500 opacity-0 pointer-events-none"
        aria-hidden="true"
        style={{
          animation: "zalo-ring-green 2s ease-in-out infinite",
        }}
      />
      {blueDoneCount < 2 && (
        <>
          <span
            className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-blue-500 opacity-0 pointer-events-none"
            onAnimationEnd={handleBlueEnd}
            aria-hidden="true"
            style={{
              animation: "zalo-ring 1.5s ease-out forwards",
            }}
          />
          <span
            className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-blue-500 opacity-0 pointer-events-none"
            onAnimationEnd={handleBlueEnd}
            aria-hidden="true"
            style={{
              animation: "zalo-ring 1.5s ease-out 0.75s forwards",
            }}
          />
        </>
      )}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Liên hệ Zalo"
        className={cn(
          "relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          !paused && "zalo-bounce"
        )}
      >
        <img
          src="/zalo.svg"
          alt="Zalo"
          className="w-9 h-9"
          width={36}
          height={36}
        />
      </a>
      <style>{`
        @keyframes zalo-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        @keyframes zalo-ring-green {
          0% {
            transform: scale(0.7);
            opacity: 0.4;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        @keyframes zalo-bounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.08); }
          60% { transform: scale(0.97); }
          100% { transform: scale(1); }
        }
        .zalo-bounce {
          animation: zalo-bounce 0.6s ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .zalo-bounce,
          [class*="zalo-ring"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
