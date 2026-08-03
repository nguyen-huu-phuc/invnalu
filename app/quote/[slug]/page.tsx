import type { Metadata } from "next"
import { notFound } from 'next/navigation'
import { getQuoteProposalBySlug, getQuotesByProposalId, getProducts } from '@/lib/db'
import { calculateSolarAnalysis, SurveySettings, ItemInfo, ProductCatalog } from '@/lib/solar-calculator-logic'
import { QuoteClientView } from '@/components/viewer/quote-client-view'

export interface Quote {
  id: number
  proposal_id: number
  option_label: string
  option_order: number
  is_recommended: boolean
  is_selected: boolean
  status: string
  data: any
  total_price: number | null
  system_power: number | null
  created_at: string
}

export interface ProposalData {
  id: number
  share_slug: string
  title: string
  status: string
  notes: string | null
  plant_id: number | null
  plant_name?: string
  plant_address?: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
}

async function loadData(slug: string) {
  const proposal = await getQuoteProposalBySlug(slug)
  if (!proposal) return null

  const quotes = await getQuotesByProposalId(proposal.id)
  const products = await getProducts()

  return { proposal, quotes, products }
}

function normalizeSurvey(data: any): SurveySettings {
  const survey = data?.survey || data?.settings || {}
  return {
    inputType: survey.inputType ?? 'bill',
    billAmount: survey.billAmount ?? 0,
    kwhUsage: survey.kwhUsage ?? 0,
    electricityType: survey.electricityType ?? 'residential',
    businessNormalKwh: survey.businessNormalKwh ?? 0,
    businessPeakKwh: survey.businessPeakKwh ?? 0,
    businessOffpeakKwh: survey.businessOffpeakKwh ?? 0,
    daytimeUsage: survey.daytimeUsage ?? 0,
    tilt: survey.tilt ?? 0,
    azimuth: survey.azimuth ?? 0,
    storage: survey.storage ?? 'no',
    phase: survey.phase ?? '1-phase',
    inverterFactory: survey.inverterFactory ?? 'all',
    latitude: survey.latitude ?? 11.533486,
    longitude: survey.longitude ?? 106.891618,
  }
}

function normalizeItems(data: any): ItemInfo[] {
  const items = data?.items || data?.itemDetails || []
  if (Array.isArray(items)) return items
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await loadData(slug)

  if (!data) {
    return { title: "Báo giá", openGraph: { title: "Báo giá", images: ["/nalu-logo-trans-512x234.png"] }, twitter: { card: "summary_large_image", title: "Báo giá", images: ["/nalu-logo-trans-512x234.png"] } }
  }

  const { proposal, quotes, products } = data

  const plantName = proposal.plant_name || ""
  const customerName = proposal.customer_name || ""
  const title = `Báo giá ${plantName} ${customerName}`

  if (quotes.length === 0) {
    return { title, openGraph: { title, images: ["/nalu-logo-trans-512x234.png"] }, twitter: { card: "summary_large_image", title, images: ["/nalu-logo-trans-512x234.png"] } }
  }

  const normalizedQuotes: Quote[] = quotes.map((q) => ({
    ...q,
    data: typeof q.data === "string" ? JSON.parse(q.data) : q.data,
  }))

  const catalog: ProductCatalog = {
    inverters: products.inverters,
    panels: products.panels,
    batteries: products.batteries,
    components: products.components,
  }

  const firstQuote = normalizedQuotes[0]
  const survey = normalizeSurvey(firstQuote?.data)
  const items = normalizeItems(firstQuote?.data)
  const calcResult = calculateSolarAnalysis({ survey, items, catalog })

  const inverterType =
    calcResult.inverterType === "hybrid" ? "hybrid" : "ongrid"
  const systemPower = calcResult.quoteData.system_power.toFixed(1)
  let description = `Hệ thống ${inverterType} công suất ${systemPower} kWp`
  if (calcResult.hasStorage && calcResult.batteryCapacity > 0) {
    description += `, lưu trữ ${Number(calcResult.batteryCapacity).toFixed(1)} kWh`
  }

  return { title, description, openGraph: { title, description, images: ["/nalu-logo-trans-512x234.png"] }, twitter: { card: "summary_large_image", title, description, images: ["/nalu-logo-trans-512x234.png"] } }
}

export default async function QuoteSharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await loadData(slug)

  if (!data) {
    notFound()
  }

  const { quotes, products } = data

  const normalizedQuotes: Quote[] = quotes.map(q => ({
    ...q,
    data: typeof q.data === 'string' ? JSON.parse(q.data) : q.data,
  }))

  const catalog: ProductCatalog = {
    inverters: products.inverters,
    panels: products.panels,
    batteries: products.batteries,
    components: products.components,
  }

  const firstQuote = normalizedQuotes[0]
  const survey = normalizeSurvey(firstQuote?.data)
  const items = normalizeItems(firstQuote?.data)
  const calcResult = calculateSolarAnalysis({ survey, items, catalog })

  return (
    <>
      <div className="container mx-auto px-0 py-0 sm:px-4 sm:py-6 max-w-5xl">
        <QuoteClientView
          quotes={normalizedQuotes}
          catalog={catalog}
          calcResult={calcResult}
        />
      </div>
    </>
  )
}
