import {
  calculateElectricitySavedKwh,
  calculateMoneySavedTiered,
  calculateDailyProductionFromModel,
  calculateSizingSystemKwp,
  kwhToElectricityBill,
  calculateBusinessMonthlyCost,
  BUSINESS_ELECTRICITY_PRICES,
} from "@/lib/solar-tools"
import { calculateKwhFromBill } from "@/lib/electricity-pricing"

export interface SurveySettings {
  inputType: "bill" | "kwh"
  billAmount: number
  kwhUsage: number
  electricityType: "residential" | "business"
  businessNormalKwh: number
  businessPeakKwh: number
  businessOffpeakKwh: number
  daytimeUsage: number
  tilt: number
  azimuth: number
  storage: "yes" | "no" | "pending"
  phase: "1-phase" | "3-phase"
  inverterFactory: string
  latitude: number
  longitude: number
}

export interface InverterProduct {
  id: number
  product_name: string
  max_output_power: number
  max_dc_input_power: number
  max_dc_vol_input: number
  dc_vol_input_rate: number
  string: number
  phase: number
  inverter_type: string
  factory: string
  install_price: number
  warranty: number
  sku?: string
}

export interface PanelProduct {
  id: number
  product_name: string
  power_output: number
  voc: number
  is_default: number
  install_price: number
  warranty: number
  sku?: string
}

export interface BatteryProduct {
  id: number
  product_name: string
  capacity: number | string
  voltage: number
  dod: number
  install_price: number
  warranty: number
  sku?: string
}

export interface ComponentProduct {
  id: number
  sku: string
  product_name: string
  category: string
  way: number
  specification: string
  material: string
  warranty: number
  install_price: number
  sale_price: number
}

export interface ProductCatalog {
  inverters: InverterProduct[]
  panels: PanelProduct[]
  batteries: BatteryProduct[]
  components: ComponentProduct[]
}

export interface ItemInfo {
  product_type: string
  sku: string | number
  quantity: number
}

export interface QuoteDataInfo {
  system_power: number
  total_price: number | null
  phase_type: "1 phase" | "3 phase"
  daytime_usage: number
  monthly_electricity_kwh: number
  monthly_electricity_cost: number
}

export interface SolarAnalysisResult {
  monthlyConsumption: number
  monthlySavings: number
  yearlySavings: number
  totalCost: number
  paybackYears: number
  hasStorage: boolean
  storageStatus: "yes" | "no" | "pending"
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
  batteryCapacity: number
  inverterName?: string
  inverterWarranty?: number
  inverterSku?: string
  inverterCount: number
  panelName?: string
  panelWarranty?: number
  panelSku?: string
  panelCount: number
  batteryName?: string
  batteryWarranty?: number
  batterySku?: string
  batteryCount: number
  inverterType: string
  quoteData: QuoteDataInfo
  electricityType: "residential" | "business"
  businessSavedNormalMoney: number
  businessSavedPeakMoney: number
}

const PANEL_WATTAGE_DEFAULT = 580

function findInverterById(catalog: ProductCatalog, id: string | number | undefined): InverterProduct | undefined {
  if (id === undefined || id === null) return undefined
  const idStr = String(id)
  return catalog.inverters.find(i => String(i.id) === idStr)
}

function findPanelById(catalog: ProductCatalog, id: string | number | undefined): PanelProduct | undefined {
  if (id === undefined || id === null) return undefined
  const idStr = String(id)
  return catalog.panels.find(p => String(p.id) === idStr)
}

function findBatteryById(catalog: ProductCatalog, id: string | number | undefined): BatteryProduct | undefined {
  if (id === undefined || id === null) return undefined
  const idStr = String(id)
  return catalog.batteries.find(b => String(b.id) === idStr)
}

function getItem(catalog: ProductCatalog, items: ItemInfo[], productType: string): ItemInfo | undefined {
  return items.find(i => i.product_type === productType)
}

