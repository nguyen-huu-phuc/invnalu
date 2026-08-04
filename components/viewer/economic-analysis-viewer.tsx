"use client"

import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { ExportImage } from "@/components/export-image"
import type { AcceptPayload } from "@/components/viewer/accept-quote-button"
import { TrendingUp, DollarSign, Clock, Cpu, Sun, Moon, Battery, Box, Zap, Activity, Server, SolarPanel, BatteryCharging, CircuitBoard, PiggyBank } from "lucide-react"
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react"
import { formatVND } from "@/lib/utils"

const AcceptQuoteButton = dynamic(
  () => import("@/components/viewer/accept-quote-button").then((m) => m.AcceptQuoteButton),
  { ssr: false }
)


interface EconomicAnalysisProps {
  monthlyConsumption: number
  monthlySavings: number
  yearlySavings: number
  totalCost: number
  paybackYears: number
  hasStorage: boolean
  monthlyProduction?: number
  dayCoverage?: number
  nightCoverage?: number
  chargeCoverage?: number
  offpeakCoverage?: number
  peakCoverage?: number
  peakExcess?: number
  peakNeeded?: number
  offpeakExcess?: number
  offpeakNeeded?: number
  businessNormalKwh?: number
  businessPeakKwh?: number
  businessOffpeakKwh?: number
  dayProduced?: number
  dayNeeded?: number
  nightAvailable?: number
  nightNeeded?: number
  chargeExcess?: number
  chargeNeeded?: number
  batteryUsable?: number
  inverterName?: string
  inverterWarranty?: number
  inverterCount?: number
  panelName?: string
  panelWarranty?: number
  panelCount?: number
  batteryName?: string
  batteryWarranty?: number
  batteryCount?: number
  inverterType?: string
  quoteData?: {
    quote_type: 'solar' | 'pump'
    system_power: number
    inverter_id?: number
    panel_id?: number
    battery_id?: number
    panel_count: number
    battery_capacity: number
    total_price: number
    phase_type: '1 phase' | '3 phase'
    daytime_usage: number
    monthly_electricity_kwh: number
    monthly_electricity_cost: number
  }
   electricityType?: "residential" | "business"
   businessSavedNormalMoney?: number
   businessSavedPeakMoney?: number
   quoteId?: number
   quoteSelected?: boolean
}

function formatWarranty(months?: number): string {
  if (!months || months <= 0) return ""
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (years > 0 && remainingMonths > 0) return `${years} năm ${remainingMonths} tháng`
  if (years > 0) return `${years} năm`
  return `${remainingMonths} tháng`
}

