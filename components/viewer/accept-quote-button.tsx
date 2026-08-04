"use client"

import { useState, useEffect } from "react"
import { CircleCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
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

  useEffect(() => {
    if (initialAccepted && !accepted) {
      setAccepted(true)
    }
  }, [initialAccepted, accepted])

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
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (accepted && newOpen) {
          toast.success("Đã chốt báo giá rồi!")
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
            "absolute top-4 right-4 z-10",
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
          <DialogTitle>Xác nhận chốt báo giá</DialogTitle>
          <DialogDescription>
            Nalu sẽ nhanh chóng liên hệ và phục vụ bạn.
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
  )
}
