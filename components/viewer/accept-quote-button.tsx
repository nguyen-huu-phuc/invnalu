"use client"

import { useState, useEffect, useRef } from "react"
import { CircleCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface AcceptPayload {
  quote_id?: number
  data: any
  total_amount?: number | null
}

interface AcceptQuoteButtonProps {
  payload: AcceptPayload
  accepted?: boolean
}

export function AcceptQuoteButton({ payload, accepted: initialAccepted = false }: AcceptQuoteButtonProps) {
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(initialAccepted)
  const [open, setOpen] = useState(false)
  const [showAck, setShowAck] = useState(false)
  const ackTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (initialAccepted && !accepted) {
      setAccepted(true)
    }
  }, [initialAccepted, accepted])

  const handleAck = () => {
    setShowAck(true)
    if (ackTimerRef.current) clearTimeout(ackTimerRef.current)
    ackTimerRef.current = setTimeout(() => setShowAck(false), 1500)
  }

  const handleAccept = async () => {
    if (accepted || !payload.quote_id) return
    setAccepting(true)
    try {
      const res = await fetch("/api/accept-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setAccepted(true)
      }
      setOpen(false)
    } catch {
      // silently ignore
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div className="absolute top-4 right-4 z-10">
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          if (accepted && newOpen) {
            handleAck()
            return
          }
          setOpen(newOpen)
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="fab"
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full border-0",
              accepted && "cursor-default",
            )}
            onClick={undefined}
            disabled={accepting}
            aria-label={accepted ? "Đã chốt báo giá" : "Chốt báo giá"}
          >
            {accepting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <CircleCheck
                style={{
                  width: "30px",
                  height: "30px",
                  transform: "translateY(-8px)",
                  color: accepted ? "#2563eb" : "#9ca3af",
                }}
              />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận chốt báo giá?</DialogTitle>
            <DialogDescription>
              Bạn muốn chốt báo giá này. Sau khi xác nhận, báo giá sẽ được ghi nhận và nhận được hỗ trợ từ đội ngũ chúng tôi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={accepting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? "Đang gửi..." : "Xác nhận chốt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showAck && (
        <span
          className={cn(
            "absolute top-full right-0 mt-1 px-2 py-1 text-xs font-medium text-background bg-muted-foreground/80 rounded shadow-lg whitespace-nowrap",
            "pointer-events-none animate-in fade-in-0 zoom-in-95",
          )}
        >
          Đã chốt rồi!
        </span>
      )}
    </div>
  )
}
