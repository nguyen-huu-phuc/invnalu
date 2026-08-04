import { Pool } from 'pg'
import { SurveySettingsRaw, ItemInfoRaw, QuoteRaw, PlantRaw } from '@/types/solar'

export type { SurveySettingsRaw, ItemInfoRaw, QuoteRaw, PlantRaw }

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined
}

const pool =
  globalThis.pgPool ||
  new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'solar_calculator',
    user: process.env.POSTGRES_USER || 'solar',
    password: process.env.POSTGRES_PASSWORD || 'solar123',
    // Read-only connection
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.pgPool = pool
}

export async function query(text: string, params?: any[]) {
  return pool.query(text, params)
}

export async function getQuoteProposalBySlug(slug: string) {
  const result = await pool.query(
    `SELECT qp.*, p.name as plant_name, p.address as plant_address, p.location as plant_location,
             c.name as customer_name, c.phone as customer_phone, c.email as customer_email
      FROM quote_proposals qp
      LEFT JOIN plants p ON qp.plant_id = p.id
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE qp.share_slug = $1`,
    [slug]
  )
  return result.rows[0] || null
}

export async function getQuotesByProposalId(proposalId: number) {
  const result = await pool.query(
    `SELECT id, proposal_id, option_label, option_order, is_recommended, is_selected, status, data, total_price, system_power, created_at
      FROM quotes WHERE proposal_id = $1 ORDER BY option_order ASC`,
    [proposalId]
  )
  return result.rows
}

export async function getPlantBySlug(slug: string): Promise<PlantRaw | null> {
  const result = await pool.query(
    `SELECT p.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
     FROM plants p
     LEFT JOIN customers c ON p.customer_id = c.id
     WHERE p.share_slug = $1`,
    [slug]
  )
  return result.rows[0] || null
}

export async function getQuotesByPlantId(plantId: number): Promise<QuoteRaw[]> {
  const result = await pool.query(
    `SELECT q.id, q.proposal_id, q.option_label, q.option_order, q.is_recommended, q.is_selected,
            q.status, q.data, q.total_price, q.system_power, q.created_at,
            qp.title as proposal_title, qp.share_slug as proposal_share_slug, qp.status as proposal_status,
            qp.plant_id
     FROM quotes q
     JOIN quote_proposals qp ON q.proposal_id = qp.id
     WHERE qp.plant_id = $1
     ORDER BY qp.created_at DESC, q.option_order ASC`,
    [plantId]
  )
  return result.rows
}

export async function refreshPlantShare(slug: string, expiresDays: number = 7) {
  const result = await pool.query(
    'UPDATE plants SET expires_at = NOW() + ($1 || \' days\')::interval, updated_at = CURRENT_TIMESTAMP WHERE share_slug = $2 RETURNING share_slug, expires_at',
    [expiresDays, slug]
  )
  return result.rows[0] || null
}

// In-memory cache for products catalog
let productsCache: {
  data: {
    inverters: any[]
    panels: any[]
    batteries: any[]
    components: any[]
  }
  timestamp: number
} | null = null

const PRODUCTS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getProducts() {
  const now = Date.now()
  if (productsCache && now - productsCache.timestamp < PRODUCTS_CACHE_TTL) {
    return productsCache.data
  }

  const [inverters, panels, batteries, components] = await Promise.all([
    pool.query('SELECT * FROM inverters WHERE status = 1'),
    pool.query('SELECT * FROM panels WHERE status = 1 ORDER BY power_output DESC'),
    pool.query('SELECT * FROM batteries WHERE status = 1'),
    pool.query('SELECT * FROM components WHERE status = 1'),
  ])

  const catalog = {
    inverters: inverters.rows,
    panels: panels.rows,
    batteries: batteries.rows,
    components: components.rows,
  }

  productsCache = {
    data: catalog,
    timestamp: now,
  }

  return catalog
}

export default pool

