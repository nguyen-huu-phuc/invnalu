"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ZaloButtonProps {
  href?: string
  className?: string
}

export function ZaloButton({
  href = "https://zalo.me/0559310193",
  className,
}: ZaloButtonProps) {
  const [blueDoneCount, setBlueDoneCount] = useState(0)

  const handleBlueEnd = useCallback(() => {
    setBlueDoneCount((prev) => prev + 1)
  }, [])

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col items-center gap-2 group",
        className
      )}
      style={{ bottom: "1rem", right: "1rem" }}
    >
      <span
        className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-blue-500 opacity-0 pointer-events-none"
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
          "relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 zalo-bounce group-hover:animate-none"
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
      <style dangerouslySetInnerHTML={{
        __html: `
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
          animation: zalo-bounce 0.6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .zalo-bounce,
          [class*="zalo-ring"] {
            animation: none !important;
          }
        }
      `
      }} />
    </div>
  )
}


