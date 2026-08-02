"use client"

import { Toaster } from "sonner"
import { EconomicAnalysis } from "@/components/viewer/economic-analysis-viewer"
import { AcceptQuoteButton } from "@/components/viewer/accept-quote-button"
import { SolarAnalysisResult } from "@/lib/solar-calculator-logic"

export function CalculatorClientView({
  calcResult,
  encodedData,
}: {
  calcResult: SolarAnalysisResult
  encodedData: string
}) {
  return (
    <div className="pt-4 flex flex-col gap-4">
      <Toaster />
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
        payload={{ data: encodedData, total_amount: calcResult.totalCost }}
      />
    </div>
  )
}
