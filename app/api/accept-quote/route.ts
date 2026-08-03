import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()
  const { quote_id, data, total_amount } = body

  if (!data) {
    return NextResponse.json(
      { error: 'data is required' },
      { status: 400 }
    )
  }

  if (!quote_id) {
    return NextResponse.json(
      { error: 'No quote_id — please contact sales to create a proposal' },
      { status: 503 }
    )
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(
      'UPDATE quotes SET is_selected = true, status = $1 WHERE id = $2',
      ['confirmed', quote_id]
    )

    await client.query(
      "UPDATE quote_proposals SET status = 'selected' WHERE id = (SELECT proposal_id FROM quotes WHERE id = $1)",
      [quote_id]
    )

    const proposalResult = await client.query(
      'SELECT proposal_id FROM quotes WHERE id = $1',
      [quote_id]
    )
    const proposalId = proposalResult.rows[0]?.proposal_id

    const confirmation = await client.query(
      'INSERT INTO quote_confirmations (quote_id, proposal_id, total_amount, snapshot) VALUES ($1, $2, $3, $4) ON CONFLICT (quote_id) DO UPDATE SET total_amount = EXCLUDED.total_amount, snapshot = EXCLUDED.snapshot RETURNING *',
      [quote_id, proposalId, total_amount || null, JSON.stringify(data)]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      confirmation_id: confirmation.rows[0]?.id,
      total_amount,
    })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('Error accepting quote:', error)
    return NextResponse.json(
      { error: 'Failed to accept quote: ' + error?.message || 'Unknown error' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
