import { NextResponse } from 'next/server'
import { getProductImages, getPrimaryProductImage } from '@/lib/product-images'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sku = searchParams.get('sku')

  if (!sku) {
    return NextResponse.json(
      { error: 'sku is required' },
      { status: 400 }
    )
  }

  const images = await getProductImages(sku)
  const primary = images.length > 0 ? images[0] : await getPrimaryProductImage(sku)
  return NextResponse.json({ images, primary })
}
