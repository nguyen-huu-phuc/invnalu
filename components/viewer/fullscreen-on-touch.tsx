"use client"

import { useFullscreenOnTouch } from "@/lib/use-fullscreen-on-touch"

export function FullscreenOnTouch() {
  useFullscreenOnTouch(true)
  return null
}