"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { Loader2 } from "lucide-react"
import { Toaster } from "sonner"
import { EconomicAnalysis } from "@/components/viewer/economic-analysis-viewer"
import { MobileIndicator } from '@/components/viewer/mobile-indicator'
import { calculateSolarAnalysis, SurveySettings, ItemInfo, ProductCatalog, SolarAnalysisResult } from '@/lib/solar-calculator-logic'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

export interface PlantQuote {
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
  proposal_title?: string
  proposal_share_slug?: string
}

export interface PlantData {
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

export function PlantClientView({
  plant,
  quotes,
  catalog,
  isExpired,
}: {
  plant: PlantData
  quotes: PlantQuote[]
  catalog: ProductCatalog
  isExpired: boolean
}) {
  return (
    <>
      <Toaster />

      {quotes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có báo giá nào cho địa điểm này.
        </div>
      ) : (
        <PlantTabsView
          quotes={quotes}
          catalog={catalog}
          isExpired={isExpired}
        />
      )}
    </>
  )
}

function PlantTabsView({
  quotes,
  catalog,
  isExpired,
}: {
  quotes: PlantQuote[]
  catalog: ProductCatalog
  isExpired: boolean
}) {
  const selectedIndex = quotes.findIndex((q) => q.is_selected)
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0
  )
  const [activeCalc, setActiveCalc] = useState<SolarAnalysisResult | null>(null)

  const activeQuote = quotes[activeIndex]

  const allCalcs = useMemo(() => {
    return quotes.map((q) => {
      const survey = normalizeSurvey(q?.data)
      const items = normalizeItems(q?.data)
      return calculateSolarAnalysis({ survey, items, catalog })
    })
  }, [quotes, catalog])

  useEffect(() => {
    setActiveCalc(allCalcs[activeIndex])
  }, [allCalcs, activeIndex])

  return (
    <>
      <MobileIndicator
        currentIndex={activeIndex}
        totalCount={quotes.length}
      />

      {!activeCalc ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Swiper
          modules={[Navigation, Keyboard]}
          navigation={false}
          keyboard={{ enabled: true }}
          spaceBetween={0}
          slidesPerView={1}
          initialSlide={activeIndex}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          style={{ width: '100%', overflow: 'hidden' }}
        >
          {quotes.map((q, i) => {
            const calc = allCalcs[i]
            if (!calc) return null
            return (
              <SwiperSlide key={q.id}>
                 <EconomicAnalysis
                    monthlyConsumption={calc.monthlyConsumption}
                    quoteId={q.id}
                    quoteSelected={q.is_selected}
                    monthlySavings={calc.monthlySavings}
                    yearlySavings={calc.yearlySavings}
                    totalCost={calc.totalCost}
                    paybackYears={calc.paybackYears}
                    hasStorage={calc.hasStorage}
                    monthlyProduction={calc.monthlyProduction}
                    dayCoverage={calc.dayCoverage}
                    nightCoverage={calc.nightCoverage}
                    chargeCoverage={calc.chargeCoverage}
                    offpeakCoverage={calc.offpeakCoverage}
                    peakCoverage={calc.peakCoverage}
                    peakExcess={calc.peakExcess}
                    peakNeeded={calc.peakNeeded}
                    offpeakExcess={calc.offpeakExcess}
                    offpeakNeeded={calc.offpeakNeeded}
                    businessNormalKwh={calc.businessNormalKwh}
                    businessPeakKwh={calc.businessPeakKwh}
                    businessOffpeakKwh={calc.businessOffpeakKwh}
                    dayProduced={calc.dayProduced}
                    dayNeeded={calc.dayNeeded}
                    nightAvailable={calc.nightAvailable}
                    nightNeeded={calc.nightNeeded}
                    chargeExcess={calc.chargeExcess}
                    chargeNeeded={calc.chargeNeeded}
                    batteryUsable={calc.batteryUsable}
                    inverterName={calc.inverterName}
                    inverterWarranty={calc.inverterWarranty}
                    inverterCount={calc.inverterCount}
                    panelName={calc.panelName}
                    panelWarranty={calc.panelWarranty}
                    panelCount={calc.panelCount}
                    batteryName={calc.batteryName}
                    batteryWarranty={calc.batteryWarranty}
                    batteryCount={calc.batteryCount}
                    inverterType={calc.inverterType}
                    quoteData={{
                      quote_type: 'solar' as const,
                      system_power: Number(calc.quoteData.system_power),
                      total_price: calc.totalCost,
                      panel_count: calc.panelCount,
                      battery_capacity: calc.hasStorage ? calc.batteryCapacity : 0,
                      phase_type: calc.quoteData.phase_type,
                      daytime_usage: calc.quoteData.daytime_usage,
                      monthly_electricity_kwh: calc.quoteData.monthly_electricity_kwh,
                      monthly_electricity_cost: calc.quoteData.monthly_electricity_cost,
                    }}
                    electricityType={calc.electricityType}
                    businessSavedNormalMoney={calc.businessSavedNormalMoney}
                    businessSavedPeakMoney={calc.businessSavedPeakMoney}
                  />
                </SwiperSlide>
            )
          })}

        </Swiper>
       )}
      </>
  )
}
