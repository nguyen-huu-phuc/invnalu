import { NextResponse } from 'next/server'
import { refreshPlantShare } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const result = await refreshPlantShare(slug, 7)

    if (!result) {
      return NextResponse.json({ error: 'Plant share not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      share_slug: result.share_slug,
      expires_at: result.expires_at,
      message: 'Đã gia hạn thêm 7 ngày',
    })
  } catch (error) {
    console.error('Error refreshing plant share:', error)
    return NextResponse.json({ error: 'Failed to refresh plant share' }, { status: 500 })
  }
}
