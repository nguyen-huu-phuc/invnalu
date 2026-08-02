import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { quote_id, data, total_amount } = body

    if (!data) {
      return NextResponse.json(
        { error: 'data is required' },
        { status: 400 }
      )
    }

    // Calculator share link (no quote_id) — cannot proxy to Calnalu
    if (!quote_id) {
      return NextResponse.json(
        { error: 'No quote_id — please contact sales to create a proposal' },
        { status: 503 }
      )
    }

    const calnaluUrl = process.env.NEXT_PUBLIC_CALNALU_URL || 'https://cal.nalu.vn'

    const res = await fetch(`${calnaluUrl}/api/quotes/${quote_id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, total_amount }),
      signal: AbortSignal.timeout(10000),
    })

    if (res.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized - calnalu auth required' },
        { status: 401 }
      )
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.error || 'Failed to accept quote on calnalu' },
        { status: res.status }
      )
    }

    const result = await res.json()
    return NextResponse.json(result)
  } catch (error: any) {
    const message = error?.message || 'Unknown error'
    const isTimeout = message.includes('timeout') || message.includes('AbortError')
    if (isTimeout) {
      return NextResponse.json(
        { error: 'Calnalu is unreachable' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to accept quote: ' + message },
      { status: 502 }
    )
  }
}
