"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { toPng } from "html-to-image"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const PRESETS = [
  { key: "mobile", label: "Mobile", width: 390 },
  { key: "tablet", label: "Tablet", width: 768 },
  { key: "view", label: "View" },
] as const

const DEFAULT_NAME = "bao-gia-he-thong"

interface ExportImageProps {
  trigger?: ReactNode
  filename?: string
}

export function ExportImage({ trigger, filename: filenameProp }: ExportImageProps = {}) {
  const [open, setOpen] = useState(false)
  const [filename, setFilename] = useState(filenameProp ?? DEFAULT_NAME)
  const [kbShift, setKbShift] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [open])

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null
    if (!vv) return
    const handle = () => {
      const kbHeight = window.innerHeight - vv.height - vv.offsetTop
      setKbShift(kbHeight > 0 ? Math.min(kbHeight / 3, 150) : 0)
    }
    vv.addEventListener("resize", handle)
    vv.addEventListener("scroll", handle)
    handle()
    return () => {
      vv.removeEventListener("resize", handle)
      vv.removeEventListener("scroll", handle)
    }
  }, [open])

  const capture = async (width: number) => {
    const node = document.querySelector<HTMLElement>('[data-export="quote"]')
    if (!node) return

    const base = (filename.trim() || DEFAULT_NAME).replace(/\.png$/i, "")
    const name = `${base}.png`

    const iframe = document.createElement("iframe")
    iframe.style.cssText = `position:fixed;left:-9999px;top:0;border:0;width:${width}px;height:2400px;visibility:hidden;`
    document.body.appendChild(iframe)
    const idoc = iframe.contentDocument
    if (!idoc) {
      document.body.removeChild(iframe)
      return
    }

    idoc.open()
    idoc.write('<!DOCTYPE html><html><head></head><body style="margin:0"></body></html>')
    idoc.close()

    Array.from(document.styleSheets).forEach((sheet) => {
      let css = ""
      try {
        css = Array.from(sheet.cssRules).map((r) => r.cssText).join("\n")
      } catch {
        if (sheet.href) {
          const link = idoc.createElement("link")
          link.rel = "stylesheet"
          link.href = sheet.href
          idoc.head.appendChild(link)
        }
        return
      }
      const style = idoc.createElement("style")
      style.textContent = css
      idoc.head.appendChild(style)
    })

    const clone = node.cloneNode(true) as HTMLElement
    idoc.body.appendChild(clone)

    try {
      await new Promise((r) => setTimeout(r, 300))
      const dataUrl = await toPng(clone, {
        pixelRatio: 2,
      })
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = name
      a.click()
    } finally {
      document.body.removeChild(iframe)
    }
    setOpen(false)
  }

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      title="Xuất ảnh báo giá"
    >
      <Download className="w-4 h-4" />
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? defaultTrigger}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[420px] rounded-2xl"
        style={kbShift ? ({ "--tw-translate-y": `calc(-50% - ${kbShift}px)` } as unknown as CSSProperties) : undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Xuất ảnh báo giá</DialogTitle>
          <DialogDescription className="sr-only">
            Chọn kích thước và tên tệp để xuất ảnh báo giá.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="export-filename">Tên tệp</Label>
            <Input
              id="export-filename"
              ref={inputRef}
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.key}
                variant="outline"
                 onClick={() => "width" in p && p.width ? capture(p.width) : capture(document.querySelector<HTMLElement>('[data-export="quote"]')?.offsetWidth || window.innerWidth)}
                className="flex h-auto flex-col gap-1 py-3"
              >
                <span className="text-sm font-medium">{p.label}</span>
                 <span className="text-[10px] text-muted-foreground">{"width" in p && p.width ? `${p.width}px` : "Thực tế"}</span>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
