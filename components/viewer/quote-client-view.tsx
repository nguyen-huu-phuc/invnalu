"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Toaster />
        {quotes.length > 1 ? (
          <QuoteTabsView
            quotes={quotes}
            catalog={catalog}
          />
        ) : (
          <QuoteSingleView
            quote={quotes[0]}
            calc={calcResult}
          />
        )}
      </div>
    )
  }

function QuoteSingleView({
  quote,
  calc,
}: {
  quote: Quote
  calc: SolarAnalysisResult
}) {
  return (
    <EconomicAnalysisWithAccept
      calc={calc}
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
      monthlyConsumption={calc.monthlyConsumption}
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
      acceptPayload={{
        quote_id: quote.id,
        data: quote.data,
        total_amount: quote.total_price,
      }}
    />
  )
}

function QuoteTabsView({
  quotes,
  catalog,
}: {
  quotes: Quote[]
  catalog: ProductCatalog
}) {
  const [activeQuote, setActiveQuote] = useState(quotes[0])
  const survey = normalizeSurvey(activeQuote?.data)
  const items = normalizeItems(activeQuote?.data)
  const calc = calculateSolarAnalysis({ survey, items, catalog })

  return (
    <>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {quotes.map((q) => (
          <Button
            key={q.id}
            variant={activeQuote.id === q.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveQuote(q)}
          >
            Tùy chọn {q.option_label}
          </Button>
        ))}
      </div>

      <EconomicAnalysisWithAccept
        calc={calc}
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
        monthlyConsumption={calc.monthlyConsumption}
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
        acceptPayload={{
          quote_id: activeQuote.id,
          data: activeQuote.data,
          total_amount: activeQuote.total_price,
        }}
      />
    </>
  )
}

interface EconomicAnalysisWithAcceptProps {
  calc: SolarAnalysisResult
  quoteData: {
    quote_type: 'solar' | 'pump'
    system_power: number
    total_price: number
    panel_count: number
    battery_capacity: number
    phase_type: '1 phase' | '3 phase'
    daytime_usage: number
    monthly_electricity_kwh: number
    monthly_electricity_cost: number
  }
  electricityType: 'residential' | 'business'
  businessSavedNormalMoney: number
  businessSavedPeakMoney: number
  monthlyConsumption: number
  monthlySavings: number
  yearlySavings: number
  totalCost: number
  paybackYears: number
  hasStorage: boolean
  monthlyProduction: number
  dayCoverage: number
  nightCoverage: number
  chargeCoverage: number
  offpeakCoverage: number
  peakCoverage: number
  peakExcess: number
  peakNeeded: number
  offpeakExcess: number
  offpeakNeeded: number
  businessNormalKwh: number
  businessPeakKwh: number
  businessOffpeakKwh: number
  dayProduced: number
  dayNeeded: number
  nightAvailable: number
  nightNeeded: number
  chargeExcess: number
  chargeNeeded: number
  batteryUsable: number
  inverterName?: string
  inverterWarranty?: number
  inverterCount: number
  panelName?: string
  panelWarranty?: number
  panelCount: number
  batteryName?: string
  batteryWarranty?: number
  batteryCount: number
  inverterType: string
  acceptPayload: {
    quote_id: number
    data: any
    total_amount: number | null
  }
}

function EconomicAnalysisWithAccept(props: EconomicAnalysisWithAcceptProps) {
  return (
    <>
      <EconomicAnalysis
        monthlyConsumption={props.monthlyConsumption}
        monthlySavings={props.monthlySavings}
        yearlySavings={props.yearlySavings}
        totalCost={props.totalCost}
        paybackYears={props.paybackYears}
        hasStorage={props.hasStorage}
        monthlyProduction={props.monthlyProduction}
        dayCoverage={props.dayCoverage}
        nightCoverage={props.nightCoverage}
        chargeCoverage={props.chargeCoverage}
        offpeakCoverage={props.offpeakCoverage}
        peakCoverage={props.peakCoverage}
        peakExcess={props.peakExcess}
        peakNeeded={props.peakNeeded}
        offpeakExcess={props.offpeakExcess}
        offpeakNeeded={props.offpeakNeeded}
        businessNormalKwh={props.businessNormalKwh}
        businessPeakKwh={props.businessPeakKwh}
        businessOffpeakKwh={props.businessOffpeakKwh}
        dayProduced={props.dayProduced}
        dayNeeded={props.dayNeeded}
        nightAvailable={props.nightAvailable}
        nightNeeded={props.nightNeeded}
        chargeExcess={props.chargeExcess}
        chargeNeeded={props.chargeNeeded}
        batteryUsable={props.batteryUsable}
        inverterName={props.inverterName}
        inverterWarranty={props.inverterWarranty}
        inverterCount={props.inverterCount}
        panelName={props.panelName}
        panelWarranty={props.panelWarranty}
        panelCount={props.panelCount}
        batteryName={props.batteryName}
        batteryWarranty={props.batteryWarranty}
        batteryCount={props.batteryCount}
        inverterType={props.inverterType}
        quoteData={props.quoteData}
        electricityType={props.electricityType}
        businessSavedNormalMoney={props.businessSavedNormalMoney}
        businessSavedPeakMoney={props.businessSavedPeakMoney}
      />

      <AcceptQuoteButton payload={props.acceptPayload} />
    </>
  )
}
