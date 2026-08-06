"use client"

import { usePathname } from "next/navigation"
import { PhoneButton } from "./zalo-button"

export function ZaloButtonWrapper() {
  const pathname = usePathname()
  const hide = pathname.startsWith("/plant/") || pathname.startsWith("/quote/")
  if (hide) return null
  return <PhoneButton />
}
