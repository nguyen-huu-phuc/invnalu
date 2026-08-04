export interface SurveySettingsRaw {
  electricityType?: "residential" | "business"
  inputType?: "bill" | "kwh"
  billAmount?: number
  kwhUsage?: number
  daytimeUsage?: number
  tilt?: number
  azimuth?: number
  storage?: string
  phase?: string
  inverterFactory?: string
  latitude?: number
  longitude?: number
  businessNormalKwh?: number
  businessPeakKwh?: number
  businessOffpeakKwh?: number
}

export interface ItemInfoRaw {
  product_type: string
  sku: string | number
  quantity: number
}

export interface QuoteRaw {
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
  proposal?: {
    id: number
    share_slug: string
    title: string
    status: string
    plant_id: number | null
    plant_name?: string
    plant_address?: string
    customer_name?: string
    customer_phone?: string
  }
}

export interface PlantRaw {
  id: number
  customer_id: number | null
  name: string
  address: string | null
  location: string | null
  contact_name: string | null
  contact_phone: string | null
  share_slug: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
}

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
