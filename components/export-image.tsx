"use client"

import dynamic from "next/dynamic"
import type React from "react"

const ExportImageContent = dynamic(() => import("./export-image-content").then(m => m.ExportImageContent), { ssr: false })

interface ExportImageProps {
  trigger?: React.ReactNode
  filename?: string
}

export function ExportImage(props: ExportImageProps) {
  return <ExportImageContent {...props} />
}
