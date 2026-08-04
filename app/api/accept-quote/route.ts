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

    const proposalCheck = await client.query(
      `SELECT qp.status as proposal_status, q.proposal_id
       FROM quotes q
       JOIN quote_proposals qp ON q.proposal_id = qp.id
       WHERE q.id = $1`,
      [quote_id]
    )

    if (proposalCheck.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const { proposal_status, proposal_id } = proposalCheck.rows[0]

    if (proposal_status === 'cancelled' || proposal_status === 'confirm' || proposal_status === 'complete') {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Đề xuất đã được khóa, không thể thay đổi lựa chọn' },
        { status: 403 }
      )
    }

    await client.query(
      `UPDATE quotes SET is_selected = false, status = 'created'
       WHERE proposal_id = $1 AND id != $2 AND is_selected = true`,
      [proposal_id, quote_id]
    )

    await client.query(
      'UPDATE quotes SET is_selected = true, status = $1 WHERE id = $2',
      ['select', quote_id]
    )

    await client.query(
      "UPDATE quote_proposals SET status = 'select' WHERE id = $1",
      [proposal_id]
    )

    const confirmation = await client.query(
      'INSERT INTO quote_confirmations (quote_id, proposal_id, total_amount, snapshot) VALUES ($1, $2, $3, $4) ON CONFLICT (quote_id) DO UPDATE SET total_amount = EXCLUDED.total_amount, snapshot = EXCLUDED.snapshot RETURNING *',
      [quote_id, proposal_id, total_amount || null, JSON.stringify(data)]
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