export const EconomicAnalysis = forwardRef<HTMLDivElement, EconomicAnalysisProps>(({
  monthlyConsumption,
  monthlySavings,
  yearlySavings,
  totalCost,
  paybackYears,
  hasStorage,
  monthlyProduction,
  dayCoverage,
  nightCoverage,
  chargeCoverage,
  offpeakCoverage,
  peakCoverage,
  peakExcess,
  peakNeeded,
  offpeakExcess,
  offpeakNeeded,
  businessNormalKwh,
  businessPeakKwh,
  businessOffpeakKwh,
  dayProduced,
  dayNeeded,
  nightAvailable,
  nightNeeded,
  chargeExcess,
  chargeNeeded,
  batteryUsable,
  inverterName,
  inverterWarranty,
  inverterCount,
  panelName,
  panelWarranty,
  panelCount,
  batteryName,
  batteryWarranty,
  batteryCount,
  inverterType,
  quoteData,
  electricityType,
   businessSavedNormalMoney,
   businessSavedPeakMoney,
   quoteId,
   quoteSelected,
}, ref) => {
  const [mounted, setMounted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => cardRef.current as HTMLDivElement)
  useEffect(() => {
    setMounted(true)
  }, [])

  const roundedCost = Math.ceil(totalCost / 100000) * 100000
  const roundedMonthlySavings = Math.ceil(monthlySavings / 1000) * 1000
  const roundedYearlySavings = roundedMonthlySavings * 12

  const coverageValues = [
    dayCoverage || 0,
    hasStorage ? (nightCoverage || 0) : 0,
    hasStorage ? (chargeCoverage || 0) : 0,
  ]
  const getBarWidth = (val: number) => `${Math.min(100, val)}%`

  return (
    <div ref={cardRef} className="relative">
      <Card className="border-primary/20 shadow-sm" data-export="quote">
       {quoteId && (
         <AcceptQuoteButton
           payload={{
             quote_id: quoteId,
             data: quoteData,
             total_amount: quoteData?.total_price,
           } as AcceptPayload}
           accepted={quoteSelected}
         />
       )}
        <CardContent className="pt-0 space-y-3 sm:space-y-5">
            <div className="text-sm">
            <div className="flex items-center gap-2">
               <ExportImage trigger={<Server className="w-4 h-4 text-blue-500 shrink-0" />} />
               <span className="sm:hidden text-sm font-semibold">Hệ thống {inverterType === 'hybrid' ? 'hybrid' : 'ongrid'} {quoteData?.system_power?.toFixed(1)} kWp{hasStorage && quoteData?.battery_capacity ? `, lưu trữ ${Number(quoteData.battery_capacity).toFixed(1)} kWh` : ''}</span>
               <span className="hidden sm:inline sm:truncate text-base sm:text-lg font-semibold">
                Hệ thống {inverterType === 'hybrid' ? 'hybrid' : 'ongrid'} công suất {quoteData?.system_power?.toFixed(1)} kWp
                {hasStorage && quoteData?.battery_capacity ? `, lưu trữ ${Number(quoteData.battery_capacity).toFixed(1)} kWh` : ''}
               </span>
            </div>
            </div>

        {/* Mobile Warranty List */}
        <div className="block sm:hidden rounded-xl border border-border/60 bg-muted/10 divide-y divide-border/50">
          {inverterName && inverterCount && formatWarranty(inverterWarranty) ? (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">Biến tần {inverterName}</span>
              </div>
              <span className="mt-0.5 block text-sm text-muted-foreground ml-[1.4rem]">Số lượng: {inverterCount} · Bảo hành: {formatWarranty(inverterWarranty)}</span>
            </div>
          ) : null}
          {panelName && panelCount && formatWarranty(panelWarranty) ? (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <SolarPanel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">Tấm pin {panelName}</span>
              </div>
              <span className="mt-0.5 block text-sm text-muted-foreground ml-[1.4rem]">Số lượng: {panelCount} · Bảo hành: {formatWarranty(panelWarranty)}</span>
            </div>
          ) : null}
          {hasStorage && batteryName && batteryCount && formatWarranty(batteryWarranty) ? (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <Battery className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">Pin {batteryName}</span>
              </div>
              <span className="mt-0.5 block text-sm text-muted-foreground ml-[1.4rem]">Số lượng: {batteryCount} · Bảo hành: {formatWarranty(batteryWarranty)}</span>
            </div>
          ) : null}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2">
              <CircuitBoard className="w-3.5 h-3.5 text-chart-3 shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">Tủ, thiết bị bảo vệ khác</span>
            </div>
            <span className="mt-0.5 block text-sm text-muted-foreground ml-[1.4rem]">Số lượng: 1 · Bảo hành: 1 năm</span>
          </div>
        </div>
        <div className="hidden sm:block w-full overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-left">
                <th className="px-3 py-2 font-medium text-foreground">Thiết bị</th>
                <th className="px-3 py-2 font-medium text-foreground text-center">Số lượng</th>
                <th className="px-3 py-2 font-medium text-foreground text-center">Bảo hành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {inverterName && inverterCount && formatWarranty(inverterWarranty) ? (
                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="font-medium text-foreground truncate">Biến tần {inverterName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-foreground text-center">{inverterCount}</td>
                  <td className="px-3 py-2.5 text-foreground text-center">{formatWarranty(inverterWarranty)}</td>
                </tr>
              ) : null}
              {panelName && panelCount && formatWarranty(panelWarranty) ? (
                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <SolarPanel className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-medium text-foreground truncate">Tấm pin {panelName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-foreground text-center">{panelCount}</td>
                  <td className="px-3 py-2.5 text-foreground text-center">{formatWarranty(panelWarranty)}</td>
                </tr>
              ) : null}
              {hasStorage && batteryName && batteryCount && formatWarranty(batteryWarranty) ? (
                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-medium text-foreground truncate">Pin lưu trữ {batteryName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-foreground text-center">{batteryCount}</td>
                  <td className="px-3 py-2.5 text-foreground text-center">{formatWarranty(batteryWarranty)}</td>
                </tr>
              ) : null}
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <CircuitBoard className="w-4 h-4 text-chart-3 shrink-0" />
                    <span className="font-medium text-foreground truncate">Tủ, thiết bị bảo vệ khác</span>
                  </div>
                </td>
                  <td className="px-3 py-2.5 text-foreground text-center">1</td>
                  <td className="px-3 py-2.5 text-foreground text-center">1 năm</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sản lượng Section */}
        <div className="p-3 rounded-xl border border-border/60 bg-secondary/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="font-medium text-foreground text-sm">Sản lượng trung bình</span>
            </div>
            <span className="font-medium text-foreground text-sm">{monthlyProduction?.toFixed(0)} kWh/tháng</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-muted-foreground">
                  {electricityType === "business" ? "Bình thường" : "Ban ngày"} {dayProduced?.toFixed(1)}/{dayNeeded?.toFixed(1)}
                </span>
              </div>
              <span className="font-medium text-amber-500">{dayCoverage?.toFixed(0)}%</span>
            </div>
            <div className="relative h-2 rounded-full bg-muted">
              <div 
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{ 
                  width: getBarWidth(dayCoverage || 0),
                  background: `linear-gradient(to right, rgba(251, 191, 36, ${Math.max(0.7, 1 - (dayCoverage || 0) * 0.005)}), rgba(245, 158, 11, ${Math.min(1, 0.8 + (dayCoverage || 0) * 0.002)}))`
                }} 
              />
            </div>
          </div>
          {hasStorage && electricityType === "business" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">Cao điểm {(chargeExcess && batteryUsable ? Math.min(chargeExcess, batteryUsable) : 0)?.toFixed(1)}/{(peakNeeded || 0)?.toFixed(1)}</span>
                </div>
                <span className="font-medium text-blue-500">{peakCoverage?.toFixed(0)}%</span>
              </div>
              <div className="relative h-2 rounded-full bg-muted">
                <div 
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{ 
                    width: getBarWidth(peakCoverage || 0),
                    background: `linear-gradient(to right, rgba(96, 165, 250, ${Math.max(0.7, 1 - (peakCoverage || 0) * 0.005)}), rgba(59, 130, 246, ${Math.min(1, 0.8 + (peakCoverage || 0) * 0.002)}))`
                  }} 
                />
              </div>
            </div>
          )}
          {hasStorage && electricityType === "business" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-chart-3" />
                    <span className="text-muted-foreground">Thấp điểm {Math.max(0, (chargeExcess && batteryUsable ? Math.min(chargeExcess, batteryUsable) - (peakNeeded || 0) : 0))?.toFixed(1)}/{(offpeakNeeded || 0)?.toFixed(1)}</span>
                  </div>
                  <span className="font-medium text-chart-3">{offpeakCoverage?.toFixed(0)}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted">
                  <div 
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    style={{ 
                      width: getBarWidth(offpeakCoverage || 0),
                      background: `linear-gradient(to right, rgba(45, 212, 191, ${Math.max(0.7, 1 - (offpeakCoverage || 0) * 0.005)}), rgba(20, 184, 166, ${Math.min(1, 0.8 + (offpeakCoverage || 0) * 0.002)}))`
                    }} 
                  />
              </div>
            </div>
          )}
          {hasStorage && electricityType === "business" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-green-500" />
                  {(() => {
                    const needed = Math.min(batteryUsable || 0, (peakNeeded || 0) + (offpeakNeeded || 0)) / 0.9
                    const coverage = needed > 0 ? (chargeExcess || 0) / needed * 100 : 0
                    return <span className="text-muted-foreground">Sạc pin {(chargeExcess || 0).toFixed(1)}/{needed.toFixed(1)}</span>
                  })()}
                </div>
                {(() => {
                  const needed = Math.min(batteryUsable || 0, (peakNeeded || 0) + (offpeakNeeded || 0)) / 0.9
                  const coverage = needed > 0 ? (chargeExcess || 0) / needed * 100 : 0
                  return <span className="font-medium text-green-500">{coverage.toFixed(0)}%</span>
                })()}
              </div>
              <div className="relative h-2 rounded-full bg-muted">
                {(() => {
                  const needed = Math.min(batteryUsable || 0, (peakNeeded || 0) + (offpeakNeeded || 0)) / 0.9
                  const coverage = needed > 0 ? (chargeExcess || 0) / needed * 100 : 0
                  return (
                    <div 
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{ 
                        width: getBarWidth(coverage),
                        background: `linear-gradient(to right, rgba(74, 222, 128, ${Math.max(0.7, 1 - coverage * 0.005)}), rgba(34, 197, 94, ${Math.min(1, 0.8 + coverage * 0.002)}))`
                      }} 
                    />
                  )
                })()}
              </div>
            </div>
          )}
          {hasStorage && electricityType === "residential" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">Ban đêm {nightAvailable?.toFixed(1)}/{nightNeeded?.toFixed(1)}</span>
                </div>
                <span className="font-medium text-blue-500">{nightCoverage?.toFixed(0)}%</span>
              </div>
              <div className="relative h-2 rounded-full bg-muted">
                <div 
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{ 
                    width: getBarWidth(nightCoverage || 0),
                    background: `linear-gradient(to right, rgba(96, 165, 250, ${Math.max(0.7, 1 - (nightCoverage || 0) * 0.005)}), rgba(59, 130, 246, ${Math.min(1, 0.8 + (nightCoverage || 0) * 0.002)}))`
                  }} 
                />
              </div>
            </div>
          )}
          {hasStorage && electricityType === "residential" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">Sạc pin {chargeExcess?.toFixed(1)}/{chargeNeeded?.toFixed(1)}</span>
                </div>
                <span className="font-medium text-green-500">{chargeCoverage?.toFixed(0)}%</span>
              </div>
              <div className="relative h-2 rounded-full bg-muted">
                <div 
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{ 
                    width: getBarWidth(chargeCoverage || 0),
                    background: `linear-gradient(to right, rgba(74, 222, 128, ${Math.max(0.7, 1 - (chargeCoverage || 0) * 0.005)}), rgba(34, 197, 94, ${Math.min(1, 0.8 + (chargeCoverage || 0) * 0.002)}))`
                  }} 
                />
              </div>
            </div>
          )}
          {!hasStorage && electricityType === "business" && (
            <>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-chart-3" />
                    <span className="text-muted-foreground">Thấp điểm {Math.max(0, (chargeExcess && batteryUsable ? Math.min(chargeExcess, batteryUsable) - (peakNeeded || 0) : 0))?.toFixed(1)}/{(offpeakNeeded || 0)?.toFixed(1)}</span>
                  </div>
                  <span className="font-medium text-chart-3">{offpeakCoverage?.toFixed(0)}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted">
                  <div 
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    style={{ 
                      width: getBarWidth(offpeakCoverage || 0),
                      background: `linear-gradient(to right, rgba(45, 212, 191, ${Math.max(0.7, 1 - (offpeakCoverage || 0) * 0.005)}), rgba(20, 184, 166, ${Math.min(1, 0.8 + (offpeakCoverage || 0) * 0.002)}))`
                    }} 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
<BatteryCharging className="w-4 h-4 text-green-500" />
<span className="text-muted-foreground">Sạc pin {chargeExcess?.toFixed(1)}/{chargeNeeded?.toFixed(1)}</span>
                  </div>
                  <span className="font-medium text-green-500">{chargeCoverage?.toFixed(0)}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted">
                  <div 
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    style={{ 
                      width: getBarWidth(chargeCoverage || 0),
                      background: `linear-gradient(to right, rgba(74, 222, 128, ${Math.max(0.7, 1 - (chargeCoverage || 0) * 0.005)}), rgba(34, 197, 94, ${Math.min(1, 0.8 + (chargeCoverage || 0) * 0.002)}))`
                    }} 
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Chi phí lắp đặt */}
          <div className="p-3 sm:p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
               <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
               <span className="text-sm text-muted-foreground">Chi phí lắp đặt</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-amber-500 truncate text-center" suppressHydrationWarning>
                {formatVND(roundedCost)}
            </p>
          </div>

          {/* Tiết kiệm/tháng */}
          <div className="p-3 sm:p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Tiết kiệm/tháng</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-blue-500 truncate text-center" suppressHydrationWarning>
                {formatVND(roundedMonthlySavings)}
            </p>
          </div>

          {/* Hoàn vốn */}
          <div className="p-3 sm:p-4 rounded-lg bg-chart-3/10 border border-chart-3/20">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-chart-3" />
              <span className="text-sm text-muted-foreground">Hoàn vốn</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-chart-3 text-center">
               {paybackYears.toFixed(1)}<span className="text-muted-foreground/70"> năm</span>
            </p>
          </div>

          {/* Tiết kiệm/năm */}
          <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Tiết kiệm/năm</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-green-600 truncate text-center" suppressHydrationWarning>
                {formatVND(roundedYearlySavings)}
            </p>
          </div>
        </div>

        <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
          <li>
            Tính cho tải sử dụng{" "}
             {formatVND(quoteData?.monthly_electricity_cost)}/tháng
            {" "}(~ {mounted ? quoteData?.monthly_electricity_kwh.toLocaleString("vi-VN") : quoteData?.monthly_electricity_kwh} kWh),{" "}
            điện {electricityType === "business" ? "kinh doanh" : "sinh hoạt"}{" "}
            {quoteData?.phase_type === '3 phase' ? '3 pha' : '1 pha'}
            {electricityType === "business"
              ? `, BT: ${(businessNormalKwh || 0).toFixed(0)}, CD: ${(businessPeakKwh || 0).toFixed(0)}, TD: ${(businessOffpeakKwh || 0).toFixed(0)} kWh`
              : `, ban ngày ${quoteData?.daytime_usage}%`}
          </li>
          <li>Bảo hành tận nơi trong 2 năm đầu, sau đó bảo hành theo chính sách nhà sản xuất.</li>
          <li>Báo giá lắp đặt trọn gói cho mái tôn nhà cấp 4 tiêu chuẩn, trường hợp khác cần khảo sát chi tiết.</li>
        </ul>
      </CardContent>
    </Card>
    </div>
  )
})
