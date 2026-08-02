"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { Loader2 } from "lucide-react"
import { Toaster } from "sonner"
import { EconomicAnalysis } from "@/components/viewer/economic-analysis-viewer"
import { AcceptQuoteButton } from "@/components/viewer/accept-quote-button"
import { TabIndicator } from '@/components/viewer/tab-indicator'
import { calculateSolarAnalysis, SurveySettings, ItemInfo, ProductCatalog, SolarAnalysisResult } from '@/lib/solar-calculator-logic'

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

  const handlePrev = () => {
    setActiveIndex(Math.max(0, activeIndex - 1))
  }

  const handleNext = () => {
    setActiveIndex(Math.min(quotes.length - 1, activeIndex + 1))
  }

  const pointerStart = useRef<{ x: number; time: number } | null>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      pointerStart.current = { x: e.clientX, time: Date.now() }
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStart.current) return
    const { x, time } = pointerStart.current
    pointerStart.current = null
    if (e.pointerType !== 'touch') return

    const dx = e.clientX - x
    const dt = Date.now() - time
    const absDx = Math.abs(dx)

    if (absDx > 50 && dt < 500) {
      if (dx > 0) {
        handlePrev()
      } else {
        handleNext()
      }
    }
  }

  return (
    <>
      <TabIndicator
        currentIndex={activeIndex}
        totalCount={quotes.length}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {!activeCalc ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
<div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'pan-y' }}
        >
          <EconomicAnalysis
            monthlyConsumption={activeCalc.monthlyConsumption}
            monthlySavings={activeCalc.monthlySavings}
            yearlySavings={activeCalc.yearlySavings}
            totalCost={activeCalc.totalCost}
            paybackYears={activeCalc.paybackYears}
            hasStorage={activeCalc.hasStorage}
            monthlyProduction={activeCalc.monthlyProduction}
            dayCoverage={activeCalc.dayCoverage}
            nightCoverage={activeCalc.nightCoverage}
            chargeCoverage={activeCalc.chargeCoverage}
            offpeakCoverage={activeCalc.offpeakCoverage}
            peakCoverage={activeCalc.peakCoverage}
            peakExcess={activeCalc.peakExcess}
            peakNeeded={activeCalc.peakNeeded}
            offpeakExcess={activeCalc.offpeakExcess}
            offpeakNeeded={activeCalc.offpeakNeeded}
            businessNormalKwh={activeCalc.businessNormalKwh}
            businessPeakKwh={activeCalc.businessPeakKwh}
            businessOffpeakKwh={activeCalc.businessOffpeakKwh}
            dayProduced={activeCalc.dayProduced}
            dayNeeded={activeCalc.dayNeeded}
            nightAvailable={activeCalc.nightAvailable}
            nightNeeded={activeCalc.nightNeeded}
            chargeExcess={activeCalc.chargeExcess}
            chargeNeeded={activeCalc.chargeNeeded}
            batteryUsable={activeCalc.batteryUsable}
            inverterName={activeCalc.inverterName}
            inverterWarranty={activeCalc.inverterWarranty}
            inverterCount={activeCalc.inverterCount}
            panelName={activeCalc.panelName}
            panelWarranty={activeCalc.panelWarranty}
            panelCount={activeCalc.panelCount}
            batteryName={activeCalc.batteryName}
            batteryWarranty={activeCalc.batteryWarranty}
            batteryCount={activeCalc.batteryCount}
            inverterType={activeCalc.inverterType}
            quoteData={{
              quote_type: 'solar' as const,
              system_power: Number(activeCalc.quoteData.system_power),
              total_price: activeCalc.totalCost,
              panel_count: activeCalc.panelCount,
              battery_capacity: activeCalc.hasStorage ? activeCalc.batteryCapacity : 0,
              phase_type: activeCalc.quoteData.phase_type,
              daytime_usage: activeCalc.quoteData.daytime_usage,
              monthly_electricity_kwh: activeCalc.quoteData.monthly_electricity_kwh,
              monthly_electricity_cost: activeCalc.quoteData.monthly_electricity_cost,
            }}
            electricityType={activeCalc.electricityType}
            businessSavedNormalMoney={activeCalc.businessSavedNormalMoney}
            businessSavedPeakMoney={activeCalc.businessSavedPeakMoney}
          />

          <AcceptQuoteButton
            payload={{
              quote_id: activeQuote.id,
              data: activeQuote.data,
              total_amount: activeQuote.total_price,
            }}
          />
        </div>
      )}
    </>
  )
}
