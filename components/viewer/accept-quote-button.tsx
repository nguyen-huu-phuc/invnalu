"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

export interface AcceptPayload {
  quote_id?: number
  data: any
  total_amount?: number | null
}

export function AcceptQuoteButton({ payload }: { payload: AcceptPayload }) {
  const [accepting, setAccepting] = useState(false)
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const timeoutId = useRef<NodeJS.Timeout | null>(null)

  const show = () => {
    setVisible(true)
    if (timeoutId.current) clearTimeout(timeoutId.current)
    timeoutId.current = setTimeout(() => setVisible(false), 2000)
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY < lastScrollY.current) {
        show()
      }
      lastScrollY.current = currentScrollY
    }

    timeoutId.current = setTimeout(() => setVisible(false), 2000)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (timeoutId.current) clearTimeout(timeoutId.current)
    }
  }, [])

  const handleMouseEnter = () => {
    setVisible(true)
    if (timeoutId.current) clearTimeout(timeoutId.current)
  }

  const handleMouseLeave = () => {
    if (timeoutId.current) clearTimeout(timeoutId.current)
    timeoutId.current = setTimeout(() => setVisible(false), 1000)
  }

  const handleAccept = async () => {
    setVisible(true)
    setAccepting(true)
    try {
      const res = await fetch("/api/accept-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success("Báo giá đã được gửi thành công")
      } else if (res.status === 503) {
        toast.error("Calnalu chưa sẵn sàng", {
          description: "Vui lòng liên hệ sales để chốt báo giá.",
        })
      } else {
        const err = await res.json()
        toast.error("Lỗi", { description: err.error || "Chốt báo giá thất bại" })
      }
    } catch (err: any) {
      toast.error("Lỗi", { description: err.message || "Đã xảy ra lỗi" })
    } finally {
      setAccepting(false)
    }
  }

  return (
    <Button
      variant="default"
      size="icon"
      className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-105 transition-all"
      style={{ opacity: visible ? 1 : 0.3 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleAccept}
      disabled={accepting}
      aria-label="Chốt báo giá"
    >
      {accepting ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Send className="h-6 w-6" />
      )}
    </Button>
  )
}
