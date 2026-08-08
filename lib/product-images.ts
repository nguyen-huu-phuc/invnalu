import fs from 'fs/promises'
import path from 'path'

const PRODUCT_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products')

export async function getProductImages(sku: string): Promise<string[]> {
  try {
    const files = await fs.readdir(PRODUCT_IMAGES_DIR)
    const prefixLower = sku.toLowerCase()
    const prefixUpper = sku.toUpperCase()
    const prefixOriginal = sku

    const matched = files.filter((file) => {
      const base = file.replace(/\.[^/.]+$/, '')
      const baseLower = base.toLowerCase()
      return (
        baseLower === prefixLower ||
        base === prefixUpper ||
        base === prefixOriginal ||
        baseLower.startsWith(prefixLower + '-') ||
        base.startsWith(prefixUpper + '-') ||
        base.startsWith(prefixOriginal + '-')
      )
    })
    matched.sort((a, b) => {
      const numA = extractNumber(a)
      const numB = extractNumber(b)
      if (numA === null && numB === null) return a.localeCompare(b)
      if (numA === null) return 1
      if (numB === null) return -1
      return numA - numB
    })
    return matched.map((file) => `/images/products/${file}`)
  } catch {
    return []
  }
}

export async function getPrimaryProductImage(sku: string): Promise<string> {
  const images = await getProductImages(sku)
  if (images.length > 0) return images[0]
  const candidates = [`${sku}.webp`, `${sku.toLowerCase()}.webp`, `${sku.toUpperCase()}.webp`]
  for (const candidate of candidates) {
    const candidatePath = path.join(PRODUCT_IMAGES_DIR, candidate)
    try {
      await fs.access(candidatePath)
      return `/images/products/${candidate}`
    } catch {
      // continue
    }
  }
  return '/images/products/placeholder.webp'
}

function extractNumber(fileName: string): number | null {
  const base = fileName.replace(/\.[^/.]+$/, '')
  const match = base.match(/-(\d+)$/)
  if (!match) return null
  const num = parseInt(match[1], 10)
  return Number.isNaN(num) ? null : num
}
