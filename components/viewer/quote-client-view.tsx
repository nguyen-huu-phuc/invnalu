"use client"

import { Toaster } from "sonner"
import { AcceptQuoteButton } from "@/components/viewer/accept-quote-button"
import { EconomicAnalysis } from "@/components/viewer/economic-analysis-viewer"
import { calculateSolarAnalysis, SurveySettings, ItemInfo, ProductCatalog, SolarAnalysisResult } from '@/lib/solar-calculator-logic'

interface Quote {
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

export function QuoteClientView({
  quotes,
  catalog,
  calcResult,
}: {
  quotes: Quote[]
  catalog: ProductCatalog
  calcResult: SolarAnalysisResult
}) {
  const quote = quotes[0]

  return (
    <>
      <Toaster />

      {quotes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Chưa có báo giá nào cho địa điểm này.
        </div>
      ) : (
        <>
          <EconomicAnalysis
            monthlyConsumption={calcResult.monthlyConsumption}
            monthlySavings={calcResult.monthlySavings}
            yearlySavings={calcResult.yearlySavings}
            totalCost={calcResult.totalCost}
            paybackYears={calcResult.paybackYears}
            hasStorage={calcResult.hasStorage}
            monthlyProduction={calcResult.monthlyProduction}
            dayCoverage={calcResult.dayCoverage}
            nightCoverage={calcResult.nightCoverage}
            chargeCoverage={calcResult.chargeCoverage}
            offpeakCoverage={calcResult.offpeakCoverage}
            peakCoverage={calcResult.peakCoverage}
            peakExcess={calcResult.peakExcess}
            peakNeeded={calcResult.peakNeeded}
            offpeakExcess={calcResult.offpeakExcess}
            offpeakNeeded={calcResult.offpeakNeeded}
            businessNormalKwh={calcResult.businessNormalKwh}
            businessPeakKwh={calcResult.businessPeakKwh}
            businessOffpeakKwh={calcResult.businessOffpeakKwh}
            dayProduced={calcResult.dayProduced}
            dayNeeded={calcResult.dayNeeded}
            nightAvailable={calcResult.nightAvailable}
            nightNeeded={calcResult.nightNeeded}
            chargeExcess={calcResult.chargeExcess}
            chargeNeeded={calcResult.chargeNeeded}
            batteryUsable={calcResult.batteryUsable}
            inverterName={calcResult.inverterName}
            inverterWarranty={calcResult.inverterWarranty}
            inverterCount={calcResult.inverterCount}
            panelName={calcResult.panelName}
            panelWarranty={calcResult.panelWarranty}
            panelCount={calcResult.panelCount}
            batteryName={calcResult.batteryName}
            batteryWarranty={calcResult.batteryWarranty}
            batteryCount={calcResult.batteryCount}
            inverterType={calcResult.inverterType}
            quoteData={{
              quote_type: 'solar' as const,
              system_power: Number(calcResult.quoteData.system_power),
              total_price: calcResult.totalCost,
              panel_count: calcResult.panelCount,
              battery_capacity: calcResult.hasStorage ? calcResult.batteryCapacity : 0,
              phase_type: calcResult.quoteData.phase_type,
              daytime_usage: calcResult.quoteData.daytime_usage,
              monthly_electricity_kwh: calcResult.quoteData.monthly_electricity_kwh,
              monthly_electricity_cost: calcResult.quoteData.monthly_electricity_cost,
            }}
            electricityType={calcResult.electricityType}
            businessSavedNormalMoney={calcResult.businessSavedNormalMoney}
            businessSavedPeakMoney={calcResult.businessSavedPeakMoney}
          />

          <AcceptQuoteButton
            payload={{
              quote_id: quote.id,
              data: quote.data,
              total_amount: quote.total_price,
            }}
          />
        </>
      )}
    </>
  )
}