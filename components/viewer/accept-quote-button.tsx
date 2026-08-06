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
  readOnly?: boolean
  selectedQuoteId?: number
  onAcceptSuccess?: () => void
}

export function AcceptQuoteButton({ payload, accepted: initialAccepted = false, readOnly = false, selectedQuoteId, onAcceptSuccess }: AcceptQuoteButtonProps) {
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(initialAccepted)
  const [open, setOpen] = useState(false)
  const [showAck, setShowAck] = useState(false)
  const ackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [switchMode, setSwitchMode] = useState(false)

  useEffect(() => {
    setAccepted(initialAccepted)
  }, [initialAccepted])

  const handleAck = () => {
    setShowAck(true)
    if (ackTimerRef.current) clearTimeout(ackTimerRef.current)
    ackTimerRef.current = setTimeout(() => setShowAck(false), 1500)
  }

  const handleAccept = async () => {
    if (!payload.quote_id) return
    setAccepting(true)
    try {
      const res = await fetch("/api/accept-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setAccepted(true)
        onAcceptSuccess?.()
      }
      setOpen(false)
    } catch {
      // silently ignore
    } finally {
      setAccepting(false)
    }
  }

  if (readOnly) {
    return (
      <div className="absolute bottom-4 right-4 z-10">
        <Button
          variant="fab"
          size="icon"
          className="h-16 w-16 rounded-full border-0 bg-transparent p-0 cursor-default"
          aria-label="Đã chốt báo giá"
        >
          <CircleCheck
            size={48}
            className="size-12"
            style={{
              color: "#2563eb",
            }}
          />
        </Button>
      </div>
    )
  }

  return (
      <div className="absolute bottom-4 right-4 z-10">
      <Dialog open={open} onOpenChange={setOpen}>
          <Button
            variant="fab"
            size="icon"
            className={cn(
              "h-16 w-16 rounded-full border-0 bg-transparent p-0",
              accepted && "cursor-default",
              !accepted && "cursor-pointer",
            )}
            onClick={() => {
              if (accepted) {
                handleAck()
                handleAccept()
                return
              }
              if (selectedQuoteId && selectedQuoteId !== payload.quote_id) {
                setSwitchMode(true)
              } else {
                setSwitchMode(false)
              }
              setOpen(true)
            }}
            disabled={accepting}
            aria-label={accepted ? "Đã chốt báo giá" : "Chốt báo giá"}
          >
            <span className="relative inline-flex items-center justify-center">
              {accepting ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : accepted ? (
                <CircleCheck
                  size={48}
                  className="size-12"
                  style={{
                    color: "#2563eb",
                  }}
                />
              ) : selectedQuoteId != null && selectedQuoteId !== payload.quote_id ? (
                <CircleCheck
                  size={48}
                  className="size-12"
                  style={{
                    color: "#9ca3af",
                  }}
                />
              ) : selectedQuoteId != null && selectedQuoteId === payload.quote_id ? (
                <CircleCheck
                  size={48}
                  className="size-12"
                  style={{
                    color: "#2563eb",
                  }}
                />
              ) : (
                <CircleCheck
                  size={48}
                  className="size-12 relative z-10"
                  style={{
                    color: "#2563eb",
                    display: 'inline-block',
                    animation: 'breath 2.2s ease-in-out infinite',
                    transformOrigin: 'center',
                    willChange: 'transform, opacity, filter',
                  }}
                />
              )}
            </span>
          </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {switchMode ? "Đổi phương án" : "Xác nhận chốt báo giá?"}
            </DialogTitle>
            <DialogDescription>
              {switchMode ? "Hệ thống sẽ chuyển sang phương án mới." : "Nalu sẽ sớm liên hệ và phục vụ bạn!"}
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
              {accepting ? "Đang gửi..." : (switchMode ? "Xác nhận đổi" : "Xác nhận chốt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showAck && (
        <span
          style={{
            position: "absolute",
            top: "10%",
            right: "80%",
            marginRight: "4px",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
          className={cn(
            "px-2 py-1 text-xs font-medium text-background bg-muted-foreground/80 rounded shadow-lg whitespace-nowrap",
            "pointer-events-none animate-in fade-in-0 zoom-in-95",
          )}
        >
        Đã chốt rồi!
      </span>
      )}
    </div>
  )
}
