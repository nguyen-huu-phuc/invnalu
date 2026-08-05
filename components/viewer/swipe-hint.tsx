"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export function SwipeHint() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-none select-none">
        <div className="flex items-center justify-center gap-10">
          <span className="text-gray-500 text-5xl animate-swipe-hint-left">&lt;&lt;</span>
          <span className="text-gray-500 text-4xl tracking-widest">VUỐT</span>
          <span className="text-gray-500 text-5xl animate-swipe-hint-right">&gt;&gt;</span>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes swipeHintLeft {
          0% {
            transform: translateX(0) scale(0.8);
            opacity: 0.7;
          }
          100% {
            transform: translateX(-220px) scale(1.4);
            opacity: 0;
          }
        }
        @keyframes swipeHintRight {
          0% {
            transform: translateX(0) scale(0.8);
            opacity: 0.7;
          }
          100% {
            transform: translateX(220px) scale(1.4);
            opacity: 0;
          }
        }
        .animate-swipe-hint-left {
          animation: swipeHintLeft 2s ease-out forwards;
        }
        .animate-swipe-hint-right {
          animation: swipeHintRight 2s ease-out forwards;
        }
      `
      }} />
    </>,
    document.body
  )
}
