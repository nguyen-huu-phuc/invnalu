"use client"

import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { ExportImage } from "@/components/export-image"
import type { AcceptPayload } from "@/components/viewer/accept-quote-button"
import { TrendingUp, DollarSign, Clock, Cpu, Sun, Moon, Battery, Box, Zap, Activity, Server, SolarPanel, BatteryCharging, CircuitBoard, PiggyBank } from "lucide-react"
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react"
import { formatVND } from "@/lib/utils"

function formatVNDWithMutedCurrency(amount: number | null | undefined) {
  const formatted = formatVND(amount)
  if (formatted === "-") return <span className="text-muted-foreground">-</span>
  const parts = formatted.split(" ")
  return (
    <>
      <span className="text-muted-foreground">{parts[0]}</span>
      <span className="text-muted-foreground"> {parts[1]}</span>
    </>
  )
}

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
    proposalStatus?: string
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
     quoteId,
     quoteSelected,
     proposalStatus,
  }, ref) => {
  const [mounted, setMounted] = useState(false)
  const [scale, setScale] = useState(1)
  const cardRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => cardRef.current as HTMLDivElement)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const updateScale = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        setScale(width < 500 ? width / 500 : 1)
      }
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const isProposalLocked = proposalStatus === 'confirm' || proposalStatus === 'complete'

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
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <div
        ref={cardRef}
        className="relative"
        style={{
          width: scale < 1 ? '500px' : '100%',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          transition: 'transform 0.1s ease-out'
        }}
      >
        <Card className="border-primary/20 shadow-sm" data-export="quote">
       {quoteId && proposalStatus !== 'cancelled' && (!isProposalLocked || quoteSelected) && (
          <AcceptQuoteButton
            payload={{
              quote_id: quoteId,
              data: quoteData,
              total_amount: quoteData?.total_price,
            } as AcceptPayload}
            accepted={quoteSelected}
            readOnly={isProposalLocked}
          />
        )}
        <CardContent className="pt-0 space-y-3">
            <div className="flex items-center gap-2">
                <ExportImage trigger={<Server className="w-4 h-4 text-blue-500 shrink-0" />} />
                 <span className="text-lg text-foreground truncate">Hệ thống {inverterType === 'hybrid' ? 'hybrid' : 'ongrid'} công suất {quoteData?.system_power?.toFixed(1)} kWp{hasStorage && quoteData?.battery_capacity ? `, lưu trữ ${Number(quoteData.battery_capacity).toFixed(1)} kWh` : ''}</span>
            </div>

        <div className="w-full rounded-xl border border-border/60">
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="bg-muted/40 text-left">
               <th className="px-3 py-2 text-foreground">Thiết bị</th>
               <th className="px-3 py-2 text-foreground text-left">Số lượng</th>
               <th className="px-3 py-2 text-foreground text-left">Bảo hành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {inverterName && inverterCount && formatWarranty(inverterWarranty) ? (
                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground truncate">Biến tần {inverterName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-foreground text-left">{inverterCount}</td>
                  <td className="px-3 py-2.5 text-foreground text-left">{formatWarranty(inverterWarranty)}</td>
                </tr>
              ) : null}
              {panelName && panelCount && formatWarranty(panelWarranty) ? (
                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground truncate">Tấm pin {panelName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-foreground text-left">{panelCount}</td>
                  <td className="px-3 py-2.5 text-foreground text-left">{formatWarranty(panelWarranty)}</td>
                </tr>
              ) : null}
              {hasStorage && batteryName && batteryCount && formatWarranty(batteryWarranty) ? (
                <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground truncate">Pin lưu trữ {batteryName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-foreground text-left">{batteryCount}</td>
                  <td className="px-3 py-2.5 text-foreground text-left">{formatWarranty(batteryWarranty)}</td>
                </tr>
              ) : null}
              <tr className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5">
                   <div className="flex items-center gap-2">
                     <span className="text-foreground truncate">Tủ, thiết bị bảo vệ khác</span>
                   </div>
                 </td>
                   <td className="px-3 py-2.5 text-foreground text-left">1</td>
                   <td className="px-3 py-2.5 text-foreground text-left">1 năm</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sản lượng Section */}
        <div className="p-3 rounded-xl border border-border/60 bg-muted/10 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-foreground text-sm">Sản lượng trung bình</span>
            <span className="text-muted-foreground text-sm">{monthlyProduction?.toFixed(0)} kWh/tháng</span>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-3 items-center">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {electricityType === "business" ? "Bình thường" : "Ban ngày"}
                </span>
              </div>
              <span className="text-muted-foreground">{dayProduced?.toFixed(1)} / {dayNeeded?.toFixed(1)} kWh</span>
              <span className="text-muted-foreground text-right">{dayCoverage?.toFixed(0)}%</span>
            </div>
          </div>
          {hasStorage && electricityType === "business" && (
            <div className="space-y-1">
              <div className="grid grid-cols-3 items-center">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cao điểm</span>
                </div>
                <span className="text-muted-foreground">{(chargeExcess && batteryUsable ? Math.min(chargeExcess, batteryUsable) : 0)?.toFixed(1)} / {(peakNeeded || 0)?.toFixed(1)} kWh</span>
                <span className="text-muted-foreground text-right">{peakCoverage?.toFixed(0)}%</span>
              </div>
            </div>
          )}
          {hasStorage && electricityType === "business" && (
            <div className="space-y-1">
              <div className="grid grid-cols-3 items-center">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Thấp điểm</span>
                </div>
                  <span className="text-muted-foreground">{Math.max(0, (chargeExcess && batteryUsable ? Math.min(chargeExcess, batteryUsable) - (peakNeeded || 0) : 0))?.toFixed(1)} / {(offpeakNeeded || 0)?.toFixed(1)} kWh</span>
                <span className="text-muted-foreground text-right">{offpeakCoverage?.toFixed(0)}%</span>
              </div>
            </div>
          )}
          {hasStorage && electricityType === "business" && (
            <div className="space-y-1">
              <div className="grid grid-cols-3 items-center">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sạc pin</span>
                </div>
                <span className="text-muted-foreground">{(() => {
                  const needed = Math.min(batteryUsable || 0, (peakNeeded || 0) + (offpeakNeeded || 0)) / 0.9
                  return (chargeExcess || 0).toFixed(1) + " / " + needed.toFixed(1) + " kWh"
                })()}</span>
                <span className="text-muted-foreground text-right">{(() => {
                  const needed = Math.min(batteryUsable || 0, (peakNeeded || 0) + (offpeakNeeded || 0)) / 0.9
                  const coverage = needed > 0 ? (chargeExcess || 0) / needed * 100 : 0
                  return coverage.toFixed(0) + "%"
                })()}</span>
              </div>
            </div>
          )}
          {hasStorage && electricityType === "residential" && (
            <div className="space-y-1">
              <div className="grid grid-cols-3 items-center">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ban đêm</span>
                </div>
                <span className="text-muted-foreground">{nightAvailable?.toFixed(1)} / {nightNeeded?.toFixed(1)} kWh</span>
                <span className="text-muted-foreground text-right">{nightCoverage?.toFixed(0)}%</span>
              </div>
            </div>
          )}
          {hasStorage && electricityType === "residential" && (
            <div className="space-y-1">
              <div className="grid grid-cols-3 items-center">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sạc pin</span>
                </div>
                  <span className="text-muted-foreground">{chargeExcess?.toFixed(1)} / {chargeNeeded?.toFixed(1)} kWh</span>
                <span className="text-muted-foreground text-right">{chargeCoverage?.toFixed(0)}%</span>
              </div>
            </div>
          )}
          {!hasStorage && electricityType === "business" && (
            <>
              <div className="space-y-1">
                <div className="grid grid-cols-3 items-center">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Thấp điểm</span>
                  </div>
                <span className="text-muted-foreground">{Math.max(0, (chargeExcess && batteryUsable ? Math.min(chargeExcess, batteryUsable) - (peakNeeded || 0) : 0))?.toFixed(1)} / {(offpeakNeeded || 0)?.toFixed(1)} kWh</span>
                  <span className="text-muted-foreground text-right">{offpeakCoverage?.toFixed(0)}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="grid grid-cols-3 items-center">
                  <div className="flex items-center gap-2">
                    <BatteryCharging className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Sạc pin</span>
                  </div>
                <span className="text-muted-foreground">{chargeExcess?.toFixed(1)} / {chargeNeeded?.toFixed(1)} kWh</span>
                  <span className="text-muted-foreground text-right">{chargeCoverage?.toFixed(0)}%</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Chi phí lắp đặt */}
          <div className="p-3 rounded-xl bg-muted/10 border border-amber-500/20">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
               <span className="text-sm text-muted-foreground">Chi phí lắp đặt</span>
            </div>
            <p className="text-lg text-muted-foreground truncate text-center" suppressHydrationWarning>
                {formatVNDWithMutedCurrency(roundedCost)}
            </p>
          </div>

          {/* Tiết kiệm/tháng */}
          <div className="p-3 rounded-xl bg-muted/10 border border-blue-500/20">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
               <span className="text-sm text-muted-foreground">Tiết kiệm/tháng</span>
            </div>
            <p className="text-lg text-muted-foreground truncate text-center" suppressHydrationWarning>
                {formatVNDWithMutedCurrency(roundedMonthlySavings)}
            </p>
          </div>

          {/* Hoàn vốn */}
          <div className="p-3 rounded-xl bg-muted/10 border border-chart-3/30">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
               <span className="text-sm text-muted-foreground">Hoàn vốn</span>
            </div>
            <p className="text-lg text-muted-foreground text-center">
               {paybackYears.toFixed(1)}               <span className="text-muted-foreground"> năm</span>
            </p>
          </div>

          {/* Tiết kiệm/năm */}
          <div className="p-3 rounded-xl bg-muted/10 border border-primary/20">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
               <span className="text-sm text-muted-foreground">Tiết kiệm/năm</span>
            </div>
            <p className="text-lg text-muted-foreground truncate text-center" suppressHydrationWarning>
                {formatVNDWithMutedCurrency(roundedYearlySavings)}
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
    </div>
  )
})
