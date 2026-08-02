"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { toast, Toaster } from "sonner"
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
          plant={plant}
          isExpired={isExpired}
        />
      )}
    </>
  )
}

function PlantTabsView({
  quotes,
  catalog,
  plant,
  isExpired,
}: {
  quotes: PlantQuote[]
  catalog: ProductCatalog
  plant: PlantData
  isExpired: boolean
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeCalc, setActiveCalc] = useState<SolarAnalysisResult | null>(null)

  const activeQuote = quotes[activeIndex]

  const allCalcs = useMemo(() => {
    return quotes.map(q => {
      const survey = normalizeSurvey(q?.data)
      const items = normalizeItems(q?.data)
      return calculateSolarAnalysis({ survey, items, catalog })
    })
  }, [quotes, catalog])

  useEffect(() => {
    setActiveCalc(allCalcs[activeIndex])
  }, [allCalcs, activeIndex])

  const handleRefresh = async () => {
    if (!plant.share_slug) return
    try {
      const res = await fetch(`/api/plant/${plant.share_slug}/refresh`, { method: 'POST' })
      if (res.ok) {
        toast.success('Đã gia hạn thêm 7 ngày')
      } else {
        const err = await res.json()
        toast.error('Lỗi', { description: err.error || 'Gia hạn thất bại' })
      }
    } catch (err: any) {
      toast.error('Lỗi', { description: err.message || 'Đã xảy ra lỗi' })
    }
  }

  const handlePrev = () => {
    setActiveIndex(Math.max(0, activeIndex - 1))
  }

  const handleNext = () => {
    setActiveIndex(Math.min(quotes.length - 1, activeIndex + 1))
  }

  return (
    <>
      <TabIndicator currentIndex={activeIndex} totalCount={quotes.length} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {quotes.length > 1 && (
            <>
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={activeIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Tùy chọn {activeQuote.option_label}
                {activeQuote.is_recommended && <span className="ml-1 text-xs">(Gợi ý)</span>}
              </span>
              <Button variant="outline" size="sm" onClick={handleNext} disabled={activeIndex === quotes.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {plant.share_slug && !isExpired && (
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <ExternalLink className="h-4 w-4 mr-1" />
            Làm mới
          </Button>
        )}
      </div>

      {!activeCalc ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
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
        </>
      )}
    </>
  )
}
