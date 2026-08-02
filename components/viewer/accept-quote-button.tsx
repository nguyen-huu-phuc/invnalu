"use client"

import { useState, useRef } from "react"
import { Loader2, Send } from "lucide-react"
import { FloatingActionButton } from "@/components/viewer/floating-action-button"

export interface AcceptPayload {
  quote_id?: number
  data: any
  total_amount?: number | null
}

export function AcceptQuoteButton({ payload }: { payload: AcceptPayload }) {
  const [accepting, setAccepting] = useState(false)

  const handleAccept = async () => {
    setAccepting(true)
    try {
      await fetch("/api/accept-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch {
      // silently ignore
    } finally {
      setAccepting(false)
    }
  }

  return (
    <FloatingActionButton
      position="bottom-right"
      size="lg"
      draggable
      onClick={handleAccept}
      disabled={accepting}
    >
      {accepting ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Send className="h-6 w-6" />
      )}
    </FloatingActionButton>
  )
}