export function calculateSolarAnalysis(params: {
  survey: SurveySettings
  items: ItemInfo[]
  catalog: ProductCatalog
}): SolarAnalysisResult {
  const { survey, items, catalog } = params

  const {
    inputType,
    billAmount,
    kwhUsage,
    electricityType,
    businessNormalKwh,
    businessPeakKwh,
    businessOffpeakKwh,
    daytimeUsage,
    tilt,
    azimuth,
    storage,
    phase,
  } = survey

  const storageOption: "yes" | "no" | "pending" = storage as "yes" | "no" | "pending"
  const hasStorage = storageOption === "yes"

  const invItem = getItem(catalog, items, "inverter")
  const panelItem = getItem(catalog, items, "panel")
  const battItem = getItem(catalog, items, "battery")

  const selectedInverter = invItem ? findInverterById(catalog, invItem.sku) : undefined
  const selectedPanel = panelItem ? findPanelById(catalog, panelItem.sku) : undefined
  const selectedBattery = battItem ? findBatteryById(catalog, battItem.sku) : undefined

  const inverterCount = invItem ? Math.max(1, Number(invItem.quantity)) : 1
  const panelCount = panelItem ? Math.max(1, Number(panelItem.quantity)) : (selectedPanel ? Math.ceil(calculateSizingSystemKwp({
    daytimeKwh: 0, nighttimeKwh: 0, batteryUsable: 0, storage: storageOption, tilt, azimuth
  }) / (PANEL_WATTAGE_DEFAULT / 1000)) : 1)
  const batteryCount = battItem ? Math.max(1, Number(battItem.quantity)) : 1

  let monthlyKwh = inputType === "bill" ? calculateKwhFromBill(billAmount) : kwhUsage
  let dailyKwh = monthlyKwh / 30
  let daytimeKwh = dailyKwh * (daytimeUsage / 100)
  let nighttimeKwh = dailyKwh * (1 - daytimeUsage / 100)

  if (electricityType === "business") {
    monthlyKwh = businessNormalKwh + businessPeakKwh + businessOffpeakKwh
    dailyKwh = monthlyKwh / 30
    daytimeKwh = businessNormalKwh / 30
    nighttimeKwh = businessPeakKwh / 30
  }
  

  let sizingBatteryCap = 0
  let sizingBatteryDod = 0.8

  if ((storageOption === "yes" || storageOption === "pending") && selectedBattery) {
    sizingBatteryCap = Number(selectedBattery.capacity) * batteryCount
    sizingBatteryDod = selectedBattery.dod ? selectedBattery.dod / 100 : 0.8
  }
  const panelWattage = selectedPanel?.power_output || PANEL_WATTAGE_DEFAULT

  const systemPowerNeeded = calculateSizingSystemKwp({
    daytimeKwh,
    nighttimeKwh,
    batteryUsable: sizingBatteryCap * sizingBatteryDod,
    storage: storageOption,
    tilt,
    azimuth,
  })

  const actualPanelCount = panelCount > 0 ? panelCount : (panelWattage > 0 ? Math.ceil(systemPowerNeeded / (panelWattage / 1000)) : 1)
  const actualSystemKwp = (actualPanelCount * panelWattage) / 1000

  const dailyProduction = calculateDailyProductionFromModel(actualSystemKwp, tilt, azimuth)
  const monthlyProduction = dailyProduction * 30

  const actualBatteryCapacity = selectedBattery ? Number(selectedBattery.capacity) * batteryCount : 0
  const batteryUsable = actualBatteryCapacity * (selectedBattery?.dod ? selectedBattery.dod / 100 : 0.8)

  const excessDaytime = Math.max(0, dailyProduction - daytimeKwh)
  const chargeCoverage = storageOption === "yes" && batteryUsable > 0 ? Math.min(100, (excessDaytime / batteryUsable) * 100) : 0

  const peakDaily = electricityType === "business" ? businessPeakKwh / 30 : 0
  const offpeakDaily = electricityType === "business" ? businessOffpeakKwh / 30 : 0
  const effectiveChargeCapacity = Math.min(excessDaytime, batteryUsable)
  const peakCoverage = electricityType === "business" && peakDaily > 0 && storageOption === "yes"
    ? (effectiveChargeCapacity / peakDaily) * 100
    : 0
  const offpeakCoverage = electricityType === "business" && offpeakDaily > 0 && storageOption === "yes"
    ? Math.max(0, (effectiveChargeCapacity - peakDaily) / offpeakDaily * 100)
    : 0

  const inverterType = selectedInverter?.inverter_type || "ongrid"

  const electricitySavedKwh = calculateElectricitySavedKwh(
    monthlyProduction,
    daytimeKwh,
    nighttimeKwh,
    batteryUsable,
    chargeCoverage,
    storageOption
  )

  let businessSavedNormalMoney = 0
  let businessSavedPeakMoney = 0
  let electricitySavedMoney = 0

  if (electricityType === "business") {
    const normalSavedKwh = Math.min(monthlyProduction, businessNormalKwh)
    const normalSavedMoney = normalSavedKwh * BUSINESS_ELECTRICITY_PRICES.normal
    const peakSavedKwh = Math.min((peakCoverage || 0) / 100 * businessPeakKwh, businessPeakKwh)
    const peakSavedMoney = peakSavedKwh * BUSINESS_ELECTRICITY_PRICES.peak
    const offpeakSavedKwh = Math.min((offpeakCoverage || 0) / 100 * businessOffpeakKwh, businessOffpeakKwh)
    const offpeakSavedMoney = offpeakSavedKwh * BUSINESS_ELECTRICITY_PRICES.offpeak
    electricitySavedMoney = normalSavedMoney + peakSavedMoney + offpeakSavedMoney
    businessSavedNormalMoney = normalSavedMoney
    businessSavedPeakMoney = peakSavedMoney + offpeakSavedMoney
  } else {
    electricitySavedMoney = calculateMoneySavedTiered(
      inputType,
      billAmount,
      kwhUsage,
      electricitySavedKwh
    )
  }

  const usedString = selectedInverter?.string || 1

  const atsCount = storageOption === "yes" ? 1 : 0
  const mcbAcCount = (inverterType === "ongrid" ? 1 : 2) * inverterCount
  const spdAcCount = 1
  const mcbDcCount = usedString
  const spdDcCount = usedString
  const day4Count = usedString * 2 * 10

  const boxHtWay = 24
  const componentWays = [
    { way: 1, qty: atsCount },
    { way: 1, qty: mcbAcCount },
    { way: 1, qty: spdAcCount },
    { way: 1, qty: mcbDcCount },
    { way: 1, qty: spdDcCount },
    { way: 1, qty: day4Count },
  ]
  const totalWay = componentWays.reduce((sum, c) => sum + (c.way * c.qty), 0)
  const boxHtCount = Math.ceil(totalWay / boxHtWay)

  const atsPrice = Number(catalog.components.find(c => c.category === "protection" && c.product_name.includes("ATS"))?.install_price) || 0
  const mcbAcPrice = Number(catalog.components.find(c => c.category === "protection" && c.product_name.includes("MCB AC"))?.install_price) || 0
  const spdAcPrice = Number(catalog.components.find(c => c.category === "protection" && c.product_name.includes("SPD AC"))?.install_price) || 0
  const mcbDcPrice = Number(catalog.components.find(c => c.category === "protection" && c.product_name.includes("MCB DC"))?.install_price) || 0
  const spdDcPrice = Number(catalog.components.find(c => c.category === "protection" && c.product_name.includes("SPD DC"))?.install_price) || 0
  const day4Price = Number(catalog.components.find(c => c.category === "wire" && c.product_name.includes("4.0"))?.install_price) || 0
  const boxHtPrice = Number(catalog.components.find(c => c.category === "cabinet")?.install_price) || 0

  const componentTotal =
    (atsCount * atsPrice) +
    (mcbAcCount * mcbAcPrice) +
    (spdAcCount * spdAcPrice) +
    (mcbDcCount * mcbDcPrice) +
    (spdDcCount * spdDcPrice) +
    (day4Count * day4Price) +
    (boxHtCount * boxHtPrice)

  const inverterTotal = (selectedInverter?.install_price || 0) * inverterCount
  const panelTotal = (selectedPanel?.install_price || 0) * actualPanelCount
  const batteryTotal = (selectedBattery?.install_price || 0) * batteryCount
  const totalCost = componentTotal + inverterTotal + panelTotal + batteryTotal

  const yearlySavings = electricitySavedMoney * 12
  const paybackYears = yearlySavings > 0 ? totalCost / yearlySavings : 0

  const displayDayCoverage = daytimeKwh > 0 ? (dailyProduction / daytimeKwh) * 100 : 0
  const displayChargeCoverage = storageOption === "yes" && batteryUsable > 0 && nighttimeKwh > 0
    ? (Math.max(0, dailyProduction - daytimeKwh) / (Math.min(batteryUsable, nighttimeKwh) / 0.9)) * 100
    : 0
  const displayNightCoverage = storageOption === "yes" && nighttimeKwh > 0
    ? ((batteryUsable * Math.min(displayChargeCoverage, 100) / 100) / nighttimeKwh) * 100
    : 0

  const peakExcess = electricityType === "business" && storageOption === "yes" ? Math.min(batteryUsable, peakDaily) : 0
  const offpeakExcess = electricityType === "business" && storageOption === "yes" && offpeakDaily > 0
    ? Math.max(0, batteryUsable - peakDaily)
    : 0

  const quoteDataInfo: QuoteDataInfo = {
    system_power: actualSystemKwp,
    total_price: totalCost,
    phase_type: phase === "1-phase" ? "1 phase" : "3 phase",
    daytime_usage: daytimeUsage,
    monthly_electricity_kwh: monthlyKwh,
    monthly_electricity_cost: electricityType === "business"
      ? calculateBusinessMonthlyCost(businessNormalKwh, businessPeakKwh, businessOffpeakKwh)
      : inputType === "bill" ? billAmount : kwhToElectricityBill(kwhUsage),
  }

  return {
    monthlyConsumption: monthlyKwh,
    monthlySavings: electricitySavedMoney,
    yearlySavings,
    totalCost,
    paybackYears,
    hasStorage,
    storageStatus: storageOption,
    monthlyProduction,
    dayCoverage: displayDayCoverage,
    nightCoverage: displayNightCoverage,
    chargeCoverage: displayChargeCoverage,
    offpeakCoverage,
    peakCoverage,
    peakExcess,
    peakNeeded: peakDaily,
    offpeakExcess,
    offpeakNeeded: offpeakDaily,
    businessNormalKwh,
    businessPeakKwh,
    businessOffpeakKwh,
    dayProduced: dailyProduction,
    dayNeeded: daytimeKwh,
    nightAvailable: batteryUsable * Math.min(displayChargeCoverage, 100) / 100,
    nightNeeded: nighttimeKwh,
    chargeExcess: Math.max(0, dailyProduction - daytimeKwh),
    chargeNeeded: Math.min(batteryUsable, nighttimeKwh) / 0.9,
    batteryUsable,
    batteryCapacity: actualBatteryCapacity,
    inverterName: selectedInverter?.product_name,
    inverterWarranty: selectedInverter?.warranty,
    inverterSku: selectedInverter?.sku || String(selectedInverter?.id || ''),
    inverterCount,
    panelName: selectedPanel?.product_name,
    panelWarranty: selectedPanel?.warranty,
    panelSku: selectedPanel?.sku || String(selectedPanel?.id || ''),
    panelCount: actualPanelCount,
    batteryName: selectedBattery?.product_name,
    batteryWarranty: selectedBattery?.warranty,
    batterySku: selectedBattery?.sku || String(selectedBattery?.id || ''),
    batteryCount: batteryCount,
    inverterType,
    quoteData: quoteDataInfo,
    electricityType,
    businessSavedNormalMoney,
    businessSavedPeakMoney,
  }
}
