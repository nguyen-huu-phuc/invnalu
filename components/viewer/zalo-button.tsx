"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface PhoneButtonProps {
  href?: string
  className?: string
}

export function PhoneButton({
  href = "tel:0559310193",
  className,
}: PhoneButtonProps) {
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
          animation: "phone-ring-green 2s ease-in-out infinite",
        }}
      />
      {blueDoneCount < 2 && (
        <>
          <span
            className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-blue-500 opacity-0 pointer-events-none"
            onAnimationEnd={handleBlueEnd}
            aria-hidden="true"
            style={{
              animation: "phone-ring 1.5s ease-out forwards",
            }}
          />
          <span
            className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-blue-500 opacity-0 pointer-events-none"
            onAnimationEnd={handleBlueEnd}
            aria-hidden="true"
            style={{
              animation: "phone-ring 1.5s ease-out 0.75s forwards",
            }}
          />
        </>
      )}
      <a
        href={href}
        aria-label="Gọi điện"
        className={cn(
          "relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 phone-bounce group-hover:animate-none text-blue-500"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-9 h-9"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </a>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes phone-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        @keyframes phone-ring-green {
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
        @keyframes phone-bounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.08); }
          60% { transform: scale(0.97); }
          100% { transform: scale(1); }
        }
        .phone-bounce {
          animation: phone-bounce 0.6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .phone-bounce,
          [class*="phone-ring"] {
            animation: none !important;
          }
        }
      `
      }} />
    </div>
  )
}


